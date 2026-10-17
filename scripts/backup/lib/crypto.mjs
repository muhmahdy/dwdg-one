// Encryption of backup files at rest: AES-256-GCM with a key the operator holds (BACKUP_ENCRYPTION_KEY, 32 bytes, base64).
// File layout: "DWDGBK1\n" (8 bytes) | iv (12) | ciphertext | authentication tag (16). Any change to the file, or a wrong
// key, makes decryption fail; nothing is released before the tag has been checked.
import {createCipheriv, createDecipheriv, createHash, randomBytes} from 'node:crypto';
import {createReadStream, createWriteStream} from 'node:fs';
import {open, stat} from 'node:fs/promises';
import {pipeline} from 'node:stream/promises';

const MAGIC = Buffer.from('DWDGBK1\n');
const IV = 12, TAG = 16;

export function parseKey(value) {
  const key = Buffer.from(String(value ?? ''), 'base64');
  if (key.length !== 32) throw new Error('BACKUP_ENCRYPTION_KEY must be 32 random bytes in base64 (create one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))").');
  return key;
}

export async function encryptFile(inPath, outPath, key) {
  const iv = randomBytes(IV);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const out = createWriteStream(outPath, {flags: 'wx'}); // never overwrite
  out.write(Buffer.concat([MAGIC, iv]));
  await pipeline(createReadStream(inPath), cipher, out, {end: false});
  await new Promise((resolve, reject) => out.end(cipher.getAuthTag(), err => (err ? reject(err) : resolve())));
}

async function readParts(path) {
  const size = (await stat(path)).size;
  if (size < MAGIC.length + IV + TAG) throw new Error('Not an encrypted backup (too short).');
  const fh = await open(path, 'r');
  try {
    const head = Buffer.alloc(MAGIC.length + IV), tag = Buffer.alloc(TAG);
    await fh.read(head, 0, head.length, 0);
    await fh.read(tag, 0, TAG, size - TAG);
    if (!head.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error('Not an encrypted backup (wrong header).');
    return {iv: head.subarray(MAGIC.length), tag, start: head.length, end: size - TAG - 1};
  } finally { await fh.close(); }
}

/** Decrypts to `outPath`, or only counts it when `outPath` is null. Resolves to the sha256 of the plain file. */
export async function decryptFile(inPath, outPath, key) {
  const {iv, tag, start, end} = await readParts(inPath);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const hash = createHash('sha256');
  const tap = async function* (source) { for await (const chunk of source) { hash.update(chunk); yield chunk; } };
  if (outPath) await pipeline(createReadStream(inPath, {start, end}), decipher, tap, createWriteStream(outPath, {flags: 'wx'}));
  else await pipeline(createReadStream(inPath, {start, end}), decipher, tap, async function (source) { for await (const _ of source); });
  return hash.digest('hex');
}

export async function sha256File(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}
