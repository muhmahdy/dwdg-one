/** Keep startup failures visible without resetting any persisted workspace data. */
export async function startExperience(load, document) {
 try { await load(); return true; }
 catch (error) {
  const root=document.querySelector('#page');
  if(!root)throw error;
  const indonesian=document.documentElement.lang==='id';
  const panel=document.createElement('section');
  panel.className='panel sculpted panel-inner';
  panel.setAttribute('role','alert');
  const title=document.createElement('h1');
  title.textContent=indonesian?'Ruang kerja belum dapat dibuka':'The workspace could not start';
  const explanation=document.createElement('p');
  explanation.className='page-description';
  explanation.textContent=indonesian?'Terjadi kesalahan saat membuka aplikasi. Data tersimpan tidak dihapus. Salin pesan di bawah untuk pemeriksaan.':'An error stopped the app from opening. Your saved data has not been cleared. Copy the message below for troubleshooting.';
  const details=document.createElement('pre');
  details.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;margin:24px 0;font:inherit';
  details.textContent=String(error?.message||error);
  const retry=document.createElement('button');
  retry.className='button primary';
  retry.textContent=indonesian?'Coba lagi':'Try again';
  retry.addEventListener('click',()=>document.defaultView.location.reload());
  panel.append(title,explanation,details,retry);
  root.replaceChildren(panel);
  console.error('DWDG startup failed:',error);
  return false;
 }
}
