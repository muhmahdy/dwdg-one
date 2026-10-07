import { RECORD_SCHEMAS, EXPERIENCE_KEYS } from './experience-data.mjs';
import { DIVISION_SCHEMAS, EXTRA_SCHEMAS, STAGE_TRANSLATIONS } from './experience-records.mjs';

/** One locale boundary for page controllers, editors, charts, and notices. */
export const LANGUAGES = {en:'English',id:'Bahasa Indonesia'};
export const STATUS_LABELS = {todo:['Not started','Belum dimulai'],progress:['In progress','Dikerjakan'],blocked:['Blocked','Terhambat'],done:['Completed','Selesai']};
export const PRIMARY_PAGES = [
 ['home','Home','Beranda','home'],['tasks','My tasks','Tugas saya','tasks'],['projects','Projects','Proyek','projects'],['schedule','Schedule','Jadwal','calendar'],['documents','Documents','Dokumen','documents'],['updates','Updates','Pembaruan','updates'],['organization','Organization','Organisasi','people'],['settings','Settings','Pengaturan','settings'],
];
export function createTranslator(getLanguage) {
 return (english,indonesian) => getLanguage()==='id' ? (indonesian || english) : english;
}
export function formatLocalDate(value,language='en',options={day:'numeric',month:'short'}) {
 if(!value) return '—';
 const date=new Date(value.length===10?`${value}T12:00:00`:value);
 return Number.isNaN(+date)?'—':new Intl.DateTimeFormat(language==='id'?'id-ID':'en-GB',options).format(date);
}
export const ERROR_TRANSLATIONS={
 'Give this task a title.':'Beri judul tugas ini.',
 'Choose a project.':'Pilih proyek.',
 'Choose an existing project.':'Pilih proyek yang tersedia.',
 'Choose an assignee.':'Pilih penanggung jawab.',
 'The due date must be on or after the start date.':'Tenggat harus sama dengan atau setelah tanggal mulai.',
 'The end date must be on or after the start date.':'Tanggal akhir harus sama dengan atau setelah tanggal mulai.',
 'Choose a valid status.':'Pilih status yang valid.',
 'Choose a valid priority.':'Pilih prioritas yang valid.',
 'A task cannot depend on itself.':'Tugas tidak dapat bergantung pada dirinya sendiri.',
 'Complete the dependency first.':'Selesaikan tugas prasyarat terlebih dahulu.',
 'Clear dependent task links before moving this task to another project.':'Hapus tautan tugas yang bergantung sebelum memindahkan tugas ini ke proyek lain.',
 'Choose a dependency from the same project.':'Pilih prasyarat dari proyek yang sama.',
 'These dependencies form a loop. Choose a different task.':'Prasyarat ini membentuk lingkaran. Pilih tugas lain.',
 'Complete the dependency before completing this task.':'Selesaikan tugas prasyarat sebelum menyelesaikan tugas ini.',
 'Reopen the completed dependent task first.':'Buka kembali tugas turunan yang sudah selesai terlebih dahulu.',
 'Give this project a name.':'Beri nama proyek ini.',
 'Choose a division.':'Pilih divisi.',
 'Choose a project lead.':'Pilih ketua proyek.',
 'Give this event a title.':'Beri judul rapat ini.',
 'Choose a valid date and time.':'Pilih tanggal dan waktu yang valid.',
 'Duration must be between 15 and 480 minutes.':'Durasi harus antara 15 dan 480 menit.',
 'Task not found.':'Tugas tidak ditemukan.',
 'Browser storage is unavailable. Your change was not saved.':'Penyimpanan peramban tidak tersedia. Perubahan belum tersimpan.',
 'Browser storage is full or unavailable. Your change was not saved.':'Penyimpanan peramban penuh atau tidak tersedia. Perubahan belum tersimpan.',
 'Storage unavailable':'Penyimpanan tidak tersedia.',
 'Invalid data':'Data tidak valid.',
 'Choose a DWDG workspace backup.':'Pilih cadangan ruang kerja DWDG.',
 'Choose a file.':'Pilih berkas.',
 'Choose a file no larger than 10 MB.':'Pilih berkas berukuran maksimal 10 MB.',
 'This file is empty.':'Berkas ini kosong.',
 'This attachment is unavailable on this device. The document metadata is still saved.':'Lampiran ini tidak tersedia di perangkat ini. Informasi dokumen tetap tersimpan.',
 'Local file storage is unavailable in this browser.':'Penyimpanan berkas lokal tidak tersedia di peramban ini.',
 'Could not open local file storage.':'Penyimpanan berkas lokal tidak dapat dibuka.',
 'Local file storage is busy in another tab. Close that tab and retry.':'Penyimpanan berkas lokal sedang digunakan tab lain. Tutup tab tersebut lalu coba kembali.',
 'The local file could not be saved or loaded. Storage may be full.':'Berkas lokal tidak dapat disimpan atau dimuat. Penyimpanan mungkin penuh.',
 'Your change could not be saved. Please try again.':'Perubahan belum tersimpan. Silakan coba lagi.',
 'Project dates must include its tasks. Adjust the task dates first.':'Rentang tanggal proyek harus mencakup tugasnya. Sesuaikan tanggal tugas terlebih dahulu.',
 'Enter a title.':'Masukkan judul.',
 'Enter the decision.':'Masukkan keputusan.',
 'Enter a whole number of zero or more.':'Masukkan bilangan bulat nol atau lebih.',
 'End date must be after the start date.':'Tanggal akhir harus setelah tanggal mulai.',
 'Choose a budget line for this request.':'Pilih pos anggaran untuk permintaan ini.',
 'Enter an amount greater than zero.':'Masukkan jumlah lebih dari nol.',
 'Choose a different project.':'Pilih proyek lain.',
 'This project dependency already exists.':'Dependensi proyek ini sudah ada.',
 'This link would create a circular project dependency.':'Tautan ini akan membuat dependensi proyek melingkar.',
 'Reassign linked requests before deleting this budget line.':'Pindahkan permintaan terkait sebelum menghapus pos anggaran ini.',
 'Enter a document name.':'Masukkan nama dokumen.',
 'Use an https:// or http:// document link.':'Gunakan tautan dokumen https:// atau http://.',
 'Choose a link or a file, not both. Clear the link to attach a file.':'Pilih tautan atau berkas. Kosongkan tautan untuk melampirkan berkas.',
 'Add a document link or choose a file.':'Tambahkan tautan dokumen atau pilih berkas.',
 'Enter a name.':'Masukkan nama.',
 'This task is no longer available.':'Tugas ini sudah tidak tersedia.',
 'This project is no longer available.':'Proyek ini sudah tidak tersedia.',
 'This record is no longer available.':'Catatan ini sudah tidak tersedia.',
 'This document is no longer available.':'Dokumen ini sudah tidak tersedia.',
 'This member is no longer available.':'Anggota ini sudah tidak tersedia.',
 'Division state must be an object.':'Format data divisi tidak valid.',
 'Unsupported division state version.':'Versi data divisi tidak didukung.',
 'Missing workflow stages.':'Tahap alur kerja belum tersedia.',
 'A financial request needs an existing budget line.':'Permintaan keuangan memerlukan pos anggaran yang tersedia.',
 'activity must be an array.':'Format riwayat aktivitas harus berupa daftar.',
 'Choose a time horizon.':'Pilih horizon waktu.',
 'Target date must be on or after the start date.':'Tanggal target harus sama dengan atau setelah tanggal mulai.',
 'This expense exceeds the remaining budget.':'Pengeluaran ini melebihi sisa anggaran.',
 'The requester cannot be changed after creation.':'Pemohon tidak dapat diubah setelah permintaan dibuat.',
 'Allocation cannot be below committed and paid spending.':'Alokasi tidak boleh lebih kecil dari pengeluaran yang disetujui dan sudah dibayar.',
 'Links must begin with http:// or https://.':'Tautan harus diawali http:// atau https://.',
 'Change was not saved. Check your connection and try again.':'Perubahan belum tersimpan. Periksa koneksi dan coba lagi.',
 'The overlay controller has been destroyed.':'Tampilan ini sudah ditutup. Buka kembali untuk melanjutkan.',
 'todayISO must be an ISO date.':'Tanggal harus memakai format YYYY-MM-DD.',
};

const STORE_NAMES={core:'ruang kerja',divisions:'divisi',extras:'rincian proyek',extension:'fitur tambahan'};
for(const [name,label]of Object.entries(STORE_NAMES)){
 ERROR_TRANSLATIONS[`Saved ${name} is protected because it could not be read. Export a backup before recovery.`]=`Data ${label} tersimpan dilindungi karena tidak dapat dibaca. Ekspor cadangan sebelum pemulihan.`;
 ERROR_TRANSLATIONS[`Invalid ${name} data. Your change was not saved.`]=`Data ${label} tidak valid. Perubahan belum tersimpan.`;
 ERROR_TRANSLATIONS[`Saved ${name} could not be read. The original data is preserved; this store is read-only.`]=`Data ${label} tersimpan tidak dapat dibaca. Data asli dipertahankan; data ini hanya dapat dibaca.`;
 ERROR_TRANSLATIONS[`Saved ${name} changed to an unreadable format. The original data is preserved; this store is read-only.`]=`Format data ${label} tersimpan tidak lagi dapat dibaca. Data asli dipertahankan; data ini hanya dapat dibaca.`;
 const key=EXPERIENCE_KEYS[name];
 ERROR_TRANSLATIONS[`Cannot read ${key}. Changes to this store are disabled.`]=`Penyimpanan ${label} tidak dapat dibaca. Perubahan dinonaktifkan untuk data ini.`;
}

const COLLECTION_ALIASES={task:'tasks',project:'projects',member:'members',event:'events',document:'documents',milestone:'milestones',blocker:'blockers',decision:'decisions',partner:'partners',followup:'followups',delivery:'deliveries',legalRequest:'legalRequests',meetingNotes:'meetingNotes'};
const TYPE_LABELS={task:['Task','Tugas'],tasks:['Tasks','Tugas'],project:['Project','Proyek'],projects:['Projects','Proyek'],member:['Member','Anggota'],members:['Members','Anggota'],division:['Division','Divisi'],event:['Meeting','Rapat'],events:['Meetings','Rapat'],document:['Document','Dokumen'],documents:['Documents','Dokumen'],milestone:['Milestone','Tonggak'],milestones:['Milestones','Tonggak'],blocker:['Blocker','Hambatan'],blockers:['Blockers','Hambatan'],decision:['Decision','Keputusan'],decisions:['Decisions','Keputusan'],partner:['Partner','Mitra'],followup:['Follow-up','Tindak lanjut'],delivery:['Delivery','Penyerahan'],legalRequest:['Legal request','Permintaan legal'],meetingNotes:['Meeting notes','Notulen rapat']};
const VALUE_LABELS={
 todo:['Not started','Belum dimulai'],progress:['In progress','Sedang berjalan'],'not-started':['Not started','Belum dimulai'],'in-progress':['In progress','Sedang berjalan'],done:['Completed','Selesai'],blocked:['Blocked','Terhambat'],open:['Open','Terbuka'],planned:['Planned','Direncanakan'],at_risk:['At risk','Berisiko'],reached:['Reached','Tercapai'],low:['Low','Rendah'],medium:['Medium','Sedang'],high:['High','Tinggi'],now:['Now','Sekarang'],next:['Next','Berikutnya'],later:['Later','Nanti'],proposed:['Proposed','Diusulkan'],researching:['Researching','Dalam riset'],active:['Active','Aktif'],paused:['Paused','Dijeda'],completed:['Completed','Selesai'],draft:['Draft','Draf'],submitted:['Submitted','Diajukan'],review:['In review','Dalam tinjauan'],approved:['Approved','Disetujui'],rejected:['Rejected','Ditolak'],paid:['Paid','Dibayar'],applied:['Applied','Mendaftar'],screening:['Screening','Seleksi'],interview:['Interview','Wawancara'],offer:['Offer','Penawaran'],joined:['Joined','Bergabung'],closed:['Closed','Ditutup'],waiting:['Waiting','Menunggu'],complete:['Complete','Selesai'],idea:['Idea','Ide'],producing:['Producing','Produksi'],scheduled:['Scheduled','Terjadwal'],published:['Published','Diterbitkan'],building:['Building','Dikerjakan'],released:['Released','Dirilis'],pending:['Pending','Menunggu'],ready:['Ready','Siap'],resolved:['Resolved','Selesai'],decided:['Decided','Diputuskan'],recorded:['Recorded','Tercatat'],normal:['Normal','Normal'],restricted:['Restricted','Terbatas'],confidential:['Confidential','Rahasia']
};

/** For editable stageId, pass the saved stage.label as value; custom labels remain untouched. */
export function recordValueLabel(collection,field,value,t,source=''){
 if(value===undefined||value===null||value==='')return '—';
 const key=COLLECTION_ALIASES[collection]||String(collection||'').replace(/^(division|project):/,'');
 const schema=source==='extras'?EXTRA_SCHEMAS[key]:source==='extension'?RECORD_SCHEMAS[key]:source==='division'?DIVISION_SCHEMAS[key]:RECORD_SCHEMAS[key]||DIVISION_SCHEMAS[key]||EXTRA_SCHEMAS[key];
 const choices=schema?.fields?.find(([name])=>name===field)?.[4];
 const option=Array.isArray(choices)?choices.find(([id])=>String(id)===String(value)):null;
 if(option)return t(option[1],option[2]||option[1]);
 if(typeof value==='boolean')return value?t('Yes','Ya'):t('No','Tidak');
 if(STAGE_TRANSLATIONS[value])return t(value,STAGE_TRANSLATIONS[value]);
 if(['stageId','stage','status','priority','severity','horizon','sensitivity'].includes(field)&&VALUE_LABELS[value])return t(...VALUE_LABELS[value]);
 return String(value);
}

export function searchTypeLabel(type,t){
 const key=String(type||'').replace(/^(division|project):/,'');
 if(TYPE_LABELS[key])return t(...TYPE_LABELS[key]);
 const schema=RECORD_SCHEMAS[key]||DIVISION_SCHEMAS[key]||EXTRA_SCHEMAS[key];
 return schema?t(schema.labels.en,schema.labels.id):t('Record','Catatan');
}

/** Translate known domain and storage failures while preserving actual record content. */
export function translateError(error,t){
 const message=String(error?.message||error||'');
 if(ERROR_TRANSLATIONS[message])return t(message,ERROR_TRANSLATIONS[message]);
 let match;
 if((match=message.match(/^Storage failed during rollback \(([^)]+)\)\. Export this session before reloading\.$/))){const names=match[1].split(',').map(name=>STORE_NAMES[name.trim()]||name.trim()).join(', ');return t(message,`Penyimpanan gagal saat pemulihan (${names}). Ekspor sesi ini sebelum memuat ulang.`);}
 if((match=message.match(/^Unsupported division workspace: (.+)$/)))return t(message,`Ruang kerja divisi tidak didukung: ${match[1]}`);
 if(message.startsWith('Saved data is invalid: '))return t(message,`Data tersimpan tidak valid: ${translateError(message.slice(23),t)}`);
 for(const schema of [...Object.values(RECORD_SCHEMAS),...Object.values(DIVISION_SCHEMAS),...Object.values(EXTRA_SCHEMAS)])for(const[,en,id,type]of schema.fields){
  if(type==='url'&&message===`${en} must start with https:// or http://.`)return t(message,`${id} harus diawali https:// atau http://.`);
  if(type==='date'&&message===`Choose a valid ${en.toLowerCase()}.`)return t(message,`Pilih ${id.toLowerCase()} yang valid.`);
 }
 const patterns=[
  [/^(.+) needs at least one stage\.$/,'memerlukan setidaknya satu tahap.'],
  [/^(.+) has an invalid stage\.$/,'memiliki tahap yang tidak valid.'],
  [/^(.+) has a duplicate stage ID\.$/,'memiliki ID tahap yang sama.'],
  [/^(.+) must be an array\.$/,'harus berupa daftar.'],
  [/^(.+) contains an invalid record\.$/,'memuat catatan yang tidak valid.'],
  [/^(.+) contains a duplicate ID\.$/,'memuat ID yang sama.'],
  [/^(.+) references an unknown stage\.$/,'mengacu pada tahap yang tidak tersedia.'],
  [/^(.+) amounts must be non-negative integer IDR\.$/,'harus memakai jumlah rupiah bulat nol atau lebih.'],
 ];
 for(const[pattern,suffix]of patterns)if((match=message.match(pattern)))return t(message,`${searchTypeLabel(match[1],(en,id)=>id)} ${suffix}`);
 if((match=message.match(/^(.+) contains an invalid (dueDate|publishDate|startDate|endDate)\.$/))){const label={dueDate:'tenggat',publishDate:'tanggal terbit',startDate:'tanggal mulai',endDate:'tanggal akhir'}[match[2]];return t(message,`${searchTypeLabel(match[1],(en,id)=>id)} memuat ${label} yang tidak valid.`);}
 // Browser parser errors are not useful form copy; the original Error remains available to the caller.
 if(/JSON|Unexpected token|Unexpected end|not valid JSON/i.test(message))return t('This file is not valid JSON. Choose a DWDG workspace backup.','Berkas ini bukan JSON yang valid. Pilih cadangan ruang kerja DWDG.');
 return message;
}
