// UXD3 · Finance & Legal and Marketing Communication & IT (UI sprint, owned by this session only). Registers PAGES / CAPS / INSP / ACT / MENUS entries; see .planning/workstreams/SPRINT.md.
// FnL: legal intake, versions, review, numbering, signatures and the PKS → BAST → invoice gate (legal_*, flow-legal, W055, W056, S046–S048);
// budget allocations, finance requests, independent approval, recorded payments and corrections (finance_*, flow-finance-outgoing, W057, S049, S050);
// incoming client terms (finance_incoming_terms, flow-finance-incoming); period reviews and snapshots (finance_period_snapshot, W058, S051).
// MCIT: content calendar, production board and exact-version review with recorded publication per channel (marketing_*, flow-marketing-content,
// W053, S042, S043); IT and brief requests (marketing_it_requests, flow-it-support, W054, S044); safe account register (marketing_account_register,
// integration-credentials, S045). Rules POL and the FnL/MCIT leads have not adopted are shown as the plan proposes them and listed as open in
// DFL/HANDOFF.md and DMS/HANDOFF.md. Demo data only (D8); seeded lazily into db.fnl and db.mcit. Nothing here moves money, signs or publishes.
(() => {
'use strict';
// Bahasa Indonesia for the FnL and MCIT screens (D7, formal "Anda"). Keys are the exact English strings; user content is never translated.
Object.assign(window.ID_DICT, {
  "{n} day from today": "{n} hari lagi", "{n} days from today": "{n} hari lagi", "{n} discrepancy is open.": "{n} selisih masih terbuka.", "{n} discrepancies are open.": "{n} selisih masih terbuka.",
  "{n} item": "{n} item", "{n} items": "{n} item", "{n} row is not checked yet. Every row needs a result before a snapshot.": "{n} baris belum diperiksa. Setiap baris perlu hasil sebelum snapshot.",
  "{n} rows are not checked yet. Every row needs a result before a snapshot.": "{n} baris belum diperiksa. Setiap baris perlu hasil sebelum snapshot.",
  "(name only)": "(hanya nama)",
  "+{n} more": "+{n} lainnya",
  "A Drive link to the receipt or quotation. Without it Finance may return the request.": "Tautan Drive ke kuitansi atau penawaran harga. Tanpa tautan ini, Keuangan dapat mengembalikan permintaan.",
  "A closed request is not a security test result.": "Permintaan yang ditutup bukan hasil uji keamanan.",
  "A correction or payment changed this period. The earlier snapshot stays as the past basis.": "Koreksi atau pembayaran mengubah periode ini. Snapshot sebelumnya tetap sebagai dasar lampau.",
  "A follow-up task goes to the executor. Other channels keep their own state.": "Tugas tindak lanjut dikirim ke pelaksana. Kanal lain tetap dengan statusnya sendiri.",
  "A link is not a copy. Access stays with the file owner.": "Tautan bukan salinan. Akses tetap pada pemilik berkas.",
  "A newer version needs its own review": "Versi yang lebih baru memerlukan tinjauannya sendiri",
  "A routine post needs no campaign. Engagement numbers are not shown because none are recorded.": "Unggahan rutin tidak memerlukan kampanye. Angka keterlibatan tidak ditampilkan karena tidak ada yang dicatat.",
  "A safe screenshot. Crop out personal data.": "Tangkapan layar yang aman. Potong data pribadi.",
  "A wish, not an agreed date. MCIT confirms when it accepts.": "Sebuah harapan, bukan tanggal yang disepakati. MCIT mengonfirmasi saat menerimanya.",
  "Above the remaining allocation of {r}. Amend the allocation first; going over is an exception POL has not defined.": "Melebihi sisa alokasi sebesar {r}. Ubah alokasi terlebih dahulu; melebihinya adalah pengecualian yang belum ditetapkan POL.",
  "Accept and create content": "Terima dan buat konten",
  "Accepted by Finance": "Diterima oleh Keuangan",
  "Accepted. Agreed date {d}.": "Diterima. Tanggal disepakati {d}.",
  "Access to {s}": "Akses ke {s}",
  "Account custody": "Penjagaan akun",
  "Account or access": "Akun atau akses",
  "Accounts": "Akun",
  "Accounts register": "Daftar akun",
  "Action marked done": "Tindakan ditandai selesai",
  "Actual publication": "Publikasi aktual",
  "Add note": "Tambah catatan",
  "Add the invoice reference.": "Tambahkan referensi faktur.",
  "Add the reference.": "Tambahkan referensinya.",
  "Add the transfer or receipt reference.": "Tambahkan referensi transfer atau kuitansi.",
  "Add version {v}": "Tambah versi {v}",
  "Add what Finance asked for and submit again. A changed amount needs a new review.": "Tambahkan yang diminta Keuangan lalu ajukan lagi. Jumlah yang berubah memerlukan tinjauan baru.",
  "After a correction; the earlier snapshot stays as the past basis.": "Setelah koreksi; snapshot sebelumnya tetap sebagai dasar lampau.",
  "All content": "Semua konten",
  "All signatures recorded. The request is signed.": "Semua tanda tangan tercatat. Permintaan sudah ditandatangani.",
  "Allocated": "Dialokasikan",
  "Allocated by period end": "Dialokasikan hingga akhir periode",
  "Allocation": "Alokasi",
  "Allocation amended. Paid records are unchanged.": "Alokasi diubah. Catatan pembayaran tidak berubah.",
  "Allocation approval": "Persetujuan alokasi",
  "Allocation approved": "Alokasi disetujui",
  "Allocation proposals": "Usulan alokasi",
  "Allocation proposed": "Alokasi diusulkan",
  "Allocations": "Alokasi",
  "Already recorded as {id}. Nothing was added.": "Sudah tercatat sebagai {id}. Tidak ada yang ditambahkan.",
  "Amend allocation": "Ubah alokasi",
  "Amount": "Jumlah",
  "Amount (Rp)": "Jumlah (Rp)",
  "Amount paid (Rp)": "Jumlah dibayar (Rp)",
  "Amount received (Rp)": "Jumlah diterima (Rp)",
  "An approver other than you decides. Until then it is not budget.": "Penyetuju selain Anda yang memutuskan. Sampai saat itu, ini belum menjadi anggaran.",
  "An attestation stays marked as not verified.": "Pernyataan tetap ditandai belum diverifikasi.",
  "An independent approver decides. Approval is not payment; Finance records the payment after it happens outside the app.": "Penyetuju independen yang memutuskan. Persetujuan bukan pembayaran; Keuangan mencatat pembayaran setelah terjadi di luar aplikasi.",
  "An independent approver in Finance reviews it.": "Penyetuju independen di Keuangan meninjaunya.",
  "An independent reviewer, not the drafter.": "Peninjau independen, bukan penyusun.",
  "An offer outside MCIT needs the person to accept first.": "Tawaran di luar MCIT perlu diterima dulu oleh orangnya.",
  "Answer": "Jawaban",
  "Answer and submit again": "Jawab dan ajukan lagi",
  "Answer the question from Legal. The request waits for you.": "Jawab pertanyaan dari Legal. Permintaan menunggu Anda.",
  "Answered": "Dijawab",
  "Answered the question from Legal": "Menjawab pertanyaan dari Legal",
  "Approval": "Persetujuan",
  "Approval records a commitment. It is not a payment and moves no money.": "Persetujuan mencatat komitmen. Ini bukan pembayaran dan tidak memindahkan uang.",
  "Approve allocation": "Setujui alokasi",
  "Approve exception": "Setujui pengecualian",
  "Approve v{v}": "Setujui v{v}",
  "Approve v{v} for signature": "Setujui v{v} untuk ditandatangani",
  "Approved allocations, commitments and recorded payments in whole rupiah. The app records money; it never moves it.": "Alokasi yang disetujui, komitmen, dan pembayaran tercatat dalam rupiah bulat. Aplikasi mencatat uang; tidak pernah memindahkannya.",
  "Approved amount (Rp)": "Jumlah disetujui (Rp)",
  "Approved by": "Disetujui oleh",
  "Approved commitments": "Komitmen disetujui",
  "Approved earlier": "Disetujui sebelumnya",
  "Approved for signature": "Disetujui untuk ditandatangani",
  "Approved v{v}": "v{v} disetujui",
  "Approved {a}": "Disetujui {a}",
  "Approved {a} of {b}": "Disetujui {a} dari {b}",
  "Approved {a}, paid {p}": "Disetujui {a}, dibayar {p}",
  "Approved {a}. Not paid until a payment is recorded.": "Disetujui {a}. Belum dibayar sampai pembayaran dicatat.",
  "Approved, not paid": "Disetujui, belum dibayar",
  "Approved, not paid. Finance records the payment after it is made outside the app.": "Disetujui, belum dibayar. Keuangan mencatat pembayaran setelah dilakukan di luar aplikasi.",
  "Approving authority": "Pihak yang menyetujui",
  "Approving owner": "Penanggung jawab persetujuan",
  "Approving owner in your unit": "Penanggung jawab persetujuan di unit Anda",
  "Archived.": "Diarsipkan.",
  "Ask IT for help with an account, the website or a tool, or ask Marketing for content. Never type passwords here.": "Minta bantuan IT untuk akun, situs web, atau alat, atau minta konten ke Pemasaran. Jangan pernah mengetik kata sandi di sini.",
  "Ask Legal for a document or Finance for money. You see your own requests and what happens next; reviewer notes stay with FnL.": "Minta dokumen ke Legal atau dana ke Keuangan. Anda melihat permintaan Anda sendiri dan langkah berikutnya; catatan peninjau tetap di FnL.",
  "Ask for an exception": "Ajukan pengecualian",
  "Ask for an urgent exception": "Ajukan pengecualian mendesak",
  "Ask for information": "Minta informasi",
  "Asked for an urgent exception": "Mengajukan pengecualian mendesak",
  "Asked for missing information": "Meminta informasi yang kurang",
  "Asked the requester for information": "Meminta informasi dari pemohon",
  "Asset": "Aset",
  "Asset or brand link": "Tautan aset atau merek",
  "Assets": "Aset",
  "Assign": "Tugaskan",
  "Assigned to {who}": "Ditugaskan ke {who}",
  "At most {o}, the amount still owed.": "Paling banyak {o}, jumlah yang masih terutang.",
  "At most {o}.": "Paling banyak {o}.",
  "Attach evidence first": "Lampirkan bukti terlebih dahulu",
  "Attach evidence first. Missing evidence stays a discrepancy.": "Lampirkan bukti terlebih dahulu. Bukti yang tidak ada tetap menjadi selisih.",
  "Attestation without a copy": "Pernyataan tanpa salinan",
  "Attestation, no link (for example a story)": "Pernyataan, tanpa tautan (misalnya story)",
  "Attested, no link": "Dinyatakan, tanpa tautan",
  "Attested, not verified": "Dinyatakan, belum diverifikasi",
  "Awaiting signature": "Menunggu tanda tangan",
  "Awaiting signatures": "Menunggu tanda tangan",
  "BAST": "BAST",
  "BAST signed by every party": "BAST ditandatangani semua pihak",
  "BAST v{v} and PKS v{p}": "BAST v{v} dan PKS v{p}",
  "Bank": "Bank",
  "Bank and cash reconciliation incomplete": "Rekonsiliasi bank dan kas belum lengkap",
  "Bank compared": "Bank sudah dicocokkan",
  "Bank comparison recorded": "Pencocokan bank dicatat",
  "Bank not compared": "Bank belum dicocokkan",
  "Bank reconciliation incomplete.": "Rekonsiliasi bank belum lengkap.",
  "Bank statement compared": "Rekening koran sudah dicocokkan",
  "Bank transfer": "Transfer bank",
  "Be specific. The requester answers on this page.": "Tulis dengan spesifik. Pemohon menjawab di halaman ini.",
  "Below what is already committed": "Di bawah jumlah yang sudah dikomitmenkan",
  "Below what is committed. Tick the exception box to save it as an exception.": "Di bawah jumlah yang dikomitmenkan. Centang kotak pengecualian untuk menyimpannya sebagai pengecualian.",
  "Blocked: {r}": "Terhambat: {r}",
  "Blocker cleared": "Hambatan teratasi",
  "Blocker recorded": "Hambatan dicatat",
  "Board view: approved totals by division. Requests, payees and evidence stay with FnL.": "Tampilan Dewan: total yang disetujui per divisi. Permintaan, penerima, dan bukti tetap di FnL.",
  "Board view: counts only. Request details stay with FnL and the requester.": "Tampilan Dewan: hanya jumlah. Detail permintaan tetap di FnL dan pemohon.",
  "Brief sent again": "Brief dikirim lagi",
  "Brief sent to MCIT": "Brief dikirim ke MCIT",
  "Budget & transactions": "Anggaran & transaksi",
  "Budget line": "Pos anggaran",
  "Campaign": "Kampanye",
  "Campaigns": "Kampanye",
  "Can be lower than requested. A higher amount needs a new version from the requester.": "Boleh lebih rendah dari yang diminta. Jumlah lebih tinggi memerlukan versi baru dari pemohon.",
  "Cancel content": "Batalkan konten",
  "Cancel request": "Batalkan permintaan",
  "Canceled as a duplicate": "Dibatalkan sebagai duplikat",
  "Canceled as a duplicate of {r}.": "Dibatalkan sebagai duplikat dari {r}.",
  "Canceled as a duplicate. Both records stay.": "Dibatalkan sebagai duplikat. Kedua catatan tetap ada.",
  "Canceled by the requester": "Dibatalkan oleh pemohon",
  "Canceled. The history stays.": "Dibatalkan. Riwayat tetap ada.",
  "Canceled: {r}": "Dibatalkan: {r}",
  "Canva, Drive or Docs. The link records which file was reviewed.": "Canva, Drive, atau Docs. Tautan mencatat berkas mana yang ditinjau.",
  "Change custodian": "Ganti penjaga",
  "Change to a tool or the website": "Perubahan pada alat atau situs web",
  "Changes requested on version {v}": "Perubahan diminta pada versi {v}",
  "Changes requested. A revision task went to {who}.": "Perubahan diminta. Tugas revisi dikirim ke {who}.",
  "Changes to live systems follow the release steps outside this request.": "Perubahan pada sistem yang berjalan mengikuti langkah rilis di luar permintaan ini.",
  "Channels": "Kanal",
  "Check the delivery evidence, then send the gate to Finance.": "Periksa bukti penyerahan, lalu kirim gerbang ke Keuangan.",
  "Checked: not a duplicate": "Diperiksa: bukan duplikat",
  "Checked: not a duplicate of {r} ({who}).": "Diperiksa: bukan duplikat dari {r} ({who}).",
  "Choose a budget line": "Pilih pos anggaran",
  "Choose a date and a time.": "Pilih tanggal dan waktu.",
  "Choose at least one channel.": "Pilih setidaknya satu kanal.",
  "Choose the budget line it comes from.": "Pilih pos anggaran sumbernya.",
  "Choose the date Finance is asked to act by.": "Pilih tanggal Keuangan diminta bertindak.",
  "Choose the date you need it by.": "Pilih tanggal Anda membutuhkannya.",
  "Choose the date you would like it by.": "Pilih tanggal yang Anda inginkan.",
  "Choose the executor.": "Pilih pelaksana.",
  "Choose the internal due date.": "Pilih tenggat internal.",
  "Choose the new custodian.": "Pilih penjaga baru.",
  "Choose the payment to correct.": "Pilih pembayaran yang akan dikoreksi.",
  "Choose the planned publication date.": "Pilih tanggal rencana publikasi.",
  "Clear form": "Kosongkan formulir",
  "Close period": "Tutup periode",
  "Closed after the requester confirmed it.": "Ditutup setelah pemohon mengonfirmasinya.",
  "Closed with snapshot": "Ditutup dengan snapshot",
  "Closed, confirmed solved": "Ditutup, dikonfirmasi selesai",
  "Collector": "Penagih",
  "Columns come from the content states. Canceled stays visible with its reason.": "Kolom berasal dari status konten. Yang dibatalkan tetap terlihat beserta alasannya.",
  "Committed": "Dikomitmenkan",
  "Committed = approved amounts of approved and paid requests. Paid = recorded payments and corrections. Remaining = allocation minus committed. Proposed basis; POL confirms.": "Dikomitmenkan = jumlah disetujui dari permintaan yang disetujui dan dibayar. Dibayar = pembayaran dan koreksi tercatat. Sisa = alokasi dikurangi komitmen. Dasar usulan; POL yang mengonfirmasi.",
  "Committed, not paid": "Dikomitmenkan, belum dibayar",
  "Compare": "Bandingkan",
  "Confirm custodian": "Konfirmasi penjaga",
  "Confirmed": "Dikonfirmasi",
  "Confirmed solved": "Dikonfirmasi selesai",
  "Consumption": "Konsumsi",
  "Content": "Konten",
  "Content brief": "Brief konten",
  "Content brief from {u}": "Brief konten dari {u}",
  "Content canceled": "Konten dibatalkan",
  "Content created. {who} was told.": "Konten dibuat. {who} sudah diberi tahu.",
  "Content exported. Planned and actual dates stay in separate columns.": "Konten diekspor. Tanggal rencana dan aktual tetap di kolom terpisah.",
  "Content item": "Item konten",
  "Content review": "Tinjauan konten",
  "Cooperation agreement (PKS)": "Perjanjian kerja sama (PKS)",
  "Correction": "Koreksi",
  "Correction or takedown recorded": "Koreksi atau penurunan dicatat",
  "Correction recorded": "Koreksi dicatat",
  "Correction recorded against {p}": "Koreksi dicatat terhadap {p}",
  "Correction recorded. The original payment is unchanged.": "Koreksi dicatat. Pembayaran asli tidak berubah.",
  "Correction to {r}": "Koreksi untuk {r}",
  "Corrections and takedowns": "Koreksi dan penurunan",
  "Could not submit. Your draft is kept here; try again.": "Gagal mengajukan. Draf Anda tetap tersimpan di sini; coba lagi.",
  "Counterpart": "Pihak lawan",
  "Create content": "Buat konten",
  "Create linked task": "Buat tugas tertaut",
  "Create task": "Buat tugas",
  "Created and linked to its task": "Dibuat dan ditautkan ke tugasnya",
  "Current basis": "Dasar saat ini",
  "Custodian": "Penjaga",
  "Custodian changed. Verify ownership in the provider too.": "Penjaga diganti. Verifikasi juga kepemilikan di penyedia layanan.",
  "Custodian confirmed today": "Penjaga dikonfirmasi hari ini",
  "Custodian unknown": "Penjaga tidak diketahui",
  "Custodian verified": "Penjaga terverifikasi",
  "DOC": "DOC",
  "Decide on the exception": "Putuskan pengecualian",
  "Decided by the FnL legal reviewer (proposed). Approving does not skip review.": "Diputuskan oleh peninjau legal FnL (usulan). Persetujuan tidak melewati tinjauan.",
  "Decision note": "Catatan keputusan",
  "Decline exception": "Tolak pengecualian",
  "Declined to sign": "Menolak menandatangani",
  "Decree (SK)": "Surat keputusan (SK)",
  "Deficit": "Defisit",
  "Delivery check": "Pemeriksaan penyerahan",
  "Delivery evidence": "Bukti penyerahan",
  "Delivery evidence check recorded": "Pemeriksaan bukti penyerahan dicatat",
  "Delivery evidence checked": "Bukti penyerahan diperiksa",
  "Delivery evidence checked by Legal": "Bukti penyerahan diperiksa oleh Legal",
  "Describe the problem only. If access is the issue, IT routes you to the account custodian.": "Jelaskan masalahnya saja. Jika masalahnya akses, IT mengarahkan Anda ke penjaga akun.",
  "Difference (Rp)": "Selisih (Rp)",
  "Discrepancy": "Selisih",
  "Discrepancy recorded with an owner": "Selisih dicatat dengan penanggung jawab",
  "Document": "Dokumen",
  "Document number": "Nomor dokumen",
  "Document numbering": "Penomoran dokumen",
  "Document type": "Jenis dokumen",
  "Documents & register": "Dokumen & register",
  "Draft saved {t}": "Draf tersimpan {t}",
  "Drafted by": "Disusun oleh",
  "Drafting": "Penyusunan",
  "Drafting started": "Penyusunan dimulai",
  "Due: {t}": "Tenggat: {t}",
  "Duplicate check": "Pemeriksaan duplikat",
  "Duplicate flag cleared": "Tanda duplikat dihapus",
  "Duplicate of {r}": "Duplikat dari {r}",
  "EE client opportunity": "Peluang klien EE",
  "EE to Consulting handoff": "Serah terima EE ke Consulting",
  "Each channel gets its own publication record.": "Setiap kanal memiliki catatan publikasinya sendiri.",
  "Each month: allocations, commitments, payments, what is still owed and missing evidence. Closed reviews keep their snapshot; a later correction makes a new one.": "Setiap bulan: alokasi, komitmen, pembayaran, yang masih terutang, dan bukti yang belum ada. Tinjauan yang ditutup menyimpan snapshot-nya; koreksi berikutnya membuat snapshot baru.",
  "Ends reminders and publication duties. History stays.": "Mengakhiri pengingat dan kewajiban publikasi. Riwayat tetap ada.",
  "Enter a positive whole rupiah amount, for example 90.000.": "Masukkan jumlah rupiah bulat positif, misalnya 90.000.",
  "Enter a positive whole rupiah amount.": "Masukkan jumlah rupiah bulat positif.",
  "Enter a whole rupiah amount.": "Masukkan jumlah rupiah bulat.",
  "Enter the difference in whole rupiah, with + or −.": "Masukkan selisih dalam rupiah bulat, dengan + atau −.",
  "Events": "Acara",
  "Every number issued, with its exact version and signature state. A void keeps its number and reason.": "Setiap nomor yang diterbitkan, dengan versi persis dan status tanda tangannya. Nomor yang dibatalkan tetap menyimpan nomor dan alasannya.",
  "Every party has signed": "Semua pihak sudah menandatangani",
  "Every row needs a result before a snapshot.": "Setiap baris perlu hasil sebelum snapshot.",
  "Everyone or the public": "Semua orang atau publik",
  "Evidence missing": "Bukti belum ada",
  "Exception": "Pengecualian",
  "Exception approved": "Pengecualian disetujui",
  "Exception approved. Review still applies.": "Pengecualian disetujui. Tinjauan tetap berlaku.",
  "Exception declined": "Pengecualian ditolak",
  "Exception recorded": "Pengecualian dicatat",
  "Exception recorded. It shows on the gate and to Finance.": "Pengecualian dicatat. Terlihat di gerbang dan oleh Keuangan.",
  "Exception requested": "Pengecualian diajukan",
  "Executor": "Pelaksana",
  "Expected client income is never budget and never mixed with spending. A term opens only after the legal gate (proposed, P1).": "Pendapatan klien yang diharapkan tidak pernah menjadi anggaran dan tidak dicampur dengan pengeluaran. Termin dibuka hanya setelah gerbang legal (usulan, P1).",
  "Expected from clients": "Diharapkan dari klien",
  "Expected income is not budget and is never added to spending. It counts as received only when a receipt is recorded.": "Pendapatan yang diharapkan bukan anggaran dan tidak pernah ditambahkan ke pengeluaran. Dihitung diterima hanya jika penerimaan dicatat.",
  "Export CSV": "Ekspor CSV",
  "Export downloaded. Restricted evidence is left out for viewers without the grant.": "Ekspor diunduh. Bukti terbatas tidak disertakan bagi yang tidak memiliki izin.",
  "Facts, photos with consent, approved wording. Links only.": "Fakta, foto dengan persetujuan, teks yang disetujui. Hanya tautan.",
  "Failed, follow-up open": "Gagal, tindak lanjut terbuka",
  "Failed: {r}": "Gagal: {r}",
  "Failure recorded. A follow-up task went to {who}.": "Kegagalan dicatat. Tugas tindak lanjut dikirim ke {who}.",
  "Finance": "Keuangan",
  "Finance & Legal requests": "Permintaan Finance & Legal",
  "Finance accepted the gate": "Keuangan menerima gerbang",
  "Finance approval": "Persetujuan keuangan",
  "Finance cannot invoice yet": "Keuangan belum dapat menagih",
  "Finance gets the agreement, the BAST and this gate decision. No invoice or payment is created.": "Keuangan menerima perjanjian, BAST, dan keputusan gerbang ini. Tidak ada faktur atau pembayaran yang dibuat.",
  "Finance request": "Permintaan keuangan",
  "Finance returned the gate: {r}": "Keuangan mengembalikan gerbang: {r}",
  "Find who looks after an account and how to get access": "Cari siapa yang menjaga sebuah akun dan cara mendapatkan akses",
  "Fix evidence": "Bukti perbaikan",
  "FnL Legal triages it, drafts the document and asks for review. You see the next step at every stage.": "Legal FnL memilahnya, menyusun dokumen, dan meminta tinjauan. Anda melihat langkah berikutnya di setiap tahap.",
  "FnL Legal triages the request and names who drafts it.": "Legal FnL memilah permintaan dan menunjuk penyusunnya.",
  "For example the session attendance list and the slide pack Consulting handed over.": "Misalnya daftar hadir sesi dan materi presentasi yang diserahkan Consulting.",
  "For example: Cooperation agreement with the client": "Contoh: Perjanjian kerja sama dengan klien",
  "Form cleared": "Formulir dikosongkan",
  "Format": "Format",
  "From FnL Legal": "Dari Legal FnL",
  "From the IT request \"{t}\".": "Dari permintaan IT \"{t}\".",
  "From the brief \"{t}\" sent by {who}.": "Dari brief \"{t}\" yang dikirim oleh {who}.",
  "Gate": "Gerbang",
  "Gate exception recorded, approved by {who}": "Pengecualian gerbang dicatat, disetujui oleh {who}",
  "Give the brief a title.": "Beri judul pada brief.",
  "Give the content a title.": "Beri judul pada konten.",
  "Give the document a title.": "Beri judul pada dokumen.",
  "Give the reason and scope.": "Tuliskan alasan dan cakupannya.",
  "Give the reason.": "Tuliskan alasannya.",
  "Give the reason. It stays in the history.": "Tuliskan alasannya. Alasan tetap tersimpan di riwayat.",
  "Give the reason. It stays in the register.": "Tuliskan alasannya. Alasan tetap tersimpan di register.",
  "Give the request a title.": "Beri judul pada permintaan.",
  "Goes back to the Legal owner.": "Dikembalikan ke penanggung jawab Legal.",
  "Handoff from Legal": "Serah terima dari Legal",
  "Handoff requested": "Serah terima diminta",
  "Handover note": "Catatan serah terima",
  "Handover record (BAST)": "Berita acara serah terima (BAST)",
  "Headroom after": "Ruang tersisa setelahnya",
  "Hidden account": "Akun tersembunyi",
  "Higher than requested. Ask the requester for a new version.": "Lebih tinggi dari yang diminta. Minta versi baru dari pemohon.",
  "How to get access": "Cara mendapatkan akses",
  "I can use {s} for my work.": "Saya dapat memakai {s} untuk pekerjaan saya.",
  "IT": "IT",
  "IT help and content briefs from every unit. A request never authorizes a deployment or an access change by itself.": "Bantuan IT dan brief konten dari setiap unit. Permintaan tidak pernah dengan sendirinya mengizinkan rilis atau perubahan akses.",
  "IT notes": "Catatan IT",
  "IT request": "Permintaan IT",
  "IT requests exported. Notes and credentials are never included.": "Permintaan IT diekspor. Catatan dan kredensial tidak pernah disertakan.",
  "IT technician": "Teknisi IT",
  "IT triage": "Pemilahan IT",
  "IT triages it and names an owner. No response time is promised.": "IT memilahnya dan menunjuk penanggung jawab. Tidak ada janji waktu respons.",
  "IT triages it, names an owner and links the work. You confirm whether it is solved.": "IT memilahnya, menunjuk penanggung jawab, dan menautkan pekerjaannya. Anda yang mengonfirmasi apakah sudah selesai.",
  "Incoming money is a separate basis": "Uang masuk memakai dasar terpisah",
  "Incoming money, separate basis": "Uang masuk, dasar terpisah",
  "Incoming terms": "Termin masuk",
  "Incoming, separate basis": "Masuk, dasar terpisah",
  "Internal approval is not a signature. A counterpart comment is not an approval.": "Persetujuan internal bukan tanda tangan. Komentar pihak lawan bukan persetujuan.",
  "Internal due": "Tenggat internal",
  "Internal due date": "Tenggat internal",
  "Internal due dates, planned publication and actual publication are kept apart. A planned date passing never publishes anything.": "Tenggat internal, rencana publikasi, dan publikasi aktual dipisahkan. Tanggal rencana yang terlewat tidak pernah memublikasikan apa pun.",
  "Invoice": "Faktur",
  "Invoice issued outside the app": "Faktur diterbitkan di luar aplikasi",
  "Invoice issued outside the app was recorded": "Faktur yang diterbitkan di luar aplikasi dicatat",
  "Invoice recorded": "Faktur dicatat",
  "Invoice reference": "Referensi faktur",
  "Is it solved?": "Apakah sudah selesai?",
  "Issue number for v{v}": "Terbitkan nomor untuk v{v}",
  "Issue the invoice outside the app first. This records that it was issued.": "Terbitkan faktur di luar aplikasi terlebih dahulu. Ini mencatat bahwa faktur sudah diterbitkan.",
  "Issue the number first (proposed order).": "Terbitkan nomor terlebih dahulu (urutan usulan).",
  "Issued": "Diterbitkan",
  "Issued on": "Diterbitkan pada",
  "It failed": "Gagal",
  "Kept in the allocation history.": "Disimpan dalam riwayat alokasi.",
  "Kind of help": "Jenis bantuan",
  "LTR": "LTR",
  "Last verified": "Terakhir diverifikasi",
  "Latest snapshot": "Snapshot terbaru",
  "Leave empty for internal documents.": "Kosongkan untuk dokumen internal.",
  "Legal": "Legal",
  "Legal and Finance queues in one division. Approval, numbering, signatures and payments are separate grants.": "Antrean Legal dan Keuangan dalam satu divisi. Persetujuan, penomoran, tanda tangan, dan pembayaran adalah izin terpisah.",
  "Legal gate": "Gerbang legal",
  "Legal registers and archives it.": "Legal mendaftarkan dan mengarsipkannya.",
  "Legal request": "Permintaan legal",
  "Legal review": "Tinjauan legal",
  "Legal sends the gate when the PKS and the BAST are signed and delivery is checked. Nothing is invoiced automatically.": "Legal mengirim gerbang jika PKS dan BAST sudah ditandatangani dan penyerahan sudah diperiksa. Tidak ada yang ditagih secara otomatis.",
  "Legal sent the gate; waiting for Finance to accept": "Legal mengirim gerbang; menunggu Keuangan menerima",
  "Legal triage and drafting": "Pemilahan dan penyusunan legal",
  "Letter": "Surat",
  "Link to the delivery evidence": "Tautan ke bukti penyerahan",
  "Link to the signed copy": "Tautan ke salinan bertanda tangan",
  "Linked to version {v}.": "Ditautkan ke versi {v}.",
  "Linked to version {v}. A revision task goes to {who}.": "Ditautkan ke versi {v}. Tugas revisi dikirim ke {who}.",
  "Linked work": "Pekerjaan tertaut",
  "Links must start with https://.": "Tautan harus diawali https://.",
  "Links only. Files stay in your drive.": "Hanya tautan. Berkas tetap di drive Anda.",
  "List who signs. One per line: name, role, party.": "Sebutkan siapa yang menandatangani. Satu per baris: nama, jabatan, pihak.",
  "MCIT checks it is complete, then accepts it as a content item or returns it with a reason.": "MCIT memeriksa kelengkapannya, lalu menerimanya sebagai item konten atau mengembalikannya dengan alasan.",
  "Mark as sent for signature": "Tandai sudah dikirim untuk ditandatangani",
  "Marked as matching the evidence": "Ditandai sesuai dengan bukti",
  "Marked as sent for signature": "Ditandai sudah dikirim untuk ditandatangani",
  "Marked resolved. {who} confirms it.": "Ditandai terselesaikan. {who} yang mengonfirmasi.",
  "Matches": "Sesuai",
  "Matches evidence": "Sesuai bukti",
  "Missing": "Belum ada",
  "Missing evidence stays flagged until it is added.": "Bukti yang belum ada tetap ditandai sampai ditambahkan.",
  "More than the {o} still expected.": "Lebih dari {o} yang masih diharapkan.",
  "More than the {o} still owed. A larger payment needs an amended approval.": "Lebih dari {o} yang masih terutang. Pembayaran lebih besar memerlukan perubahan persetujuan.",
  "Move date": "Pindahkan tanggal",
  "Move planned date": "Pindahkan tanggal rencana",
  "My team": "Tim saya",
  "NDA": "NDA",
  "Name only. Bank details are never stored here.": "Nama saja. Detail bank tidak pernah disimpan di sini.",
  "Name the action needed.": "Sebutkan tindakan yang diperlukan.",
  "Name the counterpart for this type.": "Sebutkan pihak lawan untuk jenis ini.",
  "Name the task.": "Beri nama tugas.",
  "Named receiver in Finance": "Penerima yang ditunjuk di Keuangan",
  "Named receiver {who}. Needed by {d}. HR keeps grades and reasons; only the approved packet comes to MCIT.": "Penerima yang ditunjuk {who}. Dibutuhkan pada {d}. HR menyimpan nilai dan alasan; hanya paket yang disetujui yang sampai ke MCIT.",
  "Needed {n} days after it was submitted. H-3 for agreements and H-2 for other letters are survey suggestions, not adopted policy, so the app warns and does not reject.": "Dibutuhkan {n} hari setelah diajukan. H-3 untuk perjanjian dan H-2 untuk surat lain adalah saran survei, bukan kebijakan yang disahkan, sehingga aplikasi memperingatkan dan tidak menolak.",
  "Never": "Belum pernah",
  "Never added to the allocations or the spending above.": "Tidak pernah ditambahkan ke alokasi atau pengeluaran di atas.",
  "Never paste passwords or codes.": "Jangan pernah menempelkan kata sandi atau kode.",
  "Never type passwords, codes or tokens": "Jangan pernah mengetik kata sandi, kode, atau token",
  "New IT request": "Permintaan IT baru",
  "New amount (Rp)": "Jumlah baru (Rp)",
  "New content": "Konten baru",
  "New content brief": "Brief konten baru",
  "New custodian": "Penjaga baru",
  "New facts help IT. The request keeps its history.": "Fakta baru membantu IT. Permintaan tetap menyimpan riwayatnya.",
  "New finance request": "Permintaan keuangan baru",
  "New legal request": "Permintaan legal baru",
  "New number issued": "Nomor baru diterbitkan",
  "New planned date": "Tanggal rencana baru",
  "Next action: {a}": "Tindakan berikutnya: {a}",
  "No PKS linked": "Tidak ada PKS yang ditautkan",
  "No account matches": "Tidak ada akun yang cocok",
  "No allocation": "Tidak ada alokasi",
  "No allocation recorded": "Belum ada alokasi tercatat",
  "No budget line": "Tidak ada pos anggaran",
  "No campaign": "Tanpa kampanye",
  "No evidence linked": "Belum ada bukti yang ditautkan",
  "No finance requests match this filter.": "Tidak ada permintaan keuangan yang cocok dengan filter ini.",
  "No legal requests match this filter.": "Tidak ada permintaan legal yang cocok dengan filter ini.",
  "No notes.": "Tidak ada catatan.",
  "No passwords here": "Tidak ada kata sandi di sini",
  "No payment recorded. Approved is not paid.": "Belum ada pembayaran tercatat. Disetujui bukan berarti dibayar.",
  "No payments recorded in this period.": "Tidak ada pembayaran tercatat pada periode ini.",
  "No requests yet.": "Belum ada permintaan.",
  "No snapshot yet.": "Belum ada snapshot.",
  "No task linked yet.": "Belum ada tugas yang ditautkan.",
  "No version yet.": "Belum ada versi.",
  "No version yet. The drafter adds a link to the draft in the team drive.": "Belum ada versi. Penyusun menambahkan tautan ke draf di drive tim.",
  "No, reopen it": "Belum, buka kembali",
  "Non-disclosure agreement": "Perjanjian kerahasiaan",
  "None linked": "Tidak ada yang ditautkan",
  "None.": "Tidak ada.",
  "Not a duplicate": "Bukan duplikat",
  "Not agreed until MCIT accepts.": "Belum disepakati sampai MCIT menerima.",
  "Not approved": "Belum disetujui",
  "Not assigned": "Belum ditugaskan",
  "Not checked": "Belum diperiksa",
  "Not checked yet": "Belum diperiksa",
  "Not chosen yet": "Belum dipilih",
  "Not given": "Tidak diisi",
  "Not listed": "Tidak terdaftar",
  "Not published": "Belum dipublikasikan",
  "Not ready for invoice": "Belum siap ditagih",
  "Not recorded yet.": "Belum dicatat.",
  "Not reviewed": "Belum ditinjau",
  "Not reviewed, replaced": "Belum ditinjau, sudah diganti",
  "Not triaged": "Belum dipilah",
  "Not verified recently": "Belum diverifikasi akhir-akhir ini",
  "Note for Finance": "Catatan untuk Keuangan",
  "Note saved": "Catatan tersimpan",
  "Note to the requester": "Catatan untuk pemohon",
  "Nothing owed.": "Tidak ada utang.",
  "Nothing planned, due or published on this day.": "Tidak ada yang direncanakan, jatuh tempo, atau dipublikasikan pada hari ini.",
  "Nothing received yet. A due date passing never means received.": "Belum ada yang diterima. Lewat jatuh tempo tidak pernah berarti diterima.",
  "Number": "Nomor",
  "Number format not adopted": "Format nomor belum disahkan",
  "Number issued": "Nomor diterbitkan",
  "Number voided: {r}": "Nomor dibatalkan: {r}",
  "Number {no} issued": "Nomor {no} diterbitkan",
  "On an exact version": "Pada versi yang persis",
  "One carousel, four slides": "Satu carousel, empat slide",
  "One content item, with its own executor, reviewer and dates per channel.": "Satu item konten, dengan pelaksana, peninjau, dan tanggal per kanal sendiri.",
  "One per line: label | https://link": "Satu per baris: label | https://tautan",
  "One per line: name, role, party": "Satu per baris: nama, jabatan, pihak",
  "One per line: name, role, party.": "Satu per baris: nama, jabatan, pihak.",
  "One task, linked here. It shows in the owner’s My Work.": "Satu tugas, ditautkan di sini. Muncul di Pekerjaan Saya milik penanggung jawab.",
  "Only FnL Legal can read it. Never shown to the requester, in search or in exports.": "Hanya Legal FnL yang dapat membacanya. Tidak pernah ditampilkan kepada pemohon, di pencarian, atau di ekspor.",
  "Only approved allocations are listed.": "Hanya alokasi yang disetujui yang ditampilkan.",
  "Only me": "Hanya saya",
  "Only the requester and FnL Legal see the sources": "Hanya pemohon dan Legal FnL yang melihat sumbernya",
  "Open actions": "Tindakan terbuka",
  "Open finance requests": "Permintaan keuangan terbuka",
  "Open incoming terms": "Buka termin masuk",
  "Open legal requests": "Permintaan legal terbuka",
  "Open request": "Permintaan terbuka",
  "Open the BAST request": "Buka permintaan BAST",
  "Open the incoming term": "Buka termin masuk",
  "Opened": "Dibuka",
  "Optional. A routine post needs none.": "Opsional. Unggahan rutin tidak memerlukannya.",
  "Other document": "Dokumen lain",
  "Outstanding": "Terutang",
  "Ownership is verified in the provider. No password is copied here.": "Kepemilikan diverifikasi di penyedia layanan. Tidak ada kata sandi yang disalin ke sini.",
  "PKS": "PKS",
  "PKS signed by every party": "PKS ditandatangani semua pihak",
  "Paid": "Dibayar",
  "Paid (recorded)": "Dibayar (tercatat)",
  "Paid in full. The period review checks it against the evidence.": "Lunas. Tinjauan periode memeriksanya terhadap bukti.",
  "Paid on": "Dibayar pada",
  "Paid would become {n}, outside 0 to the approved {a}.": "Jumlah dibayar akan menjadi {n}, di luar rentang 0 sampai {a} yang disetujui.",
  "Paid {p}, committed not paid {c}, of {a}": "Dibayar {p}, dikomitmenkan belum dibayar {c}, dari {a}",
  "Partially paid": "Dibayar sebagian",
  "Partly paid. {o} is still owed.": "Dibayar sebagian. {o} masih terutang.",
  "Partly received": "Diterima sebagian",
  "Party": "Pihak",
  "Passwords, recovery codes and tokens are never stored in this register, in search or in exports. Logins live in the organization password manager.": "Kata sandi, kode pemulihan, dan token tidak pernah disimpan di daftar ini, di pencarian, atau di ekspor. Info masuk disimpan di pengelola kata sandi organisasi.",
  "Past basis, kept": "Dasar lampau, disimpan",
  "Past due": "Lewat tenggat",
  "Paste the https link to the evidence.": "Tempelkan tautan https ke bukti.",
  "Paste the https link to the public post.": "Tempelkan tautan https ke unggahan publik.",
  "Paste the https link to the signed copy.": "Tempelkan tautan https ke salinan bertanda tangan.",
  "Payee": "Penerima pembayaran",
  "Payment": "Pembayaran",
  "Payment recorded. Paid in full.": "Pembayaran dicatat. Lunas.",
  "Payment recorded. {o} still owed.": "Pembayaran dicatat. {o} masih terutang.",
  "Payment recorded: {a}": "Pembayaran dicatat: {a}",
  "Payment recording": "Pencatatan pembayaran",
  "Payment to correct": "Pembayaran yang dikoreksi",
  "Payment {id}": "Pembayaran {id}",
  "Payments": "Pembayaran",
  "Payments and corrections in this period": "Pembayaran dan koreksi pada periode ini",
  "Period closed. Open actions stay with their owners.": "Periode ditutup. Tindakan terbuka tetap pada penanggung jawabnya.",
  "Period exported": "Periode diekspor",
  "Period preparation": "Penyiapan periode",
  "Period review": "Tinjauan periode",
  "Period reviews": "Tinjauan periode",
  "Planned date": "Tanggal rencana",
  "Planned date moved. Approval and history are unchanged.": "Tanggal rencana dipindahkan. Persetujuan dan riwayat tidak berubah.",
  "Planned date on {ch} moved: {r}": "Tanggal rencana di {ch} dipindahkan: {r}",
  "Planned date passed, not published": "Tanggal rencana terlewat, belum dipublikasikan",
  "Planned only. Publishing is recorded separately.": "Hanya rencana. Publikasi dicatat terpisah.",
  "Planned publication": "Rencana publikasi",
  "Planned {d}": "Direncanakan {d}",
  "Plus or minus. The original payment stays as it was.": "Plus atau minus. Pembayaran asli tetap seperti semula.",
  "Possible duplicate": "Kemungkinan duplikat",
  "Post": "Unggahan",
  "Prepared by": "Disiapkan oleh",
  "Printing": "Percetakan",
  "Priority": "Prioritas",
  "Priority is not a response-time promise.": "Prioritas bukan janji waktu respons.",
  "Propose": "Usulkan",
  "Propose allocation": "Usulkan alokasi",
  "Proposed format {f}. Not adopted yet, so every number here is a provisional label. Numbers are never reused.": "Format usulan {f}. Belum disahkan, jadi setiap nomor di sini adalah label sementara. Nomor tidak pernah dipakai ulang.",
  "Proposed: the FnL Director or the President.": "Usulan: Direktur FnL atau Presiden.",
  "Public link": "Tautan publik",
  "Publication by channel": "Publikasi per kanal",
  "Publication failed on {ch}": "Publikasi gagal di {ch}",
  "Publication recorded on {ch}": "Publikasi dicatat di {ch}",
  "Publication recording": "Pencatatan publikasi",
  "Publication request from HR. Agreed date {d}.": "Permintaan publikasi dari HR. Tanggal disepakati {d}.",
  "Publication requests from HR": "Permintaan publikasi dari HR",
  "Publish on each channel outside the app, then record it here.": "Publikasikan di setiap kanal di luar aplikasi, lalu catat di sini.",
  "Published (recorded)": "Dipublikasikan (tercatat)",
  "Published on": "Dipublikasikan pada",
  "Published on every channel": "Dipublikasikan di semua kanal",
  "Published on every channel.": "Dipublikasikan di semua kanal.",
  "Published on {a} of {b}": "Dipublikasikan di {a} dari {b}",
  "Published {d} by {who}": "Dipublikasikan {d} oleh {who}",
  "Question sent to {who}": "Pertanyaan dikirim ke {who}",
  "Questions": "Pertanyaan",
  "Questions from Legal": "Pertanyaan dari Legal",
  "Ready for invoice": "Siap ditagih",
  "Ready for invoice: {t}": "Siap ditagih: {t}",
  "Ready-for-invoice gate": "Gerbang siap tagih",
  "Ready-for-invoice sent to {who}": "Siap tagih dikirim ke {who}",
  "Reason and scope": "Alasan dan cakupan",
  "Reason for canceling": "Alasan pembatalan",
  "Reason for rejecting": "Alasan penolakan",
  "Receipt": "Penerimaan",
  "Receipt or quotation number": "Nomor kuitansi atau penawaran",
  "Receipt recorded": "Penerimaan dicatat",
  "Receipt recorded: {a}": "Penerimaan dicatat: {a}",
  "Receipts": "Penerimaan",
  "Received": "Diterima",
  "Received (recorded)": "Diterima (tercatat)",
  "Reconciled": "Direkonsiliasi",
  "Reconciled in a period review.": "Direkonsiliasi dalam tinjauan periode.",
  "Reconciled in {p}, snapshot {v}": "Direkonsiliasi di {p}, snapshot {v}",
  "Record a blocker": "Catat hambatan",
  "Record a correction": "Catat koreksi",
  "Record a correction or takedown": "Catat koreksi atau penurunan",
  "Record a payment only after it was made outside the app.": "Catat pembayaran hanya setelah dilakukan di luar aplikasi.",
  "Record a receipt": "Catat penerimaan",
  "Record an approved exception": "Catat pengecualian yang disetujui",
  "Record as an exception": "Catat sebagai pengecualian",
  "Record blocker": "Catat hambatan",
  "Record check": "Catat pemeriksaan",
  "Record correction": "Catat koreksi",
  "Record delivery evidence check": "Catat pemeriksaan bukti penyerahan",
  "Record discrepancy": "Catat selisih",
  "Record exception": "Catat pengecualian",
  "Record failure": "Catat kegagalan",
  "Record invoice": "Catat faktur",
  "Record payment": "Catat pembayaran",
  "Record publication": "Catat publikasi",
  "Record receipt": "Catat penerimaan",
  "Record signature": "Catat tanda tangan",
  "Record the invoice issued": "Catat faktur yang diterbitkan",
  "Recorded as declined. The request stays unsigned.": "Dicatat sebagai menolak. Permintaan tetap belum ditandatangani.",
  "Recorded on {ch}. {n} channel still open.": "Dicatat di {ch}. {n} kanal masih terbuka.",
  "Recorded transactions": "Transaksi tercatat",
  "Records version {v}. The app never posts for you.": "Mencatat versi {v}. Aplikasi tidak pernah mengunggah untuk Anda.",
  "Reference": "Referensi",
  "Register and archive": "Daftarkan dan arsipkan",
  "Register exported": "Register diekspor",
  "Registered": "Terdaftar",
  "Registered and archived": "Terdaftar dan diarsipkan",
  "Registered. Nothing else is needed.": "Terdaftar. Tidak ada lagi yang diperlukan.",
  "Reject request": "Tolak permintaan",
  "Rejected. The history stays.": "Ditolak. Riwayat tetap ada.",
  "Rejected: {r}": "Ditolak: {r}",
  "Remaining": "Sisa",
  "Remaining if approved": "Sisa jika disetujui",
  "Removed request": "Permintaan dihapus",
  "Renewal": "Perpanjangan",
  "Reopened": "Dibuka kembali",
  "Reopened with new facts. {who} looks again.": "Dibuka kembali dengan fakta baru. {who} memeriksa lagi.",
  "Reopened. {who} was told.": "Dibuka kembali. {who} sudah diberi tahu.",
  "Reopened: {r}": "Dibuka kembali: {r}",
  "Replaces {no}": "Menggantikan {no}",
  "Request": "Permintaan",
  "Request access": "Minta akses",
  "Request canceled": "Permintaan dibatalkan",
  "Request rejected": "Permintaan ditolak",
  "Request revision": "Minta revisi",
  "Request sent to IT": "Permintaan dikirim ke IT",
  "Request state": "Status permintaan",
  "Request submitted to Finance": "Permintaan diajukan ke Keuangan",
  "Request submitted to FnL Legal": "Permintaan diajukan ke Legal FnL",
  "Request type": "Jenis permintaan",
  "Requested by": "Diminta oleh",
  "Requested in": "Diminta melalui",
  "Requested, not agreed, until Finance accepts.": "Diminta, belum disepakati, sampai Keuangan menerima.",
  "Requester": "Pemohon",
  "Requesting unit": "Unit pemohon",
  "Requests on this line": "Permintaan pada pos ini",
  "Requests to Finance & Legal": "Permintaan ke Finance & Legal",
  "Requests to FnL": "Permintaan ke FnL",
  "Requests to MCIT": "Permintaan ke MCIT",
  "Required for agreements. One per line: name, role, party.": "Wajib untuk perjanjian. Satu per baris: nama, jabatan, pihak.",
  "Required for an attestation: who confirmed it and how.": "Wajib untuk pernyataan: siapa yang mengonfirmasi dan bagaimana.",
  "Required for an attestation: who saw it and where.": "Wajib untuk pernyataan: siapa yang melihatnya dan di mana.",
  "Required for this type.": "Wajib untuk jenis ini.",
  "Required when you decline. Say what the requester should expect.": "Wajib jika Anda menolak. Sampaikan apa yang dapat diharapkan pemohon.",
  "Resolution": "Penyelesaian",
  "Resolved, waiting for you to confirm": "Terselesaikan, menunggu konfirmasi Anda",
  "Resolved: {r}": "Terselesaikan: {r}",
  "Restricted to FnL Legal": "Terbatas untuk Legal FnL",
  "Restricted to IT": "Terbatas untuk IT",
  "Retry {t} on {ch}": "Ulangi {t} di {ch}",
  "Return for information": "Kembalikan untuk informasi",
  "Return to Legal": "Kembalikan ke Legal",
  "Return to requester": "Kembalikan ke pemohon",
  "Return unclear briefs instead of promising a date.": "Kembalikan brief yang belum jelas alih-alih menjanjikan tanggal.",
  "Returned because": "Dikembalikan karena",
  "Returned for information": "Dikembalikan untuk informasi",
  "Returned to Legal": "Dikembalikan ke Legal",
  "Review started": "Tinjauan dimulai",
  "Reviewed by": "Ditinjau oleh",
  "Reviewer notes": "Catatan peninjau",
  "Revise {t} (v{v})": "Revisi {t} (v{v})",
  "Revision requested": "Revisi diminta",
  "Revision requested on version {v}": "Revisi diminta pada versi {v}",
  "Row total {s} matches paid {p}.": "Total baris {s} sesuai dengan dibayar {p}.",
  "SK": "SK",
  "Same amount and reference as {r}. Nothing is deleted; a finance reviewer decides.": "Jumlah dan referensi sama dengan {r}. Tidak ada yang dihapus; peninjau keuangan yang memutuskan.",
  "Same claim: cancel this one": "Klaim yang sama: batalkan yang ini",
  "Save a new snapshot after the correction": "Simpan snapshot baru setelah koreksi",
  "Save amendment": "Simpan perubahan",
  "Save custodian": "Simpan penjaga",
  "Save note": "Simpan catatan",
  "Save snapshot": "Simpan snapshot",
  "Say exactly what is missing.": "Sebutkan dengan tepat apa yang kurang.",
  "Say what blocks the work.": "Sebutkan apa yang menghambat pekerjaan.",
  "Say what changed and why.": "Sebutkan apa yang berubah dan mengapa.",
  "Say what changed in this version.": "Sebutkan apa yang berubah di versi ini.",
  "Say what happens.": "Jelaskan apa yang terjadi.",
  "Say what it is for.": "Sebutkan untuk apa.",
  "Say what must change.": "Sebutkan apa yang harus diubah.",
  "Say what should happen.": "Jelaskan apa yang seharusnya terjadi.",
  "Say what still happens.": "Jelaskan apa yang masih terjadi.",
  "Say what the document must achieve.": "Sebutkan apa yang harus dicapai dokumen ini.",
  "Say what the money is for.": "Sebutkan untuk apa dananya.",
  "Say what the party said.": "Sebutkan apa yang dikatakan pihak tersebut.",
  "Say what the requester should expect instead.": "Sampaikan apa yang dapat diharapkan pemohon sebagai gantinya.",
  "Say what was done.": "Sebutkan apa yang dilakukan.",
  "Say what went wrong.": "Sebutkan apa yang salah.",
  "Say what you need delivered.": "Sebutkan apa yang perlu diserahkan.",
  "Say what you need to know.": "Sebutkan apa yang perlu Anda ketahui.",
  "Say where the figure comes from.": "Sebutkan asal angka tersebut.",
  "Say who confirmed the signature and how.": "Sebutkan siapa yang mengonfirmasi tanda tangan dan bagaimana.",
  "Say who saw it and where.": "Sebutkan siapa yang melihatnya dan di mana.",
  "Say why it is urgent.": "Jelaskan mengapa mendesak.",
  "Schedule the approved version.": "Jadwalkan versi yang disetujui.",
  "Schedule v{v}": "Jadwalkan v{v}",
  "Scheduled": "Terjadwal",
  "Scheduled version {v}": "Versi {v} dijadwalkan",
  "Scheduled. Record each channel after it is posted.": "Terjadwal. Catat setiap kanal setelah diunggah.",
  "Scheduling records the plan. Nothing is posted by the app.": "Penjadwalan mencatat rencana. Aplikasi tidak mengunggah apa pun.",
  "Screenshot": "Tangkapan layar",
  "Screenshot or evidence link": "Tangkapan layar atau tautan bukti",
  "Search accounts or custodians": "Cari akun atau penjaga",
  "Send ready-for-invoice to Finance": "Kirim siap tagih ke Keuangan",
  "Send to Finance": "Kirim ke Keuangan",
  "Send version {v}": "Kirim versi {v}",
  "Send v{v} for review": "Kirim v{v} untuk ditinjau",
  "Sent for signature": "Dikirim untuk ditandatangani",
  "Sent to {who}. No invoice or payment was created.": "Dikirim ke {who}. Tidak ada faktur atau pembayaran yang dibuat.",
  "Sent under an exception": "Dikirim dengan pengecualian",
  "Separate grants, not job titles. POL and the division lead confirm them before launch.": "Izin terpisah, bukan jabatan. POL dan pimpinan divisi mengonfirmasinya sebelum peluncuran.",
  "Short notice": "Pemberitahuan mendadak",
  "Shown on the gate and to Finance.": "Ditampilkan di gerbang dan kepada Keuangan.",
  "Signatories": "Penanda tangan",
  "Signature": "Tanda tangan",
  "Signature recorded for {party}": "Tanda tangan dicatat untuk {party}",
  "Signature recorded. {a} of {b}.": "Tanda tangan dicatat. {a} dari {b}.",
  "Signature recording": "Pencatatan tanda tangan",
  "Signatures": "Tanda tangan",
  "Signed": "Ditandatangani",
  "Signed copy": "Salinan bertanda tangan",
  "Signed copy (link)": "Salinan bertanda tangan (tautan)",
  "Signed copy recorded": "Salinan bertanda tangan dicatat",
  "Signed on": "Ditandatangani pada",
  "Signed on {d}": "Ditandatangani pada {d}",
  "Snapshot": "Snapshot",
  "Snapshot {v}": "Snapshot {v}",
  "Snapshot {v} saved": "Snapshot {v} tersimpan",
  "Snapshots": "Snapshot",
  "Someone else approves it. Self-approval is denied (proposed separation rule).": "Orang lain yang menyetujuinya. Menyetujui permintaan sendiri ditolak (aturan pemisahan usulan).",
  "Source material": "Bahan sumber",
  "Sources (KAK, proposal, earlier versions)": "Sumber (KAK, proposal, versi sebelumnya)",
  "Start a legal or finance request. Drafts are kept until you submit.": "Mulai permintaan legal atau keuangan. Draf disimpan sampai Anda mengajukannya.",
  "Start an IT request or a content brief.": "Mulai permintaan IT atau brief konten.",
  "Start drafting": "Mulai menyusun",
  "Steps to see it": "Langkah untuk melihatnya",
  "Still owed at period end": "Masih terutang di akhir periode",
  "Submit request": "Ajukan permintaan",
  "Submit when the amount, budget line and evidence are ready.": "Ajukan setelah jumlah, pos anggaran, dan bukti siap.",
  "Submit when the required fields are complete.": "Ajukan setelah kolom wajib lengkap.",
  "Submitted. Finance will check a possible duplicate.": "Diajukan. Keuangan akan memeriksa kemungkinan duplikat.",
  "S{v}": "S{v}",
  "Task created": "Tugas dibuat",
  "Task created and linked": "Tugas dibuat dan ditautkan",
  "Template used": "Templat yang dipakai",
  "Term recorded from PKS version {v}; waiting for the BAST gate": "Termin dicatat dari PKS versi {v}; menunggu gerbang BAST",
  "Term {t}, approved allocations": "Periode {t}, alokasi disetujui",
  "Thanks. The request is closed.": "Terima kasih. Permintaan ditutup.",
  "That is the current amount.": "Itu jumlah saat ini.",
  "That reference is already recorded. Nothing was added.": "Referensi itu sudah tercatat. Tidak ada yang ditambahkan.",
  "The September close also runs as the project {p}.": "Tutup buku September juga berjalan sebagai proyek {p}.",
  "The app records signatures made elsewhere. It does not sign, send or verify documents.": "Aplikasi mencatat tanda tangan yang dibuat di tempat lain. Aplikasi tidak menandatangani, mengirim, atau memverifikasi dokumen.",
  "The current version is not approved. Only an approved version can be recorded as published.": "Versi saat ini belum disetujui. Hanya versi yang disetujui yang dapat dicatat sebagai dipublikasikan.",
  "The document stays in the team drive. This records which file was reviewed.": "Dokumen tetap di drive tim. Ini mencatat berkas mana yang ditinjau.",
  "The executor and reviewer are told. Approval and history do not change.": "Pelaksana dan peninjau diberi tahu. Persetujuan dan riwayat tidak berubah.",
  "The number stays in the register with this reason. A new number can be issued after.": "Nomor tetap di register dengan alasan ini. Nomor baru dapat diterbitkan setelahnya.",
  "The requester sent a new version. Review it again.": "Pemohon mengirim versi baru. Tinjau kembali.",
  "The reviewer must be someone other than the executor.": "Peninjau harus orang lain selain pelaksana.",
  "The rows below are compared with receipts only. This is not full accounting proof.": "Baris di bawah hanya dicocokkan dengan kuitansi. Ini bukan bukti akuntansi lengkap.",
  "The same reference twice is refused, so a retry never pays twice.": "Referensi yang sama dua kali ditolak, sehingga percobaan ulang tidak pernah membayar dua kali.",
  "The survey suggested H-3 for agreements and H-2 for other letters. It is not adopted policy, so nothing is rejected automatically. Say why it is urgent; FnL decides.": "Survei menyarankan H-3 untuk perjanjian dan H-2 untuk surat lain. Ini bukan kebijakan yang disahkan, jadi tidak ada yang ditolak otomatis. Jelaskan mengapa mendesak; FnL yang memutuskan.",
  "This creates a deficit of {d}. Paid records stay unchanged. Save only as a recorded exception.": "Ini menimbulkan defisit sebesar {d}. Catatan pembayaran tetap. Simpan hanya sebagai pengecualian tercatat.",
  "This looks like a password or code. Remove it; IT never needs it here.": "Ini tampak seperti kata sandi atau kode. Hapus; IT tidak pernah membutuhkannya di sini.",
  "This request has no approved budget line. Link one first.": "Permintaan ini tidak memiliki pos anggaran yang disetujui. Tautkan dulu.",
  "To FnL Finance": "Ke Keuangan FnL",
  "Tools and hosting": "Alat dan hosting",
  "Totals changed since the last snapshot": "Total berubah sejak snapshot terakhir",
  "Totals from the rows, now": "Total dari baris, saat ini",
  "Totals: {n} rows, {s}. Each row links to its request; corrections point at the payment they change.": "Total: {n} baris, {s}. Setiap baris tertaut ke permintaannya; koreksi menunjuk ke pembayaran yang diubahnya.",
  "Transfer or receipt reference": "Referensi transfer atau kuitansi",
  "Transport": "Transportasi",
  "Triage": "Pemilahan",
  "Triaged": "Dipilah",
  "Triaged and assigned to {who}": "Dipilah dan ditugaskan ke {who}",
  "Triaged; {who} is drafting": "Dipilah; {who} menyusun",
  "Try another name, or ask in Requests to MCIT.": "Coba nama lain, atau tanyakan di Permintaan ke MCIT.",
  "Under review": "Sedang ditinjau",
  "Undid the amendment": "Membatalkan perubahan",
  "Undid: {m}": "Dibatalkan: {m}",
  "Unknown, not zero. Requests for this unit cannot be approved against a budget line.": "Tidak diketahui, bukan nol. Permintaan untuk unit ini tidak dapat disetujui terhadap pos anggaran.",
  "Unresolved actions": "Tindakan belum selesai",
  "Urgent exception": "Pengecualian mendesak",
  "Use HH:MM, for example 19:00.": "Gunakan JJ:MM, misalnya 19:00.",
  "Use the actual publication time, not a future one.": "Gunakan waktu publikasi sebenarnya, bukan waktu mendatang.",
  "Use the actual signing date, not a future one.": "Gunakan tanggal penandatanganan sebenarnya, bukan tanggal mendatang.",
  "Use the date it was actually issued.": "Gunakan tanggal penerbitan sebenarnya.",
  "Use the date the money actually arrived.": "Gunakan tanggal uang benar-benar masuk.",
  "Use the date the payment was actually made.": "Gunakan tanggal pembayaran benar-benar dilakukan.",
  "Used to spot possible duplicates.": "Dipakai untuk mengenali kemungkinan duplikat.",
  "Vault entry": "Entri brankas",
  "Version 2 sent for review": "Versi 2 dikirim untuk ditinjau",
  "Version or change reference": "Versi atau referensi perubahan",
  "Version ready for review": "Versi siap ditinjau",
  "Version sent": "Versi dikirim",
  "Version {a} was approved. Version {b} changed the content, so it needs its own review before it can be scheduled or published.": "Versi {a} sudah disetujui. Versi {b} mengubah konten, jadi perlu ditinjau sendiri sebelum dapat dijadwalkan atau dipublikasikan.",
  "Version {a} was approved. Version {b} changed the document, so that approval does not carry over.": "Versi {a} sudah disetujui. Versi {b} mengubah dokumen, jadi persetujuan itu tidak berlaku untuknya.",
  "Version {v} approved for signature": "Versi {v} disetujui untuk ditandatangani",
  "Version {v} is approved. Sending a new version makes that approval stale until it is reviewed again.": "Versi {v} sudah disetujui. Mengirim versi baru membuat persetujuan itu kedaluwarsa sampai ditinjau lagi.",
  "Version {v} sent for review; the version {a} approval does not carry over": "Versi {v} dikirim untuk ditinjau; persetujuan versi {a} tidak berlaku untuknya",
  "Version {v} sent to {who}": "Versi {v} dikirim ke {who}",
  "Version {v} sent. The earlier approval is now stale.": "Versi {v} dikirim. Persetujuan sebelumnya kini kedaluwarsa.",
  "Version {v} was replaced. Nothing was recorded; review the current version.": "Versi {v} sudah diganti. Tidak ada yang dicatat; tinjau versi saat ini.",
  "Void": "Batal",
  "Void this number": "Batalkan nomor ini",
  "Void {no}": "Batalkan {no}",
  "Void, kept in the register": "Batal, tetap di register",
  "Void: {r}": "Batal: {r}",
  "Waiting": "Menunggu",
  "Waiting for a decision": "Menunggu keputusan",
  "Waiting for information": "Menunggu informasi",
  "Waiting for the allocation approver. An unapproved line is never used as budget.": "Menunggu penyetuju alokasi. Pos yang belum disetujui tidak pernah dipakai sebagai anggaran.",
  "Waiting for the legal gate": "Menunggu gerbang legal",
  "Waiting for the requester.": "Menunggu pemohon.",
  "Waiting for your answer.": "Menunggu jawaban Anda.",
  "Waiting for {who} to accept or return it. Silence never accepts.": "Menunggu {who} menerima atau mengembalikannya. Diam tidak pernah berarti menerima.",
  "Waiting: {r}": "Menunggu: {r}",
  "Wanted by": "Diinginkan pada",
  "Website or tool problem": "Masalah situs web atau alat",
  "What blocks the work": "Apa yang menghambat pekerjaan",
  "What do you need to know?": "Apa yang perlu Anda ketahui?",
  "What happens": "Apa yang terjadi",
  "What is missing": "Apa yang kurang",
  "What is missing?": "Apa yang kurang?",
  "What must change": "Apa yang harus diubah",
  "What should happen": "Apa yang seharusnya terjadi",
  "What still happens": "Apa yang masih terjadi",
  "What the document must achieve.": "Apa yang harus dicapai dokumen ini.",
  "What the money is for.": "Untuk apa dananya.",
  "What was corrected or taken down, and why": "Apa yang dikoreksi atau diturunkan, dan mengapa",
  "What was done": "Apa yang dilakukan",
  "What went wrong": "Apa yang salah",
  "When the executor sends a version for review. Usually before the planned publication.": "Saat pelaksana mengirim versi untuk ditinjau. Biasanya sebelum rencana publikasi.",
  "Where the figure comes from, for example the annual plan line.": "Asal angka tersebut, misalnya pos rencana tahunan.",
  "Who can do what here (proposed)": "Siapa dapat melakukan apa di sini (usulan)",
  "Who is affected": "Siapa yang terdampak",
  "Who looks after each organization account and how to get access.": "Siapa yang menjaga setiap akun organisasi dan cara mendapatkan akses.",
  "Whole rupiah only.": "Hanya rupiah bulat.",
  "Whole unit": "Seluruh unit",
  "Why is it urgent?": "Mengapa mendesak?",
  "Why return it?": "Mengapa dikembalikan?",
  "Why void this number?": "Mengapa nomor ini dibatalkan?",
  "Working": "Dikerjakan",
  "Write the handover note.": "Tulis catatan serah terima.",
  "Write the note.": "Tulis catatannya.",
  "Yes, it is solved": "Ya, sudah selesai",
  "You have no requests yet": "Anda belum memiliki permintaan",
  "You made this version, so another reviewer decides.": "Anda membuat versi ini, jadi peninjau lain yang memutuskan.",
  "You prepared this period; the reviewer should be someone else (proposed).": "Anda menyiapkan periode ini; peninjaunya sebaiknya orang lain (usulan).",
  "You proposed it, so another approver decides.": "Anda yang mengusulkannya, jadi penyetuju lain yang memutuskan.",
  "You requested this": "Anda yang meminta ini",
  "You requested this, so someone else approves it.": "Anda yang meminta ini, jadi orang lain yang menyetujuinya.",
  "You wrote this version, so another reviewer decides.": "Anda menulis versi ini, jadi peninjau lain yang memutuskan.",
  "Your IT requests": "Permintaan IT Anda",
  "Your content briefs": "Brief konten Anda",
  "Your draft": "Draf Anda",
  "Your draft request stays as it is. Add what is missing here.": "Draf permintaan Anda tetap seperti semula. Tambahkan yang kurang di sini.",
  "Your requests": "Permintaan Anda",
  "accepted the ready-for-invoice gate for": "menerima gerbang siap tagih untuk",
  "amended an allocation": "mengubah alokasi",
  "answered a question on": "menjawab pertanyaan pada",
  "approved a finance request": "menyetujui permintaan keuangan",
  "approved an allocation": "menyetujui alokasi",
  "asked for an urgent exception on": "mengajukan pengecualian mendesak pada",
  "asked for information on": "meminta informasi pada",
  "canceled": "membatalkan",
  "canceled a finance request": "membatalkan permintaan keuangan",
  "changed the custodian of": "mengganti penjaga",
  "checked a payment in": "memeriksa pembayaran di",
  "checked the delivery evidence for": "memeriksa bukti penyerahan untuk",
  "cleared a blocker on": "mengatasi hambatan pada",
  "closed the period": "menutup periode",
  "confirmed solved": "mengonfirmasi selesai",
  "confirmed the custodian of": "mengonfirmasi penjaga",
  "created content": "membuat konten",
  "custodian": "penjaga",
  "evidence recorded": "bukti tercatat",
  "exception: below commitments": "pengecualian: di bawah komitmen",
  "exported IT requests": "mengekspor permintaan IT",
  "exported content records": "mengekspor catatan konten",
  "exported finance requests": "mengekspor permintaan keuangan",
  "exported the document register": "mengekspor register dokumen",
  "exported the period review": "mengekspor tinjauan periode",
  "had a content brief accepted by MCIT": "brief kontennya diterima MCIT",
  "issued a document number for": "menerbitkan nomor dokumen untuk",
  "linked a task to": "menautkan tugas ke",
  "moved the planned date of": "memindahkan tanggal rencana",
  "outstanding": "terutang",
  "paid": "dibayar",
  "proposed an allocation": "mengusulkan alokasi",
  "received a content brief": "menerima brief konten",
  "received an IT request": "menerima permintaan IT",
  "received an updated content brief": "menerima brief konten yang diperbarui",
  "recorded a blocker on": "mencatat hambatan pada",
  "recorded a correction on": "mencatat koreksi pada",
  "recorded a declined signature on": "mencatat penolakan tanda tangan pada",
  "recorded a discrepancy in": "mencatat selisih di",
  "recorded a failed publication for": "mencatat publikasi gagal untuk",
  "recorded a gate exception on": "mencatat pengecualian gerbang pada",
  "recorded a payment on": "mencatat pembayaran pada",
  "recorded a publication for": "mencatat publikasi untuk",
  "recorded a receipt for": "mencatat penerimaan untuk",
  "recorded a signature on": "mencatat tanda tangan pada",
  "recorded an invoice for": "mencatat faktur untuk",
  "recorded every signature on": "mencatat semua tanda tangan pada",
  "recorded the bank comparison for": "mencatat pencocokan bank untuk",
  "registered and archived": "mendaftarkan dan mengarsipkan",
  "rejected a finance request": "menolak permintaan keuangan",
  "resolved an IT request": "menyelesaikan permintaan IT",
  "resolved an open action in": "menyelesaikan tindakan terbuka di",
  "returned a content brief": "mengembalikan brief konten",
  "returned a finance request": "mengembalikan permintaan keuangan",
  "returned an allocation proposal": "mengembalikan usulan alokasi",
  "returned the ready-for-invoice gate for": "mengembalikan gerbang siap tagih untuk",
  "saved a snapshot of": "menyimpan snapshot",
  "sent a legal request to FnL": "mengirim permintaan legal ke FnL",
  "sent a version for review": "mengirim versi untuk ditinjau",
  "sent an IT request to MCIT": "mengirim permintaan IT ke MCIT",
  "sent for signature": "mengirim untuk ditandatangani",
  "sent the ready-for-invoice gate to Finance for": "mengirim gerbang siap tagih ke Keuangan untuk",
  "started drafting": "mulai menyusun",
  "started reviewing": "mulai meninjau",
  "submitted a finance request": "mengajukan permintaan keuangan",
  "submitted a legal request": "mengajukan permintaan legal",
  "the internal due date": "tenggat internal",
  "triaged": "memilah",
  "undid a change on": "membatalkan perubahan pada",
  "undid a custodian change on": "membatalkan pergantian penjaga pada",
  "undid a custodian confirmation on": "membatalkan konfirmasi penjaga pada",
  "undid an allocation amendment": "membatalkan perubahan alokasi",
  "undid an allocation approval": "membatalkan persetujuan alokasi",
  "voided a document number on": "membatalkan nomor dokumen pada",
  "withdrew an allocation proposal": "menarik usulan alokasi",
  "{a} of {b} signatures recorded. It stays here until every party has signed.": "{a} dari {b} tanda tangan tercatat. Tetap di sini sampai semua pihak menandatangani.",
  "{f} is proposed. Numbers here are provisional labels for the walkthrough. The real build issues each number on the server, one at a time, so two people can never get the same number.": "{f} masih usulan. Nomor di sini adalah label sementara untuk peragaan. Versi sebenarnya menerbitkan setiap nomor di server, satu per satu, sehingga dua orang tidak pernah mendapat nomor yang sama.",
  "{i} issued, {v} void. Next number {n}. No number is reused.": "{i} diterbitkan, {v} batal. Nomor berikutnya {n}. Tidak ada nomor yang dipakai ulang.",
  "{no} voided. It stays in the register.": "{no} dibatalkan. Tetap ada di register.",
  "{n} rows": "{n} baris",
  "{party} declined to sign": "{party} menolak menandatangani",
  "{who} answered your content brief": "{who} menjawab brief konten Anda",
  "{who} answered your ready-for-invoice gate": "{who} menjawab gerbang siap tagih Anda",
  "{who} approved a request that is ready for payment": "{who} menyetujui permintaan yang siap dibayar",
  "{who} approved an exception: {r}": "{who} menyetujui pengecualian: {r}",
  "{who} approved your content": "{who} menyetujui konten Anda",
  "{who} approved your finance request. It is not paid yet": "{who} menyetujui permintaan keuangan Anda. Belum dibayar",
  "{who} asked for an urgent exception": "{who} mengajukan pengecualian mendesak",
  "{who} asked for changes to your content": "{who} meminta perubahan pada konten Anda",
  "{who} asked you to draft a legal document": "{who} meminta Anda menyusun dokumen legal",
  "{who} assigned an IT request to you": "{who} menugaskan permintaan IT kepada Anda",
  "{who} canceled a content item": "{who} membatalkan item konten",
  "{who} confirms it is solved or reopens it.": "{who} mengonfirmasi sudah selesai atau membukanya kembali.",
  "{who} decided on your allocation proposal": "{who} memutuskan usulan alokasi Anda",
  "{who} gave you a content item": "{who} memberi Anda item konten",
  "{who} gave you a period review action": "{who} memberi Anda tindakan tinjauan periode",
  "{who} is reviewing it.": "{who} sedang meninjaunya.",
  "{who} is working on it.": "{who} sedang mengerjakannya.",
  "{who} issues the document number.": "{who} menerbitkan nomor dokumen.",
  "{who} made you the custodian of an account": "{who} menjadikan Anda penjaga sebuah akun",
  "{who} moved a planned publication date": "{who} memindahkan tanggal rencana publikasi",
  "{who} needs information for your IT request": "{who} memerlukan informasi untuk permintaan IT Anda",
  "{who} needs information for your legal request": "{who} memerlukan informasi untuk permintaan legal Anda",
  "{who} plans the work.": "{who} merencanakan pekerjaannya.",
  "{who} prepares a new version.": "{who} menyiapkan versi baru.",
  "{who} prepares the first version.": "{who} menyiapkan versi pertama.",
  "{who} proposed a budget allocation": "{who} mengusulkan alokasi anggaran",
  "{who} recorded a failed publication. A retry is needed": "{who} mencatat publikasi gagal. Perlu diulang",
  "{who} recorded a gate exception in your name": "{who} mencatat pengecualian gerbang atas nama Anda",
  "{who} recorded a payment on your request": "{who} mencatat pembayaran pada permintaan Anda",
  "{who} recorded every BAST signature. Check the delivery evidence": "{who} mencatat semua tanda tangan BAST. Periksa bukti penyerahan",
  "{who} recorded the last signature": "{who} mencatat tanda tangan terakhir",
  "{who} reopened an IT request": "{who} membuka kembali permintaan IT",
  "{who} resolved your IT request. Is it solved?": "{who} menyelesaikan permintaan IT Anda. Apakah sudah beres?",
  "{who} reviewed your draft": "{who} meninjau draf Anda",
  "{who} reviews version {v}.": "{who} meninjau versi {v}.",
  "{who} scheduled your content": "{who} menjadwalkan konten Anda",
  "{who} sends a new version.": "{who} mengirim versi baru.",
  "{who} sends a version for review by {d}.": "{who} mengirim versi untuk ditinjau paling lambat {d}.",
  "{who} sends the approved version for signature.": "{who} mengirim versi yang disetujui untuk ditandatangani.",
  "{who} sent a content brief": "{who} mengirim brief konten",
  "{who} sent a finance request for approval": "{who} mengirim permintaan keuangan untuk disetujui",
  "{who} sent a legal document for your review": "{who} mengirim dokumen legal untuk Anda tinjau",
  "{who} sent a legal request": "{who} mengirim permintaan legal",
  "{who} sent an IT request": "{who} mengirim permintaan IT",
  "{who} sent content for your review": "{who} mengirim konten untuk Anda tinjau",
  "{who} sent you a ready-for-invoice gate": "{who} mengirimi Anda gerbang siap tagih",
  "{who} starts drafting.": "{who} mulai menyusun.",
  "{who} updated a legal request of yours": "{who} memperbarui permintaan legal Anda",
  "{who} updated an IT request": "{who} memperbarui permintaan IT",
  "{who} updated your finance request": "{who} memperbarui permintaan keuangan Anda",
  "{who}, {d}": "{who}, {d}",
  "{who}: {r}": "{who}: {r}",
});
const FNL = 'fnl', MC = 'mcit';

// ---------- small helpers (local to this file) ----------
const chip = (def, pill = 'pill') => state(L(def[0]), def[1], def[2], pill);
const sec = (title, n, extra = '') => `<h2 class="sec-h">${title}${n != null ? ` <span class="n">${n}</span>` : ''}${extra}</h2>`;
const note = (kind, ic, title, body = '', acts = '') => `<div class="notice n-${kind}"><i class="n-ic" style="--m:${maskUrl(A.ui[ic] || A.ui.info)}"></i><div><b>${title}</b>${body ? `<p>${body}</p>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
const emptyBox = (title, body, extra = '') => `<div class="empty"><b>${title}</b><p>${body}</p>${extra}</div>`;
const locked = label => `<span class="restricted">${icon('lock')}${label}</span>`;
const meta = rows => `<dl class="meta fm-meta">${rows.filter(Boolean).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
const nl = s => esc(s || '').replace(/\n/g, '<br>');
const fmtD = d => d ? `${dShort(d)} ${D(d).getFullYear()}` : '';
const fmtDT = s => s ? `${dShort(s.slice(0, 10))} ${s.slice(11, 16)}` : '';
const who = id => id && person(id) ? `<button class="fm-who" data-act="open-person" data-id="${esc(id)}">${av(id, 'av-xs')}<span>${esc(first(id))}</span></button>` : `<span class="t-mute">${L('Not assigned')}</span>`;
const byAt = (id, at) => `${who(id)}<span class="fm-at">${esc(fmtDT(at))}</span>`;
const crumb = (d, parts) => `${esc(div(d).short)}<i>/</i>${parts.map(([h, t], i) => i === parts.length - 1 ? `<b>${esc(t)}</b>` : `<a href="#/${h}">${esc(t)}</a>`).join('<i>/</i>')}`;
const useWs = d => { const m = me(); if (m && visibleDivs(m).includes(d) && session.ws !== d) { session.ws = d; saveSession(); } };
const $v = sel => { const el = $(sel); return el ? el.value.trim() : ''; };
const bad = (sel, msg) => { const el = $(sel); const f = el && el.closest('.field'); if (f) { f.classList.add('invalid'); const h = f.querySelector('.help'); if (h) h.textContent = msg; } if (el) el.focus(); return false; };
const opts = (pairs, cur, blank) => `${blank ? `<option value="">${esc(blank)}</option>` : ''}${pairs.map(([v, t]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(t)}</option>`).join('')}`;
const pOpts = (ids, cur, blank) => opts(ids.map(id => [id, pname(id)]), cur, blank);
const tgt = (id, name, h) => ({type: 'link', id, name, h});
// Updates for these records carry their route (ref.h). UXD1's wrappers in div-hr-sng.js render and open any update or change with an h.
const upd = (to, type, title, h, actor) => { actor = actor || session.me; if (!to || to === actor) return; db.updates.unshift({id: uid('n'), to, type, actor, ref: {type: 'link', id: h, h, title}, at: nowStamp(), read: false}); };
const failSave = () => /fail=save/.test(location.search); // QA hook shared with UX2: the save fails and the draft stays
const field = (id, label, ctl, help = '', req = false) => `<div class="field"><label for="${id}">${label}${req ? ' <span class="req">*</span>' : ''}</label>${ctl}<span class="help">${help}</span></div>`;
const inp = (id, v = '', x = '') => `<input class="input" id="${id}" value="${esc(v)}" ${x}>`;
const txa = (id, v = '', x = '') => `<textarea class="textarea" id="${id}" ${x}>${esc(v)}</textarea>`;
const safeUrl = u => /^https:\/\/[^\s]+$/i.test(u || '');
const linkOut = (label, url) => url ? (safeUrl(url) ? `<a class="ctx fm-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon('external')}${esc(label || url)}</a>` : `<span class="ctx">${esc(label || url)}</span>`) : '';
const steps = (list, idx) => `<div class="fm-steps" aria-label="${esc(L('Progress'))}" data-now="${esc(idx >= 0 && idx < list.length ? L(list[idx]) : '')}">${list.map((s, i) => `<span class="${i < idx ? 'fm-sd' : i === idx ? 'fm-sn' : ''}">${L(s)}</span>`).join('')}</div>`;
const isTopP = p => !!p && (p.role === 'president' || p.role === 'vp' || !!p.admin);
const isBoardP = p => !!p && p.role === 'board';
const unitLead = (p, unit) => !!p && !!unit && p.div === unit && rank(p) >= 2;
const unitName = u => u && div(u) ? div(u).short : L('Organization');
// CSV export of a scoped list (finance_receipts_export, legal_export, marketing_exports). Only the rows on screen; no restricted fields.
function csv(name, head, rows) {
  const q = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const blob = new Blob([[head, ...rows].map(r => r.map(q).join(',')).join('\n')], {type: 'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// ---------- money (integer IDR only, finance_validation, data_money) ----------
const fmtN = n => Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const idr = (n, cls = '') => n == null ? `<span class="t-mute">${L('Not recorded')}</span>` : `<span class="money ${cls}"><small>Rp</small>${n < 0 ? '−' : ''}${fmtN(n)}</span>`;
const idrT = n => `Rp ${n < 0 ? '−' : ''}${fmtN(n)}`;
// Accepts "90000", "90.000" or "Rp 90.000". Negative, decimal (comma) and empty values are rejected, never rounded.
const parseIdr = s => { const t = String(s || '').trim().replace(/^rp\s*/i, '').replace(/\./g, '').replace(/\s/g, ''); return /^\d+$/.test(t) ? +t : NaN; };

// ---------- grants (proposed until POL adopts access_finance_policy and access_legal_policy) ----------
const G = (g, id) => (((db.fnl || {}).grants || {})[g] || []).includes(id || session.me);
const MG = (g, id) => (((db.mcit || {}).grants || {})[g] || []).includes(id || session.me);
const fnlIn = p => !!p && p.div === FNL;
const fnlFull = p => fnlIn(p) || isTopP(p);
const mcIn = p => !!p && p.div === MC;
const mcFull = p => mcIn(p) || isTopP(p) || isBoardP(p);
const GRANT_LABEL = {legal: 'Legal triage and drafting', legalReview: 'Legal review', issue: 'Document numbering', sign: 'Signature recording', finReview: 'Finance approval', pay: 'Payment recording', allocate: 'Allocation proposals', budget: 'Allocation approval', period: 'Period review', periodPrep: 'Period preparation', invoice: 'Incoming terms',
  review: 'Content review', publish: 'Publication recording', triage: 'IT triage', tech: 'IT technician', custody: 'Account custody'};
const grantsBox = (grants, keys) => `<details class="fm-grants"><summary>${icon('shield', 'ic-sm')}${L('Who can do what here (proposed)')}</summary><dl class="meta fm-meta">${keys.map(k => `<dt>${L(GRANT_LABEL[k])}</dt><dd>${(grants[k] || []).map(who).join('')}</dd>`).join('')}</dl><p class="t-small t-mute">${L('Separate grants, not job titles. POL and the division lead confirm them before launch.')}</p></details>`;

// ---------- FnL seed (demo records; ids agreed in SPRINT.md: lgl-hms-pks, lgl-hms-bast, inv-hms-1) ----------
const LTYPE = {PKS: ['Cooperation agreement (PKS)', 'PKS'], BAST: ['Handover record (BAST)', 'BAST'], NDA: ['Non-disclosure agreement', 'NDA'], SK: ['Decree (SK)', 'SK'], LTR: ['Letter', 'LTR'], DOC: ['Other document', 'DOC']};
const AGREEMENT = ['PKS', 'BAST', 'NDA'];
// legal_pipeline (proposed): draft → submitted → triaged → drafting → in review → revision requested → approved for signature → awaiting signature → signed → registered; cancelled/rejected.
const LST = {draft: ['Draft', 'edit', 'mute'], submitted: ['Submitted', 'upload', 'ink2'], info: ['Waiting for information', 'info', 'warn'], drafting: ['Drafting', 'edit', 'ink'], review: ['In review', 'search', 'warn'], revision: ['Revision requested', 'undo', 'warn'],
  approved: ['Approved for signature', 'check', 'green'], awaiting: ['Awaiting signatures', 'clock', 'warn'], signed: ['Signed', 'check', 'green'], registered: ['Registered', 'archive', 'ink2'], cancelled: ['Canceled', 'close', 'mute'], rejected: ['Rejected', 'close', 'danger']};
const LSTEPS = ['Submitted', 'Triaged', 'Drafting', 'In review', 'Approved for signature', 'Awaiting signatures', 'Signed', 'Registered'];
const LSTEP_I = {draft: -1, submitted: 0, info: 0, drafting: 2, revision: 2, review: 3, approved: 4, awaiting: 5, signed: 6, registered: 7};
const SIG = {pending: ['Not sent yet', 'circle', 'mute'], requested: ['Awaiting signature', 'clock', 'warn'], signed: ['Signed copy recorded', 'check', 'green'], attested: ['Attested, not verified', 'info', 'ink2'], declined: ['Declined', 'close', 'danger']};
// finance_request (proposed): draft → submitted → under review → approved/rejected → partially paid/paid → reconciled; returned for information; canceled with reason.
const FST = {draft: ['Draft', 'edit', 'mute'], submitted: ['Submitted', 'upload', 'ink2'], review: ['Under review', 'search', 'warn'], returned: ['Returned for information', 'undo', 'warn'], approved: ['Approved, not paid', 'check', 'ink'],
  partial: ['Partially paid', 'wallet', 'warn'], paid: ['Paid', 'wallet', 'green'], reconciled: ['Reconciled', 'check', 'green'], rejected: ['Rejected', 'close', 'danger'], cancelled: ['Canceled', 'close', 'mute']};
const FSTEPS = ['Submitted', 'Under review', 'Approved', 'Paid', 'Reconciled'];
const FSTEP_I = {draft: -1, submitted: 0, returned: 0, review: 1, approved: 2, partial: 3, paid: 4, reconciled: 5};
const AST = {proposed: ['Waiting for approval', 'clock', 'warn'], approved: ['Approved', 'check', 'green'], returned: ['Returned', 'undo', 'warn']};
// Incoming client terms (finance_incoming_terms, P1, optional until adopted): a separate basis from outgoing spending.
const IST = {gate: ['Waiting for the legal gate', 'lock', 'mute'], requested: ['Handoff requested', 'upload', 'warn'], returned: ['Returned to Legal', 'undo', 'warn'], accepted: ['Accepted by Finance', 'check', 'ink'], invoiced: ['Invoice issued outside the app', 'file', 'ink'],
  partial: ['Partly received', 'wallet', 'warn'], received: ['Received', 'wallet', 'green'], cancelled: ['Canceled', 'close', 'mute']};
const PST = {open: ['Open', 'circle', 'ink'], review: ['In review', 'search', 'warn'], closed: ['Closed with snapshot', 'archive', 'green']};
const RCK = {unchecked: ['Not checked', 'circle', 'mute'], matched: ['Matches evidence', 'check', 'green'], discrepancy: ['Discrepancy', 'warning', 'danger']};
const CATS = ['Operations', 'Events', 'Printing', 'Tools and hosting', 'Transport', 'Consumption'];
const TERM = '2026/1';

function seedFnl() {
  const H = (by, at, what, v) => ({by, at, what, v: v || null});
  const grants = {legal: ['rafi', 'daniel'], legalReview: ['daniel'], issue: ['daniel'], sign: ['rafi', 'daniel'], finReview: ['daniel', 'citra'], pay: ['citra', 'kevin'], allocate: ['citra', 'daniel'], budget: ['daniel'], period: ['daniel'], periodPrep: ['citra', 'kevin'], invoice: ['citra']};
  const policy = {format: 'DWDG/FnL/{type}/{year}/{seq}', adopted: false, leadAdopted: false, leadAgreement: 3, leadOther: 2, selfApproval: 'deny', basis: 'total-approved', capAtApproved: true};
  const S = (id, party, name, role, st, x = {}) => ({id, party, name, role, state: st, evidence: x.ev || '', date: x.date || null, by: x.by || null, at: x.at || null, basis: x.basis || null, note: x.note || ''});
  const V = (v, label, url, by, at, dec) => ({v, label, url, by, at, decision: dec || null});
  const legal = [
    {id: 'lgl-hms-pks', type: 'PKS', title: 'Cooperation agreement (PKS) with Himpunan Mahasiswa Statistika', purpose: 'Agree the scope of the two workshop sessions, the fee and when it is invoiced.', requester: 'ilham', unit: 'cons', project: 'p-hms', opp: 'opp-hms', handoff: 'ho-hms', counterpart: 'Himpunan Mahasiswa Statistika UII', requiredBy: '2026-10-09', owner: 'rafi', reviewer: 'daniel', stage: 'awaiting', confidential: true,
      sources: [{label: 'KAK (terms of reference) from HMS', url: 'https://drive.google.com/file/d/hms-kak-2026'}, {label: 'Consulting proposal v2', url: 'https://docs.google.com/document/d/hms-proposal-v2'}], template: 'PKS Client template, revision 3',
      versions: [V(1, 'First draft from the PKS Client template', 'https://docs.google.com/document/d/hms-pks-v1', 'rafi', '2026-10-01T15:20', {kind: 'revision', by: 'daniel', at: '2026-10-02T09:10', reason: 'Payment terms must point to the BAST, not to the first session.'}),
        V(2, 'Invoice after the BAST; fee also written in words', 'https://docs.google.com/document/d/hms-pks-v2', 'rafi', '2026-10-02T16:40', {kind: 'approved', by: 'daniel', at: '2026-10-03T10:05', reason: ''})],
      signatories: [S('s1', 'DWDG UII', 'Fadhil Akbar', 'President', 'signed', {ev: 'https://drive.google.com/file/d/hms-pks-signed-dwdg', date: '2026-10-04', by: 'rafi', at: '2026-10-04T13:00', basis: 'copy'}), S('s2', 'Himpunan Mahasiswa Statistika UII', 'Chair of HMS', 'Counterpart signatory', 'requested')],
      number: 'rg-015', urgency: null, info: [], priv: [{by: 'daniel', at: '2026-10-02T09:12', text: 'HMS asked for a 50% advance on the call. Do not accept it without the Director of Consulting.'}],
      history: [H('ilham', '2026-09-30T10:00', 'Submitted'), H('rafi', '2026-09-30T14:00', 'Triaged; {who} is drafting', {who: 'Rafi'}), H('rafi', '2026-10-01T15:20', 'Version {v} sent for review', {v: 1}), H('daniel', '2026-10-02T09:10', 'Revision requested on version {v}', {v: 1}), H('rafi', '2026-10-02T16:40', 'Version {v} sent for review', {v: 2}), H('daniel', '2026-10-03T10:05', 'Version {v} approved for signature', {v: 2}), H('daniel', '2026-10-03T10:30', 'Number issued'), H('rafi', '2026-10-03T11:00', 'Sent for signature'), H('rafi', '2026-10-04T13:00', 'Signature recorded for {party}', {party: 'DWDG UII'})],
      createdBy: 'ilham', createdAt: '2026-09-30T10:00'},
    {id: 'lgl-hms-bast', type: 'BAST', title: 'Handover record (BAST) for the HMS data workshop', purpose: 'Record that both sessions and the slide pack were handed over, so the fee can be invoiced under the PKS.', requester: 'ilham', unit: 'cons', project: 'p-hms', opp: 'opp-hms', handoff: 'ho-hms', counterpart: 'Himpunan Mahasiswa Statistika UII', requiredBy: '2026-10-26', owner: 'rafi', reviewer: 'daniel', stage: 'review', pks: 'lgl-hms-pks', invoice: 'inv-hms-1',
      sources: [{label: 'PKS version 2', url: 'https://docs.google.com/document/d/hms-pks-v2'}], template: 'BAST template, revision 1',
      versions: [V(1, 'BAST draft listing both sessions and the slide pack', 'https://docs.google.com/document/d/hms-bast-v1', 'rafi', '2026-10-05T16:10')],
      signatories: [S('s1', 'DWDG UII', 'Reza Mahendra', 'Director of Consulting', 'pending'), S('s2', 'Himpunan Mahasiswa Statistika UII', 'Chair of HMS', 'Counterpart signatory', 'pending')],
      number: null, urgency: null, info: [], priv: [], gate: {delivery: null, exception: null, sent: null},
      history: [H('ilham', '2026-10-05T11:00', 'Submitted'), H('rafi', '2026-10-05T12:30', 'Triaged; {who} is drafting', {who: 'Rafi'}), H('rafi', '2026-10-05T16:10', 'Version {v} sent for review', {v: 1})], createdBy: 'ilham', createdAt: '2026-10-05T11:00'},
    {id: 'lgl-kk-pks', type: 'PKS', title: 'Partnership agreement (PKS) with Kopi Kultur Jakal', purpose: 'Member discount and a venue for two partner events this term.', requester: 'alya', unit: 'ee', project: 'p-breakfast', counterpart: 'Kopi Kultur Jakal', requiredBy: '2026-10-16', owner: 'rafi', reviewer: 'daniel', stage: 'review',
      sources: [{label: 'Benefit list draft', url: 'https://docs.google.com/document/d/kk-benefits'}], template: 'PKS Partner template, revision 2', versions: [V(1, 'Draft with the benefit list as an annex', 'https://docs.google.com/document/d/kk-pks-v1', 'rafi', '2026-10-05T17:00')],
      signatories: [S('s1', 'DWDG UII', 'Fadhil Akbar', 'President', 'pending'), S('s2', 'Kopi Kultur Jakal', 'Owner of Kopi Kultur', 'Counterpart signatory', 'pending')], number: null, urgency: null, info: [], priv: [],
      history: [H('alya', '2026-10-02T09:00', 'Submitted'), H('rafi', '2026-10-02T13:00', 'Triaged; {who} is drafting', {who: 'Rafi'}), H('rafi', '2026-10-05T17:00', 'Version {v} sent for review', {v: 1})], createdBy: 'alya', createdAt: '2026-10-02T09:00'},
    {id: 'lgl-letter-fh', type: 'LTR', title: 'Speaker invitation letter to Fakultas Hukum UII', purpose: 'Invite a lecturer to speak at the partner breakfast.', requester: 'tasya', unit: 'ee', project: 'p-breakfast', counterpart: 'Fakultas Hukum UII', requiredBy: '2026-10-07', owner: 'rafi', reviewer: 'daniel', stage: 'info',
      sources: [], template: '', versions: [], signatories: [S('s1', 'DWDG UII', 'Fadhil Akbar', 'President', 'pending')], number: null,
      urgency: {state: 'requested', reason: 'The speaker confirmed late; the event is on 9 Oct.', by: 'tasya', at: '2026-10-05T21:00'}, info: [{q: 'Name and title of the lecturer, and the event time.', by: 'rafi', at: '2026-10-06T08:20', a: '', aAt: null}], priv: [],
      history: [H('tasya', '2026-10-05T20:50', 'Submitted'), H('tasya', '2026-10-05T21:00', 'Asked for an urgent exception'), H('rafi', '2026-10-06T08:20', 'Asked for missing information')], createdBy: 'tasya', createdAt: '2026-10-05T20:50'},
    {id: 'lgl-sk-orient', type: 'SK', title: 'Decree (SK) for the Batch 2026 orientation committee', purpose: 'Appoint the orientation committee named in the HR plan.', requester: 'kirana', unit: 'hr', project: 'p-orient', counterpart: '', requiredBy: '2026-10-20', owner: null, reviewer: null, stage: 'submitted',
      sources: [{label: 'Committee list', url: 'https://docs.google.com/spreadsheets/d/orient-committee'}], template: '', versions: [], signatories: [S('s1', 'DWDG UII', 'Fadhil Akbar', 'President', 'pending')], number: null, urgency: null, info: [], priv: [],
      history: [H('kirana', '2026-10-06T07:30', 'Submitted')], createdBy: 'kirana', createdAt: '2026-10-06T07:30'},
    {id: 'lgl-permit', type: 'LTR', title: 'Activity permit request to Rektorat UII', purpose: 'Permit for the partner breakfast on campus grounds.', requester: 'rani', unit: 'ee', project: 'p-breakfast', counterpart: 'Rektorat UII', requiredBy: '2026-09-29', owner: 'rafi', reviewer: 'daniel', stage: 'registered',
      sources: [], template: 'Permit letter, revision 1', versions: [V(1, 'Permit letter', 'https://docs.google.com/document/d/permit-v1', 'rafi', '2026-09-24T10:00', {kind: 'approved', by: 'daniel', at: '2026-09-25T09:00', reason: ''})],
      signatories: [S('s1', 'DWDG UII', 'Fadhil Akbar', 'President', 'signed', {ev: 'https://drive.google.com/file/d/permit-signed', date: '2026-09-26', by: 'rafi', at: '2026-09-26T13:00', basis: 'copy'})], number: 'rg-012', urgency: null, info: [], priv: [],
      history: [H('rani', '2026-09-22T10:00', 'Submitted'), H('daniel', '2026-09-25T09:00', 'Version {v} approved for signature', {v: 1}), H('daniel', '2026-09-26T11:00', 'Number issued'), H('rafi', '2026-09-26T13:00', 'Signature recorded for {party}', {party: 'DWDG UII'}), H('rafi', '2026-09-27T09:00', 'Registered')], createdBy: 'rani', createdAt: '2026-09-22T10:00'},
    {id: 'lgl-letter-sp', type: 'LTR', title: 'Speaker letter for the September alumni talk', purpose: 'Confirm the alumni speaker and the talk date.', requester: 'nadia', unit: 'sng', project: null, counterpart: 'Alumni speaker', requiredBy: '2026-09-28', owner: 'rafi', reviewer: 'daniel', stage: 'registered',
      sources: [], template: 'Speaker letter, revision 2', versions: [V(1, 'Speaker letter', 'https://docs.google.com/document/d/sp-v1', 'rafi', '2026-09-26T15:00', {kind: 'approved', by: 'daniel', at: '2026-09-27T09:30', reason: ''}), V(2, 'Talk date corrected to 30 Sep', 'https://docs.google.com/document/d/sp-v2', 'rafi', '2026-09-28T08:40', {kind: 'approved', by: 'daniel', at: '2026-09-28T09:00', reason: ''})],
      signatories: [S('s1', 'DWDG UII', 'Fadhil Akbar', 'President', 'signed', {ev: 'https://drive.google.com/file/d/sp-signed', date: '2026-09-28', by: 'rafi', at: '2026-09-28T12:00', basis: 'copy'})], number: 'rg-014', urgency: null, info: [], priv: [],
      history: [H('nadia', '2026-09-25T19:00', 'Submitted'), H('daniel', '2026-09-27T10:00', 'Number issued'), H('daniel', '2026-09-28T09:00', 'Number voided: {r}', {r: 'wrong talk date'}), H('daniel', '2026-09-28T09:05', 'New number issued'), H('rafi', '2026-09-28T13:00', 'Registered')], createdBy: 'nadia', createdAt: '2026-09-25T19:00'},
    {id: 'lgl-mou-ksj', type: 'DOC', title: 'Memorandum of understanding with Komunitas Startup Jogja', purpose: 'Explore joint events with the startup community.', requester: 'arief', unit: 'ee', project: null, counterpart: 'Komunitas Startup Jogja', requiredBy: '2026-10-15', owner: 'rafi', reviewer: 'daniel', stage: 'cancelled',
      sources: [], template: '', versions: [], signatories: [], number: null, urgency: null, info: [], priv: [], cancel: {reason: 'The community chose to wait until next term.', by: 'arief', at: '2026-09-30T10:00'},
      history: [H('arief', '2026-09-18T10:00', 'Submitted'), H('arief', '2026-09-30T10:00', 'Canceled: {r}', {r: 'The community chose to wait until next term.'})], createdBy: 'arief', createdAt: '2026-09-18T10:00'},
  ];
  const RG = (id, seq, type, req, version, by, at, x = {}) => ({id, seq, no: `DWDG/FnL/${type}/2026/${String(seq).padStart(3, '0')}`, type, req, version, issuedBy: by, issuedAt: at, state: x.state || 'issued', voidReason: x.reason || '', voidBy: x.vby || null, voidAt: x.vat || null, reissue: x.reissue || null, replaces: x.replaces || null, provisional: true});
  const register = [RG('rg-012', 12, 'LTR', 'lgl-permit', 1, 'daniel', '2026-09-26T11:00'),
    RG('rg-013', 13, 'LTR', 'lgl-letter-sp', 1, 'daniel', '2026-09-27T10:00', {state: 'void', reason: 'Wrong talk date on the letter', vby: 'daniel', vat: '2026-09-28T09:00', reissue: 'rg-014'}),
    RG('rg-014', 14, 'LTR', 'lgl-letter-sp', 2, 'daniel', '2026-09-28T09:05', {replaces: 'rg-013'}), RG('rg-015', 15, 'PKS', 'lgl-hms-pks', 2, 'daniel', '2026-10-03T10:30')];
  const AL = (id, unit, project, category, amount, st, by, at, x = {}) => ({id, term: TERM, unit, project, category, amount, state: st, source: x.source || '', approvedBy: st === 'approved' ? (x.ab || 'daniel') : null, approvedAt: st === 'approved' ? (x.aat || at) : null, history: [{amount, by, at, reason: x.reason || 'First allocation'}], createdBy: by, createdAt: at, returnNote: ''});
  const allocations = [AL('al-sng', 'sng', null, 'Operations', 2000000, 'approved', 'citra', '2026-08-20T10:00', {source: 'Annual plan 2026, SnG line'}),
    AL('al-survey', 'sng', 'p-survey', 'Events', 300000, 'approved', 'citra', '2026-09-23T10:00', {source: 'Member growth survey proposal'}),
    AL('al-hms', 'cons', 'p-hms', 'Events', 600000, 'approved', 'citra', '2026-10-02T10:00', {source: 'HMS workshop proposal v2'}),
    AL('al-breakfast', 'ee', 'p-breakfast', 'Events', 1500000, 'approved', 'citra', '2026-09-16T10:00', {source: 'Partner breakfast plan'}),
    AL('al-print', 'mcit', null, 'Printing', 500000, 'approved', 'citra', '2026-09-10T10:00', {source: 'Annual plan 2026, MCIT line'}),
    AL('al-fnl', 'fnl', null, 'Operations', 250000, 'approved', 'citra', '2026-08-20T10:00', {source: 'Annual plan 2026, FnL line'}),
    AL('al-site', 'mcit', 'p-site', 'Tools and hosting', 450000, 'proposed', 'citra', '2026-10-05T15:00', {source: 'Hosting quote for one year', reason: 'First allocation'})];
  const FR = (id, requester, unit, alloc, category, purpose, requested, st, at, x = {}) => ({id, requester, unit, project: x.project || null, alloc, category, purpose, requested, approved: x.approved ?? null, state: st, payee: x.payee || '', method: x.method || 'Bank transfer', neededBy: x.need || null,
    evidence: x.ev || [], ref: x.ref || '', version: x.version || 1, review: x.review || null, returnNote: x.ret || '', reason: x.reason || '', dup: x.dup || null, reconciledIn: x.rin || null, history: x.h || [{by: requester, at, what: st === 'draft' ? 'Draft saved' : 'Submitted'}], createdBy: requester, createdAt: at, submittedAt: st === 'draft' ? null : at});
  const RV = (by, at, amount) => ({by, at, amount, version: 1});
  const requests = [
    FR('fr-snacks', 'fikri', 'sng', 'al-survey', 'Consumption', 'Snacks and printed consent forms for the survey focus group', 90000, 'partial', '2026-09-28T14:00', {project: 'p-survey', approved: 90000, payee: 'Fikri Ramadhan (reimbursement)', need: '2026-10-02', ev: [{label: 'Receipts (Drive)', url: 'https://drive.google.com/file/d/fg-receipts'}], ref: 'Toko Rejeki 2809', review: RV('daniel', '2026-09-29T10:00', 90000),
      h: [{by: 'fikri', at: '2026-09-28T14:00', what: 'Submitted'}, {by: 'daniel', at: '2026-09-29T10:00', what: 'Approved {a}', v: {a: 'Rp 90.000'}}, {by: 'citra', at: '2026-10-02T16:00', what: 'Payment recorded: {a}', v: {a: 'Rp 30.000'}}]}),
    FR('fr-venue', 'alya', 'ee', 'al-breakfast', 'Events', 'Venue deposit for the partner breakfast', 750000, 'approved', '2026-10-03T09:00', {project: 'p-breakfast', approved: 700000, payee: 'Kopi Kultur Jakal', need: '2026-10-09', ev: [{label: 'Venue quotation', url: 'https://drive.google.com/file/d/kk-quote'}], ref: 'KK quotation 0310', review: {...RV('daniel', '2026-10-05T11:00', 700000), note: 'Deposit capped at 700.000 as agreed with the venue.'},
      h: [{by: 'alya', at: '2026-10-03T09:00', what: 'Submitted'}, {by: 'daniel', at: '2026-10-05T11:00', what: 'Approved {a} of {b}', v: {a: 'Rp 700.000', b: 'Rp 750.000'}}]}),
    FR('fr-booth', 'laras', 'mcit', 'al-print', 'Printing', 'Booth banner printing for open recruitment', 420000, 'returned', '2026-10-04T10:00', {project: 'p-oprec', payee: 'Percetakan Kaliurang', need: '2026-10-15', ret: 'Attach the printing quotation and say how many banners.',
      h: [{by: 'laras', at: '2026-10-04T10:00', what: 'Submitted'}, {by: 'citra', at: '2026-10-05T09:30', what: 'Returned for information'}]}),
    FR('fr-gift', 'bima', 'cons', 'al-hms', 'Events', 'Speaker gift for the HMS workshop', 150000, 'submitted', '2026-10-06T08:00', {project: 'p-hms', payee: 'Bima Saputra (reimbursement)', need: '2026-10-16', ev: [{label: 'Shop listing', url: 'https://www.tokopedia.com/dwdg-gift'}], ref: 'Gift 0610'}),
    FR('fr-ink', 'citra', 'fnl', 'al-fnl', 'Operations', 'Printer ink for agreement copies', 85000, 'submitted', '2026-10-05T19:00', {payee: 'Citra Lestari (reimbursement)', need: '2026-10-12', ev: [{label: 'Receipt photo', url: 'https://drive.google.com/file/d/ink-receipt'}], ref: 'Ink 0510'}),
    FR('fr-materai1', 'rafi', 'fnl', 'al-fnl', 'Operations', 'Stamp duty (materai) for the HMS PKS', 20000, 'paid', '2026-10-03T12:00', {project: 'p-hms', approved: 20000, payee: 'Rafi Firmansyah (reimbursement)', ev: [{label: 'Receipt TK-0412', url: 'https://drive.google.com/file/d/materai-0412'}], ref: 'Receipt TK-0412', review: RV('daniel', '2026-10-03T15:00', 20000),
      h: [{by: 'rafi', at: '2026-10-03T12:00', what: 'Submitted'}, {by: 'daniel', at: '2026-10-03T15:00', what: 'Approved {a}', v: {a: 'Rp 20.000'}}, {by: 'kevin', at: '2026-10-04T10:00', what: 'Payment recorded: {a}', v: {a: 'Rp 20.000'}}]}),
    FR('fr-materai2', 'rafi', 'fnl', 'al-fnl', 'Operations', 'Stamp duty for the HMS agreement', 20000, 'submitted', '2026-10-06T07:50', {project: 'p-hms', payee: 'Rafi Firmansyah (reimbursement)', ev: [{label: 'Receipt TK-0412', url: 'https://drive.google.com/file/d/materai-0412'}], ref: 'Receipt TK-0412', dup: {of: 'fr-materai1', state: 'flagged', by: null, at: null, note: ''}}),
    FR('fr-print-sep', 'galih', 'mcit', 'al-print', 'Printing', 'September poster printing', 120000, 'reconciled', '2026-09-20T10:00', {approved: 120000, payee: 'Percetakan Kaliurang', ev: [{label: 'Invoice 2009', url: 'https://drive.google.com/file/d/poster-2009'}], ref: 'Invoice 2009', review: RV('daniel', '2026-09-21T09:00', 120000), rin: 'pr-2026-09',
      h: [{by: 'galih', at: '2026-09-20T10:00', what: 'Submitted'}, {by: 'daniel', at: '2026-09-21T09:00', what: 'Approved {a}', v: {a: 'Rp 120.000'}}, {by: 'citra', at: '2026-09-25T15:00', what: 'Payment recorded: {a}', v: {a: 'Rp 12.000'}}, {by: 'citra', at: '2026-10-02T10:00', what: 'Correction recorded against {p}', v: {p: 'py-3'}}, {by: 'daniel', at: '2026-10-03T11:00', what: 'Reconciled in {p}, snapshot {v}', v: {p: 'September 2026', v: 2}}]}),
    FR('fr-cards', 'salsa', 'sng', 'al-sng', 'Consumption', 'Thank-you cards for alumni mentors', 60000, 'draft', '2026-10-05T21:30', {project: 'p-mentoring', need: '2026-10-20'}),
    FR('fr-promo', 'yoga', 'mcit', null, 'Operations', 'Paid Instagram promotion for the recruitment post', 200000, 'rejected', '2026-10-01T10:00', {project: 'p-oprec', reason: 'Paid promotion has no 2026 budget line. The MCIT Director can propose an allocation first.', review: {...RV('daniel', '2026-10-02T09:00', 0), decision: 'rejected'},
      h: [{by: 'yoga', at: '2026-10-01T10:00', what: 'Submitted'}, {by: 'daniel', at: '2026-10-02T09:00', what: 'Rejected'}]}),
  ];
  const payments = [
    {id: 'py-1', req: 'fr-snacks', kind: 'payment', amount: 30000, date: '2026-10-02', ref: 'TRF 0210-01', evidence: 'https://drive.google.com/file/d/trf-0210', by: 'citra', at: '2026-10-02T16:00', note: 'First part; the rest after the treasurer tops up the account.'},
    {id: 'py-2', req: 'fr-materai1', kind: 'payment', amount: 20000, date: '2026-10-04', ref: 'Cash 0410', evidence: '', by: 'kevin', at: '2026-10-04T10:00', note: 'Paid in cash at the FnL desk. Evidence not attached yet.'},
    {id: 'py-3', req: 'fr-print-sep', kind: 'payment', amount: 12000, date: '2026-09-25', ref: 'TRF 2509-02', evidence: 'https://drive.google.com/file/d/trf-2509', by: 'citra', at: '2026-09-25T15:00', note: ''},
    {id: 'py-4', req: 'fr-print-sep', kind: 'correction', of: 'py-3', amount: 108000, date: '2026-09-25', ref: 'TRF 2509-02', evidence: 'https://drive.google.com/file/d/trf-2509', by: 'citra', at: '2026-10-02T10:00', note: 'Typed 12.000; the bank receipt shows 120.000.'}];
  const incoming = [{id: 'inv-hms-1', title: 'HMS data workshop fee', client: 'Himpunan Mahasiswa Statistika UII', project: 'p-hms', opp: 'opp-hms', gateFrom: 'lgl-hms-bast', pks: 'lgl-hms-pks', expected: 750000, state: 'gate', handoff: null, invoiceRef: '', invoiceUrl: '', issuedOn: null, due: null, collector: 'citra', receipts: [],
    history: [{by: 'citra', at: '2026-10-03T11:30', what: 'Term recorded from PKS version {v}; waiting for the BAST gate', v: {v: 2}}], createdBy: 'citra', createdAt: '2026-10-03T11:30'}];
  const periods = [
    {id: 'pr-2026-09', name: 'September 2026', from: '2026-09-01', to: '2026-09-30', project: 'p-close', state: 'closed', preparedBy: 'citra', reviewer: 'daniel', bank: 'incomplete', checks: {'py-3': 'matched', 'py-4': 'matched'},
      snapshots: [{v: 1, at: '2026-09-30T20:00', by: 'daniel', totals: {alloc: 4550000, committed: 210000, paid: 12000, outstanding: 198000}, ids: ['fr-print-sep', 'fr-snacks', 'py-3'], note: 'Reviewed before the poster payment was corrected.'},
        {v: 2, at: '2026-10-03T11:00', by: 'daniel', totals: {alloc: 4550000, committed: 210000, paid: 120000, outstanding: 90000}, ids: ['fr-print-sep', 'fr-snacks', 'py-3', 'py-4'], note: 'After the correction py-4 to payment py-3 (typed 12.000 instead of 120.000).'}],
      unresolved: [{id: 'ur-1', text: 'September bank statement not shared by the treasurer yet, so bank reconciliation is incomplete.', owner: 'citra', due: '2026-10-10', state: 'open'}], createdBy: 'citra', createdAt: '2026-09-28T09:00'},
    {id: 'pr-2026-10', name: 'October 2026', from: '2026-10-01', to: '2026-10-31', project: null, state: 'open', preparedBy: 'citra', reviewer: 'daniel', bank: 'incomplete', checks: {'py-1': 'matched'}, discrepancies: {}, snapshots: [], unresolved: [], createdBy: 'citra', createdAt: '2026-10-01T09:00'}];
  return {v: 1, grants, policy, legal, register, allocations, requests, payments, incoming, periods, drafts: {}};
}

// ---------- MCIT seed ----------
const CH = {instagram: 'Instagram', linkedin: 'LinkedIn', website: 'Website'};
// marketing_lifecycle (proposed): idea → drafting → review → revision requested → approved → scheduled → published; canceled/archived.
const CST = {idea: ['Idea', 'sparkles', 'mute'], drafting: ['Drafting', 'edit', 'ink'], review: ['In review', 'search', 'warn'], revision: ['Revision requested', 'undo', 'warn'], approved: ['Approved', 'check', 'green'], scheduled: ['Scheduled', 'calendar', 'ink'], published: ['Published', 'globe', 'green'], cancelled: ['Canceled', 'close', 'mute'], archived: ['Archived', 'archive', 'mute']};
const CORDER = ['idea', 'drafting', 'review', 'revision', 'approved', 'scheduled', 'published'];
// marketing_it_requests (proposed): new → triaged → working → waiting → resolved → closed with requester confirmation; reopened; canceled.
const IT = {new: ['New', 'circle', 'ink2'], triaged: ['Triaged', 'flag', 'ink'], working: ['Working', 'clock', 'ink'], waiting: ['Waiting', 'hand', 'warn'], resolved: ['Resolved, waiting for you to confirm', 'check', 'warn'], closed: ['Closed, confirmed solved', 'check', 'green'], reopened: ['Reopened', 'undo', 'danger'], cancelled: ['Canceled', 'close', 'mute']};
const ITYPE = {access: 'Account or access', bug: 'Website or tool problem', change: 'Change to a tool or the website'};
const PRIO = {low: 'Low', medium: 'Medium', high: 'High'};
const BST = {submitted: ['Submitted', 'upload', 'ink2'], accepted: ['Accepted', 'check', 'green'], returned: ['Returned', 'undo', 'warn'], cancelled: ['Canceled', 'close', 'mute']};
const ACST = {verified: ['Custodian verified', 'check', 'green'], unverified: ['Not verified recently', 'clock', 'warn'], unknown: ['Custodian unknown', 'warning', 'danger']};

function seedMc() {
  const H = (by, at, what, v) => ({by, at, what, v: v || null});
  const V = (v, label, url, by, at, dec) => ({v, label, url, by, at, decision: dec || null});
  const C = (ch, planned, pub) => ({ch, planned, pub: pub || null, failed: null});
  const grants = {review: ['laras', 'galih'], publish: ['laras', 'hana'], triage: ['galih', 'gilang'], tech: ['gilang', 'farah'], custody: ['galih']};
  const campaigns = [
    {id: 'cmp-oprec', name: 'Open recruitment 2026', purpose: 'Bring strong applicants to the Batch 2026 open recruitment.', owner: 'laras', start: '2026-10-01', end: '2026-11-15', channels: ['instagram', 'linkedin', 'website'], audience: 'UII students in semesters 1 to 5', project: 'p-oprec', createdBy: 'galih', createdAt: '2026-09-25T10:00'},
    {id: 'cmp-site', name: 'Website relaunch', purpose: 'Announce the new site and its division pages.', owner: 'laras', start: '2026-10-01', end: '2026-10-31', channels: ['website', 'instagram'], audience: 'Members, partners and applicants', project: 'p-site', createdBy: 'galih', createdAt: '2026-09-28T10:00'}];
  const content = [
    {id: 'ct-teaser', title: 'Open recruitment teaser', campaign: 'cmp-oprec', kind: 'Carousel post', channels: [C('instagram', '2026-10-12T19:00')], executor: 'hana', reviewer: 'laras', due: '2026-10-08', stage: 'review', approvedV: null,
      versions: [V(1, 'First caption and carousel', 'https://www.canva.com/design/dwdg-oprec-teaser-v1', 'hana', '2026-10-03T20:00', {kind: 'revision', by: 'laras', at: '2026-10-04T09:00', reason: 'The registration date is missing from slide 3.'}), V(2, 'Registration date added on slide 3', 'https://www.canva.com/design/dwdg-oprec-teaser-v2', 'hana', '2026-10-05T21:15')],
      brief: 'Three slides: why DWDG, what members do, how to register. Use the 2026 brand kit.', assets: [{label: 'Brand kit 2026', url: 'https://www.canva.com/brand/dwdg-2026'}], task: null, corrections: [], history: [H('laras', '2026-10-01T10:00', 'Created'), H('hana', '2026-10-03T20:00', 'Version {v} sent for review', {v: 1}), H('laras', '2026-10-04T09:00', 'Changes requested on version {v}', {v: 1}), H('hana', '2026-10-05T21:15', 'Version {v} sent for review', {v: 2})], createdBy: 'laras', createdAt: '2026-10-01T10:00'},
    {id: 'ct-poster', title: 'Open recruitment poster', campaign: 'cmp-oprec', kind: 'Poster', channels: [C('instagram', '2026-10-05T19:00', {url: 'https://www.instagram.com/p/dwdg-oprec-poster', at: '2026-10-05T19:04', by: 'hana', basis: 'url', v: 2, recordedAt: '2026-10-05T19:10'}), C('linkedin', '2026-10-05T19:00')], executor: 'yoga', reviewer: 'laras', due: '2026-10-02', stage: 'scheduled', approvedV: 2,
      versions: [V(1, 'Poster with the old logo', 'https://www.canva.com/design/dwdg-oprec-poster-v1', 'yoga', '2026-09-30T18:00', {kind: 'revision', by: 'laras', at: '2026-10-01T08:30', reason: 'Use the official logo file; do not redraw it.'}), V(2, 'Official logo and final dates', 'https://www.canva.com/design/dwdg-oprec-poster-v2', 'yoga', '2026-10-01T20:00', {kind: 'approved', by: 'laras', at: '2026-10-02T09:00', reason: ''})],
      brief: 'One poster for Instagram and LinkedIn with the registration dates.', assets: [{label: 'Official logo files', url: 'https://drive.google.com/drive/folders/dwdg-brand'}], task: null, corrections: [],
      history: [H('laras', '2026-09-29T10:00', 'Created'), H('laras', '2026-10-02T09:00', 'Version {v} approved', {v: 2}), H('laras', '2026-10-02T09:10', 'Scheduled version {v}', {v: 2}), H('hana', '2026-10-05T19:10', 'Publication recorded on {ch}', {ch: 'Instagram'})], createdBy: 'laras', createdAt: '2026-09-29T10:00'},
    {id: 'ct-launch', title: 'Website relaunch announcement', campaign: 'cmp-site', kind: 'Post and site banner', channels: [C('instagram', '2026-10-25T19:00'), C('website', '2026-10-25T09:00')], executor: 'farah', reviewer: 'galih', due: '2026-10-20', stage: 'review', approvedV: 2,
      versions: [V(1, 'First announcement copy', 'https://docs.google.com/document/d/site-launch-v1', 'farah', '2026-10-02T19:00', {kind: 'revision', by: 'galih', at: '2026-10-03T10:00', reason: 'Mention the division pages.'}), V(2, 'Division pages mentioned', 'https://docs.google.com/document/d/site-launch-v2', 'farah', '2026-10-04T18:00', {kind: 'approved', by: 'galih', at: '2026-10-05T09:00', reason: ''}),
        V(3, 'Shorter headline', 'https://docs.google.com/document/d/site-launch-v3', 'farah', '2026-10-06T08:40')],
      brief: 'Announce the relaunch on the day the division pages go live.', assets: [], task: null, corrections: [], history: [H('galih', '2026-10-01T10:00', 'Created'), H('galih', '2026-10-05T09:00', 'Version {v} approved', {v: 2}), H('farah', '2026-10-06T08:40', 'Version {v} sent for review; the version {a} approval does not carry over', {v: 3, a: 2})], createdBy: 'galih', createdAt: '2026-10-01T10:00'},
    {id: 'ct-pages', title: 'Division pages copy', campaign: 'cmp-site', kind: 'Web pages', channels: [C('website', '2026-10-20T09:00')], executor: 'yoga', reviewer: 'laras', due: '2026-10-15', stage: 'drafting', approvedV: null, versions: [], brief: 'One page per division: what it does, who leads it, how to join.', assets: [], task: 't18', corrections: [],
      history: [H('laras', '2026-10-01T11:00', 'Created and linked to its task'), H('yoga', '2026-10-06T08:30', 'Drafting started')], createdBy: 'laras', createdAt: '2026-10-01T11:00'},
    {id: 'ct-tip', title: 'Data tip of the week', campaign: null, kind: 'Single post', channels: [C('instagram', '2026-10-09T12:00')], executor: 'gilang', reviewer: 'laras', due: '2026-10-08', stage: 'idea', approvedV: null, versions: [], brief: 'A weekly tip from Consulting. No campaign needed.', assets: [], task: null, corrections: [], history: [H('laras', '2026-10-05T10:00', 'Created')], createdBy: 'laras', createdAt: '2026-10-05T10:00'},
    {id: 'ct-recap', title: 'September recap', campaign: null, kind: 'Carousel post', channels: [C('instagram', '2026-09-30T19:00', {url: 'https://www.instagram.com/p/dwdg-sept-recap', at: '2026-09-30T19:20', by: 'hana', basis: 'url', v: 1, recordedAt: '2026-09-30T19:30'})], executor: 'hana', reviewer: 'laras', due: '2026-09-28', stage: 'published', approvedV: 1,
      versions: [V(1, 'Recap of four September events', 'https://www.canva.com/design/dwdg-sept-recap', 'hana', '2026-09-27T20:00', {kind: 'approved', by: 'laras', at: '2026-09-28T09:00', reason: ''})], brief: '', assets: [], task: null, corrections: [], history: [H('hana', '2026-09-30T19:30', 'Publication recorded on {ch}', {ch: 'Instagram'})], createdBy: 'laras', createdAt: '2026-09-24T10:00'},
    {id: 'ct-breakfast', title: 'Partner breakfast teaser', campaign: null, kind: 'Story', channels: [C('instagram', '2026-10-10T08:00')], executor: 'hana', reviewer: 'laras', due: '2026-10-08', stage: 'cancelled', approvedV: null, versions: [], brief: '', assets: [], task: null, corrections: [], cancel: {reason: 'EE has not confirmed the breakfast date yet.', by: 'laras', at: '2026-10-04T10:00'},
      history: [H('laras', '2026-10-04T10:00', 'Canceled: {r}', {r: 'EE has not confirmed the breakfast date yet.'})], createdBy: 'laras', createdAt: '2026-10-01T10:00'}];
  const briefs = [
    {id: 'br-ee-1', title: 'Partner breakfast thank-you post', unit: 'ee', requester: 'alya', purpose: 'Thank the six partners after the breakfast.', audience: 'Partners and members', channel: 'instagram', deliverable: 'One carousel, four slides', desired: '2026-10-21', sources: 'Partner list 2026 in EE Resources; photos from the event', approver: 'rani', state: 'submitted', content: null, returnNote: '', createdBy: 'alya', createdAt: '2026-10-05T15:00'},
    {id: 'br-cons-1', title: 'HMS workshop recap', unit: 'cons', requester: 'ilham', purpose: 'Show the workshop to future clients.', audience: 'Student associations at UII', channel: 'instagram', deliverable: 'One post', desired: '2026-10-26', sources: 'Session photos after the workshop', approver: 'reza', state: 'returned', content: null, returnNote: 'Send the photo consent list from HMS first.', returnedBy: 'laras', createdBy: 'ilham', createdAt: '2026-10-04T12:00'}];
  const it = [
    {id: 'it-forms', title: 'Cannot edit the open recruitment form', type: 'access', service: 'acc-google', symptom: 'Editing the Google Form asks me to request access.', expected: 'HR leads can edit the recruitment form.', impact: 'team', steps: '1. Open the form link from HR Resources\n2. Click Edit', evidence: {label: 'Screenshot of the access page', url: 'https://drive.google.com/file/d/it-forms-shot'},
      requester: 'aisyah', unit: 'hr', owner: 'gilang', priority: 'medium', stage: 'working', tasks: ['tk-it-forms'], info: [], blocker: null, resolution: null, confirm: null, priv: 'Form owner is the organization Google account. Add HR leads as editors; do not share the account login.',
      history: [H('aisyah', '2026-10-05T09:00', 'Submitted'), H('galih', '2026-10-05T10:00', 'Triaged and assigned to {who}', {who: 'Gilang'}), H('gilang', '2026-10-05T10:05', 'Task created')], createdBy: 'aisyah', createdAt: '2026-10-05T09:00'},
    {id: 'it-drive', title: 'Brand assets folder asks for access', type: 'access', service: 'acc-google', symptom: 'The Brand assets link in SnG Resources opens a request access page.', expected: 'SnG members can view the brand assets.', impact: 'team', steps: 'Open Brand assets from SnG Resources on a phone.', evidence: null,
      requester: 'salsa', unit: 'sng', owner: 'gilang', priority: 'low', stage: 'resolved', tasks: [], info: [], blocker: null, resolution: {text: 'Shared the folder with the SnG group as viewers. The folder owner stays the organization account.', url: '', version: '', by: 'gilang', at: '2026-10-06T08:00'}, confirm: null, priv: '',
      history: [H('salsa', '2026-10-02T19:00', 'Submitted'), H('gilang', '2026-10-03T09:00', 'Resolved: {r}', {r: 'Shared with Salsa.'}), H('salsa', '2026-10-04T08:00', 'Reopened: {r}', {r: 'Still asks for access on my phone (signed in with my campus account).'}), H('gilang', '2026-10-06T08:00', 'Resolved: {r}', {r: 'Shared with the SnG group.'})], createdBy: 'salsa', createdAt: '2026-10-02T19:00'},
    {id: 'it-contact', title: 'Website contact form sends no email', type: 'bug', service: 'acc-hosting', symptom: 'Messages sent from the contact page never arrive.', expected: 'Each message reaches the EE inbox.', impact: 'all', steps: 'Send a test message from the contact page.', evidence: null,
      requester: 'tasya', unit: 'ee', owner: 'farah', priority: 'high', stage: 'closed', tasks: [], info: [], blocker: null, resolution: {text: 'The form pointed at an old address. Changed it and sent two test messages.', url: 'https://github.com/dwdg-uii/site/commit/4f2a9c1', version: 'site 1.4.2', by: 'farah', at: '2026-10-03T16:00'}, confirm: {kind: 'solved', by: 'tasya', at: '2026-10-04T09:00', note: 'Both test messages arrived.'}, priv: '',
      history: [H('tasya', '2026-10-01T10:00', 'Submitted'), H('farah', '2026-10-03T16:00', 'Resolved: {r}', {r: 'The form pointed at an old address.'}), H('tasya', '2026-10-04T09:00', 'Confirmed solved')], createdBy: 'tasya', createdAt: '2026-10-01T10:00'},
    {id: 'it-hosting', title: 'Nobody knows who owns the hosting account', type: 'access', service: 'acc-hosting', symptom: 'We cannot change the site without the hosting login, and nobody knows who holds it.', expected: 'A named custodian and an access route for the relaunch.', impact: 'all', steps: '', evidence: null,
      requester: 'laras', unit: 'mcit', owner: 'galih', priority: 'high', stage: 'waiting', tasks: ['t18'], info: [], blocker: {text: 'The hosting login belongs to a 2024 alumnus. Waiting for him to transfer it.', action: 'Name the account owner and share the access route', by: 'galih', at: '2026-10-03T10:30'}, resolution: null, confirm: null, priv: 'Alumnus contacted by email on 3 Oct.',
      history: [H('laras', '2026-10-03T10:00', 'Submitted'), H('galih', '2026-10-03T10:30', 'Waiting: {r}', {r: 'Name the account owner and share the access route'})], createdBy: 'laras', createdAt: '2026-10-03T10:00'},
    {id: 'it-page', title: 'Add a Consulting page to the site', type: 'change', service: 'acc-hosting', symptom: 'The site has no page for Consulting services.', expected: 'A page listing our workshop and project offers.', impact: 'all', steps: '', evidence: null,
      requester: 'reza', unit: 'cons', owner: null, priority: null, stage: 'new', tasks: [], info: [], blocker: null, resolution: null, confirm: null, priv: '', history: [H('reza', '2026-10-06T07:45', 'Submitted')], createdBy: 'reza', createdAt: '2026-10-06T07:45'}];
  const accounts = [
    {id: 'acc-ig', service: 'Instagram @dwdg.uii', purpose: 'Main public channel for posts and stories.', custodian: 'galih', backup: 'laras', access: 'Ask Galih through Requests to MCIT. The login lives in the organization password manager, never in this app.', vault: 'Password manager › Marketing › Instagram', renewal: null, verifiedBy: 'galih', verifiedAt: '2026-09-02', hidden: false},
    {id: 'acc-linkedin', service: 'LinkedIn page DWDG UII', purpose: 'Partner and alumni updates.', custodian: 'hana', backup: 'galih', access: 'Page admins are added inside LinkedIn by the custodian. No shared login.', vault: '', renewal: null, verifiedBy: 'hana', verifiedAt: '2026-09-02', hidden: false},
    {id: 'acc-canva', service: 'Canva team', purpose: 'Design files and the 2026 brand kit.', custodian: 'laras', backup: 'galih', access: 'Laras invites members to the team with their own email.', vault: '', renewal: '2027-01-31', verifiedBy: 'laras', verifiedAt: '2026-06-15', hidden: false},
    {id: 'acc-google', service: 'Organization Google account', purpose: 'Owns shared forms, the calendar and the brand folder.', custodian: 'galih', backup: 'mahdy', access: 'Files are shared with your own account. Ask in Requests to MCIT; nobody receives this login.', vault: 'Password manager › Admin › Google', renewal: null, verifiedBy: 'galih', verifiedAt: '2026-09-10', hidden: false},
    {id: 'acc-hosting', service: 'Website hosting', purpose: 'Hosts the public DWDG site.', custodian: null, backup: null, access: 'Unknown until the open request is resolved.', vault: '', renewal: null, verifiedBy: null, verifiedAt: null, hidden: false, request: 'it-hosting'},
    {id: 'acc-system', service: 'dwdg’ONE system account', purpose: 'Runs scheduled jobs for this app. Never appears in search, pickers or contact suggestions.', custodian: 'mahdy', backup: 'galih', access: 'Admin only.', vault: 'Password manager › Admin › System', renewal: null, verifiedBy: 'mahdy', verifiedAt: '2026-10-01', hidden: true}];
  return {v: 1, grants, campaigns, content, briefs, it, accounts, drafts: {}};
}

// Seed once per demo store (the store resets from Settings). Adds the canonical tasks and the first Updates and Changes these records need.
function ensureFnl() {
  if (db.fnl && db.fnl.v === 1) return; db.fnl = seedFnl();
  const N = (to, type, actor, h, title, at, read = false) => db.updates.push({id: uid('n'), to, type, actor, ref: {type: 'link', id: h, h, title}, at, read});
  N('daniel', 'fnl-review', 'rafi', 'fnl-requests/lgl-kk-pks', 'Partnership agreement (PKS) with Kopi Kultur Jakal, v1', '2026-10-05T17:00');
  N('daniel', 'fnl-review', 'rafi', 'fnl-requests/lgl-hms-bast', 'Handover record (BAST) for the HMS data workshop, v1', '2026-10-05T16:10');
  N('daniel', 'fnl-urgent', 'tasya', 'fnl-requests/lgl-letter-fh', 'Speaker invitation letter to Fakultas Hukum UII', '2026-10-05T21:00');
  N('daniel', 'fnl-f-review', 'citra', 'fnl-requests/fr-ink', 'Printer ink for agreement copies', '2026-10-05T19:00');
  N('daniel', 'fnl-f-review', 'bima', 'fnl-requests/fr-gift', 'Speaker gift for the HMS workshop', '2026-10-06T08:00');
  N('daniel', 'fnl-alloc', 'citra', 'budget', 'Website relaunch, Tools and hosting', '2026-10-05T15:00');
  N('rafi', 'fnl-submitted', 'kirana', 'fnl-requests/lgl-sk-orient', 'Decree (SK) for the Batch 2026 orientation committee', '2026-10-06T07:30');
  N('citra', 'fnl-pay-ready', 'daniel', 'fnl-requests/fr-venue', 'Venue deposit for the partner breakfast', '2026-10-05T11:00');
  N('citra', 'fnl-f-review', 'rafi', 'fnl-requests/fr-materai2', 'Stamp duty for the HMS agreement', '2026-10-06T07:50');
  const Cg = (actor, verb, id, name, h, at, from, to) => db.changes.push({id: uid('c'), ws: FNL, actor, verb, target: tgt(id, name, h), at, from: from || null, to: to || null});
  Cg('rafi', 'sent a version for review', 'lgl-kk-pks', 'Partnership agreement (PKS) with Kopi Kultur Jakal', 'fnl-requests/lgl-kk-pks', '2026-10-05T17:00', 'Drafting', 'In review');
  Cg('daniel', 'approved a finance request', 'fr-venue', 'Venue deposit for the partner breakfast', 'fnl-requests/fr-venue', '2026-10-05T11:00', 'Under review', 'Approved, not paid');
  Cg('rafi', 'recorded a signature on', 'lgl-hms-pks', 'Cooperation agreement (PKS) with Himpunan Mahasiswa Statistika', 'fnl-requests/lgl-hms-pks', '2026-10-04T13:00');
  Cg('daniel', 'issued a document number for', 'lgl-hms-pks', 'Cooperation agreement (PKS) with Himpunan Mahasiswa Statistika', 'fnl-requests/lgl-hms-pks', '2026-10-03T10:30');
  db.changes.sort((a, b) => b.at.localeCompare(a.at)); db.updates.sort((a, b) => b.at.localeCompare(a.at)); save();
}
function ensureMc() {
  if (db.mcit && db.mcit.v === 1) return; db.mcit = seedMc();
  if (!db.tasks.some(t => t.id === 'tk-it-forms')) db.tasks.push({id: 'tk-it-forms', title: 'Give HR leads edit access to the recruitment form', owner: 'gilang', due: '2026-10-07', time: null, status: 'doing', reviewer: null, project: null, milestone: null, div: MC, notes: 'From the IT request in MCIT Requests. Add editors; never share the account login.', evidence: '', doneAt: null, createdBy: 'gilang', createdAt: '2026-10-05T10:05', offer: null, meeting: null, links: [], mentions: [], trashed: false});
  const N = (to, type, actor, h, title, at) => db.updates.push({id: uid('n'), to, type, actor, ref: {type: 'link', id: h, h, title}, at, read: false});
  N('laras', 'mc-review', 'hana', 'content/ct-teaser', 'Open recruitment teaser, v2', '2026-10-05T21:15');
  N('galih', 'mc-review', 'farah', 'content/ct-launch', 'Website relaunch announcement, v3', '2026-10-06T08:40');
  N('galih', 'mc-it-new', 'reza', 'it-requests/it-page', 'Add a Consulting page to the site', '2026-10-06T07:45');
  N('salsa', 'mc-it-resolved', 'gilang', 'it-requests/it-drive', 'Brand assets folder asks for access', '2026-10-06T08:00');
  N('galih', 'mc-brief', 'alya', 'it-requests/br-ee-1', 'Partner breakfast thank-you post', '2026-10-05T15:00');
  const Cg = (actor, verb, id, name, h, at, from, to) => db.changes.push({id: uid('c'), ws: MC, actor, verb, target: tgt(id, name, h), at, from: from || null, to: to || null});
  Cg('farah', 'sent a new version for review', 'ct-launch', 'Website relaunch announcement', 'content/ct-launch', '2026-10-06T08:40', 'Approved', 'In review');
  Cg('gilang', 'resolved an IT request', 'it-drive', 'Brand assets folder asks for access', 'it-requests/it-drive', '2026-10-06T08:00', 'Reopened', 'Resolved');
  Cg('hana', 'recorded a publication for', 'ct-poster', 'Open recruitment poster', 'content/ct-poster', '2026-10-05T19:10');
  db.changes.sort((a, b) => b.at.localeCompare(a.at)); db.updates.sort((a, b) => b.at.localeCompare(a.at)); save();
}

// ---------- FnL lookups and derived values (never stored: paid, outstanding and remaining come from the rows) ----------
const lrOf = id => (db.fnl.legal || []).find(x => x.id === id);
const frOf = id => (db.fnl.requests || []).find(x => x.id === id);
const invOf = id => (db.fnl.incoming || []).find(x => x.id === id);
const rgOf = id => (db.fnl.register || []).find(x => x.id === id);
const alOf = id => (db.fnl.allocations || []).find(x => x.id === id);
const prOf = id => (db.fnl.periods || []).find(x => x.id === id);
const paysOf = fr => db.fnl.payments.filter(p => p.req === fr.id);
const netPaid = fr => paysOf(fr).reduce((s, p) => s + p.amount, 0); // corrections carry a signed amount and point at the original (finance_adjustments)
const COMMIT = ['approved', 'partial', 'paid', 'reconciled'];
const commit = fr => COMMIT.includes(fr.state) ? (fr.approved || 0) : 0; // total-approved basis (finance_comparisons, proposed)
const owed = fr => commit(fr) ? commit(fr) - netPaid(fr) : 0;
const alStats = al => { const rs = db.fnl.requests.filter(r => r.alloc === al.id), c = rs.reduce((s, r) => s + commit(r), 0), p = rs.reduce((s, r) => s + (commit(r) ? netPaid(r) : 0), 0);
  return {reqs: rs, committed: c, paid: p, outstanding: c - p, remaining: al.state === 'approved' ? al.amount - c : null}; };
const alName = al => al ? `${unitName(al.unit)} · ${L(al.category)}${al.project && projOf(al.project) ? ` · ${projOf(al.project).name}` : ''}` : L('No budget line');
const latestV = x => x.versions[x.versions.length - 1];
const liveNo = x => { const r = x.number && rgOf(x.number); return r && r.state === 'issued' ? r : null; };
const sigDone = s => s.state === 'signed' || s.state === 'attested';
const allSigned = x => x.signatories.length > 0 && x.signatories.every(sigDone);
const canSeeL = x => { const m = me(); return !!m && !isBoardP(m) && (fnlFull(m) || x.requester === m.id || x.createdBy === m.id || unitLead(m, x.unit)); };
const isReqL = x => x.requester === session.me || x.createdBy === session.me;
const lPriv = () => G('legal') || G('legalReview');
const canSeeF = x => { const m = me(); return !!m && !isBoardP(m) && (fnlFull(m) || x.requester === m.id); };
const fPriv = x => x.requester === session.me || G('finReview') || G('pay'); // payee and evidence (security_finance)
const leadNeed = x => AGREEMENT.includes(x.type) ? db.fnl.policy.leadAgreement : db.fnl.policy.leadOther;
const daysLeft = x => x.requiredBy ? daysBetween(today(), x.requiredBy) : null;
const shortNotice = x => !['signed', 'registered', 'cancelled', 'rejected'].includes(x.stage) && x.requiredBy && daysBetween(x.createdAt.slice(0, 10), x.requiredBy) < leadNeed(x);
const neededTag = d => { if (!d) return `<span class="t-mute">${L('Not set')}</span>`; const n = daysBetween(today(), d); return `<span class="t-num">${esc(dShort(d))}</span>${n < 0 ? ` <span class="tag tag-danger">${L('Past due')}</span>` : n <= 1 ? ` <span class="tag tag-warn">${n === 0 ? L('Today') : L('Tomorrow')}</span>` : ''}`; };
const gateOf = x => { // PKS → BAST → invoice gate (legal_bast_gate): each check is read from its own record, never from a percentage
  const pks = lrOf(x.pks), del = x.gate && x.gate.delivery;
  const items = [{k: 'pks', ok: !!pks && ['signed', 'registered'].includes(pks.stage), label: L('PKS signed by every party'), sub: pks ? `<a href="#/fnl-requests/${pks.id}">${esc(pks.title)}</a> ${chip(LST[pks.stage], '')}` : `<span class="t-mute">${L('No PKS linked')}</span>`},
    {k: 'bast', ok: ['signed', 'registered'].includes(x.stage) && allSigned(x), label: L('BAST signed by every party'), sub: chip(LST[x.stage], '')},
    {k: 'delivery', ok: !!del, label: L('Delivery evidence checked by Legal'), sub: del ? `${linkOut(L('Delivery evidence'), del.url)} ${byAt(del.by, del.at)}` : `<span class="t-mute">${L('Not checked yet')}</span>`}];
  return {items, ok: items.every(i => i.ok), exception: x.gate && x.gate.exception};
};

// ---------- FnL: Requests (Legal, Finance and Incoming views; one queue per specialist, blueprint §8) ----------
function fnlRequestsPage(r) {
  ensureFnl(); const m = me(); useWs(FNL);
  const cr = parts => crumb(FNL, [['fnl-requests', L('Requests')], ...parts]);
  if (r.id === 'new') return newFnlPage(r.sub);
  if (r.id) { const x = lrOf(r.id) || frOf(r.id) || invOf(r.id);
    if (!x) return {crumb: cr([]), content: denied()};
    if (lrOf(r.id)) return legalPage(x); if (frOf(r.id)) return financePage(x); return incomingPage(x); }
  if (isBoardP(m)) { // Board: counts only, no titles or amounts (access_board_scope, security_finance)
    const cnt = (list, open) => list.filter(open).length;
    return {crumb: cr([]), content: `<div class="page fm-page"><div class="ph"><div><h1 class="t-title">${L('Finance & Legal requests')}</h1><p class="sub">${L('Board view: counts only. Request details stay with FnL and the requester.')}</p></div></div>
      ${meta([[L('Open legal requests'), `<span class="t-num">${cnt(db.fnl.legal, x => !['registered', 'cancelled', 'rejected', 'draft'].includes(x.stage))}</span>`], [L('Open finance requests'), `<span class="t-num">${cnt(db.fnl.requests, x => ['submitted', 'review', 'returned', 'approved', 'partial'].includes(x.state))}</span>`]])}</div>`}; }
  const full = fnlFull(m);
  const mineL = db.fnl.legal.filter(x => isReqL(x) || (!full && unitLead(m, x.unit))), mineF = db.fnl.requests.filter(x => x.requester === m.id);
  const lRow = x => `<tr data-act="go" data-h="fnl-requests/${x.id}" tabindex="0" role="link"><td><b>${esc(x.title)}</b><small class="t-mute">${L(LTYPE[x.type][0])}${x.counterpart ? `, ${esc(x.counterpart)}` : ''}</small></td>
    <td>${who(x.requester)} <small class="t-mute">${esc(unitName(x.unit))}</small></td><td>${neededTag(x.requiredBy)}${shortNotice(x) ? ` <span class="tag tag-warn">${L('Short notice')}</span>` : ''}</td><td>${who(x.owner)}</td>
    <td>${liveNo(x) ? `<span class="reg-no">${esc(liveNo(x).no)}</span>` : '<span class="t-mute">–</span>'}</td><td>${chip(LST[x.stage])}</td></tr>`;
  const fRow = x => `<tr data-act="go" data-h="fnl-requests/${x.id}" tabindex="0" role="link"><td><b>${esc(x.purpose)}</b><small class="t-mute">${esc(alName(alOf(x.alloc)))}</small></td><td>${who(x.requester)}</td>
    <td class="num">${idr(x.requested)}</td><td class="num">${x.approved != null && COMMIT.includes(x.state) ? idr(x.approved) : '<span class="t-mute">–</span>'}</td><td class="num">${commit(x) ? idr(netPaid(x)) : '<span class="t-mute">–</span>'}</td><td class="num">${commit(x) ? idr(owed(x)) : '<span class="t-mute">–</span>'}</td>
    <td>${chip(FST[x.state])}${x.dup && x.dup.state === 'flagged' ? ` <span class="tag tag-warn">${L('Possible duplicate')}</span>` : ''}</td></tr>`;
  const iRow = x => { const rec = x.receipts.reduce((s, p) => s + p.amount, 0); return `<tr data-act="go" data-h="fnl-requests/${x.id}" tabindex="0" role="link"><td><b>${esc(x.title)}</b><small class="t-mute">${esc(x.client)}</small></td><td class="num">${idr(x.expected)}</td><td class="num">${idr(rec)}</td><td class="num">${idr(x.expected - rec)}</td><td>${chip(IST[x.state])}</td></tr>`; };
  const lHead = `<tr><th>${L('Request')}</th><th>${L('Requested by')}</th><th>${L('Needed by')}</th><th>${L('Responsible')}</th><th>${L('Number')}</th><th>${L('State')}</th></tr>`;
  const fHead = `<tr><th>${L('Request')}</th><th>${L('Requested by')}</th><th class="num">${L('Requested')}</th><th class="num">${L('Approved')}</th><th class="num">${L('Paid')}</th><th class="num">${L('Outstanding')}</th><th>${L('State')}</th></tr>`;
  const tbl = (head, rows) => `<div class="fm-scroll"><table class="tbl fm-tbl"><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
  const newBtns = `<div class="ph-r"><a class="btn" href="#/fnl-requests/new/legal">${icon('file')}${L('Legal request')}</a><a class="btn btn-pri" href="#/fnl-requests/new/finance">${icon('wallet')}${L('Finance request')}</a></div>`;
  const yours = (mineL.length || mineF.length) ? `${sec(L('Your requests'), mineL.length + mineF.length)}${mineL.length ? tbl(lHead, mineL.map(lRow).join('')) : ''}${mineF.length ? tbl(fHead, mineF.map(fRow).join('')) : ''}` : '';
  if (!full) return {crumb: cr([]), content: `<div class="page wide fm-page"><div class="ph"><div><h1 class="t-title">${L('Requests to Finance & Legal')}</h1><p class="sub">${L('Ask Legal for a document or Finance for money. You see your own requests and what happens next; reviewer notes stay with FnL.')}</p></div>${newBtns}</div>
    ${yours || emptyBox(L('You have no requests yet'), L('Start a legal or finance request. Drafts are kept until you submit.'))}</div>`};
  const v = ui.view.fnlreq || 'legal', f = ui.view.fnlf || 'open';
  const openL = x => !['registered', 'cancelled', 'rejected'].includes(x.stage), openF = x => !['reconciled', 'cancelled', 'rejected', 'paid'].includes(x.state);
  const lList = db.fnl.legal.filter(x => x.stage !== 'draft' || isReqL(x)).filter(x => f === 'all' || (f === 'open' ? openL(x) : !openL(x))).sort((a, b) => (a.requiredBy || '9').localeCompare(b.requiredBy || '9'));
  const fList = db.fnl.requests.filter(x => x.state !== 'draft' || x.requester === m.id).filter(x => f === 'all' || (f === 'open' ? openF(x) : !openF(x))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tabs = `<div class="tabs fm-tabs" role="tablist">${[['legal', 'Legal', db.fnl.legal.filter(openL).length], ['finance', 'Finance', db.fnl.requests.filter(openF).length], ['incoming', 'Incoming', db.fnl.incoming.length]].map(([k, t, n]) => `<button class="${v === k ? 'on' : ''}" data-act="view" data-scope="fnlreq" data-v="${k}" role="tab" aria-selected="${v === k}">${L(t)} <span class="n">${n}</span></button>`).join('')}</div>`;
  const filt = v === 'incoming' ? '' : `<div class="seg fm-seg" role="radiogroup" aria-label="${esc(L('Show'))}">${[['open', 'Open'], ['done', 'Done'], ['all', 'All']].map(([k, t]) => `<button class="${f === k ? 'on' : ''}" data-act="view" data-scope="fnlf" data-v="${k}" role="radio" aria-checked="${f === k}">${L(t)}</button>`).join('')}</div>`;
  const body = v === 'legal' ? (lList.length ? tbl(lHead, lList.map(lRow).join('')) : emptyBox(L('Nothing here'), L('No legal requests match this filter.')))
    : v === 'finance' ? (fList.length ? tbl(fHead, fList.map(fRow).join('')) : emptyBox(L('Nothing here'), L('No finance requests match this filter.')))
    : `${note('info', 'info', L('Incoming money is a separate basis'), L('Expected client income is never budget and never mixed with spending. A term opens only after the legal gate (proposed, P1).'))}${tbl(`<tr><th>${L('Term')}</th><th class="num">${L('Expected')}</th><th class="num">${L('Received')}</th><th class="num">${L('Outstanding')}</th><th>${L('State')}</th></tr>`, db.fnl.incoming.map(iRow).join(''))}`;
  return {crumb: cr([]), content: `<div class="page wide fm-page"><div class="ph"><div><h1 class="t-title">${L('Requests')}</h1><p class="sub">${L('Legal and Finance queues in one division. Approval, numbering, signatures and payments are separate grants.')}</p></div>${newBtns}</div>
    <div class="fm-bar">${tabs}${filt}</div>${body}${grantsBox(db.fnl.grants, v === 'legal' ? ['legal', 'legalReview', 'issue', 'sign'] : v === 'finance' ? ['finReview', 'pay'] : ['invoice', 'pay'])}</div>`};
}

// ---------- new legal or finance request (legal_request, finance_request, work_forms: drafts survive errors) ----------
const draftOf = (k, st = 'fnl') => { const o = db[st]; const d = o.drafts[session.me] = o.drafts[session.me] || {}; return d[k] = d[k] || {}; };
function newFnlPage(kind) {
  const m = me(); kind = kind === 'finance' ? 'finance' : 'legal';
  const cr = crumb(FNL, [['fnl-requests', L('Requests')], ['', kind === 'legal' ? L('New legal request') : L('New finance request')]]);
  if (isBoardP(m)) return {crumb: cr, content: denied()};
  const d = draftOf(kind), dv = (k, def = '') => d[k] != null ? d[k] : def, inD = k => `data-input="fm-draft" data-kind="${kind}" data-k="${k}"`;
  const projs = db.projects.filter(p => visibleDivs(m).includes(p.div) || (p.team || []).some(t => t.id === m.id && t.state === 'joined'));
  const seg = `<div class="seg fm-seg" role="radiogroup" aria-label="${esc(L('Request type'))}"><button class="${kind === 'legal' ? 'on' : ''}" data-act="go" data-h="fnl-requests/new/legal" role="radio" aria-checked="${kind === 'legal'}">${L('Legal')}</button><button class="${kind === 'finance' ? 'on' : ''}" data-act="go" data-h="fnl-requests/new/finance" role="radio" aria-checked="${kind === 'finance'}">${L('Finance')}</button></div>`;
  const saved = d._at ? `<span class="t-caption fm-saved">${L('Draft saved {t}', {t: d._at.slice(11, 16)})}</span>` : '';
  let form;
  if (kind === 'legal') {
    const ty = dv('type', 'PKS'), agr = AGREEMENT.includes(ty), rb = dv('requiredBy'), short = rb && daysBetween(today(), rb) < (agr ? db.fnl.policy.leadAgreement : db.fnl.policy.leadOther);
    form = `<div class="fm-form">${field('fm-l-type', L('Document type'), `<select class="input" id="fm-l-type" ${inD('type')}>${opts(Object.keys(LTYPE).map(k => [k, L(LTYPE[k][0])]), ty)}</select>`, '', true)}
      ${field('fm-l-title', L('Title'), inp('fm-l-title', dv('title'), inD('title')), L('For example: Cooperation agreement with the client'), true)}
      ${field('fm-l-purpose', L('Purpose'), txa('fm-l-purpose', dv('purpose'), inD('purpose')), L('What the document must achieve.'), true)}
      <div class="fm-2">${field('fm-l-cp', L('Counterpart'), inp('fm-l-cp', dv('counterpart'), inD('counterpart')), agr || ty === 'LTR' ? L('Required for this type.') : L('Leave empty for internal documents.'), agr || ty === 'LTR')}
      ${field('fm-l-proj', L('Project'), `<select class="input" id="fm-l-proj" ${inD('project')}>${opts(projs.map(p => [p.id, p.name]), dv('project'), L('No project'))}</select>`)}</div>
      <div class="fm-2">${field('fm-l-rb', L('Needed by'), `<input type="date" class="input" id="fm-l-rb" value="${esc(rb)}" ${inD('requiredBy')}>`, '', true)}
      ${field('fm-l-conf', L('Confidential'), `<label class="fm-check"><input type="checkbox" id="fm-l-conf" ${dv('conf') ? 'checked' : ''} data-input="fm-draft" data-kind="${kind}" data-k="conf"> ${L('Only the requester and FnL Legal see the sources')}</label>`)}</div>
      ${field('fm-l-sig', L('Signatories'), txa('fm-l-sig', dv('signatories'), inD('signatories') + ` placeholder="${esc(L('One per line: name, role, party'))}"`), agr ? L('Required for agreements. One per line: name, role, party.') : L('One per line: name, role, party.'), agr)}
      ${field('fm-l-src', L('Sources (KAK, proposal, earlier versions)'), txa('fm-l-src', dv('sources'), inD('sources') + ` placeholder="${esc(L('One per line: label | https://link'))}"`), L('Links only. Files stay in your drive.'))}
      ${short ? `${note('warn', 'warning', L('Short notice'), L('The survey suggested H-3 for agreements and H-2 for other letters. It is not adopted policy, so nothing is rejected automatically. Say why it is urgent; FnL decides.'))}${field('fm-l-urg', L('Why is it urgent?'), txa('fm-l-urg', dv('urgency'), inD('urgency')))}` : ''}</div>`;
  } else {
    const als = db.fnl.allocations.filter(a => a.state === 'approved');
    form = `<div class="fm-form">${field('fm-f-purpose', L('Purpose'), inp('fm-f-purpose', dv('purpose'), inD('purpose')), L('What the money is for.'), true)}
      <div class="fm-2">${field('fm-f-amount', L('Amount (Rp)'), inp('fm-f-amount', dv('amount'), inD('amount') + ' inputmode="numeric" placeholder="90.000"'), L('Whole rupiah only.'), true)}
      ${field('fm-f-need', L('Needed by'), `<input type="date" class="input" id="fm-f-need" value="${esc(dv('need'))}" ${inD('need')}>`)}</div>
      <div class="fm-2">${field('fm-f-alloc', L('Budget line'), `<select class="input" id="fm-f-alloc" ${inD('alloc')}>${opts(als.map(a => [a.id, alName(a)]), dv('alloc'), L('Choose a budget line'))}</select>`, L('Only approved allocations are listed.'), true)}
      ${field('fm-f-cat', L('Category'), `<select class="input" id="fm-f-cat" ${inD('category')}>${opts(CATS.map(c => [c, L(c)]), dv('category', 'Events'))}</select>`, '', true)}</div>
      <div class="fm-2">${field('fm-f-payee', L('Payee'), inp('fm-f-payee', dv('payee'), inD('payee')), L('Name only. Bank details are never stored here.'))}
      ${field('fm-f-ref', L('Receipt or quotation number'), inp('fm-f-ref', dv('ref'), inD('ref')), L('Used to spot possible duplicates.'))}</div>
      ${field('fm-f-ev', L('Evidence link'), inp('fm-f-ev', dv('evidence'), inD('evidence') + ' placeholder="https://"'), L('A Drive link to the receipt or quotation. Without it Finance may return the request.'))}</div>`;
  }
  return {crumb: cr, content: `<div class="page fm-page"><div class="ph"><div><h1 class="t-title">${kind === 'legal' ? L('New legal request') : L('New finance request')}</h1><p class="sub">${kind === 'legal' ? L('FnL Legal triages it, drafts the document and asks for review. You see the next step at every stage.') : L('An independent approver decides. Approval is not payment; Finance records the payment after it happens outside the app.')}</p></div>${seg}</div>
    ${form}<div class="acts fm-acts"><button class="btn btn-pri" data-act="fnl-submit-new" data-kind="${kind}">${L('Submit request')}</button><button class="btn" data-act="fnl-draft-keep" data-kind="${kind}">${L('Save draft')}</button><button class="btn btn-ghost" data-act="fnl-draft-clear" data-kind="${kind}">${L('Clear form')}</button>${saved}</div></div>`};
}

// ---------- one legal request (legal_requester_view, flow-legal-*) ----------
function lNext(x) {
  const lv = latestV(x), sg = x.signatories.filter(sigDone).length;
  return {draft: [x.requester, L('Submit when the required fields are complete.')], submitted: [null, L('FnL Legal triages the request and names who drafts it.')], info: [x.requester, L('Answer the question from Legal. The request waits for you.')],
    drafting: [x.owner, L('{who} prepares the first version.', {who: first(x.owner)})], revision: [x.owner, L('{who} prepares a new version.', {who: first(x.owner)})], review: [x.reviewer, L('{who} reviews version {v}.', {who: first(x.reviewer), v: lv ? lv.v : 1})],
    approved: liveNo(x) ? [x.owner, L('{who} sends the approved version for signature.', {who: first(x.owner)})] : [db.fnl.grants.issue[0], L('{who} issues the document number.', {who: first(db.fnl.grants.issue[0])})],
    awaiting: [x.owner, L('{a} of {b} signatures recorded. It stays here until every party has signed.', {a: sg, b: x.signatories.length})], signed: [x.owner, x.type === 'BAST' ? L('Check the delivery evidence, then send the gate to Finance.') : L('Legal registers and archives it.')],
    registered: [null, L('Registered. Nothing else is needed.')], cancelled: [null, L('Canceled. The history stays.')], rejected: [null, L('Rejected. The history stays.')]}[x.stage] || [null, ''];
}
function legalPage(x) {
  const m = me(), cr = crumb(FNL, [['fnl-requests', L('Requests')], ['', x.title]]);
  if (!canSeeL(x)) return {crumb: crumb(FNL, [['fnl-requests', L('Requests')]]), content: denied()};
  const lv = latestV(x), no = x.number ? rgOf(x.number) : null, f = ui.form || '', req = isReqL(x), legal = G('legal'), rev = G('legalReview'), seeSrc = !x.confidential || req || lPriv();
  const [nWho, nTxt] = lNext(x), closed = ['cancelled', 'rejected', 'registered'].includes(x.stage);
  const proj = x.project && projOf(x.project);
  const head = `<div class="ph"><div><h1 class="t-title">${esc(x.title)}</h1><p class="sub">${L(LTYPE[x.type][0])}${x.counterpart ? ` · ${esc(x.counterpart)}` : ''}${liveNo(x) ? ` · <span class="reg-no">${esc(liveNo(x).no)}</span>` : ''}</p></div><div class="ph-r">${chip(LST[x.stage], 'pill-o')}</div></div>`;
  const nextBox = `<div class="fm-next">${icon('flag', 'ic-sm')}<div><b>${L('Next')}</b><span>${nWho ? `${who(nWho)} ` : ''}${esc(nTxt)}</span></div></div>`;
  const stp = LSTEP_I[x.stage] != null ? steps(LSTEPS, x.stage === 'info' ? 0 : LSTEP_I[x.stage]) : '';
  const info = meta([[L('Created by'), byAt(x.createdBy, x.createdAt)], x.requester !== x.createdBy ? [L('Requester'), who(x.requester)] : null, [L('Requesting unit'), esc(unitName(x.unit))], [L('Responsible'), who(x.owner)], [L('Reviewer'), who(x.reviewer)],
    [L('Needed by'), `${neededTag(x.requiredBy)}${x.requiredBy && daysLeft(x) >= 0 ? ` <span class="t-mute t-small">${plural(daysLeft(x), '{n} day from today', '{n} days from today')}</span>` : ''}`], [L('Purpose'), nl(x.purpose)],
    x.project ? [L('Project'), proj ? `<a href="#/projects/${proj.id}">${esc(proj.name)}</a>` : `<span class="t-mute">${L('Removed project')}</span>`] : null,
    x.opp ? [L('Opportunity'), `<a href="#/opportunities/${esc(x.opp)}">${L('EE client opportunity')}</a>${x.handoff ? ` · <a href="#/opportunities/${esc(x.opp)}">${L('EE to Consulting handoff')}</a>` : ''}`] : null,
    [L('Template'), x.template ? esc(x.template) : `<span class="t-mute">${L('Not chosen yet')}</span>`],
    [L('Sources'), seeSrc ? (x.sources.length ? `<span class="fm-links">${x.sources.map(s => linkOut(s.label, s.url)).join('')}</span>` : `<span class="t-mute">${L('None linked')}</span>`) : locked(L('Confidential'))], x.confidential ? [L('Confidential'), `<span class="tag tag-ink">${L('Yes')}</span>`] : null]);
  // urgency (legal_urgent, legal_sla open): a warning and an exception with a named approver, never an automatic rejection
  const u = x.urgency;
  const urg = (shortNotice(x) || u) && !closed ? `${note('warn', 'warning', L('Short notice'), L('Needed {n} days after it was submitted. H-3 for agreements and H-2 for other letters are survey suggestions, not adopted policy, so the app warns and does not reject.', {n: Math.max(0, daysBetween(x.createdAt.slice(0, 10), x.requiredBy))}))}
    ${u ? `<div class="quiet fm-box"><div class="fm-between"><b>${L('Urgent exception')}</b>${chip(u.state === 'approved' ? ['Exception approved', 'check', 'green'] : u.state === 'declined' ? ['Exception declined', 'close', 'mute'] : ['Waiting for a decision', 'clock', 'warn'])}</div>
      ${meta([[L('Asked by'), byAt(u.by, u.at)], [L('Reason'), nl(u.reason)], u.decidedBy ? [L('Decided by'), byAt(u.decidedBy, u.decidedAt)] : null, u.note ? [L('Decision note'), nl(u.note)] : null])}
      ${u.state === 'requested' && rev && !req ? (f === 'l-urg' ? `${field('fm-urg-note', L('Decision note'), txa('fm-urg-note', '', 'data-autofocus'), L('Required when you decline. Say what the requester should expect.'))}<div class="acts"><button class="btn btn-pri" data-act="fnl-l-urgent-decide" data-id="${x.id}" data-o="approved">${L('Approve exception')}</button><button class="btn" data-act="fnl-l-urgent-decide" data-id="${x.id}" data-o="declined">${L('Decline exception')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>`
        : `<div class="acts"><button class="btn" data-act="fm-form" data-f="l-urg">${L('Decide on the exception')}</button></div>`) : u.state === 'requested' ? `<p class="t-small t-mute">${L('Decided by the FnL legal reviewer (proposed). Approving does not skip review.')}</p>` : ''}</div>`
    : req ? (f === 'l-urg-ask' ? `${field('fm-urg-why', L('Why is it urgent?'), txa('fm-urg-why', '', 'data-autofocus'), '', true)}<div class="acts"><button class="btn btn-pri" data-act="fnl-l-urgent-ask" data-id="${x.id}">${L('Ask for an exception')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>` : `<div class="acts"><button class="btn" data-act="fm-form" data-f="l-urg-ask">${L('Ask for an urgent exception')}</button></div>`) : ''}` : '';
  // triage (flow-legal-intake 3)
  const triage = x.stage === 'submitted' && legal ? `${sec(L('Triage'), null)}<div class="fm-2">${field('fm-tr-owner', L('Drafted by'), `<select class="input" id="fm-tr-owner">${pOpts(db.fnl.grants.legal, x.owner || session.me)}</select>`)}${field('fm-tr-rev', L('Reviewed by'), `<select class="input" id="fm-tr-rev">${pOpts(db.fnl.grants.legalReview, x.reviewer || db.fnl.grants.legalReview[0])}</select>`, L('An independent reviewer, not the drafter.'))}</div>
      ${f === 'l-ask' ? `${field('fm-ask-q', L('What is missing?'), txa('fm-ask-q', '', 'data-autofocus'), L('Be specific. The requester answers on this page.'), true)}<div class="acts"><button class="btn btn-pri" data-act="fnl-l-ask" data-id="${x.id}">${L('Send question')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>`
      : f === 'l-reject' ? `${field('fm-rej-why', L('Reason'), txa('fm-rej-why', '', 'data-autofocus'), '', true)}<div class="acts"><button class="btn btn-danger" data-act="fnl-l-reject" data-id="${x.id}">${L('Reject request')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>`
      : `<div class="acts"><button class="btn btn-pri" data-act="fnl-l-triage" data-id="${x.id}">${L('Start drafting')}</button><button class="btn" data-act="fm-form" data-f="l-ask">${L('Ask for information')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="l-reject">${L('Reject')}</button></div>`}` : '';
  const infoSec = x.info.length ? `${sec(L('Questions from Legal'), x.info.length)}<div class="fm-qa">${x.info.map((q, i) => `<div class="quiet fm-box"><p class="t-small t-mute">${byAt(q.by, q.at)}</p><p>${nl(q.q)}</p>
      ${q.a ? `<p class="fm-ans"><b>${L('Answer')}</b> ${nl(q.a)} <span class="t-mute t-small">${esc(fmtDT(q.aAt))}</span></p>` : req && x.stage === 'info' ? `${field(`fm-ans-${i}`, L('Your answer'), txa(`fm-ans-${i}`, '', 'data-autofocus'), L('Your draft request stays as it is. Add what is missing here.'), true)}<div class="acts"><button class="btn btn-pri" data-act="fnl-l-answer" data-id="${x.id}" data-i="${i}">${L('Send answer')}</button></div>` : `<p class="t-small t-mute">${L('Waiting for the requester.')}</p>`}</div>`).join('')}</div>` : '';
  // versions and review on an exact version (flow-legal-draft-review)
  const decChip = (ver, i) => ver.decision ? chip(ver.decision.kind === 'approved' ? ['Approved for signature', 'check', 'green'] : ver.decision.kind === 'rejected' ? ['Rejected', 'close', 'danger'] : ['Revision requested', 'undo', 'warn']) : i < x.versions.length - 1 ? chip(['Not reviewed, replaced', 'minus', 'mute']) : x.stage === 'review' ? chip(['Waiting for review', 'clock', 'warn']) : chip(['Not reviewed', 'circle', 'mute']);
  const verRows = x.versions.slice().reverse().map((ver, j) => { const i = x.versions.length - 1 - j; return `<div class="ver ${i === x.versions.length - 1 ? 'sel' : ''}"><span class="v">v${ver.v}</span><div><b>${esc(ver.label)}</b><small>${esc(pname(ver.by))}, ${esc(fmtDT(ver.at))}${seeSrc && ver.url ? ` · <a href="${esc(ver.url)}" target="_blank" rel="noopener noreferrer">${L('Open')}</a>` : ''}</small>${ver.decision ? `<small>${L('{who}, {d}', {who: pname(ver.decision.by), d: fmtDT(ver.decision.at)})}${ver.decision.reason ? `: ${esc(ver.decision.reason)}` : ''}</small>` : ''}</div>${decChip(ver, i)}</div>`; }).join('');
  const approvedOld = x.versions.find(v => v.decision && v.decision.kind === 'approved' && v !== lv);
  const canRev = x.stage === 'review' && rev && lv && lv.by !== m.id, canDraft = ['drafting', 'revision'].includes(x.stage) && (x.owner === m.id || (legal && !x.owner));
  const verSec = ['draft', 'submitted', 'info', 'cancelled'].includes(x.stage) && !x.versions.length ? '' : `${sec(L('Versions'), x.versions.length)}${approvedOld && x.stage === 'review' ? note('warn', 'warning', L('A newer version needs its own review'), L('Version {a} was approved. Version {b} changed the document, so that approval does not carry over.', {a: approvedOld.v, b: lv.v})) : ''}
    ${x.versions.length ? `<div class="versions">${verRows}</div>` : `<p class="t-small t-mute">${L('No version yet. The drafter adds a link to the draft in the team drive.')}</p>`}
    ${canRev ? (f === 'l-revise' || f === 'l-rej' ? `${field('fm-rv-why', f === 'l-rej' ? L('Reason for rejecting') : L('What must change'), txa('fm-rv-why', '', 'data-autofocus'), L('Linked to version {v}.', {v: lv.v}), true)}<div class="acts">${f === 'l-rej' ? `<button class="btn btn-danger" data-act="fnl-l-decide" data-id="${x.id}" data-v="${lv.v}" data-o="rejected">${L('Reject request')}</button>` : `<button class="btn btn-pri" data-act="fnl-l-decide" data-id="${x.id}" data-v="${lv.v}" data-o="revision">${L('Request revision')}</button>`}<button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>`
      : `<div class="acts"><button class="btn btn-pri" data-act="fnl-l-decide" data-id="${x.id}" data-v="${lv.v}" data-o="approved">${icon('check')}${L('Approve v{v} for signature', {v: lv.v})}</button><button class="btn" data-act="fm-form" data-f="l-revise">${L('Request revision')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="l-rej">${L('Reject')}</button></div><p class="t-small t-mute">${L('Internal approval is not a signature. A counterpart comment is not an approval.')}</p>`)
    : x.stage === 'review' && rev && lv && lv.by === m.id ? `<p class="t-small t-mute">${L('You wrote this version, so another reviewer decides.')}</p>` : ''}
    ${canDraft ? (f === 'l-ver' ? `<div class="fm-form">${field('fm-v-label', L('What changed'), inp('fm-v-label', '', 'data-autofocus'), '', true)}${field('fm-v-url', L('Link to this version'), inp('fm-v-url', '', 'placeholder="https://"'), L('The document stays in the team drive. This records which file was reviewed.'), true)}${x.versions.length ? '' : field('fm-v-tpl', L('Template used'), inp('fm-v-tpl', x.template))}</div><div class="acts"><button class="btn btn-pri" data-act="fnl-l-version" data-id="${x.id}">${L('Send v{v} for review', {v: (lv ? lv.v : 0) + 1})}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>`
      : `<div class="acts"><button class="btn btn-pri" data-act="fm-form" data-f="l-ver">${icon('upload')}${L('Add version {v}', {v: (lv ? lv.v : 0) + 1})}</button></div>`) : ''}`;
  // number (legal_numbering, legal_number_void): provisional labels until POL adopts the format and moment
  const issuable = ['approved', 'awaiting', 'signed'].includes(x.stage) && !liveNo(x) && G('issue');
  const regChain = db.fnl.register.filter(g => g.req === x.id);
  const numSec = regChain.length || ['approved', 'awaiting', 'signed', 'registered'].includes(x.stage) ? `${sec(L('Document number'), null)}
    ${regChain.length ? `<div class="rows fm-regrows">${regChain.map(g => `<div class="row"><span class="reg-no ${g.state === 'void' ? 'void' : ''}">${esc(g.no)}</span><div class="t"><small>${L('Version {v}', {v: g.version})}, ${esc(pname(g.issuedBy))}, ${esc(fmtDT(g.issuedAt))}${g.state === 'void' ? ` · ${L('Void: {r}', {r: g.voidReason})}` : ''}</small></div>${g.state === 'void' ? chip(['Void, kept in the register', 'close', 'mute']) : chip(['Issued', 'check', 'green'])}</div>`).join('')}</div>` : ''}
    <p class="t-small t-mute">${L('Proposed format {f}. Not adopted yet, so every number here is a provisional label. Numbers are never reused.', {f: db.fnl.policy.format})}</p>
    ${issuable ? `<div class="acts"><button class="btn btn-pri" data-act="fnl-l-issue" data-id="${x.id}">${L('Issue number for v{v}', {v: lv.v})}</button></div>` : ''}
    ${liveNo(x) && G('issue') && x.stage !== 'registered' ? (f === 'l-void' ? `${field('fm-void-why', L('Why void this number?'), txa('fm-void-why', '', 'data-autofocus'), L('The number stays in the register with this reason. A new number can be issued after.'), true)}<div class="acts"><button class="btn btn-danger" data-act="fnl-l-void" data-id="${x.id}">${L('Void {no}', {no: liveNo(x).no})}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>` : `<div class="acts"><button class="btn btn-ghost" data-act="fm-form" data-f="l-void">${L('Void this number')}</button></div>`) : ''}` : '';
  // signatures (legal_signature_status, integration-signature): recorded evidence, never an e-signature
  const sigRows = x.signatories.map(s => `<div class="row fm-sig"><div class="t"><b>${esc(s.name)}</b><small>${esc(s.role)}, ${esc(s.party)}</small>${s.state === 'signed' || s.state === 'attested' ? `<small>${s.evidence ? linkOut(L('Signed copy'), s.evidence) : ''} ${L('Signed on {d}', {d: fmtD(s.date)})}, ${L('recorded by {who}', {who: pname(s.by)})}${s.note ? ` · ${esc(s.note)}` : ''}</small>` : s.state === 'declined' ? `<small>${esc(s.note)}</small>` : ''}</div>${chip(SIG[s.state])}
    ${x.stage === 'awaiting' && G('sign') && s.state === 'requested' ? `<button class="btn btn-sm" data-act="fm-form" data-f="sig-${s.id}">${L('Record')}</button>` : ''}</div>
    ${f === `sig-${s.id}` ? `<div class="quiet fm-box">${field('fm-sg-basis', L('Evidence'), `<select class="input" id="fm-sg-basis">${opts([['copy', L('Signed copy (link)')], ['attested', L('Attestation without a copy')]], 'copy')}</select>`, L('An attestation stays marked as not verified.'))}${field('fm-sg-url', L('Link to the signed copy'), inp('fm-sg-url', '', 'placeholder="https://" data-autofocus'))}
      <div class="fm-2">${field('fm-sg-date', L('Signed on'), `<input type="date" class="input" id="fm-sg-date" value="${today()}">`, '', true)}${field('fm-sg-note', L('Note'), inp('fm-sg-note'), L('Required for an attestation: who confirmed it and how.'))}</div>
      <div class="acts"><button class="btn btn-pri" data-act="fnl-l-sign" data-id="${x.id}" data-s="${s.id}">${L('Record signature')}</button><button class="btn" data-act="fnl-l-sign-decl" data-id="${x.id}" data-s="${s.id}">${L('Declined to sign')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>` : ''}`).join('');
  const sigSec = ['approved', 'awaiting', 'signed', 'registered'].includes(x.stage) && x.signatories.length ? `${sec(L('Signatures'), `${x.signatories.filter(sigDone).length}/${x.signatories.length}`)}<div class="rows">${sigRows}</div>
    <p class="t-small t-mute">${L('The app records signatures made elsewhere. It does not sign, send or verify documents.')}</p>
    ${x.stage === 'approved' && (G('sign') || x.owner === m.id) ? (liveNo(x) ? `<div class="acts"><button class="btn btn-pri" data-act="fnl-l-send-sign" data-id="${x.id}">${L('Mark as sent for signature')}</button></div>` : `<p class="t-small t-mute">${L('Issue the number first (proposed order).')}</p>`) : ''}
    ${x.stage === 'signed' && legal && x.type !== 'BAST' ? `<div class="acts"><button class="btn btn-pri" data-act="fnl-l-register" data-id="${x.id}">${icon('archive')}${L('Register and archive')}</button></div>` : ''}` : '';
  // gate (legal_bast_gate, flow-legal-signatures 15, flow-legal-handoff 16–17)
  let gateSec = '';
  if (x.type === 'BAST') {
    const g = gateOf(x), inv = invOf(x.invoice), sent = x.gate.sent;
    gateSec = `${sec(L('Ready-for-invoice gate'), null, ` ${g.ok ? chip(['Ready for invoice', 'check', 'green'], '') : g.exception ? chip(['Exception recorded', 'warning', 'warn'], '') : chip(['Not ready for invoice', 'lock', 'mute'], '')}`)}
      <div class="fm-checks">${g.items.map(i => `<div class="fm-check-r">${chip(i.ok ? ['Done', 'check', 'green'] : ['Missing', 'circle', 'mute'], '')}<div><b>${i.label}</b><div class="t-small">${i.sub}</div></div></div>`).join('')}</div>
      ${!x.gate.delivery && rev && ['awaiting', 'signed'].includes(x.stage) ? (f === 'g-del' ? `<div class="quiet fm-box">${field('fm-del-url', L('Link to the delivery evidence'), inp('fm-del-url', '', 'placeholder="https://" data-autofocus'), L('For example the session attendance list and the slide pack Consulting handed over.'), true)}<div class="acts"><button class="btn btn-pri" data-act="fnl-g-delivery" data-id="${x.id}">${L('Record check')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>` : `<div class="acts"><button class="btn" data-act="fm-form" data-f="g-del">${L('Record delivery evidence check')}</button></div>`) : ''}
      ${g.exception ? note('warn', 'warning', L('Sent under an exception'), L('{who} approved an exception: {r}', {who: pname(g.exception.by), r: g.exception.reason})) : ''}
      ${!g.ok && !g.exception && rev && !sent && ['awaiting', 'signed'].includes(x.stage) ? (f === 'g-exc' ? `<div class="quiet fm-box">${field('fm-exc-auth', L('Approving authority'), `<select class="input" id="fm-exc-auth">${pOpts(['daniel', 'fadhil'], 'daniel')}</select>`, L('Proposed: the FnL Director or the President.'))}${field('fm-exc-why', L('Reason and scope'), txa('fm-exc-why', '', 'data-autofocus'), L('Shown on the gate and to Finance.'), true)}<div class="acts"><button class="btn btn-danger" data-act="fnl-g-exception" data-id="${x.id}">${L('Record exception')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>` : `<div class="acts"><button class="btn btn-ghost" data-act="fm-form" data-f="g-exc">${L('Record an approved exception')}</button></div>`) : ''}
      ${(g.ok || g.exception) && !sent && (rev || legal) && inv ? (f === 'g-send' ? `<div class="quiet fm-box"><div class="fm-2">${field('fm-gs-to', L('Named receiver in Finance'), `<select class="input" id="fm-gs-to">${pOpts(db.fnl.grants.invoice, db.fnl.grants.invoice[0])}</select>`)}${field('fm-gs-need', L('Needed by'), `<input type="date" class="input" id="fm-gs-need" value="${addDays(today(), 3)}">`, L('Requested, not agreed, until Finance accepts.'))}</div>
          <div class="acts"><button class="btn btn-pri" data-act="fnl-g-send" data-id="${x.id}">${L('Send to Finance')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div><p class="t-small t-mute">${L('Finance gets the agreement, the BAST and this gate decision. No invoice or payment is created.')}</p></div>` : `<div class="acts"><button class="btn btn-pri" data-act="fm-form" data-f="g-send">${L('Send ready-for-invoice to Finance')}</button></div>`) : ''}
      ${sent && inv ? handoffCard(inv) : ''}`;
  }
  const linked = x.type === 'PKS' ? db.fnl.legal.filter(y => y.pks === x.id).map(y => `<a class="ctx" href="#/fnl-requests/${y.id}">${icon('file')}${esc(y.title)}</a>`).concat(db.fnl.incoming.filter(i => i.pks === x.id && fnlFull(m)).map(i => `<a class="ctx" href="#/fnl-requests/${i.id}">${icon('wallet')}${esc(i.title)}</a>`)) : [];
  const privSec = `${sec(L('Reviewer notes'), lPriv() ? x.priv.length : null)}${lPriv() ? `${x.priv.map(n => `<div class="quiet fm-box"><p class="t-small t-mute">${byAt(n.by, n.at)}</p><p>${nl(n.text)}</p></div>`).join('') || `<p class="t-small t-mute">${L('No notes.')}</p>`}
      ${f === 'l-note' ? `${field('fm-note', L('Note'), txa('fm-note', '', 'data-autofocus'), L('Only FnL Legal can read it. Never shown to the requester, in search or in exports.'))}<div class="acts"><button class="btn btn-pri" data-act="fnl-l-note" data-id="${x.id}">${L('Save note')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>` : `<div class="acts"><button class="btn btn-ghost" data-act="fm-form" data-f="l-note">${L('Add note')}</button></div>`}` : locked(L('Restricted to FnL Legal'))}`;
  const cancelable = !closed && !['signed', 'awaiting'].includes(x.stage) && (req || legal);
  const cancelSec = x.cancel ? note('info', 'close', L('Canceled'), L('{who}: {r}', {who: pname(x.cancel.by), r: x.cancel.reason})) : x.stage === 'rejected' && x.rejectReason ? note('error', 'close', L('Rejected'), esc(x.rejectReason)) : '';
  const cancelForm = cancelable ? (f === 'l-cancel' ? `${field('fm-cx-why', L('Reason for canceling'), txa('fm-cx-why', '', 'data-autofocus'), '', true)}<div class="acts"><button class="btn btn-danger" data-act="fnl-l-cancel" data-id="${x.id}">${L('Cancel request')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Keep it')}</button></div>` : `<div class="acts fm-foot"><button class="btn btn-ghost" data-act="fm-form" data-f="l-cancel">${L('Cancel request')}</button></div>`) : '';
  const submitDraft = x.stage === 'draft' && req ? `<div class="acts"><button class="btn btn-pri" data-act="fnl-l-submit" data-id="${x.id}">${L('Submit request')}</button></div>` : '';
  const hist = `${sec(L('History'), x.history.length)}<div class="fm-hist">${x.history.slice().reverse().map(h => `<div class="fm-hist-r">${av(h.by, 'av-xs')}<span><b>${esc(first(h.by))}</b> ${esc(L(h.what, h.v))}</span><time>${esc(fmtDT(h.at))}</time></div>`).join('')}</div>`;
  return {crumb: cr, content: `<div class="page fm-page">${head}${stp}${nextBox}${cancelSec}${urg}${info}${submitDraft}${linked.length ? `<div class="fm-links fm-linked">${linked.join('')}</div>` : ''}${triage}${infoSec}${verSec}${numSec}${sigSec}${gateSec}${privSec}${hist}${cancelForm}</div>`};
}
// The shared handoff contract (blueprint §12): source and version, sender, named receiver, requested vs agreed date, status.
function handoffCard(inv) {
  const h = inv.handoff; if (!h) return '';
  const st = inv.state === 'returned' ? 'returned' : ['accepted', 'invoiced', 'partial', 'received'].includes(inv.state) ? (['partial', 'received'].includes(inv.state) ? 'fulfilled' : 'accepted') : 'requested';
  const idx = {requested: 1, accepted: 2, returned: 1, fulfilled: 3}[st];
  return `<div class="sheet handoff fm-handoff"><div class="fm-between"><b>${L('Ready for invoice: {t}', {t: inv.title})}</b>${chip({requested: ['Requested', 'upload', 'warn'], accepted: ['Accepted', 'check', 'green'], returned: ['Returned', 'undo', 'warn'], fulfilled: ['Fulfilled', 'check', 'green']}[st])}</div>
    <div class="ends"><div class="end"><small>${L('From FnL Legal')}</small>${who(h.from)}<small>${L('BAST v{v} and PKS v{p}', {v: h.version, p: h.pksVersion})}</small></div>${icon('right')}<div class="end"><small>${L('To FnL Finance')}</small>${who(h.to)}<small>${h.acceptedAt ? L('Accepted {d}', {d: fmtD(h.acceptedAt.slice(0, 10))}) : h.returnNote ? L('Returned') : L('Not answered yet')}</small></div></div>
    ${meta([[L('Requested by'), `<span class="t-num">${esc(fmtD(h.neededBy))}</span>`], [L('Agreed date'), h.agreedDate ? `<span class="t-num">${esc(fmtD(h.agreedDate))}</span>` : `<span class="t-mute">${L('Not agreed yet')}</span>`], h.returnNote ? [L('Returned because'), nl(h.returnNote)] : null, h.exception ? [L('Exception'), esc(h.exception)] : null])}
    <div class="fm-steps" data-now="${esc(L({requested: 'Requested', accepted: 'Accepted', returned: 'Returned', fulfilled: 'Fulfilled'}[st]))}"><span class="fm-sd">${L('Draft')}</span><span class="${idx > 1 ? 'fm-sd' : 'fm-sn'}">${L('Requested')}</span><span class="${idx > 2 ? 'fm-sd' : idx === 2 ? 'fm-sn' : ''}">${L('Accepted')}</span><span class="${idx === 3 ? 'fm-sn' : ''}">${L('Fulfilled')}</span></div>
    ${fnlFull(me()) ? `<a class="btn btn-sm" href="#/fnl-requests/${inv.id}">${L('Open the incoming term')}</a>` : ''}</div>`;
}

// ---------- one finance request (flow-finance-submit, -review, -payment) ----------
function financePage(x) {
  const m = me(), cr = crumb(FNL, [['fnl-requests', L('Requests')], ['', x.purpose]]);
  if (!canSeeF(x)) return {crumb: crumb(FNL, [['fnl-requests', L('Requests')]]), content: denied()};
  const f = ui.form || '', req = x.requester === m.id, al = alOf(x.alloc), st = al ? alStats(al) : null, priv = fPriv(x), pays = paysOf(x), paid = netPaid(x);
  const rev = G('finReview') && !req, open = ['submitted', 'review'].includes(x.state), canPay = G('pay') && ['approved', 'partial'].includes(x.state);
  const next = {draft: [x.requester, L('Submit when the amount, budget line and evidence are ready.')], submitted: [null, L('An independent approver in Finance reviews it.')], review: [(x.reviewing || {}).by, L('{who} is reviewing it.', {who: first((x.reviewing || {}).by)})],
    returned: [x.requester, L('Add what Finance asked for and submit again. A changed amount needs a new review.')], approved: [db.fnl.grants.pay[0], L('Approved, not paid. Finance records the payment after it is made outside the app.')], partial: [db.fnl.grants.pay[0], L('Partly paid. {o} is still owed.', {o: idrT(owed(x))})],
    paid: [db.fnl.grants.period[0], L('Paid in full. The period review checks it against the evidence.')], reconciled: [null, L('Reconciled in a period review.')], rejected: [null, L('Rejected. The history stays.')], cancelled: [null, L('Canceled. The history stays.')]}[x.state];
  const head = `<div class="ph"><div><h1 class="t-title">${esc(x.purpose)}</h1><p class="sub">${esc(alName(al))} · ${L('Version {v}', {v: x.version})}</p></div><div class="ph-r">${chip(FST[x.state], 'pill-o')}</div></div>`;
  const ledger = `<div class="ledger fm-ledger4"><div><span>${L('Requested')}</span><b>${idr(x.requested)}</b></div><div><span>${L('Approved')}</span><b>${x.approved != null && COMMIT.includes(x.state) ? idr(x.approved) : `<span class="t-mute">${L('Not approved')}</span>`}</b></div><div><span>${L('Paid (recorded)')}</span><b>${idr(paid)}</b></div><div><span>${L('Outstanding')}</span><b>${commit(x) ? idr(owed(x)) : '<span class="t-mute">–</span>'}</b></div></div>`;
  const dup = x.dup && frOf(x.dup.of);
  const dupBox = dup && x.dup.state === 'flagged' ? note('warn', 'warning', L('Possible duplicate'), L('Same amount and reference as {r}. Nothing is deleted; a finance reviewer decides.', {r: dup.purpose}), `<a class="btn btn-sm" href="#/fnl-requests/${dup.id}">${L('Compare')}</a>${G('finReview') ? `<button class="btn btn-sm" data-act="fnl-f-dup" data-id="${x.id}" data-o="cleared">${L('Not a duplicate')}</button><button class="btn btn-sm btn-danger" data-act="fnl-f-dup" data-id="${x.id}" data-o="confirmed">${L('Same claim: cancel this one')}</button>` : ''}`)
    : dup ? `<p class="t-small t-mute">${x.dup.state === 'cleared' ? L('Checked: not a duplicate of {r} ({who}).', {r: dup.purpose, who: pname(x.dup.by)}) : L('Canceled as a duplicate of {r}.', {r: dup.purpose})}</p>` : '';
  const info = meta([[L('Created by'), byAt(x.createdBy, x.createdAt)], [L('Requester'), who(x.requester)], [L('Unit'), esc(unitName(x.unit))], x.project ? [L('Project'), projOf(x.project) ? `<a href="#/projects/${x.project}">${esc(projOf(x.project).name)}</a>` : `<span class="t-mute">${L('Removed project')}</span>`] : null,
    [L('Budget line'), al ? `<button class="fm-lnk" data-act="fm-insp" data-type="fm-alloc" data-id="${al.id}">${esc(alName(al))}</button>` : `<span class="tag tag-unknown">${L('No allocation')}</span>`], [L('Category'), esc(L(x.category))], [L('Needed by'), neededTag(x.neededBy)],
    [L('Payee'), priv ? esc(x.payee || L('Not given')) : locked(L('Restricted'))], [L('Method'), priv ? esc(L(x.method)) : locked(L('Restricted'))], [L('Reference'), priv ? esc(x.ref || L('Not given')) : locked(L('Restricted'))],
    [L('Evidence'), priv ? (x.evidence.length ? `<span class="fm-links">${x.evidence.map(e => linkOut(e.label, e.url)).join('')}</span>` : `<span class="tag tag-warn">${L('No evidence linked')}</span>`) : locked(L('Restricted'))],
    x.review ? [L(x.state === 'rejected' ? 'Rejected by' : 'Approved by'), `${byAt(x.review.by, x.review.at)}${x.review.note ? ` <span class="t-small">${esc(x.review.note)}</span>` : ''}`] : null]);
  const alBox = al && st && (open || x.state === 'approved') ? `<div class="quiet fm-box fm-albox"><b>${L('Budget line')}: ${esc(alName(al))}</b><div class="ledger fm-ledger4"><div><span>${L('Allocated')}</span><b>${al.state === 'approved' ? idr(al.amount) : `<span class="t-mute">${L('Not approved')}</span>`}</b></div><div><span>${L('Committed')}</span><b>${idr(st.committed)}</b></div><div><span>${L('Remaining')}</span><b>${st.remaining == null ? '–' : idr(st.remaining)}</b></div><div><span>${L('Remaining if approved')}</span><b>${open && st.remaining != null ? idr(st.remaining - x.requested) : '–'}</b></div></div></div>` : '';
  const reviewSec = open && G('finReview') && req ? note('info', 'lock', L('You requested this'), L('Someone else approves it. Self-approval is denied (proposed separation rule).'))
    : open && rev ? `${sec(L('Review'), null)}${x.state === 'submitted' ? `<div class="acts"><button class="btn" data-act="fnl-f-start" data-id="${x.id}">${L('Start review')}</button></div>` : ''}
      ${f === 'f-approve' ? `<div class="quiet fm-box"><div class="fm-2">${field('fm-ap-amt', L('Approved amount (Rp)'), inp('fm-ap-amt', fmtN(x.requested), 'inputmode="numeric" data-autofocus'), L('Can be lower than requested. A higher amount needs a new version from the requester.'), true)}${field('fm-ap-note', L('Note to the requester'), inp('fm-ap-note'))}</div>
        <div class="acts"><button class="btn btn-pri" data-act="fnl-f-approve" data-id="${x.id}" data-v="${x.version}">${L('Approve version {v}', {v: x.version})}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div><p class="t-small t-mute">${L('Approval records a commitment. It is not a payment and moves no money.')}</p></div>`
      : f === 'f-return' || f === 'f-reject' ? `<div class="quiet fm-box">${field('fm-rt-why', f === 'f-reject' ? L('Reason for rejecting') : L('What is missing'), txa('fm-rt-why', '', 'data-autofocus'), '', true)}<div class="acts"><button class="btn ${f === 'f-reject' ? 'btn-danger' : 'btn-pri'}" data-act="${f === 'f-reject' ? 'fnl-f-reject' : 'fnl-f-return'}" data-id="${x.id}">${f === 'f-reject' ? L('Reject request') : L('Return to requester')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>`
      : `<div class="acts"><button class="btn btn-pri" data-act="fm-form" data-f="f-approve">${icon('check')}${L('Approve')}</button><button class="btn" data-act="fm-form" data-f="f-return">${L('Return for information')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="f-reject">${L('Reject')}</button></div>`}` : '';
  const editSec = req && ['draft', 'returned'].includes(x.state) ? `${sec(x.state === 'draft' ? L('Your draft') : L('Answer and submit again'), null)}${x.state === 'returned' ? note('warn', 'undo', L('Returned for information'), esc(x.returnNote)) : ''}
    <div class="fm-form"><div class="fm-2">${field('fm-ed-amt', L('Amount (Rp)'), inp('fm-ed-amt', fmtN(x.requested), 'inputmode="numeric"'), L('Whole rupiah only.'), true)}${field('fm-ed-ref', L('Receipt or quotation number'), inp('fm-ed-ref', x.ref))}</div>
    ${field('fm-ed-ev', L('Evidence link'), inp('fm-ed-ev', (x.evidence[0] || {}).url || '', 'placeholder="https://"'))}${field('fm-ed-note', L('Note for Finance'), txa('fm-ed-note', ''))}</div>
    <div class="acts"><button class="btn btn-pri" data-act="fnl-f-resubmit" data-id="${x.id}">${x.state === 'draft' ? L('Submit request') : L('Submit version {v}', {v: x.version + 1})}</button></div>` : '';
  const payRows = pays.map(p => `<div class="row fm-pay"><span class="t-num fm-pdate">${esc(dShort(p.date))}</span><div class="t"><b>${p.kind === 'correction' ? L('Correction to {r}', {r: p.of}) : L('Payment {id}', {id: p.id})}</b><small>${priv ? esc(p.ref) : ''}${p.note ? ` · ${esc(p.note)}` : ''} · ${L('recorded by {who}', {who: pname(p.by)})}, ${esc(fmtDT(p.at))}</small></div>
    ${priv ? (p.evidence ? linkOut(L('Evidence'), p.evidence) : `<span class="tag tag-warn">${L('Evidence missing')}</span>`) : ''}${idr(p.amount)}</div>`).join('');
  const paySec = COMMIT.includes(x.state) ? `${sec(L('Payments'), pays.length)}${pays.length ? `<div class="rows">${payRows}</div>` : `<p class="t-small t-mute">${L('No payment recorded. Approved is not paid.')}</p>`}
    ${canPay ? (f === 'f-pay' ? `<div class="quiet fm-box"><div class="fm-2">${field('fm-py-amt', L('Amount paid (Rp)'), inp('fm-py-amt', fmtN(owed(x)), 'inputmode="numeric" data-autofocus'), L('At most {o}, the amount still owed.', {o: idrT(owed(x))}), true)}${field('fm-py-date', L('Paid on'), `<input type="date" class="input" id="fm-py-date" value="${today()}">`, '', true)}</div>
        <div class="fm-2">${field('fm-py-ref', L('Transfer or receipt reference'), inp('fm-py-ref'), L('The same reference twice is refused, so a retry never pays twice.'), true)}${field('fm-py-ev', L('Evidence link'), inp('fm-py-ev', '', 'placeholder="https://"'), L('Missing evidence stays flagged until it is added.'))}</div>${field('fm-py-note', L('Note'), inp('fm-py-note'))}
        <div class="acts"><button class="btn btn-pri" data-act="fnl-f-pay" data-id="${x.id}">${L('Record payment')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div><p class="t-small t-mute">${L('Record a payment only after it was made outside the app.')}</p></div>`
      : `<div class="acts"><button class="btn btn-pri" data-act="fm-form" data-f="f-pay">${icon('wallet')}${L('Record payment')}</button></div>`) : ''}
    ${G('pay') && pays.some(p => p.kind === 'payment') && x.state !== 'reconciled' ? (f === 'f-corr' ? `<div class="quiet fm-box"><div class="fm-2">${field('fm-cr-of', L('Payment to correct'), `<select class="input" id="fm-cr-of">${opts(pays.filter(p => p.kind === 'payment').map(p => [p.id, `${p.id} · ${idrT(p.amount)} · ${dShort(p.date)}`]), '')}</select>`, '', true)}${field('fm-cr-amt', L('Difference (Rp)'), inp('fm-cr-amt', '', 'placeholder="+108.000 or −20.000" data-autofocus'), L('Plus or minus. The original payment stays as it was.'), true)}</div>
        ${field('fm-cr-why', L('Reason'), txa('fm-cr-why'), '', true)}<div class="acts"><button class="btn btn-pri" data-act="fnl-f-correct" data-id="${x.id}">${L('Record correction')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>`
      : `<div class="acts"><button class="btn btn-ghost" data-act="fm-form" data-f="f-corr">${L('Record a correction')}</button></div>`) : ''}` : '';
  const cancelSec = req && ['draft', 'submitted', 'returned'].includes(x.state) ? (f === 'f-cancel' ? `${field('fm-fx-why', L('Reason for canceling'), txa('fm-fx-why', '', 'data-autofocus'), '', true)}<div class="acts"><button class="btn btn-danger" data-act="fnl-f-cancel" data-id="${x.id}">${L('Cancel request')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Keep it')}</button></div>` : `<div class="acts fm-foot"><button class="btn btn-ghost" data-act="fm-form" data-f="f-cancel">${L('Cancel request')}</button></div>`) : '';
  const reason = ['rejected', 'cancelled'].includes(x.state) && x.reason ? note(x.state === 'rejected' ? 'error' : 'info', 'close', L(FST[x.state][0]), esc(x.reason)) : '';
  const hist = `${sec(L('History'), x.history.length)}<div class="fm-hist">${x.history.slice().reverse().map(h => `<div class="fm-hist-r">${av(h.by, 'av-xs')}<span><b>${esc(first(h.by))}</b> ${esc(L(h.what, h.v))}</span><time>${esc(fmtDT(h.at))}</time></div>`).join('')}</div>`;
  const stp = FSTEP_I[x.state] != null ? steps(FSTEPS, Math.min(FSTEP_I[x.state], 4) + (x.state === 'reconciled' ? 1 : 0)) : '';
  return {crumb: cr, content: `<div class="page fm-page">${head}${stp}<div class="fm-next">${icon('flag', 'ic-sm')}<div><b>${L('Next')}</b><span>${next[0] ? `${who(next[0])} ` : ''}${esc(next[1])}</span></div></div>${reason}${dupBox}${ledger}${alBox}${info}${editSec}${reviewSec}${paySec}${hist}${cancelSec}</div>`};
}

// ---------- incoming client term (flow-finance-income-open, -close; P1, optional until adopted) ----------
function incomingPage(x) {
  const m = me(), cr = crumb(FNL, [['fnl-requests', L('Requests')], ['', x.title]]);
  if (!fnlFull(m)) return {crumb: crumb(FNL, [['fnl-requests', L('Requests')]]), content: denied()};
  const f = ui.form || '', bast = lrOf(x.gateFrom), g = bast ? gateOf(bast) : null, rec = x.receipts.reduce((s, p) => s + p.amount, 0), recv = G('invoice') || G('pay');
  const head = `<div class="ph"><div><h1 class="t-title">${esc(x.title)}</h1><p class="sub">${esc(x.client)}${projOf(x.project) ? ` · <a href="#/projects/${x.project}">${esc(projOf(x.project).name)}</a>` : ''}</p></div><div class="ph-r">${chip(IST[x.state], 'pill-o')}</div></div>`;
  const basis = note('info', 'info', L('Incoming money, separate basis'), L('Expected income is not budget and is never added to spending. It counts as received only when a receipt is recorded.'));
  const ledger = `<div class="ledger"><div><span>${L('Expected')}</span><b>${idr(x.expected)}</b></div><div><span>${L('Received (recorded)')}</span><b>${idr(rec)}</b></div><div><span>${L('Outstanding')}</span><b>${idr(x.expected - rec)}</b></div></div>`;
  const gateBox = g ? `${sec(L('Legal gate'), null, ` ${g.ok ? chip(['Ready for invoice', 'check', 'green'], '') : g.exception ? chip(['Exception recorded', 'warning', 'warn'], '') : chip(['Not ready for invoice', 'lock', 'mute'], '')}`)}<div class="fm-checks">${g.items.map(i => `<div class="fm-check-r">${chip(i.ok ? ['Done', 'check', 'green'] : ['Missing', 'circle', 'mute'], '')}<div><b>${i.label}</b><div class="t-small">${i.sub}</div></div></div>`).join('')}</div>
    <p class="t-small"><a href="#/fnl-requests/${bast.id}">${L('Open the BAST request')}</a></p>${x.state === 'gate' ? note('warn', 'lock', L('Finance cannot invoice yet'), L('Legal sends the gate when the PKS and the BAST are signed and delivery is checked. Nothing is invoiced automatically.')) : ''}` : '';
  const ho = x.handoff ? `${sec(L('Handoff from Legal'), null)}${handoffCard(x)}
    ${x.state === 'requested' && x.handoff.to === m.id ? (f === 'i-return' ? `${field('fm-ir-why', L('What is missing'), txa('fm-ir-why', '', 'data-autofocus'), L('Goes back to the Legal owner.'), true)}<div class="acts"><button class="btn btn-pri" data-act="fnl-i-return" data-id="${x.id}">${L('Return to Legal')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>`
      : `<div class="fm-2">${field('fm-ia-date', L('Agreed date'), `<input type="date" class="input" id="fm-ia-date" value="${esc(x.handoff.neededBy)}">`)}</div><div class="acts"><button class="btn btn-pri" data-act="fnl-i-accept" data-id="${x.id}">${L('Accept handoff')}</button><button class="btn" data-act="fm-form" data-f="i-return">${L('Return for information')}</button></div>`)
      : x.state === 'requested' ? `<p class="t-small t-mute">${L('Waiting for {who} to accept or return it. Silence never accepts.', {who: first(x.handoff.to)})}</p>` : ''}` : '';
  const invSec = ['accepted', 'invoiced', 'partial', 'received'].includes(x.state) ? `${sec(L('Invoice'), null)}${x.invoiceRef ? meta([[L('Reference'), `<span class="t-num">${esc(x.invoiceRef)}</span>`], [L('Link'), linkOut(L('Invoice'), x.invoiceUrl) || `<span class="t-mute">${L('None')}</span>`], [L('Issued on'), esc(fmtD(x.issuedOn))], [L('Due'), x.due ? `${esc(fmtD(x.due))}${x.due < today() && rec < x.expected ? ` <span class="tag tag-danger">${L('Overdue')}</span>` : ''}` : `<span class="t-mute">${L('Not set')}</span>`], [L('Collector'), who(x.collector)]])
    : recv ? (f === 'i-inv' ? `<div class="quiet fm-box"><div class="fm-2">${field('fm-iv-ref', L('Invoice reference'), inp('fm-iv-ref', '', 'data-autofocus'), '', true)}${field('fm-iv-url', L('Link'), inp('fm-iv-url', '', 'placeholder="https://"'))}</div><div class="fm-2">${field('fm-iv-on', L('Issued on'), `<input type="date" class="input" id="fm-iv-on" value="${today()}">`, '', true)}${field('fm-iv-due', L('Due'), `<input type="date" class="input" id="fm-iv-due" value="${addDays(today(), 14)}">`)}</div>
        <div class="acts"><button class="btn btn-pri" data-act="fnl-i-invoice" data-id="${x.id}">${L('Record invoice')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div><p class="t-small t-mute">${L('Issue the invoice outside the app first. This records that it was issued.')}</p></div>`
      : `<div class="acts"><button class="btn btn-pri" data-act="fm-form" data-f="i-inv">${icon('file')}${L('Record the invoice issued')}</button></div>`) : `<p class="t-small t-mute">${L('Not recorded yet.')}</p>`}` : '';
  const recSec = ['invoiced', 'partial', 'received'].includes(x.state) ? `${sec(L('Receipts'), x.receipts.length)}${x.receipts.length ? `<div class="rows">${x.receipts.map(p => `<div class="row"><span class="t-num fm-pdate">${esc(dShort(p.date))}</span><div class="t"><b>${esc(p.ref)}</b><small>${L('recorded by {who}', {who: pname(p.by)})}</small></div>${p.evidence ? linkOut(L('Evidence'), p.evidence) : `<span class="tag tag-warn">${L('Evidence missing')}</span>`}${idr(p.amount)}</div>`).join('')}</div>` : `<p class="t-small t-mute">${L('Nothing received yet. A due date passing never means received.')}</p>`}
    ${recv && rec < x.expected ? (f === 'i-rec' ? `<div class="quiet fm-box"><div class="fm-2">${field('fm-rc-amt', L('Amount received (Rp)'), inp('fm-rc-amt', fmtN(x.expected - rec), 'inputmode="numeric" data-autofocus'), L('At most {o}.', {o: idrT(x.expected - rec)}), true)}${field('fm-rc-date', L('Received on'), `<input type="date" class="input" id="fm-rc-date" value="${today()}">`, '', true)}</div><div class="fm-2">${field('fm-rc-ref', L('Reference'), inp('fm-rc-ref'), '', true)}${field('fm-rc-ev', L('Evidence link'), inp('fm-rc-ev', '', 'placeholder="https://"'))}</div>
        <div class="acts"><button class="btn btn-pri" data-act="fnl-i-receipt" data-id="${x.id}">${L('Record receipt')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>` : `<div class="acts"><button class="btn btn-pri" data-act="fm-form" data-f="i-rec">${L('Record a receipt')}</button></div>`) : ''}` : '';
  const hist = `${sec(L('History'), x.history.length)}<div class="fm-hist">${x.history.slice().reverse().map(h => `<div class="fm-hist-r">${av(h.by, 'av-xs')}<span><b>${esc(first(h.by))}</b> ${esc(L(h.what, h.v))}</span><time>${esc(fmtDT(h.at))}</time></div>`).join('')}</div>`;
  return {crumb: cr, content: `<div class="page fm-page">${head}${basis}${ledger}${meta([[L('Created by'), byAt(x.createdBy, x.createdAt)], [L('Collector'), who(x.collector)], x.opp ? [L('Opportunity'), `<a href="#/opportunities/${esc(x.opp)}">${L('EE client opportunity')}</a>`] : null, [L('Agreement'), lrOf(x.pks) ? `<a href="#/fnl-requests/${x.pks}">${esc(lrOf(x.pks).title)}</a>` : '–']])}${gateBox}${ho}${invSec}${recSec}${hist}</div>`};
}

// ---------- Budget & transactions (finance_budget, finance_comparisons, finance_amend) ----------
function budgetPage() {
  ensureFnl(); const m = me(); useWs(FNL); const cr = crumb(FNL, [['budget', L('Budget & transactions')]]);
  if (!fnlFull(m) && !isBoardP(m)) return {crumb: cr, content: denied()};
  const als = db.fnl.allocations.filter(a => a.term === TERM), ok = als.filter(a => a.state === 'approved');
  const tot = ok.reduce((s, a) => { const t = alStats(a); s.alloc += a.amount; s.c += t.committed; s.p += t.paid; return s; }, {alloc: 0, c: 0, p: 0});
  const pct = n => tot.alloc ? Math.max(0, Math.min(100, n / tot.alloc * 100)).toFixed(1) : 0;
  const summary = `<div class="sheet pad fm-sum"><div class="fm-between"><b>${L('Term {t}, approved allocations', {t: TERM})}</b>${idr(tot.alloc)}</div>
    <div class="ledger fm-ledger4"><div><span>${L('Paid (recorded)')}</span><b>${idr(tot.p)}</b></div><div><span>${L('Committed, not paid')}</span><b>${idr(tot.c - tot.p)}</b></div><div><span>${L('Approved commitments')}</span><b>${idr(tot.c)}</b></div><div><span>${L('Remaining')}</span><b>${idr(tot.alloc - tot.c)}</b></div></div>
    <div class="split" role="img" aria-label="${esc(L('Paid {p}, committed not paid {c}, of {a}', {p: idrT(tot.p), c: idrT(tot.c - tot.p), a: idrT(tot.alloc)}))}"><i class="paid" style="width:${pct(tot.p)}%"></i><i class="com" style="width:${pct(tot.c - tot.p)}%"></i></div>
    <p class="t-small t-mute fm-formula">${L('Committed = approved amounts of approved and paid requests. Paid = recorded payments and corrections. Remaining = allocation minus committed. Proposed basis; POL confirms.')}</p></div>`;
  if (isBoardP(m)) { // Board: approved totals by unit only (security_finance: broader summaries expose approved totals)
    const rows = DIVS.map(d => { const a = ok.filter(x => x.unit === d.id); const s = a.reduce((q, x) => { const t = alStats(x); q.a += x.amount; q.c += t.committed; q.p += t.paid; return q; }, {a: 0, c: 0, p: 0});
      return `<tr><td><b>${esc(d.name)}</b></td>${a.length ? `<td class="num">${idr(s.a)}</td><td class="num">${idr(s.c)}</td><td class="num">${idr(s.p)}</td>` : `<td colspan="3"><span class="tag tag-unknown">${L('No allocation recorded')}</span></td>`}</tr>`; }).join('');
    return {crumb: cr, content: `<div class="page wide fm-page"><div class="ph"><div><h1 class="t-title">${L('Budget & transactions')}</h1><p class="sub">${L('Board view: approved totals by division. Requests, payees and evidence stay with FnL.')}</p></div></div>${summary}
      <div class="fm-scroll"><table class="tbl fm-tbl"><thead><tr><th>${L('Division')}</th><th class="num">${L('Allocated')}</th><th class="num">${L('Committed')}</th><th class="num">${L('Paid')}</th></tr></thead><tbody>${rows}</tbody></table></div></div>`}; }
  const row = a => { const t = alStats(a), w = a.amount ? Math.min(100, t.paid / a.amount * 100) : 0, wc = a.amount ? Math.min(100 - w, (t.committed - t.paid) / a.amount * 100) : 0;
    return `<tr data-act="fm-insp" data-type="fm-alloc" data-id="${a.id}" tabindex="0" class="${ui.insp && ui.insp.id === a.id ? 'sel' : ''}"><td><b>${esc(unitName(a.unit))} · ${esc(L(a.category))}</b><small class="t-mute">${a.project && projOf(a.project) ? esc(projOf(a.project).name) : L('Whole unit')}</small></td>
      <td class="num">${idr(a.amount)}</td><td class="num">${a.state === 'approved' ? idr(t.committed) : '–'}</td><td class="num">${a.state === 'approved' ? idr(t.paid) : '–'}</td><td class="num">${a.state === 'approved' ? idr(t.outstanding) : '–'}</td>
      <td class="num">${a.state === 'approved' ? `${idr(t.remaining, t.remaining < 0 ? 'fm-neg' : '')}<div class="split fm-split"><i class="paid" style="width:${w}%"></i><i class="com" style="width:${wc}%"></i></div>` : '–'}</td><td>${chip(AST[a.state])}${t.remaining < 0 ? ` <span class="tag tag-danger">${L('Deficit')}</span>` : ''}</td></tr>`; };
  const missing = DIVS.filter(d => !ok.some(a => a.unit === d.id)).map(d => `<tr><td><b>${esc(d.short)}</b><small class="t-mute">${L('Whole unit')}</small></td><td colspan="5"><span class="tag tag-unknown">${L('No allocation recorded')}</span> <small class="t-mute">${L('Unknown, not zero. Requests for this unit cannot be approved against a budget line.')}</small></td><td></td></tr>`).join('');
  const txs = db.fnl.payments.slice().sort((a, b) => b.date.localeCompare(a.date) || b.at.localeCompare(a.at));
  const txRows = txs.map(p => { const r = frOf(p.req); return `<tr data-act="go" data-h="fnl-requests/${p.req}" tabindex="0" role="link"><td class="t-num">${esc(dShort(p.date))}</td><td><b>${esc(r ? r.purpose : p.req)}</b><small class="t-mute">${p.kind === 'correction' ? L('Correction to {r}', {r: p.of}) : p.id}</small></td><td>${esc(p.ref)}</td><td>${p.evidence ? linkOut(L('Evidence'), p.evidence) : `<span class="tag tag-warn">${L('Evidence missing')}</span>`}</td><td>${who(p.by)}</td><td class="num">${idr(p.amount)}</td></tr>`; }).join('');
  const inc = db.fnl.incoming, incE = inc.reduce((s, x) => s + x.expected, 0), incR = inc.reduce((s, x) => s + x.receipts.reduce((q, p) => q + p.amount, 0), 0);
  return {crumb: cr, content: `<div class="page wide fm-page"><div class="ph"><div><h1 class="t-title">${L('Budget & transactions')}</h1><p class="sub">${L('Approved allocations, commitments and recorded payments in whole rupiah. The app records money; it never moves it.')}</p></div>
    <div class="ph-r"><button class="btn" data-act="fnl-export-budget">${icon('download')}${L('Export CSV')}</button>${G('allocate') ? `<button class="btn btn-pri" data-act="fm-insp" data-type="fm-alloc-new" data-id="new">${icon('plus')}${L('Propose allocation')}</button>` : ''}</div></div>
    ${summary}${sec(L('Allocations'), als.length)}<div class="fm-scroll"><table class="tbl fm-tbl"><thead><tr><th>${L('Budget line')}</th><th class="num">${L('Allocated')}</th><th class="num">${L('Committed')}</th><th class="num">${L('Paid')}</th><th class="num">${L('Outstanding')}</th><th class="num">${L('Remaining')}</th><th>${L('State')}</th></tr></thead><tbody>${als.map(row).join('')}${missing}</tbody></table></div>
    ${sec(L('Recorded transactions'), txs.length)}<div class="fm-scroll"><table class="tbl fm-tbl"><thead><tr><th>${L('Date')}</th><th>${L('Request')}</th><th>${L('Reference')}</th><th>${L('Evidence')}</th><th>${L('Recorded by')}</th><th class="num">${L('Amount')}</th></tr></thead><tbody>${txRows}</tbody></table></div>
    <p class="t-small t-mute hint">${L('Totals: {n} rows, {s}. Each row links to its request; corrections point at the payment they change.', {n: txs.length, s: idrT(txs.reduce((s, p) => s + p.amount, 0))})}</p>
    ${sec(L('Incoming, separate basis'), inc.length)}<div class="ledger"><div><span>${L('Expected from clients')}</span><b>${idr(incE)}</b></div><div><span>${L('Received (recorded)')}</span><b>${idr(incR)}</b></div><div><span>${L('Outstanding')}</span><b>${idr(incE - incR)}</b></div></div>
    <p class="t-small t-mute hint">${L('Never added to the allocations or the spending above.')} <a href="#/fnl-requests">${L('Open incoming terms')}</a></p>
    ${grantsBox(db.fnl.grants, ['allocate', 'budget', 'finReview', 'pay'])}</div>`};
}
INSP['fm-alloc'] = x => { const a = alOf(x.id), m = me(); if (!a) return inspHead(L('Allocation'));
  const t = alStats(a), f = ui.form || '', canApp = a.state === 'proposed' && G('budget') && a.createdBy !== m.id;
  const amend = a.state === 'approved' && G('budget') ? (f === 'a-amend' ? (() => { const nv = parseIdr(ui.fmAmend != null ? ui.fmAmend : fmtN(a.amount)), def = !isNaN(nv) && nv < t.committed;
      return `${sec(L('Amend allocation'), null)}${field('fm-am-amt', L('New amount (Rp)'), inp('fm-am-amt', ui.fmAmend != null ? ui.fmAmend : fmtN(a.amount), 'inputmode="numeric" data-input="fm-amend" data-autofocus'), '', true)}
      <div class="ledger fm-ledger4"><div><span>${L('Now')}</span><b>${idr(a.amount)}</b></div><div><span>${L('New')}</span><b>${isNaN(nv) ? '–' : idr(nv)}</b></div><div><span>${L('Committed')}</span><b>${idr(t.committed)}</b></div><div><span>${L('Headroom after')}</span><b>${isNaN(nv) ? '–' : idr(nv - t.committed, nv < t.committed ? 'fm-neg' : '')}</b></div></div>
      ${def ? note('error', 'warning', L('Below what is already committed'), L('This creates a deficit of {d}. Paid records stay unchanged. Save only as a recorded exception.', {d: idrT(t.committed - nv)})) + `<label class="fm-check"><input type="checkbox" id="fm-am-exc"> ${L('Record as an exception')}</label>` : ''}
      ${field('fm-am-why', L('Reason'), txa('fm-am-why'), L('Kept in the allocation history.'), true)}<div class="acts"><button class="btn btn-pri" data-act="fnl-b-amend" data-id="${a.id}">${L('Save amendment')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>`; })()
    : `<div class="acts"><button class="btn" data-act="fm-form" data-f="a-amend">${L('Amend allocation')}</button></div>`) : '';
  return `${inspHead(L('Allocation'))}<h2 class="th2"><span>${esc(alName(a))}</span></h2><p>${chip(AST[a.state])}</p>
    ${meta([[L('Created by'), byAt(a.createdBy, a.createdAt)], [L('Term'), esc(a.term)], [L('Allocated'), idr(a.amount)], [L('Source'), esc(a.source || L('Not given'))], a.approvedBy ? [L('Approved by'), byAt(a.approvedBy, a.approvedAt)] : null, a.returnNote ? [L('Returned because'), nl(a.returnNote)] : null])}
    ${a.state === 'approved' ? `<div class="ledger fm-ledger4"><div><span>${L('Committed')}</span><b>${idr(t.committed)}</b></div><div><span>${L('Paid')}</span><b>${idr(t.paid)}</b></div><div><span>${L('Outstanding')}</span><b>${idr(t.outstanding)}</b></div><div><span>${L('Remaining')}</span><b>${idr(t.remaining)}</b></div></div>` : ''}
    ${canApp ? (f === 'a-return' ? `${field('fm-ar-why', L('Why return it?'), txa('fm-ar-why', '', 'data-autofocus'), '', true)}<div class="acts"><button class="btn btn-pri" data-act="fnl-b-return" data-id="${a.id}">${L('Return')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>` : `<div class="acts"><button class="btn btn-pri" data-act="fnl-b-approve" data-id="${a.id}">${L('Approve allocation')}</button><button class="btn" data-act="fm-form" data-f="a-return">${L('Return')}</button></div>`)
      : a.state === 'proposed' && G('budget') ? `<p class="t-small t-mute">${L('You proposed it, so another approver decides.')}</p>` : a.state === 'proposed' ? `<p class="t-small t-mute">${L('Waiting for the allocation approver. An unapproved line is never used as budget.')}</p>` : ''}
    ${amend}${sec(L('Requests on this line'), t.reqs.length)}${t.reqs.length ? `<div class="rows">${t.reqs.map(r => `<a class="row" href="#/fnl-requests/${r.id}"><div class="t"><b>${esc(r.purpose)}</b><small>${esc(first(r.requester))}</small></div>${idr(r.approved != null && COMMIT.includes(r.state) ? r.approved : r.requested)}${chip(FST[r.state], '')}</a>`).join('')}</div>` : `<p class="t-small t-mute">${L('No requests yet.')}</p>`}
    ${sec(L('History'), a.history.length)}<div class="fm-hist">${a.history.slice().reverse().map(h => `<div class="fm-hist-r">${av(h.by, 'av-xs')}<span>${idr(h.amount)} · ${esc(h.reason)}</span><time>${esc(fmtDT(h.at))}</time></div>`).join('')}</div>`;
};
INSP['fm-alloc-new'] = () => { if (!G('allocate')) return `${inspHead(L('Propose allocation'))}${emptyBox(L('This page is not available to you'), L('It may be outside your workspace or it was removed.'))}`;
  const projs = db.projects.filter(p => !['completed', 'cancelled', 'archived'].includes(p.stage));
  return `${inspHead(L('Propose allocation'))}<div class="fm-form">${field('fm-na-unit', L('Unit'), `<select class="input" id="fm-na-unit">${opts(DIVS.map(d => [d.id, d.name]), 'hr')}</select>`, '', true)}${field('fm-na-proj', L('Project'), `<select class="input" id="fm-na-proj">${opts(projs.map(p => [p.id, p.name]), '', L('Whole unit'))}</select>`)}
    ${field('fm-na-cat', L('Category'), `<select class="input" id="fm-na-cat">${opts(CATS.map(c => [c, L(c)]), 'Operations')}</select>`, '', true)}${field('fm-na-amt', L('Amount (Rp)'), inp('fm-na-amt', '', 'inputmode="numeric" data-autofocus'), L('Whole rupiah only.'), true)}${field('fm-na-src', L('Source'), inp('fm-na-src'), L('Where the figure comes from, for example the annual plan line.'), true)}</div>
    <div class="acts"><button class="btn btn-pri" data-act="fnl-b-new">${L('Propose')}</button></div><p class="t-small t-mute">${L('An approver other than you decides. Until then it is not budget.')}</p>`; };

// ---------- Documents & register (legal_numbering, legal_number_void, legal_export) ----------
function registerPage() {
  ensureFnl(); const m = me(); useWs(FNL); const cr = crumb(FNL, [['register', L('Documents & register')]]);
  if (!fnlFull(m)) return {crumb: cr, content: denied()};
  const f = ui.view.fnlrg || 'all', list = db.fnl.register.filter(g => f === 'all' || g.state === f).sort((a, b) => b.seq - a.seq), issued = db.fnl.register.filter(g => g.state === 'issued').length, voids = db.fnl.register.length - issued, next = Math.max(0, ...db.fnl.register.map(g => g.seq)) + 1;
  const row = g => { const x = lrOf(g.req); return `<tr data-act="go" data-h="fnl-requests/${g.req}" tabindex="0" role="link"><td><span class="reg-no ${g.state === 'void' ? 'void' : ''}">${esc(g.no)}</span></td><td><b>${esc(x ? x.title : L('Removed request'))}</b><small class="t-mute">${L(LTYPE[g.type][0])}</small></td><td>${esc(x ? x.counterpart || L('Internal') : '')}</td><td class="t-num">v${g.version}</td>
    <td>${x ? chip(LST[x.stage]) : ''}</td><td>${esc(dShort(g.issuedAt.slice(0, 10)))} ${who(g.issuedBy)}</td><td>${g.state === 'void' ? `${chip(['Void', 'close', 'mute'])}<small class="t-mute">${esc(g.voidReason)}${g.reissue ? ` → ${esc((rgOf(g.reissue) || {}).no || '')}` : ''}</small>` : `${chip(['Issued', 'check', 'green'])}${g.replaces ? `<small class="t-mute">${L('Replaces {no}', {no: (rgOf(g.replaces) || {}).no || ''})}</small>` : ''}`}</td></tr>`; };
  return {crumb: cr, content: `<div class="page wide fm-page"><div class="ph"><div><h1 class="t-title">${L('Documents & register')}</h1><p class="sub">${L('Every number issued, with its exact version and signature state. A void keeps its number and reason.')}</p></div><div class="ph-r"><button class="btn" data-act="fnl-export-register">${icon('download')}${L('Export CSV')}</button></div></div>
    ${note('warn', 'info', L('Number format not adopted'), L('{f} is proposed. Numbers here are provisional labels for the walkthrough. The real build issues each number on the server, one at a time, so two people can never get the same number.', {f: db.fnl.policy.format}))}
    <div class="fm-bar"><div class="seg fm-seg" role="radiogroup" aria-label="${esc(L('Show'))}">${[['all', 'All'], ['issued', 'Issued'], ['void', 'Void']].map(([k, t]) => `<button class="${f === k ? 'on' : ''}" data-act="view" data-scope="fnlrg" data-v="${k}" role="radio" aria-checked="${f === k}">${L(t)}</button>`).join('')}</div>
    <span class="t-small t-mute">${L('{i} issued, {v} void. Next number {n}. No number is reused.', {i: issued, v: voids, n: String(next).padStart(3, '0')})}</span></div>
    <div class="fm-scroll"><table class="tbl fm-tbl"><thead><tr><th>${L('Number')}</th><th>${L('Document')}</th><th>${L('Party')}</th><th>${L('Version')}</th><th>${L('Request state')}</th><th>${L('Issued')}</th><th>${L('State')}</th></tr></thead><tbody>${list.map(row).join('')}</tbody></table></div>
    ${grantsBox(db.fnl.grants, ['issue', 'sign', 'legalReview'])}</div>`};
}

// ---------- Period reviews (finance_period_snapshot, flow-finance-reconcile) ----------
const inPeriod = (p, d) => d >= p.from && d <= p.to;
const periodRows = p => db.fnl.payments.filter(x => inPeriod(p, x.date));
const periodTotals = p => { const reqIds = new Set([...periodRows(p).map(x => x.req), ...db.fnl.requests.filter(r => r.review && r.review.decision !== 'rejected' && COMMIT.includes(r.state) && inPeriod(p, r.review.at.slice(0, 10))).map(r => r.id)]);
  const rs = [...reqIds].map(frOf).filter(Boolean), committed = rs.reduce((s, r) => s + commit(r), 0), paid = rs.reduce((s, r) => s + paysOf(r).filter(x => x.date <= p.to).reduce((q, x) => q + x.amount, 0), 0);
  const alloc = db.fnl.allocations.filter(a => a.state === 'approved' && a.approvedAt && a.approvedAt.slice(0, 10) <= p.to).reduce((s, a) => s + a.amount, 0);
  return {alloc, committed, paid, outstanding: committed - paid, reqs: rs}; };
function periodsPage(r) {
  ensureFnl(); const m = me(); useWs(FNL); const cr = crumb(FNL, [['period-reviews', L('Period reviews')]]);
  if (!fnlFull(m) && !isBoardP(m)) return {crumb: cr, content: denied()};
  if (r.id) { const p = prOf(r.id); if (!p) return {crumb: cr, content: denied()}; return periodPage(p); }
  const row = p => { const s = p.snapshots[p.snapshots.length - 1]; return `<tr data-act="go" data-h="period-reviews/${p.id}" tabindex="0" role="link"><td><b>${esc(p.name)}</b><small class="t-mute">${esc(dShort(p.from))} – ${esc(dShort(p.to))}</small></td><td>${who(p.preparedBy)}</td><td>${who(p.reviewer)}</td>
    <td>${s ? `${L('Snapshot {v}', {v: s.v})} <small class="t-mute">${esc(fmtDT(s.at))}</small>` : `<span class="t-mute">${L('None yet')}</span>`}</td><td class="num">${p.unresolved.filter(u => u.state === 'open').length}</td><td>${chip(p.bank === 'done' ? ['Bank compared', 'check', 'green'] : ['Bank not compared', 'warning', 'warn'])}</td><td>${chip(PST[p.state])}</td></tr>`; };
  return {crumb: cr, content: `<div class="page wide fm-page"><div class="ph"><div><h1 class="t-title">${L('Period reviews')}</h1><p class="sub">${L('Each month: allocations, commitments, payments, what is still owed and missing evidence. Closed reviews keep their snapshot; a later correction makes a new one.')}</p></div></div>
    <div class="fm-scroll"><table class="tbl fm-tbl"><thead><tr><th>${L('Period')}</th><th>${L('Prepared by')}</th><th>${L('Reviewer')}</th><th>${L('Latest snapshot')}</th><th class="num">${L('Open actions')}</th><th>${L('Bank')}</th><th>${L('State')}</th></tr></thead><tbody>${db.fnl.periods.slice().reverse().map(row).join('')}</tbody></table></div>
    <p class="t-small t-mute hint">${L('The September close also runs as the project {p}.', {p: (projOf('p-close') || {}).name || ''})} <a href="#/projects/p-close">${L('Open project')}</a></p>${grantsBox(db.fnl.grants, ['periodPrep', 'period'])}</div>`};
}
function periodPage(p) {
  const m = me(), cr = crumb(FNL, [['period-reviews', L('Period reviews')], ['', p.name]]), f = ui.form || '', board = isBoardP(m), prep = G('periodPrep') || G('period'), revw = G('period') && p.preparedBy !== m.id;
  const t = periodTotals(p), rows = periodRows(p).sort((a, b) => a.date.localeCompare(b.date)), unchecked = rows.filter(x => (p.checks[x.id] || 'unchecked') === 'unchecked').length, disc = rows.filter(x => p.checks[x.id] === 'discrepancy').length;
  const live = `<div class="ledger fm-ledger4"><div><span>${L('Allocated by period end')}</span><b>${idr(t.alloc)}</b></div><div><span>${L('Approved commitments')}</span><b>${idr(t.committed)}</b></div><div><span>${L('Paid (recorded)')}</span><b>${idr(t.paid)}</b></div><div><span>${L('Outstanding')}</span><b>${idr(t.outstanding)}</b></div></div>`;
  const rowH = x => { const r = frOf(x.req), c = p.checks[x.id] || 'unchecked', d = (p.discrepancies || {})[x.id];
    return `<tr><td class="t-num">${esc(dShort(x.date))}</td><td><a href="#/fnl-requests/${x.req}"><b>${esc(r ? r.purpose : x.req)}</b></a><small class="t-mute">${x.kind === 'correction' ? L('Correction to {r}', {r: x.of}) : x.id}</small></td><td class="num">${idr(x.amount)}</td><td>${board ? '' : x.evidence ? linkOut(L('Evidence'), x.evidence) : `<span class="tag tag-warn">${L('Evidence missing')}</span>`}</td>
      <td>${chip(RCK[c])}${d ? `<small class="t-mute">${esc(d.action)}, ${esc(first(d.owner))}</small>` : ''}</td><td>${prep && p.state !== 'closed' && !board ? `<span class="fm-rowacts"><button class="btn btn-sm" data-act="fnl-p-match" data-id="${p.id}" data-x="${x.id}" ${x.evidence ? '' : 'disabled title="' + esc(L('Attach evidence first')) + '"'}>${L('Matches')}</button><button class="btn btn-sm btn-ghost" data-act="fm-form" data-f="p-d-${x.id}">${L('Discrepancy')}</button></span>` : ''}</td></tr>
      ${f === `p-d-${x.id}` ? `<tr><td colspan="6"><div class="quiet fm-box"><div class="fm-2">${field('fm-pd-act', L('Next action'), inp('fm-pd-act', '', 'data-autofocus'), '', true)}${field('fm-pd-own', L('Owner'), `<select class="input" id="fm-pd-own">${pOpts([...new Set([...db.fnl.grants.pay, ...db.fnl.grants.periodPrep])], 'citra')}</select>`)}</div><div class="acts"><button class="btn btn-pri" data-act="fnl-p-flag" data-id="${p.id}" data-x="${x.id}">${L('Record discrepancy')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div></td></tr>` : ''}`; };
  const owedRows = t.reqs.filter(r => owed(r) > 0);
  const snaps = p.snapshots.slice().reverse().map((s, i) => `<div class="ver ${i === 0 ? 'sel' : ''}"><span class="v">${L('S{v}', {v: s.v})}</span><div><b>${idr(s.totals.paid)} ${L('paid')} · ${idr(s.totals.outstanding)} ${L('outstanding')}</b><small>${esc(pname(s.by))}, ${esc(fmtDT(s.at))} · ${L('{n} rows', {n: s.ids.length})}</small>${s.note ? `<small>${esc(s.note)}</small>` : ''}</div>${i === 0 ? chip(['Current basis', 'check', 'green']) : chip(['Past basis, kept', 'archive', 'mute'])}</div>`).join('');
  const last = p.snapshots[p.snapshots.length - 1], drift = last && (last.totals.paid !== t.paid || last.totals.committed !== t.committed);
  const acts = !board && G('period') ? `<div class="acts">${p.state !== 'closed' ? `<button class="btn btn-pri" data-act="fnl-p-snap" data-id="${p.id}" ${unchecked ? 'disabled' : ''}>${L('Save snapshot')}</button>${last ? `<button class="btn" data-act="fnl-p-close" data-id="${p.id}" ${unchecked || drift ? 'disabled' : ''}>${L('Close period')}</button>` : ''}` : drift ? `<button class="btn btn-pri" data-act="fnl-p-snap" data-id="${p.id}">${L('Save a new snapshot after the correction')}</button>` : ''}</div>
    ${unchecked ? `<p class="t-small t-mute">${plural(unchecked, '{n} row is not checked yet. Every row needs a result before a snapshot.', '{n} rows are not checked yet. Every row needs a result before a snapshot.')}</p>` : ''}${!revw && G('period') ? `<p class="t-small t-mute">${L('You prepared this period; the reviewer should be someone else (proposed).')}</p>` : ''}` : '';
  return {crumb: cr, content: `<div class="page wide fm-page"><div class="ph"><div><h1 class="t-title">${esc(p.name)}</h1><p class="sub">${esc(fmtD(p.from))} – ${esc(fmtD(p.to))}</p></div><div class="ph-r">${chip(PST[p.state], 'pill-o')}${board ? '' : `<button class="btn" data-act="fnl-export-period" data-id="${p.id}">${icon('download')}${L('Export CSV')}</button>`}</div></div>
    ${meta([[L('Created by'), byAt(p.createdBy, p.createdAt)], [L('Prepared by'), who(p.preparedBy)], [L('Reviewer'), who(p.reviewer)], p.project ? [L('Project'), projOf(p.project) ? `<a href="#/projects/${p.project}">${esc(projOf(p.project).name)}</a>` : ''] : null])}
    ${p.bank !== 'done' ? note('warn', 'warning', L('Bank and cash reconciliation incomplete'), L('The rows below are compared with receipts only. This is not full accounting proof.'), !board && G('period') && p.state !== 'closed' ? `<button class="btn btn-sm" data-act="fnl-p-bank" data-id="${p.id}">${L('Bank statement compared')}</button>` : '') : note('done', 'check', L('Bank statement compared'), '')}
    ${sec(L('Totals from the rows, now'), null)}${live}${drift ? note('info', 'info', L('Totals changed since the last snapshot'), L('A correction or payment changed this period. The earlier snapshot stays as the past basis.')) : ''}
    ${board ? '' : `${sec(L('Payments and corrections in this period'), rows.length)}${rows.length ? `<div class="fm-scroll"><table class="tbl fm-tbl"><thead><tr><th>${L('Date')}</th><th>${L('Request')}</th><th class="num">${L('Amount')}</th><th>${L('Evidence')}</th><th>${L('Check')}</th><th></th></tr></thead><tbody>${rows.map(rowH).join('')}</tbody></table></div>` : `<p class="t-small t-mute">${L('No payments recorded in this period.')}</p>`}
    <p class="t-small t-mute">${L('Row total {s} matches paid {p}.', {s: idrT(rows.reduce((s, x) => s + x.amount, 0)), p: idrT(t.paid)})} ${disc ? plural(disc, '{n} discrepancy is open.', '{n} discrepancies are open.') : ''}</p>
    ${sec(L('Still owed at period end'), owedRows.length)}${owedRows.length ? `<div class="rows">${owedRows.map(r => `<a class="row" href="#/fnl-requests/${r.id}"><div class="t"><b>${esc(r.purpose)}</b><small>${L('Approved {a}, paid {p}', {a: idrT(r.approved), p: idrT(netPaid(r))})}</small></div>${idr(owed(r))}${chip(FST[r.state], '')}</a>`).join('')}</div>` : `<p class="t-small t-mute">${L('Nothing owed.')}</p>`}`}
    ${sec(L('Snapshots'), p.snapshots.length)}${p.snapshots.length ? `<div class="versions">${snaps}</div>` : `<p class="t-small t-mute">${L('No snapshot yet.')}</p>`}${acts}
    ${sec(L('Unresolved actions'), p.unresolved.filter(u => u.state === 'open').length)}${p.unresolved.length ? `<div class="rows">${p.unresolved.map(u => `<div class="row"><div class="t"><b>${esc(u.text)}</b><small>${L('Owner {who}, due {d}', {who: first(u.owner), d: u.due ? dShort(u.due) : L('Not set')})}</small></div>${chip(u.state === 'open' ? ['Open', 'circle', 'warn'] : ['Done', 'check', 'green'])}${u.state === 'open' && !board && (u.owner === m.id || G('period')) ? `<button class="btn btn-sm" data-act="fnl-p-done" data-id="${p.id}" data-x="${u.id}">${L('Mark done')}</button>` : ''}</div>`).join('')}</div>` : `<p class="t-small t-mute">${L('None.')}</p>`}</div>`};
}

// ---------- shared action helpers ----------
const hist = (x, what, v) => x.history.push({by: session.me, at: nowStamp(), what, v: v || null});
const lLink = x => tgt(x.id, x.title, `fnl-requests/${x.id}`);
const fLink = x => tgt(x.id, x.purpose, `fnl-requests/${x.id}`);
const done = (msg, undo) => { ui.form = null; save(); render(); toast(msg, undo); };
// Undo restores the store slice from just before the step and appends "Undid" to the record's own history and to Changes (D45).
const mkUndo = (key, find, msg, wsId, link) => { const snap = JSON.stringify(db[key]); return () => { const r = find(), h = r && r.history ? r.history.slice() : null; db[key] = JSON.parse(snap); const r2 = find();
  if (r2 && h) r2.history = h.concat([{by: session.me, at: nowStamp(), what: 'Undid: {m}', v: {m: msg}}]); logChange(wsId, 'undid a change on', link); rerender(); }; };
const okDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
const firstOther = list => (list || []).find(id => id !== session.me);

Object.assign(ACT, {
  'fm-form': el => { ui.form = el.dataset.f || null; render(); setTimeout(() => { const f = $('#scroller [data-autofocus], .insp [data-autofocus]'); if (f) f.focus(); }, 0); },
  'fm-insp': (el, id, e) => { if (e) e.preventDefault(); ui.insp = {type: el.dataset.type, id: el.dataset.id}; ui.form = null; ui.fmAmend = null; render(); },
  // ----- new requests (drafts are kept per person and form until submitted or cleared, work_forms) -----
  'fnl-draft-keep': el => { const d = draftOf(el.dataset.kind); d._at = nowStamp(); save(); render(); toast(L('Draft saved')); },
  'fnl-draft-clear': el => { const k = el.dataset.kind, prev = JSON.stringify(draftOf(k)); db.fnl.drafts[session.me][k] = {}; save(); render(); toast(L('Form cleared'), () => { db.fnl.drafts[session.me][k] = JSON.parse(prev); rerender(); }); },
  'fnl-submit-new': el => {
    const kind = el.dataset.kind, d = draftOf(kind), m = me();
    if (d._made && (lrOf(d._made) || frOf(d._made))) { const id = d._made; db.fnl.drafts[m.id][kind] = {}; save(); return go(`fnl-requests/${id}`); } // a retry returns the original record
    $$('.fm-form .field.invalid').forEach(x => x.classList.remove('invalid'));
    if (kind === 'legal') {
      const ty = $v('#fm-l-type') || 'PKS', title = $v('#fm-l-title'), purpose = $v('#fm-l-purpose'), cp = $v('#fm-l-cp'), rb = $v('#fm-l-rb'), sig = $v('#fm-l-sig'), src = $v('#fm-l-src'), agr = AGREEMENT.includes(ty);
      if (!title) return bad('#fm-l-title', L('Give the document a title.'));
      if (!purpose) return bad('#fm-l-purpose', L('Say what the document must achieve.'));
      if ((agr || ty === 'LTR') && !cp) return bad('#fm-l-cp', L('Name the counterpart for this type.'));
      if (!okDate(rb)) return bad('#fm-l-rb', L('Choose the date you need it by.'));
      if (agr && !sig) return bad('#fm-l-sig', L('List who signs. One per line: name, role, party.'));
      const sources = src ? src.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const [a, b] = l.split('|').map(s => (s || '').trim()); return b ? {label: a, url: b} : {label: a, url: safeUrl(a) ? a : ''}; }) : [];
      if (sources.some(s => s.url && !safeUrl(s.url))) return bad('#fm-l-src', L('Links must start with https://.'));
      if (failSave()) return toast(L('Could not submit. Your draft is kept here; try again.'));
      const x = {id: uid('lgl-'), type: ty, title, purpose, requester: m.id, unit: m.div, project: $v('#fm-l-proj') || null, counterpart: cp, requiredBy: rb, owner: null, reviewer: null, stage: 'submitted', confidential: !!($('#fm-l-conf') || {}).checked, sources, template: '', versions: [],
        signatories: sig.split('\n').map(l => l.trim()).filter(Boolean).map((l, i) => { const [n, r, p] = l.split(',').map(s => (s || '').trim()); return {id: `s${i + 1}`, party: p || L('Not given'), name: n, role: r || '', state: 'pending', evidence: '', date: null, by: null, at: null, basis: null, note: ''}; }),
        number: null, urgency: null, info: [], priv: [], history: [], createdBy: m.id, createdAt: nowStamp()};
      if (ty === 'BAST') x.gate = {delivery: null, exception: null, sent: null};
      const urg = $v('#fm-l-urg'); if (urg) x.urgency = {state: 'requested', reason: urg, by: m.id, at: nowStamp()};
      hist(x, 'Submitted'); if (urg) hist(x, 'Asked for an urgent exception');
      db.fnl.legal.push(x); d._made = x.id; db.fnl.drafts[m.id][kind] = {};
      logChange(FNL, 'submitted a legal request', lLink(x)); if (x.unit && x.unit !== FNL) logChange(x.unit, 'sent a legal request to FnL', lLink(x));
      db.fnl.grants.legal.forEach(p => upd(p, 'fnl-submitted', x.title, `fnl-requests/${x.id}`)); if (urg) upd(db.fnl.grants.legalReview[0], 'fnl-urgent', x.title, `fnl-requests/${x.id}`);
      save(); go(`fnl-requests/${x.id}`); toast(L('Request submitted to FnL Legal'));
    } else {
      const purpose = $v('#fm-f-purpose'), amt = parseIdr($v('#fm-f-amount')), alloc = $v('#fm-f-alloc'), ev = $v('#fm-f-ev'), ref = $v('#fm-f-ref');
      if (!purpose) return bad('#fm-f-purpose', L('Say what the money is for.'));
      if (isNaN(amt) || amt <= 0) return bad('#fm-f-amount', L('Enter a positive whole rupiah amount, for example 90.000.'));
      if (!alloc) return bad('#fm-f-alloc', L('Choose the budget line it comes from.'));
      if (ev && !safeUrl(ev)) return bad('#fm-f-ev', L('Links must start with https://.'));
      if (failSave()) return toast(L('Could not submit. Your draft is kept here; try again.'));
      const al = alOf(alloc), x = {id: uid('fr-'), requester: m.id, unit: m.div || (al || {}).unit, project: (al || {}).project || null, alloc, category: $v('#fm-f-cat') || 'Events', purpose, requested: amt, approved: null, state: 'submitted', payee: $v('#fm-f-payee'), method: 'Bank transfer', neededBy: $v('#fm-f-need') || null,
        evidence: ev ? [{label: L('Evidence'), url: ev}] : [], ref, version: 1, review: null, returnNote: '', reason: '', dup: null, reconciledIn: null, history: [], createdBy: m.id, createdAt: nowStamp(), submittedAt: nowStamp()};
      const dup = ref && db.fnl.requests.find(r => r.id !== x.id && !['cancelled', 'rejected'].includes(r.state) && r.requested === amt && (r.ref || '').toLowerCase() === ref.toLowerCase());
      if (dup) x.dup = {of: dup.id, state: 'flagged', by: null, at: null, note: ''};
      hist(x, 'Submitted'); db.fnl.requests.push(x); d._made = x.id; db.fnl.drafts[m.id][kind] = {};
      logChange(FNL, 'submitted a finance request', fLink(x)); db.fnl.grants.finReview.forEach(p => upd(p, 'fnl-f-review', x.purpose, `fnl-requests/${x.id}`));
      save(); go(`fnl-requests/${x.id}`); toast(dup ? L('Submitted. Finance will check a possible duplicate.') : L('Request submitted to Finance'));
    }
  },
  // ----- legal -----
  'fnl-l-triage': (el, id) => { const x = lrOf(id); if (!x || !G('legal') || x.stage !== 'submitted') return; const u = mkUndo('fnl', () => lrOf(id), L('Triage'), FNL, lLink(x));
    x.owner = $v('#fm-tr-owner') || session.me; x.reviewer = $v('#fm-tr-rev') || db.fnl.grants.legalReview[0]; x.stage = 'drafting'; hist(x, 'Triaged; {who} is drafting', {who: first(x.owner)});
    logChange(FNL, 'triaged', lLink(x), 'Submitted', 'Drafting'); upd(x.owner, 'fnl-assigned', x.title, `fnl-requests/${x.id}`); upd(x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`); done(L('Drafting started'), u); },
  'fnl-l-ask': (el, id) => { const x = lrOf(id), q = $v('#fm-ask-q'); if (!x || !G('legal')) return; if (!q) return bad('#fm-ask-q', L('Say exactly what is missing.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Question'), FNL, lLink(x)); x.info.push({q, by: session.me, at: nowStamp(), a: '', aAt: null}); x.prevStage = x.stage; x.stage = 'info'; hist(x, 'Asked for missing information');
    logChange(FNL, 'asked for information on', lLink(x)); upd(x.requester, 'fnl-info', x.title, `fnl-requests/${x.id}`); done(L('Question sent to {who}', {who: first(x.requester)}), u); },
  'fnl-l-answer': (el, id) => { const x = lrOf(id), i = +el.dataset.i, a = $v(`#fm-ans-${i}`); if (!x || !isReqL(x) || !x.info[i]) return; if (!a) return bad(`#fm-ans-${i}`, L('Write your answer.'));
    x.info[i].a = a; x.info[i].aAt = nowStamp(); x.stage = x.prevStage && x.prevStage !== 'info' ? x.prevStage : 'submitted'; hist(x, 'Answered the question from Legal');
    logChange(FNL, 'answered a question on', lLink(x)); upd(x.owner || x.info[i].by, 'fnl-answered', x.title, `fnl-requests/${x.id}`); done(L('Answer sent')); },
  'fnl-l-reject': (el, id) => { const x = lrOf(id), why = $v('#fm-rej-why'); if (!x || !G('legal')) return; if (!why) return bad('#fm-rej-why', L('Give a reason.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Rejected'), FNL, lLink(x)); x.stage = 'rejected'; x.rejectReason = why; hist(x, 'Rejected: {r}', {r: why}); logChange(FNL, 'rejected', lLink(x)); upd(x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`); done(L('Request rejected'), u); },
  'fnl-l-urgent-ask': (el, id) => { const x = lrOf(id), why = $v('#fm-urg-why'); if (!x || !isReqL(x)) return; if (!why) return bad('#fm-urg-why', L('Say why it is urgent.'));
    x.urgency = {state: 'requested', reason: why, by: session.me, at: nowStamp()}; hist(x, 'Asked for an urgent exception'); logChange(FNL, 'asked for an urgent exception on', lLink(x)); upd(db.fnl.grants.legalReview[0], 'fnl-urgent', x.title, `fnl-requests/${x.id}`); done(L('Exception requested')); },
  'fnl-l-urgent-decide': (el, id) => { const x = lrOf(id), o = el.dataset.o, n = $v('#fm-urg-note'); if (!x || !x.urgency || !G('legalReview') || isReqL(x)) return; if (o === 'declined' && !n) return bad('#fm-urg-note', L('Say what the requester should expect instead.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Urgent exception'), FNL, lLink(x)); Object.assign(x.urgency, {state: o, decidedBy: session.me, decidedAt: nowStamp(), note: n}); hist(x, o === 'approved' ? 'Urgent exception approved' : 'Urgent exception declined');
    logChange(FNL, o === 'approved' ? 'approved an urgent exception on' : 'declined an urgent exception on', lLink(x)); upd(x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`); done(o === 'approved' ? L('Exception approved. Review still applies.') : L('Exception declined'), u); },
  'fnl-l-version': (el, id) => { const x = lrOf(id), label = $v('#fm-v-label'), url = $v('#fm-v-url'); if (!x || !['drafting', 'revision'].includes(x.stage)) return;
    if (!label) return bad('#fm-v-label', L('Say what changed in this version.')); if (!safeUrl(url)) return bad('#fm-v-url', L('Paste the https link to this version.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Version'), FNL, lLink(x)), v = (latestV(x) ? latestV(x).v : 0) + 1; if (!x.versions.length && $v('#fm-v-tpl')) x.template = $v('#fm-v-tpl');
    x.versions.push({v, label, url, by: session.me, at: nowStamp(), decision: null}); x.stage = 'review'; if (!x.reviewer) x.reviewer = db.fnl.grants.legalReview[0]; hist(x, 'Version {v} sent for review', {v});
    logChange(FNL, 'sent a version for review', lLink(x), 'Drafting', 'In review'); upd(x.reviewer, 'fnl-review', `${x.title}, v${v}`, `fnl-requests/${x.id}`); done(L('Version {v} sent to {who}', {v, who: first(x.reviewer)}), u); },
  'fnl-l-decide': (el, id) => { const x = lrOf(id), o = el.dataset.o, v = +el.dataset.v, lv = x && latestV(x), why = $v('#fm-rv-why'); if (!x || !G('legalReview') || x.stage !== 'review') return;
    if (!lv || lv.v !== v) { toast(L('Version {v} was replaced. Nothing was recorded; review the current version.', {v})); return render(); } // stale-version guard (flow-legal-draft-review 8)
    if (lv.by === session.me) return toast(L('You wrote this version, so another reviewer decides.'));
    if (o !== 'approved' && !why) return bad('#fm-rv-why', L('Say what must change.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Review'), FNL, lLink(x)); lv.decision = {kind: o, by: session.me, at: nowStamp(), reason: why};
    x.stage = o === 'approved' ? 'approved' : o === 'revision' ? 'revision' : 'rejected'; if (o === 'rejected') x.rejectReason = why;
    hist(x, o === 'approved' ? 'Version {v} approved for signature' : o === 'revision' ? 'Revision requested on version {v}' : 'Rejected on version {v}', {v});
    logChange(FNL, o === 'approved' ? 'approved a version for signature' : o === 'revision' ? 'requested a revision on' : 'rejected', lLink(x), 'In review', LST[x.stage][0]);
    upd(x.owner, 'fnl-decided', `${x.title}, v${v}`, `fnl-requests/${x.id}`); upd(x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`);
    done(o === 'approved' ? L('Version {v} approved for signature', {v}) : o === 'revision' ? L('Revision requested') : L('Request rejected'), u); },
  'fnl-l-issue': (el, id) => { const x = lrOf(id); if (!x || !G('issue') || liveNo(x) || !['approved', 'awaiting', 'signed'].includes(x.stage)) return;
    const u = mkUndo('fnl', () => lrOf(id), L('Number'), FNL, lLink(x)), seq = Math.max(0, ...db.fnl.register.map(g => g.seq)) + 1, code = LTYPE[x.type][1], prev = x.number && rgOf(x.number);
    const g = {id: uid('rg-'), seq, no: `DWDG/FnL/${code}/${today().slice(0, 4)}/${String(seq).padStart(3, '0')}`, type: code, req: x.id, version: (latestV(x) || {v: 1}).v, issuedBy: session.me, issuedAt: nowStamp(), state: 'issued', voidReason: '', voidBy: null, voidAt: null, reissue: null, replaces: prev ? prev.id : null, provisional: true};
    if (prev) prev.reissue = g.id; db.fnl.register.push(g); x.number = g.id; hist(x, prev ? 'New number issued' : 'Number issued');
    logChange(FNL, 'issued a document number for', lLink(x), null, g.no); done(L('Number {no} issued', {no: g.no}), u); },
  'fnl-l-void': (el, id) => { const x = lrOf(id), why = $v('#fm-void-why'), g = x && liveNo(x); if (!g || !G('issue')) return; if (!why) return bad('#fm-void-why', L('Give the reason. It stays in the register.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Void'), FNL, lLink(x)); Object.assign(g, {state: 'void', voidReason: why, voidBy: session.me, voidAt: nowStamp()}); hist(x, 'Number voided: {r}', {r: why});
    logChange(FNL, 'voided a document number on', lLink(x), g.no, null); done(L('{no} voided. It stays in the register.', {no: g.no}), u); },
  'fnl-l-send-sign': (el, id) => { const x = lrOf(id); if (!x || x.stage !== 'approved' || !liveNo(x) || !(G('sign') || x.owner === session.me)) return;
    const u = mkUndo('fnl', () => lrOf(id), L('Sent for signature'), FNL, lLink(x)); x.stage = 'awaiting'; x.signatories.forEach(s => { if (s.state === 'pending') s.state = 'requested'; }); hist(x, 'Sent for signature');
    logChange(FNL, 'sent for signature', lLink(x), 'Approved for signature', 'Awaiting signatures'); upd(x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`); done(L('Marked as sent for signature'), u); },
  'fnl-l-sign': (el, id) => { const x = lrOf(id), s = x && x.signatories.find(y => y.id === el.dataset.s); if (!s || !G('sign') || x.stage !== 'awaiting') return;
    const basis = $v('#fm-sg-basis') || 'copy', url = $v('#fm-sg-url'), date = $v('#fm-sg-date'), n = $v('#fm-sg-note');
    if (basis === 'copy' && !safeUrl(url)) return bad('#fm-sg-url', L('Paste the https link to the signed copy.')); if (basis === 'attested' && !n) return bad('#fm-sg-note', L('Say who confirmed the signature and how.'));
    if (!okDate(date) || date > today()) return bad('#fm-sg-date', L('Use the actual signing date, not a future one.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Signature'), FNL, lLink(x)); Object.assign(s, {state: basis === 'copy' ? 'signed' : 'attested', evidence: basis === 'copy' ? url : '', date, by: session.me, at: nowStamp(), basis, note: n});
    hist(x, 'Signature recorded for {party}', {party: s.party}); logChange(FNL, 'recorded a signature on', lLink(x));
    if (allSigned(x)) { x.stage = 'signed'; hist(x, 'Every party has signed'); logChange(FNL, 'recorded every signature on', lLink(x), 'Awaiting signatures', 'Signed'); upd(x.requester, 'fnl-signed', x.title, `fnl-requests/${x.id}`); if (x.type === 'BAST') upd(x.reviewer, 'fnl-gate-check', x.title, `fnl-requests/${x.id}`); }
    done(allSigned(x) ? L('All signatures recorded. The request is signed.') : L('Signature recorded. {a} of {b}.', {a: x.signatories.filter(sigDone).length, b: x.signatories.length}), u); },
  'fnl-l-sign-decl': (el, id) => { const x = lrOf(id), s = x && x.signatories.find(y => y.id === el.dataset.s), n = $v('#fm-sg-note'); if (!s || !G('sign')) return; if (!n) return bad('#fm-sg-note', L('Say what the party said.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Signature'), FNL, lLink(x)); Object.assign(s, {state: 'declined', by: session.me, at: nowStamp(), note: n}); hist(x, '{party} declined to sign', {party: s.party}); logChange(FNL, 'recorded a declined signature on', lLink(x)); upd(x.owner, 'fnl-moved', x.title, `fnl-requests/${x.id}`); done(L('Recorded as declined. The request stays unsigned.'), u); },
  'fnl-l-register': (el, id) => { const x = lrOf(id); if (!x || x.stage !== 'signed' || !G('legal')) return; const u = mkUndo('fnl', () => lrOf(id), L('Registered'), FNL, lLink(x)); x.stage = 'registered'; hist(x, 'Registered'); logChange(FNL, 'registered and archived', lLink(x), 'Signed', 'Registered'); done(L('Registered and archived'), u); },
  'fnl-l-note': (el, id) => { const x = lrOf(id), t = $v('#fm-note'); if (!x || !lPriv()) return; if (!t) return bad('#fm-note', L('Write the note.')); x.priv.push({by: session.me, at: nowStamp(), text: t}); done(L('Note saved')); },
  'fnl-l-cancel': (el, id) => { const x = lrOf(id), why = $v('#fm-cx-why'); if (!x || !(isReqL(x) || G('legal'))) return; if (!why) return bad('#fm-cx-why', L('Give a reason.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Canceled'), FNL, lLink(x)); const prev = x.stage; x.stage = 'cancelled'; x.cancel = {reason: why, by: session.me, at: nowStamp()}; hist(x, 'Canceled: {r}', {r: why});
    logChange(FNL, 'canceled', lLink(x), LST[prev][0], 'Canceled'); upd(isReqL(x) ? x.owner : x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`); done(L('Request canceled'), u); },
  'fnl-g-delivery': (el, id) => { const x = lrOf(id), url = $v('#fm-del-url'); if (!x || !G('legalReview')) return; if (!safeUrl(url)) return bad('#fm-del-url', L('Paste the https link to the evidence.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Delivery check'), FNL, lLink(x)); x.gate.delivery = {url, by: session.me, at: nowStamp()}; hist(x, 'Delivery evidence checked'); logChange(FNL, 'checked the delivery evidence for', lLink(x)); done(L('Delivery evidence check recorded'), u); },
  'fnl-g-exception': (el, id) => { const x = lrOf(id), why = $v('#fm-exc-why'), auth = $v('#fm-exc-auth') || 'daniel'; if (!x || !G('legalReview')) return; if (!why) return bad('#fm-exc-why', L('Give the reason and scope.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Exception'), FNL, lLink(x)); x.gate.exception = {by: auth, recordedBy: session.me, at: nowStamp(), reason: why}; hist(x, 'Gate exception recorded, approved by {who}', {who: first(auth)});
    logChange(FNL, 'recorded a gate exception on', lLink(x)); if (auth !== session.me) upd(auth, 'fnl-exception', x.title, `fnl-requests/${x.id}`); done(L('Exception recorded. It shows on the gate and to Finance.'), u); },
  'fnl-g-send': (el, id) => { const x = lrOf(id), inv = x && invOf(x.invoice), g = x && gateOf(x); if (!x || !inv || !(G('legalReview') || G('legal')) || x.gate.sent || !(g.ok || g.exception)) return;
    const to = $v('#fm-gs-to') || db.fnl.grants.invoice[0], need = $v('#fm-gs-need'); if (!okDate(need)) return bad('#fm-gs-need', L('Choose the date Finance is asked to act by.'));
    const u = mkUndo('fnl', () => lrOf(id), L('Gate'), FNL, lLink(x)), pks = lrOf(x.pks), pv = pks ? (pks.versions.filter(v => v.decision && v.decision.kind === 'approved').pop() || {}).v : null;
    x.gate.sent = {by: session.me, at: nowStamp(), to}; hist(x, 'Ready-for-invoice sent to {who}', {who: first(to)});
    inv.handoff = {from: session.me, to, neededBy: need, requestedAt: nowStamp(), version: (latestV(x) || {}).v, pksVersion: pv, agreedDate: null, acceptedAt: null, returnNote: '', exception: g.exception ? g.exception.reason : ''}; inv.state = 'requested';
    inv.history.push({by: session.me, at: nowStamp(), what: 'Legal sent the gate; waiting for Finance to accept'});
    logChange(FNL, 'sent the ready-for-invoice gate to Finance for', lLink(x)); upd(to, 'fnl-gate', inv.title, `fnl-requests/${inv.id}`); done(L('Sent to {who}. No invoice or payment was created.', {who: first(to)}), u); },
  // ----- finance -----
  'fnl-f-start': (el, id) => { const x = frOf(id); if (!x || !G('finReview') || x.requester === session.me || x.state !== 'submitted') return; const u = mkUndo('fnl', () => frOf(id), L('Review'), FNL, fLink(x));
    x.state = 'review'; x.reviewing = {by: session.me, at: nowStamp()}; hist(x, 'Review started'); logChange(FNL, 'started reviewing', fLink(x), 'Submitted', 'Under review'); done(L('Review started'), u); },
  'fnl-f-approve': (el, id) => { const x = frOf(id), amt = parseIdr($v('#fm-ap-amt')); if (!x || !['submitted', 'review'].includes(x.state)) return;
    if (x.requester === session.me || !G('finReview')) return toast(L('You requested this, so someone else approves it.')); // access_review_self_policy: default deny
    if (+el.dataset.v !== x.version) { toast(L('The requester sent a new version. Review it again.')); return render(); }
    if (isNaN(amt) || amt <= 0) return bad('#fm-ap-amt', L('Enter a positive whole rupiah amount.')); if (amt > x.requested) return bad('#fm-ap-amt', L('Higher than requested. Ask the requester for a new version.'));
    const al = alOf(x.alloc); if (!al || al.state !== 'approved') return bad('#fm-ap-amt', L('This request has no approved budget line. Link one first.'));
    const rem = alStats(al).remaining; if (amt > rem) return bad('#fm-ap-amt', L('Above the remaining allocation of {r}. Amend the allocation first; going over is an exception POL has not defined.', {r: idrT(rem)}));
    const u = mkUndo('fnl', () => frOf(id), L('Approval'), FNL, fLink(x)), prev = x.state; x.approved = amt; x.state = 'approved'; x.review = {by: session.me, at: nowStamp(), amount: amt, version: x.version, note: $v('#fm-ap-note')};
    hist(x, amt === x.requested ? 'Approved {a}' : 'Approved {a} of {b}', {a: idrT(amt), b: idrT(x.requested)}); logChange(FNL, 'approved a finance request', fLink(x), FST[prev][0], 'Approved, not paid');
    upd(x.requester, 'fnl-f-approved', x.purpose, `fnl-requests/${x.id}`); const p = firstOther(db.fnl.grants.pay); if (p) upd(p, 'fnl-pay-ready', x.purpose, `fnl-requests/${x.id}`);
    done(L('Approved {a}. Not paid until a payment is recorded.', {a: idrT(amt)}), u); },
  'fnl-f-return': (el, id) => { const x = frOf(id), why = $v('#fm-rt-why'); if (!x || !G('finReview') || x.requester === session.me) return; if (!why) return bad('#fm-rt-why', L('Say what is missing.'));
    const u = mkUndo('fnl', () => frOf(id), L('Returned'), FNL, fLink(x)), prev = x.state; x.state = 'returned'; x.returnNote = why; hist(x, 'Returned for information'); logChange(FNL, 'returned a finance request', fLink(x), FST[prev][0], 'Returned for information');
    upd(x.requester, 'fnl-f-returned', x.purpose, `fnl-requests/${x.id}`); done(L('Returned to {who}', {who: first(x.requester)}), u); },
  'fnl-f-reject': (el, id) => { const x = frOf(id), why = $v('#fm-rt-why'); if (!x || !G('finReview') || x.requester === session.me) return; if (!why) return bad('#fm-rt-why', L('Give a reason.'));
    const u = mkUndo('fnl', () => frOf(id), L('Rejected'), FNL, fLink(x)), prev = x.state; x.state = 'rejected'; x.reason = why; x.review = {by: session.me, at: nowStamp(), amount: 0, version: x.version, decision: 'rejected'}; hist(x, 'Rejected');
    logChange(FNL, 'rejected a finance request', fLink(x), FST[prev][0], 'Rejected'); upd(x.requester, 'fnl-f-returned', x.purpose, `fnl-requests/${x.id}`); done(L('Request rejected'), u); },
  'fnl-f-resubmit': (el, id) => { const x = frOf(id), amt = parseIdr($v('#fm-ed-amt')), ev = $v('#fm-ed-ev'); if (!x || x.requester !== session.me || !['draft', 'returned'].includes(x.state)) return;
    if (isNaN(amt) || amt <= 0) return bad('#fm-ed-amt', L('Enter a positive whole rupiah amount, for example 90.000.')); if (ev && !safeUrl(ev)) return bad('#fm-ed-ev', L('Links must start with https://.'));
    if (failSave()) return toast(L('Could not submit. Your draft is kept here; try again.'));
    const u = mkUndo('fnl', () => frOf(id), L('Submitted'), FNL, fLink(x)), wasRet = x.state === 'returned'; if (wasRet && (amt !== x.requested || ev)) x.version++;
    x.requested = amt; x.ref = $v('#fm-ed-ref') || x.ref; if (ev) x.evidence = [{label: L('Evidence'), url: ev}]; x.state = 'submitted'; x.submittedAt = nowStamp(); const n = $v('#fm-ed-note');
    hist(x, wasRet ? 'Answered and submitted again{n}' : 'Submitted', {n: n ? `: ${n}` : ''}); logChange(FNL, wasRet ? 'submitted again' : 'submitted a finance request', fLink(x));
    db.fnl.grants.finReview.forEach(p => upd(p, 'fnl-f-review', x.purpose, `fnl-requests/${x.id}`)); done(L('Request submitted to Finance'), u); },
  'fnl-f-pay': (el, id) => { const x = frOf(id); if (!x || !G('pay') || !['approved', 'partial'].includes(x.state)) return;
    const amt = parseIdr($v('#fm-py-amt')), date = $v('#fm-py-date'), ref = $v('#fm-py-ref'), ev = $v('#fm-py-ev');
    if (isNaN(amt) || amt <= 0) return bad('#fm-py-amt', L('Enter a positive whole rupiah amount.')); if (amt > owed(x)) return bad('#fm-py-amt', L('More than the {o} still owed. A larger payment needs an amended approval.', {o: idrT(owed(x))}));
    if (!okDate(date) || date > today()) return bad('#fm-py-date', L('Use the date the payment was actually made.')); if (!ref) return bad('#fm-py-ref', L('Add the transfer or receipt reference.')); if (ev && !safeUrl(ev)) return bad('#fm-py-ev', L('Links must start with https://.'));
    const same = paysOf(x).find(p => p.kind === 'payment' && p.ref.toLowerCase() === ref.toLowerCase()); if (same) return toast(L('Already recorded as {id}. Nothing was added.', {id: same.id})); // retry-safe (reliability_retry)
    const u = mkUndo('fnl', () => frOf(id), L('Payment'), FNL, fLink(x)), prev = x.state, py = {id: uid('py-'), req: x.id, kind: 'payment', amount: amt, date, ref, evidence: ev, by: session.me, at: nowStamp(), note: $v('#fm-py-note')};
    db.fnl.payments.push(py); x.state = owed(x) === 0 ? 'paid' : 'partial'; hist(x, 'Payment recorded: {a}', {a: idrT(amt)}); logChange(FNL, 'recorded a payment on', fLink(x), FST[prev][0], FST[x.state][0]);
    upd(x.requester, 'fnl-paid', x.purpose, `fnl-requests/${x.id}`); done(x.state === 'paid' ? L('Payment recorded. Paid in full.') : L('Payment recorded. {o} still owed.', {o: idrT(owed(x))}), u); },
  'fnl-f-correct': (el, id) => { const x = frOf(id); if (!x || !G('pay')) return; const of = $v('#fm-cr-of'), raw = $v('#fm-cr-amt').replace('−', '-'), why = $v('#fm-cr-why');
    const sign = /^\s*-/.test(raw) ? -1 : 1, amt = parseIdr(raw.replace(/^\s*[+-]\s*/, ''));
    if (!of) return bad('#fm-cr-of', L('Choose the payment to correct.')); if (isNaN(amt) || amt === 0) return bad('#fm-cr-amt', L('Enter the difference in whole rupiah, with + or −.')); if (!why) return bad('#fm-cr-why', L('Give the reason.'));
    const net = netPaid(x) + sign * amt; if (net < 0 || net > x.approved) return bad('#fm-cr-amt', L('Paid would become {n}, outside 0 to the approved {a}.', {n: idrT(net), a: idrT(x.approved)}));
    const orig = db.fnl.payments.find(p => p.id === of), u = mkUndo('fnl', () => frOf(id), L('Correction'), FNL, fLink(x)), prev = x.state;
    db.fnl.payments.push({id: uid('py-'), req: x.id, kind: 'correction', of, amount: sign * amt, date: orig ? orig.date : today(), ref: orig ? orig.ref : '', evidence: orig ? orig.evidence : '', by: session.me, at: nowStamp(), note: why});
    x.state = owed(x) === 0 ? 'paid' : 'partial'; hist(x, 'Correction recorded against {p}', {p: of}); logChange(FNL, 'recorded a correction on', fLink(x), FST[prev][0], FST[x.state][0]); done(L('Correction recorded. The original payment is unchanged.'), u); },
  'fnl-f-dup': (el, id) => { const x = frOf(id), o = el.dataset.o; if (!x || !x.dup || !G('finReview')) return; const u = mkUndo('fnl', () => frOf(id), L('Duplicate check'), FNL, fLink(x));
    Object.assign(x.dup, {state: o, by: session.me, at: nowStamp()}); if (o === 'confirmed') { x.state = 'cancelled'; x.reason = L('Duplicate of {r}', {r: (frOf(x.dup.of) || {}).purpose || x.dup.of}); hist(x, 'Canceled as a duplicate'); } else hist(x, 'Checked: not a duplicate');
    logChange(FNL, o === 'confirmed' ? 'canceled a duplicate request' : 'cleared a duplicate flag on', fLink(x)); upd(x.requester, 'fnl-f-returned', x.purpose, `fnl-requests/${x.id}`); done(o === 'confirmed' ? L('Canceled as a duplicate. Both records stay.') : L('Duplicate flag cleared'), u); },
  'fnl-f-cancel': (el, id) => { const x = frOf(id), why = $v('#fm-fx-why'); if (!x || x.requester !== session.me) return; if (!why) return bad('#fm-fx-why', L('Give a reason.'));
    const u = mkUndo('fnl', () => frOf(id), L('Canceled'), FNL, fLink(x)), prev = x.state; x.state = 'cancelled'; x.reason = why; hist(x, 'Canceled: {r}', {r: why}); logChange(FNL, 'canceled a finance request', fLink(x), FST[prev][0], 'Canceled'); done(L('Request canceled'), u); },
  // ----- incoming term -----
  'fnl-i-accept': (el, id) => { const x = invOf(id); if (!x || !x.handoff || x.handoff.to !== session.me || x.state !== 'requested') return; const ag = $v('#fm-ia-date') || x.handoff.neededBy, u = mkUndo('fnl', () => invOf(id), L('Handoff'), FNL, tgt(x.id, x.title, `fnl-requests/${x.id}`));
    Object.assign(x.handoff, {acceptedAt: nowStamp(), agreedDate: ag}); x.state = 'accepted'; x.history.push({by: session.me, at: nowStamp(), what: 'Finance accepted the gate'}); logChange(FNL, 'accepted the ready-for-invoice gate for', tgt(x.id, x.title, `fnl-requests/${x.id}`));
    upd(x.handoff.from, 'fnl-gate-reply', x.title, `fnl-requests/${x.id}`); done(L('Accepted. Agreed date {d}.', {d: fmtD(ag)}), u); },
  'fnl-i-return': (el, id) => { const x = invOf(id), why = $v('#fm-ir-why'); if (!x || !x.handoff || x.handoff.to !== session.me) return; if (!why) return bad('#fm-ir-why', L('Say what is missing.'));
    const u = mkUndo('fnl', () => invOf(id), L('Handoff'), FNL, tgt(x.id, x.title, `fnl-requests/${x.id}`)); x.handoff.returnNote = why; x.state = 'returned'; const b = lrOf(x.gateFrom); if (b && b.gate) { b.gate.sent = null; b.history.push({by: session.me, at: nowStamp(), what: 'Finance returned the gate: {r}', v: {r: why}}); }
    x.history.push({by: session.me, at: nowStamp(), what: 'Returned to Legal'}); logChange(FNL, 'returned the ready-for-invoice gate for', tgt(x.id, x.title, `fnl-requests/${x.id}`)); upd(x.handoff.from, 'fnl-gate-reply', x.title, `fnl-requests/${x.gateFrom}`); done(L('Returned to Legal'), u); },
  'fnl-i-invoice': (el, id) => { const x = invOf(id); if (!x || !(G('invoice') || G('pay')) || x.state !== 'accepted') return; const ref = $v('#fm-iv-ref'), url = $v('#fm-iv-url'), on = $v('#fm-iv-on'), due = $v('#fm-iv-due');
    if (!ref) return bad('#fm-iv-ref', L('Add the invoice reference.')); if (url && !safeUrl(url)) return bad('#fm-iv-url', L('Links must start with https://.')); if (!okDate(on) || on > today()) return bad('#fm-iv-on', L('Use the date it was actually issued.'));
    const u = mkUndo('fnl', () => invOf(id), L('Invoice'), FNL, tgt(x.id, x.title, `fnl-requests/${x.id}`)); Object.assign(x, {invoiceRef: ref, invoiceUrl: url, issuedOn: on, due: okDate(due) ? due : null, state: 'invoiced'}); x.history.push({by: session.me, at: nowStamp(), what: 'Invoice issued outside the app was recorded'});
    logChange(FNL, 'recorded an invoice for', tgt(x.id, x.title, `fnl-requests/${x.id}`)); done(L('Invoice recorded'), u); },
  'fnl-i-receipt': (el, id) => { const x = invOf(id); if (!x || !(G('invoice') || G('pay')) || !['invoiced', 'partial'].includes(x.state)) return; const amt = parseIdr($v('#fm-rc-amt')), date = $v('#fm-rc-date'), ref = $v('#fm-rc-ref'), ev = $v('#fm-rc-ev'), rec = x.receipts.reduce((s, p) => s + p.amount, 0);
    if (isNaN(amt) || amt <= 0) return bad('#fm-rc-amt', L('Enter a positive whole rupiah amount.')); if (amt > x.expected - rec) return bad('#fm-rc-amt', L('More than the {o} still expected.', {o: idrT(x.expected - rec)}));
    if (!okDate(date) || date > today()) return bad('#fm-rc-date', L('Use the date the money actually arrived.')); if (!ref) return bad('#fm-rc-ref', L('Add the reference.')); if (ev && !safeUrl(ev)) return bad('#fm-rc-ev', L('Links must start with https://.'));
    if (x.receipts.some(p => p.ref.toLowerCase() === ref.toLowerCase())) return toast(L('That reference is already recorded. Nothing was added.'));
    const u = mkUndo('fnl', () => invOf(id), L('Receipt'), FNL, tgt(x.id, x.title, `fnl-requests/${x.id}`)); x.receipts.push({id: uid('rc-'), amount: amt, date, ref, evidence: ev, by: session.me, at: nowStamp()});
    x.state = rec + amt >= x.expected ? 'received' : 'partial'; x.history.push({by: session.me, at: nowStamp(), what: 'Receipt recorded: {a}', v: {a: idrT(amt)}}); logChange(FNL, 'recorded a receipt for', tgt(x.id, x.title, `fnl-requests/${x.id}`)); done(L('Receipt recorded'), u); },
  // ----- budget -----
  'fnl-b-new': () => { if (!G('allocate')) return; const amt = parseIdr($v('#fm-na-amt')), src = $v('#fm-na-src'); if (isNaN(amt) || amt <= 0) return bad('#fm-na-amt', L('Enter a positive whole rupiah amount.')); if (!src) return bad('#fm-na-src', L('Say where the figure comes from.'));
    const a = {id: uid('al-'), term: TERM, unit: $v('#fm-na-unit'), project: $v('#fm-na-proj') || null, category: $v('#fm-na-cat') || 'Operations', amount: amt, state: 'proposed', source: src, approvedBy: null, approvedAt: null, history: [{amount: amt, by: session.me, at: nowStamp(), reason: 'First allocation'}], createdBy: session.me, createdAt: nowStamp(), returnNote: ''};
    db.fnl.allocations.push(a); logChange(FNL, 'proposed an allocation', tgt(a.id, alName(a), 'budget')); db.fnl.grants.budget.forEach(p => upd(p, 'fnl-alloc', alName(a), 'budget')); ui.insp = {type: 'fm-alloc', id: a.id};
    done(L('Allocation proposed'), () => { db.fnl.allocations = db.fnl.allocations.filter(v => v !== a); ui.insp = null; logChange(FNL, 'withdrew an allocation proposal', tgt(a.id, alName(a), 'budget')); rerender(); }); },
  'fnl-b-approve': (el, id) => { const a = alOf(id); if (!a || a.state !== 'proposed' || !G('budget') || a.createdBy === session.me) return; const prev = JSON.stringify(a);
    Object.assign(a, {state: 'approved', approvedBy: session.me, approvedAt: nowStamp()}); logChange(FNL, 'approved an allocation', tgt(a.id, alName(a), 'budget'), 'Waiting for approval', 'Approved'); upd(a.createdBy, 'fnl-alloc-done', alName(a), 'budget');
    done(L('Allocation approved'), () => { Object.assign(a, JSON.parse(prev)); logChange(FNL, 'undid an allocation approval', tgt(a.id, alName(a), 'budget')); rerender(); }); },
  'fnl-b-return': (el, id) => { const a = alOf(id), why = $v('#fm-ar-why'); if (!a || !G('budget') || a.createdBy === session.me) return; if (!why) return bad('#fm-ar-why', L('Give a reason.')); const prev = JSON.stringify(a);
    Object.assign(a, {state: 'returned', returnNote: why}); logChange(FNL, 'returned an allocation proposal', tgt(a.id, alName(a), 'budget')); upd(a.createdBy, 'fnl-alloc-done', alName(a), 'budget'); done(L('Returned'), () => { Object.assign(a, JSON.parse(prev)); rerender(); }); },
  'fnl-b-amend': (el, id) => { const a = alOf(id); if (!a || !G('budget') || a.state !== 'approved') return; const amt = parseIdr($v('#fm-am-amt')), why = $v('#fm-am-why'), c = alStats(a).committed;
    if (isNaN(amt) || amt < 0) return bad('#fm-am-amt', L('Enter a whole rupiah amount.')); if (amt === a.amount) return bad('#fm-am-amt', L('That is the current amount.')); if (!why) return bad('#fm-am-why', L('Give the reason. It stays in the history.'));
    if (amt < c && !($('#fm-am-exc') || {}).checked) return bad('#fm-am-amt', L('Below what is committed. Tick the exception box to save it as an exception.'));
    const prev = JSON.stringify(a), from = a.amount; a.amount = amt; a.history.push({amount: amt, by: session.me, at: nowStamp(), reason: amt < c ? `${why} (${L('exception: below commitments')})` : why}); ui.fmAmend = null;
    logChange(FNL, 'amended an allocation', tgt(a.id, alName(a), 'budget'), idrT(from), idrT(amt)); done(L('Allocation amended. Paid records are unchanged.'), () => { Object.assign(a, JSON.parse(prev)); a.history.push({amount: from, by: session.me, at: nowStamp(), reason: L('Undid the amendment')}); logChange(FNL, 'undid an allocation amendment', tgt(a.id, alName(a), 'budget')); rerender(); }); },
  // ----- exports (scoped; restricted fields only for the grants that may read them) -----
  'fnl-export-budget': () => { if (!fnlFull(me())) return; const pr = r => fPriv(r);
    csv(`dwdg-fnl-requests-${today()}.csv`, ['id', 'purpose', 'unit', 'budget_line', 'category', 'state', 'requested_idr', 'approved_idr', 'paid_idr', 'outstanding_idr', 'evidence', 'as_of'],
      db.fnl.requests.filter(r => r.state !== 'draft').map(r => [r.id, r.purpose, r.unit, r.alloc || '', r.category, r.state, r.requested, commit(r) || '', commit(r) ? netPaid(r) : '', commit(r) ? owed(r) : '', pr(r) ? r.evidence.map(e => e.url).join(' ') : 'restricted', nowStamp()]));
    logChange(FNL, 'exported finance requests', tgt('budget', L('Budget & transactions'), 'budget')); save(); toast(L('Export downloaded. Restricted evidence is left out for viewers without the grant.')); },
  'fnl-export-register': () => { if (!fnlFull(me())) return;
    csv(`dwdg-fnl-register-${today()}.csv`, ['number', 'state', 'void_reason', 'replaces', 'type', 'request', 'document', 'version', 'request_state', 'issued_by', 'issued_at'],
      db.fnl.register.slice().sort((a, b) => a.seq - b.seq).map(g => { const x = lrOf(g.req) || {}; return [g.no, g.state, g.voidReason, (rgOf(g.replaces) || {}).no || '', g.type, g.req, x.title || '', g.version, x.stage || '', pname(g.issuedBy), g.issuedAt]; }));
    logChange(FNL, 'exported the document register', tgt('register', L('Documents & register'), 'register')); save(); toast(L('Register exported')); },
  'fnl-export-period': (el, id) => { const p = prOf(id); if (!p || !fnlFull(me())) return; const t = periodTotals(p);
    csv(`dwdg-fnl-${p.id}.csv`, ['row', 'request', 'kind', 'date', 'amount_idr', 'reference', 'evidence', 'check'], [...periodRows(p).map(x => [x.id, x.req, x.kind, x.date, x.amount, x.ref, x.evidence || 'missing', p.checks[x.id] || 'unchecked']),
      ['total', '', '', '', t.paid, '', '', ''], ['basis', 'committed', '', '', t.committed, '', '', ''], ['basis', 'outstanding', '', '', t.outstanding, '', '', ''], ['basis', 'bank_reconciliation', '', '', '', '', p.bank, '']]);
    logChange(FNL, 'exported the period review', tgt(p.id, p.name, `period-reviews/${p.id}`)); save(); toast(L('Period exported')); },
  // ----- period review -----
  'fnl-p-match': (el, id) => { const p = prOf(id), xid = el.dataset.x, row = db.fnl.payments.find(q => q.id === xid); if (!p || !row || !(G('periodPrep') || G('period')) || p.state === 'closed') return; if (!row.evidence) return toast(L('Attach evidence first. Missing evidence stays a discrepancy.'));
    const u = mkUndo('fnl', () => null, L('Check'), FNL, tgt(p.id, p.name, `period-reviews/${p.id}`)); p.checks[xid] = 'matched'; if (p.discrepancies) delete p.discrepancies[xid]; p.unresolved.forEach(r => { if (r.row === xid) r.state = 'done'; });
    logChange(FNL, 'checked a payment in', tgt(p.id, p.name, `period-reviews/${p.id}`)); done(L('Marked as matching the evidence'), u); },
  'fnl-p-flag': (el, id) => { const p = prOf(id), xid = el.dataset.x, act = $v('#fm-pd-act'), own = $v('#fm-pd-own') || 'citra'; if (!p || !(G('periodPrep') || G('period'))) return; if (!act) return bad('#fm-pd-act', L('Name the next action.'));
    const u = mkUndo('fnl', () => null, L('Discrepancy'), FNL, tgt(p.id, p.name, `period-reviews/${p.id}`)); p.checks[xid] = 'discrepancy'; p.discrepancies = p.discrepancies || {}; p.discrepancies[xid] = {action: act, owner: own, by: session.me, at: nowStamp()};
    p.unresolved.push({id: uid('ur-'), row: xid, text: act, owner: own, due: null, state: 'open'}); logChange(FNL, 'recorded a discrepancy in', tgt(p.id, p.name, `period-reviews/${p.id}`)); upd(own, 'fnl-disc', p.name, `period-reviews/${p.id}`); done(L('Discrepancy recorded with an owner'), u); },
  'fnl-p-bank': (el, id) => { const p = prOf(id); if (!p || !G('period')) return; const u = mkUndo('fnl', () => null, L('Bank'), FNL, tgt(p.id, p.name, `period-reviews/${p.id}`)); p.bank = 'done'; p.bankBy = session.me; p.bankAt = nowStamp(); logChange(FNL, 'recorded the bank comparison for', tgt(p.id, p.name, `period-reviews/${p.id}`)); done(L('Bank comparison recorded'), u); },
  'fnl-p-snap': (el, id) => { const p = prOf(id); if (!p || !G('period')) return; const rows = periodRows(p); if (p.state !== 'closed' && rows.some(x => (p.checks[x.id] || 'unchecked') === 'unchecked')) return toast(L('Every row needs a result before a snapshot.'));
    const t = periodTotals(p), u = mkUndo('fnl', () => null, L('Snapshot'), FNL, tgt(p.id, p.name, `period-reviews/${p.id}`)), v = p.snapshots.length + 1;
    p.snapshots.push({v, at: nowStamp(), by: session.me, totals: {alloc: t.alloc, committed: t.committed, paid: t.paid, outstanding: t.outstanding}, ids: [...t.reqs.map(r => r.id), ...rows.map(x => x.id)], note: p.state === 'closed' ? L('After a correction; the earlier snapshot stays as the past basis.') : (p.bank === 'done' ? '' : L('Bank reconciliation incomplete.'))});
    if (p.state === 'open') p.state = 'review'; logChange(FNL, 'saved a snapshot of', tgt(p.id, p.name, `period-reviews/${p.id}`), null, `S${v}`); done(L('Snapshot {v} saved', {v}), u); },
  'fnl-p-close': (el, id) => { const p = prOf(id); if (!p || !G('period') || !p.snapshots.length) return; const u = mkUndo('fnl', () => null, L('Closed'), FNL, tgt(p.id, p.name, `period-reviews/${p.id}`));
    p.state = 'closed'; p.closedBy = session.me; p.closedAt = nowStamp(); logChange(FNL, 'closed the period', tgt(p.id, p.name, `period-reviews/${p.id}`), 'In review', 'Closed with snapshot'); p.unresolved.filter(r => r.state === 'open').forEach(r => upd(r.owner, 'fnl-disc', p.name, `period-reviews/${p.id}`));
    done(L('Period closed. Open actions stay with their owners.'), u); },
  'fnl-p-done': (el, id) => { const p = prOf(id), r = p && p.unresolved.find(q => q.id === el.dataset.x); if (!r || !(r.owner === session.me || G('period'))) return; r.state = 'done'; r.doneBy = session.me; r.doneAt = nowStamp(); logChange(FNL, 'resolved an open action in', tgt(p.id, p.name, `period-reviews/${p.id}`)); done(L('Action marked done'), () => { r.state = 'open'; rerender(); }); },
});
// Drafts are written as the person types and survive reloads and failed saves (work_forms). Type and date changes re-render the warnings.
ON_INPUT['fm-draft'] = el => { const st = el.dataset.store || 'fnl'; if (!db[st]) return; const d = draftOf(el.dataset.kind, st); d[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value; d._at = nowStamp(); save(); const s = $('.fm-saved'); if (s) s.textContent = L('Draft saved {t}', {t: d._at.slice(11, 16)}); };
ON_CHANGE['fm-l-type'] = ON_CHANGE['fm-l-rb'] = el => { if (!db.fnl) return; ON_INPUT['fm-draft'](el); render(); };
ON_INPUT['fm-amend'] = el => { ui.fmAmend = el.value; const pos = el.selectionStart; render(); const n = $('#fm-am-amt'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch {} } };

// ---------- MCIT lookups ----------
const ctOf = id => (db.mcit.content || []).find(x => x.id === id);
const cmpOf = id => (db.mcit.campaigns || []).find(x => x.id === id);
const itOf = id => (db.mcit.it || []).find(x => x.id === id);
const brOf = id => (db.mcit.briefs || []).find(x => x.id === id);
const accOf = id => (db.mcit.accounts || []).find(x => x.id === id);
const cLatest = c => c.versions[c.versions.length - 1];
const stale = c => !!c.approvedV && !!cLatest(c) && cLatest(c).v > c.approvedV; // marketing_stale_approval
const pubCount = c => c.channels.filter(ch => ch.pub).length;
const cLink = c => tgt(c.id, c.title, `content/${c.id}`);
const iLink = x => tgt(x.id, x.title, `it-requests/${x.id}`);
const mcLead = p => !!p && ((p.div === MC && rank(p) >= 2) || !!p.admin);
const canMakeContent = p => mcLead(p) || MG('review') || MG('publish');
const canSeeIt = x => { const m = me(); return !!m && (mcFull(m) || x.requester === m.id || x.createdBy === m.id || unitLead(m, x.unit)); };
const itPriv = () => MG('triage') || MG('tech');
const seeAcc = a => !a.hidden || (me() && (me().admin || (mcIn(me()) && rank(me()) >= 3)));
// Secrets never enter ordinary records (integration-credentials, resource_secret_links): a typed password or token is refused before saving.
const SECRET = /(password|passwd|kata ?sandi|pwd|otp|token|api[ _-]?key|secret|recovery code)\s*[:=]\s*\S+/i;
const hasSecret = (...vals) => vals.some(v => SECRET.test(v || ''));
const chName = k => CH[k] || k;

// ---------- Content: calendar, production board and table (marketing_cadence, marketing_dates, pattern p-calendar, p-board, p-table) ----------
function contentPage(r) {
  ensureMc(); const m = me(); useWs(MC); const cr = crumb(MC, [['content', L('Content')]]);
  if (r.id === 'new') return newContentPage(r.sub);
  if (r.id) { const c = ctOf(r.id); if (!c || !mcFull(m)) return {crumb: cr, content: denied()}; return contentItemPage(c); }
  if (!mcFull(m)) return {crumb: cr, content: denied()};
  const v = ui.view.mcv || 'calendar', fc = ui.view.mccmp || 'all';
  const items = db.mcit.content.filter(c => fc === 'all' || (fc === 'none' ? !c.campaign : c.campaign === fc));
  const segV = `<div class="seg fm-seg" role="radiogroup" aria-label="${esc(L('View'))}">${[['calendar', 'Calendar', 'calendar'], ['board', 'Board', 'board'], ['table', 'Table', 'list']].map(([k, t, i]) => `<button class="${v === k ? 'on' : ''}" data-act="view" data-scope="mcv" data-v="${k}" role="radio" aria-checked="${v === k}">${icon(i, 'ic-sm')}${L(t)}</button>`).join('')}</div>`;
  const filt = `<label class="fm-inline">${L('Campaign')} <select class="input sel-sm" id="mc-cmp-f">${opts([['all', L('All content')], ...db.mcit.campaigns.map(c => [c.id, c.name]), ['none', L('No campaign')]], fc)}</select></label>`;
  let body = '';
  if (v === 'calendar') body = calendarView(items);
  else if (v === 'board') {
    const col = s => { const cs = items.filter(c => c.stage === s); return `<div class="col"><div class="col-h">${chip(CST[s], '')}<span class="n">${cs.length}</span></div>${cs.map(card).join('')}</div>`; };
    body = `<div class="board fm-board">${CORDER.map(col).join('')}${col('cancelled')}</div><p class="t-small t-mute hint">${L('Columns come from the content states. Canceled stays visible with its reason.')}</p>`;
  } else body = `<div class="fm-scroll"><table class="tbl fm-tbl"><thead><tr><th>${L('Content')}</th><th>${L('Executor')}</th><th>${L('Reviewer')}</th><th>${L('Internal due')}</th><th>${L('Planned publication')}</th><th>${L('Actual publication')}</th><th>${L('State')}</th></tr></thead><tbody>${items.map(c => `<tr data-act="go" data-h="content/${c.id}" tabindex="0" role="link"><td><b>${esc(c.title)}</b><small class="t-mute">${esc(c.kind)}${c.campaign && cmpOf(c.campaign) ? ` · ${esc(cmpOf(c.campaign).name)}` : ''}</small></td><td>${who(c.executor)}</td><td>${who(c.reviewer)}</td><td>${neededTag(['published', 'cancelled', 'archived'].includes(c.stage) ? null : c.due) }</td>
    <td>${c.channels.map(ch => `<small class="fm-chl">${esc(chName(ch.ch))} ${esc(fmtDT(ch.planned))}</small>`).join('')}</td><td>${c.channels.map(ch => `<small class="fm-chl">${esc(chName(ch.ch))} ${ch.pub ? esc(fmtDT(ch.pub.at)) : `<span class="t-mute">${L('Not recorded')}</span>`}</small>`).join('')}</td><td>${chip(CST[c.stage])}${stale(c) ? ` ${chip(['Approval stale', 'warning', 'danger'], '')}` : ''}</td></tr>`).join('')}</tbody></table></div>`;
  const cmps = db.mcit.campaigns.map(c => { const n = db.mcit.content.filter(x => x.campaign === c.id); return `<div class="row"><div class="t"><b>${esc(c.name)}</b><small>${esc(c.purpose)}</small><small>${esc(dShort(c.start))} – ${esc(dShort(c.end))} · ${c.channels.map(chName).join(', ')}${c.project && projOf(c.project) ? ` · <a href="#/projects/${c.project}">${esc(projOf(c.project).name)}</a>` : ''}</small></div>${who(c.owner)}<span class="t-small t-mute">${plural(n.length, '{n} item', '{n} items')}</span></div>`; }).join('');
  return {crumb: cr, content: `<div class="page wide fm-page"><div class="ph"><div><h1 class="t-title">${L('Content')}</h1><p class="sub">${L('Internal due dates, planned publication and actual publication are kept apart. A planned date passing never publishes anything.')}</p></div>
    <div class="ph-r"><button class="btn" data-act="mc-export">${icon('download')}${L('Export CSV')}</button>${canMakeContent(m) ? `<a class="btn btn-pri" href="#/content/new">${icon('plus')}${L('New content')}</a>` : ''}</div></div>
    <div class="fm-bar">${segV}${filt}</div>${body}${sec(L('Campaigns'), db.mcit.campaigns.length)}<div class="rows">${cmps}</div>
    <p class="t-small t-mute hint">${L('A routine post needs no campaign. Engagement numbers are not shown because none are recorded.')}</p>${grantsBox(db.mcit.grants, ['review', 'publish'])}</div>`};
  function card(c) { const nx = c.channels.find(ch => !ch.pub); return `<a class="card fm-card" href="#/content/${c.id}"><b>${esc(c.title)}</b><div class="ln">${av(c.executor, 'av-xs')}${esc(first(c.executor))}<span class="t-num">${nx ? esc(dShort(nx.planned.slice(0, 10))) : ''}</span></div>${stale(c) ? `<div class="ln">${chip(['Approval stale', 'warning', 'danger'], '')}</div>` : c.channels.length > 1 && pubCount(c) && pubCount(c) < c.channels.length ? `<div class="ln">${state(L('Published on {a} of {b}', {a: pubCount(c), b: c.channels.length}), 'globe', 'warn', '')}</div>` : ''}</a>`; }
}
function calendarView(items) {
  const mo = ui.mcMonth || today().slice(0, 7), y = +mo.slice(0, 4), mi0 = +mo.slice(5, 7) - 1, first0 = iso(new Date(y, mi0, 1)), start = weekStart(first0), last = iso(new Date(y, mi0 + 1, 0));
  const ev = {}; const push = (d, e) => { (ev[d] = ev[d] || []).push(e); };
  items.forEach(c => { if (c.stage === 'cancelled') return;
    c.channels.forEach(ch => { if (ch.pub) push(ch.pub.at.slice(0, 10), {k: 'pub', c, ch, t: ch.pub.at.slice(11, 16)}); else push(ch.planned.slice(0, 10), {k: ch.planned.slice(0, 10) < today() ? 'late' : 'plan', c, ch, t: ch.planned.slice(11, 16)}); });
    if (c.due && !['published', 'scheduled', 'approved', 'archived'].includes(c.stage)) push(c.due, {k: 'due', c}); });
  if (typeof window.ensureHrData === 'function' && (ui.view.mccmp || 'all') === 'all') { window.ensureHrData(); ((db.hr || {}).packets || []).filter(pk => ['requested', 'accepted', 'fulfilled'].includes(pk.state)).forEach(pk => push(pk.announcement ? pk.announcement.date || pk.agreedDate : pk.agreedDate || pk.neededBy, {k: 'hr', pk})); }
  const KIND = {plan: ['Planned publication', 'calendar'], late: ['Planned date passed, not published', 'warning'], pub: ['Published (recorded)', 'check'], due: ['Internal due', 'clock'], hr: ['From HR', 'heart']};
  const label = e => e.k === 'hr' ? esc(e.pk.title) : e.k === 'due' ? esc(L('Due: {t}', {t: e.c.title})) : `${esc(chName(e.ch.ch))} · ${esc(e.c.title)}`;
  const pill = e => `<span class="fm-ev fm-ev-${e.k}" title="${esc(L(KIND[e.k][0]))}">${icon(KIND[e.k][1], 'ic-sm')}<span>${label(e)}</span></span>`;
  const sel = ui.mcDay || today(); let cells = '';
  for (let d = start; d <= last || weekday(d) !== 1; d = addDays(d, 1)) { const es = ev[d] || [], out = d.slice(0, 7) !== mo;
    cells += `<button class="fm-day ${out ? 'out' : ''} ${d === today() ? 'today' : ''} ${d === sel ? 'sel' : ''}" data-act="mc-day" data-d="${d}" aria-label="${esc(dLong(d))}, ${esc(plural(es.length, '{n} item', '{n} items'))}" aria-pressed="${d === sel}"><span class="fm-dn">${D(d).getDate()}</span>${es.slice(0, 3).map(pill).join('')}${es.length > 3 ? `<span class="fm-more">${L('+{n} more', {n: es.length - 3})}</span>` : ''}</button>`; }
  const dayList = (ev[sel] || []).map(e => e.k === 'hr' ? `<a class="row" href="#/recognition/${esc(e.pk.round)}">${icon('heart')}<div class="t"><b>${esc(e.pk.title)}</b><small>${L('Publication request from HR. Agreed date {d}.', {d: fmtD(e.pk.agreedDate || e.pk.neededBy)})}</small></div>${chip(e.pk.state === 'fulfilled' ? ['Announced', 'check', 'green'] : ['Accepted', 'check', 'ink'], '')}</a>`
    : `<a class="row" href="#/content/${e.c.id}">${icon(KIND[e.k][1])}<div class="t"><b>${esc(e.c.title)}</b><small>${esc(L(KIND[e.k][0]))}${e.ch ? ` · ${esc(chName(e.ch.ch))} ${esc(e.t)}` : ''}${e.k === 'pub' && e.ch.pub.url ? ` · ${L('evidence recorded')}` : ''}</small></div>${chip(CST[e.c.stage], '')}</a>`).join('');
  const mName = `${MONTH()[mi0]} ${y}`, prevM = iso(new Date(y, mi0 - 1, 1)).slice(0, 7), nextM = iso(new Date(y, mi0 + 1, 1)).slice(0, 7);
  return `<div class="sheet pad fm-cal"><div class="fm-between fm-calh"><div class="fm-calnav"><button class="ib" data-act="mc-month" data-m="${prevM}" aria-label="${esc(L('Previous month'))}">${icon('chevron-left')}</button><b>${esc(mName)}</b><button class="ib" data-act="mc-month" data-m="${nextM}" aria-label="${esc(L('Next month'))}">${icon('chevron-right')}</button><button class="btn btn-sm" data-act="mc-month" data-m="${today().slice(0, 7)}">${L('Today')}</button></div>
    <div class="fm-legend">${Object.keys(KIND).map(k => `<span class="fm-ev fm-ev-${k}">${icon(KIND[k][1], 'ic-sm')}<span>${L(KIND[k][0])}</span></span>`).join('')}</div></div>
    <div class="fm-wk">${[1, 2, 3, 4, 5, 6, 0].map(i => `<span>${WD()[i]}</span>`).join('')}</div><div class="fm-grid">${cells}</div></div>
    ${sec(esc(dLong(sel)), (ev[sel] || []).length)}${dayList ? `<div class="rows">${dayList}</div>` : `<p class="t-small t-mute">${L('Nothing planned, due or published on this day.')}</p>`}`;
}
function newContentPage(fromBrief) {
  const m = me(), cr = crumb(MC, [['content', L('Content')], ['', L('New content')]]); if (!canMakeContent(m)) return {crumb: cr, content: denied()};
  const b = fromBrief && brOf(fromBrief), mcPeople = db.people.filter(p => p.status === 'active' && p.div === MC).map(p => p.id);
  return {crumb: cr, content: `<div class="page fm-page"><div class="ph"><div><h1 class="t-title">${L('New content')}</h1><p class="sub">${b ? L('From the brief "{t}" sent by {who}.', {t: b.title, who: pname(b.requester)}) : L('One content item, with its own executor, reviewer and dates per channel.')}</p></div></div>
    <div class="fm-form">${field('mc-n-title', L('Title'), inp('mc-n-title', b ? b.title : '', 'data-autofocus'), '', true)}<div class="fm-2">${field('mc-n-kind', L('Format'), inp('mc-n-kind', b ? b.deliverable : '', 'placeholder="Carousel post"'))}${field('mc-n-cmp', L('Campaign'), `<select class="input" id="mc-n-cmp">${opts(db.mcit.campaigns.map(c => [c.id, c.name]), '', L('No campaign'))}</select>`, L('Optional. A routine post needs none.'))}</div>
    ${field('mc-n-ch', L('Channels'), `<div class="fm-checks-inline">${Object.keys(CH).map(k => `<label class="fm-check"><input type="checkbox" name="mc-n-ch" value="${k}" ${b && b.channel === k ? 'checked' : !b && k === 'instagram' ? 'checked' : ''}> ${esc(CH[k])}</label>`).join('')}</div>`, L('Each channel gets its own publication record.'), true)}
    <div class="fm-2">${field('mc-n-plan', L('Planned publication'), `<input type="date" class="input" id="mc-n-plan" value="${esc(b ? b.desired : addDays(today(), 7))}">`, L('Planned only. Publishing is recorded separately.'), true)}${field('mc-n-time', L('Time'), `<input class="input" id="mc-n-time" value="19:00" inputmode="numeric">`)}</div>
    <div class="fm-2">${field('mc-n-exec', L('Executor'), `<select class="input" id="mc-n-exec">${pOpts(mcPeople, '')}</select>`, L('An offer outside MCIT needs the person to accept first.'), true)}${field('mc-n-rev', L('Reviewer'), `<select class="input" id="mc-n-rev">${pOpts(db.mcit.grants.review, db.mcit.grants.review[0])}</select>`, '', true)}</div>
    ${field('mc-n-due', L('Internal due date'), `<input type="date" class="input" id="mc-n-due" value="${esc(addDays(b ? b.desired : addDays(today(), 7), -3))}">`, L('When the executor sends a version for review. Usually before the planned publication.'), true)}
    ${field('mc-n-brief', L('Brief'), txa('mc-n-brief', b ? `${b.purpose}\n${L('Audience')}: ${b.audience}\n${L('Sources')}: ${b.sources}` : ''))}${field('mc-n-asset', L('Asset or brand link'), inp('mc-n-asset', '', 'placeholder="https://"'), L('A link is not a copy. Access stays with the file owner.'))}</div>
    <div class="acts fm-acts"><button class="btn btn-pri" data-act="mc-c-create" data-brief="${b ? b.id : ''}">${L('Create content')}</button><a class="btn btn-ghost" href="#/content">${L('Cancel')}</a></div></div>`};
}
function contentItemPage(c) {
  const m = me(), cr = crumb(MC, [['content', L('Content')], ['', c.title]]), f = ui.form || '', lv = cLatest(c), board = isBoardP(m), isExec = c.executor === m.id, rev = MG('review'), pub = MG('publish');
  const next = {idea: [c.executor, L('{who} starts drafting.', {who: first(c.executor)})], drafting: [c.executor, L('{who} sends a version for review by {d}.', {who: first(c.executor), d: c.due ? dShort(c.due) : L('the internal due date')})], review: [c.reviewer, L('{who} reviews version {v}.', {who: first(c.reviewer), v: lv ? lv.v : 1})],
    revision: [c.executor, L('{who} sends a new version.', {who: first(c.executor)})], approved: [db.mcit.grants.publish[0], L('Schedule the approved version.')], scheduled: [db.mcit.grants.publish[0], L('Publish on each channel outside the app, then record it here.')],
    published: [null, L('Published on every channel.')], cancelled: [null, L('Canceled. The history stays.')], archived: [null, L('Archived.')]}[c.stage] || [null, ''];
  const head = `<div class="ph"><div><h1 class="t-title">${esc(c.title)}</h1><p class="sub">${esc(c.kind)}${c.campaign && cmpOf(c.campaign) ? ` · ${esc(cmpOf(c.campaign).name)}` : ` · ${L('No campaign')}`}</p></div><div class="ph-r">${stale(c) ? chip(['Approval stale', 'warning', 'danger'], 'pill-o') : ''}${chip(CST[c.stage], 'pill-o')}</div></div>`;
  // the dates are separate fields, never merged (marketing_dates, flow-marketing-brief 2)
  const dates = `<div class="fm-scroll"><table class="tbl fm-tbl fm-dates"><thead><tr><th>${L('Date')}</th><th>${L('Who')}</th><th>${L('When')}</th><th>${L('State')}</th></tr></thead><tbody>
    <tr><td><b>${L('Internal due')}</b><small class="t-mute">${L('Version ready for review')}</small></td><td>${who(c.executor)}</td><td>${c.due ? `<span class="t-num">${esc(fmtD(c.due))}</span>` : `<span class="t-mute">${L('Not set')}</span>`}</td><td>${lv ? chip(['Version sent', 'check', 'green'], '') : c.due && c.due < today() ? chip(['Past due', 'warning', 'danger'], '') : chip(['Open', 'circle', 'mute'], '')}</td></tr>
    <tr><td><b>${L('Approval')}</b><small class="t-mute">${L('On an exact version')}</small></td><td>${who(c.reviewer)}</td><td>${c.approvedV ? esc(fmtDT((c.versions.find(v => v.v === c.approvedV) || {decision: {}}).decision.at || '')) : '–'}</td><td>${c.approvedV ? (stale(c) ? chip(['Approval stale', 'warning', 'danger'], '') : state(L('Approved v{v}', {v: c.approvedV}), 'check', 'green', '')) : chip(['Not approved', 'circle', 'mute'], '')}</td></tr>
    ${c.channels.map(ch => `<tr><td><b>${L('Planned publication')}</b><small class="t-mute">${esc(chName(ch.ch))}</small></td><td>${who(c.executor)}</td><td class="t-num">${esc(fmtDT(ch.planned))}</td><td>${ch.pub ? chip(['Published', 'globe', 'green'], '') : ch.planned.slice(0, 10) < today() ? chip(['Planned date passed, not published', 'warning', 'warn'], '') : chip(['Planned', 'calendar', 'ink'], '')}</td></tr>
      <tr><td><b>${L('Actual publication')}</b><small class="t-mute">${esc(chName(ch.ch))}</small></td><td>${ch.pub ? who(ch.pub.by) : '–'}</td><td class="t-num">${ch.pub ? esc(fmtDT(ch.pub.at)) : `<span class="t-mute">${L('Not recorded')}</span>`}</td><td>${ch.pub ? (ch.pub.basis === 'url' ? linkOut(L('Public link'), ch.pub.url) : chip(['Attested, no link', 'info', 'ink2'], '')) : ch.failed ? chip(['Failed, follow-up open', 'warning', 'danger'], '') : '–'}</td></tr>`).join('')}</tbody></table></div>`;
  const task = c.task && taskOf(c.task);
  const info = meta([[L('Created by'), byAt(c.createdBy, c.createdAt)], [L('Executor'), who(c.executor)], [L('Reviewer'), who(c.reviewer)], [L('Campaign'), c.campaign && cmpOf(c.campaign) ? esc(cmpOf(c.campaign).name) : `<span class="t-mute">${L('None')}</span>`],
    task ? [L('Task'), `<button class="fm-lnk" data-act="open-task" data-id="${task.id}">${esc(task.title)}</button> ${taskState(task, true)}`] : null, c.brief ? [L('Brief'), nl(c.brief)] : null, c.fromBrief && brOf(c.fromBrief) ? [L('Requested in'), `<a href="#/it-requests/${c.fromBrief}">${esc(brOf(c.fromBrief).title)}</a>`] : null,
    [L('Assets'), c.assets.length ? `<span class="fm-links">${c.assets.map(a => linkOut(a.label, a.url)).join('')}</span>` : `<span class="t-mute">${L('None linked')}</span>`]]);
  const startBtn = c.stage === 'idea' && (isExec || mcLead(m)) && !board ? `<div class="acts"><button class="btn btn-pri" data-act="mc-c-start" data-id="${c.id}">${L('Start drafting')}</button></div>` : '';
  const decChip = (ver, i) => ver.decision ? chip(ver.decision.kind === 'approved' ? (c.approvedV === ver.v ? ['Approved', 'check', 'green'] : ['Approved earlier', 'check', 'mute']) : ['Changes requested', 'undo', 'warn']) : i === c.versions.length - 1 && c.stage === 'review' ? chip(['Waiting for review', 'clock', 'warn']) : chip(['Not reviewed', 'minus', 'mute']);
  const canRev = c.stage === 'review' && rev && lv && lv.by !== m.id && !board, canVer = ['drafting', 'revision', 'review', 'approved', 'scheduled'].includes(c.stage) && isExec && !board;
  const verSec = `${sec(L('Versions'), c.versions.length)}${stale(c) ? note('warn', 'warning', L('Approval stale'), L('Version {a} was approved. Version {b} changed the content, so it needs its own review before it can be scheduled or published.', {a: c.approvedV, b: lv.v})) : ''}
    ${c.versions.length ? `<div class="versions">${c.versions.slice().reverse().map((ver, j) => { const i = c.versions.length - 1 - j; return `<div class="ver ${i === c.versions.length - 1 ? 'sel' : ''}"><span class="v">v${ver.v}</span><div><b>${esc(ver.label)}</b><small>${esc(pname(ver.by))}, ${esc(fmtDT(ver.at))} · <a href="${esc(ver.url)}" target="_blank" rel="noopener noreferrer">${L('Open')}</a></small>${ver.decision ? `<small>${L('{who}, {d}', {who: pname(ver.decision.by), d: fmtDT(ver.decision.at)})}${ver.decision.reason ? `: ${esc(ver.decision.reason)}` : ''}</small>` : ''}</div>${decChip(ver, i)}</div>`; }).join('')}</div>` : `<p class="t-small t-mute">${L('No version yet.')}</p>`}
    ${canRev ? (f === 'c-rev' ? `${field('mc-rv-why', L('What must change'), txa('mc-rv-why', '', 'data-autofocus'), L('Linked to version {v}. A revision task goes to {who}.', {v: lv.v, who: first(c.executor)}), true)}<div class="acts"><button class="btn btn-pri" data-act="mc-c-decide" data-id="${c.id}" data-v="${lv.v}" data-o="revision">${L('Request changes')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>`
      : `<div class="acts"><button class="btn btn-pri" data-act="mc-c-decide" data-id="${c.id}" data-v="${lv.v}" data-o="approved">${icon('check')}${L('Approve v{v}', {v: lv.v})}</button><button class="btn" data-act="fm-form" data-f="c-rev">${L('Request changes')}</button></div>`) : c.stage === 'review' && rev && lv && lv.by === m.id ? `<p class="t-small t-mute">${L('You made this version, so another reviewer decides.')}</p>` : ''}
    ${canVer ? (f === 'c-ver' ? `<div class="quiet fm-box">${field('mc-v-label', L('What changed'), inp('mc-v-label', '', 'data-autofocus'), '', true)}${field('mc-v-url', L('Link to this version'), inp('mc-v-url', '', 'placeholder="https://"'), L('Canva, Drive or Docs. The link records which file was reviewed.'), true)}
        ${c.approvedV ? `<p class="t-small">${icon('warning', 'ic-sm')} ${L('Version {v} is approved. Sending a new version makes that approval stale until it is reviewed again.', {v: c.approvedV})}</p>` : ''}<div class="acts"><button class="btn btn-pri" data-act="mc-c-ver" data-id="${c.id}">${L('Send v{v} for review', {v: (lv ? lv.v : 0) + 1})}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>`
      : `<div class="acts"><button class="btn ${['drafting', 'revision'].includes(c.stage) ? 'btn-pri' : ''}" data-act="fm-form" data-f="c-ver">${icon('upload')}${L('Send version {v}', {v: (lv ? lv.v : 0) + 1})}</button></div>`) : ''}`;
  const schedBtn = c.stage === 'approved' && pub && !stale(c) && !board ? `<div class="acts"><button class="btn btn-pri" data-act="mc-c-sched" data-id="${c.id}">${icon('calendar')}${L('Schedule v{v}', {v: c.approvedV})}</button></div><p class="t-small t-mute">${L('Scheduling records the plan. Nothing is posted by the app.')}</p>` : '';
  const chRows = c.channels.map((ch, i) => `<div class="row fm-chrow"><div class="t"><b>${esc(chName(ch.ch))}</b><small>${L('Planned {d}', {d: fmtDT(ch.planned)})}${ch.pub ? ` · ${L('Published {d} by {who}', {d: fmtDT(ch.pub.at), who: first(ch.pub.by)})}${ch.pub.v ? ` · v${ch.pub.v}` : ''}${ch.pub.note ? ` · ${esc(ch.pub.note)}` : ''}` : ''}${ch.failed ? ` · ${L('Failed: {r}', {r: ch.failed.reason})}` : ''}</small></div>
    ${ch.pub ? (ch.pub.basis === 'url' ? linkOut(L('Public link'), ch.pub.url) : chip(['Attested, no link', 'info', 'ink2'])) : ch.failed ? chip(['Failed, follow-up open', 'warning', 'danger']) : ch.planned.slice(0, 10) < today() ? chip(['Planned date passed, not published', 'warning', 'warn']) : chip(['Not published', 'circle', 'mute'])}
    ${!ch.pub && pub && !board && ['scheduled'].includes(c.stage) ? `<button class="btn btn-sm" data-act="fm-form" data-f="ch-${i}">${L('Record')}</button>` : ''}${!ch.pub && pub && !board && ['approved', 'scheduled', 'review', 'drafting', 'idea', 'revision'].includes(c.stage) ? `<button class="btn btn-sm btn-ghost" data-act="fm-form" data-f="chd-${i}">${L('Move date')}</button>` : ''}</div>
    ${f === `ch-${i}` ? `<div class="quiet fm-box">${field('mc-p-basis', L('Evidence'), `<select class="input" id="mc-p-basis">${opts([['url', L('Public link')], ['attest', L('Attestation, no link (for example a story)')]], 'url')}</select>`)}${field('mc-p-url', L('Public link'), inp('mc-p-url', '', 'placeholder="https://" data-autofocus'))}
      <div class="fm-2">${field('mc-p-date', L('Published on'), `<input type="date" class="input" id="mc-p-date" value="${today()}">`, '', true)}${field('mc-p-time', L('Time'), inp('mc-p-time', nowStamp().slice(11, 16), 'inputmode="numeric"'), '', true)}</div>${field('mc-p-note', L('Note'), inp('mc-p-note'), L('Required for an attestation: who saw it and where.'))}
      <div class="acts"><button class="btn btn-pri" data-act="mc-c-pub" data-id="${c.id}" data-ch="${i}">${L('Record publication')}</button><button class="btn" data-act="fm-form" data-f="chf-${i}">${L('It failed')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div><p class="t-small t-mute">${L('Records version {v}. The app never posts for you.', {v: c.approvedV})}</p></div>` : ''}
    ${f === `chf-${i}` ? `<div class="quiet fm-box">${field('mc-f-why', L('What went wrong'), txa('mc-f-why', '', 'data-autofocus'), L('A follow-up task goes to the executor. Other channels keep their own state.'), true)}<div class="acts"><button class="btn btn-pri" data-act="mc-c-fail" data-id="${c.id}" data-ch="${i}">${L('Record failure')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>` : ''}
    ${f === `chd-${i}` ? `<div class="quiet fm-box"><div class="fm-2">${field('mc-d-date', L('New planned date'), `<input type="date" class="input" id="mc-d-date" value="${esc(ch.planned.slice(0, 10))}">`, '', true)}${field('mc-d-time', L('Time'), inp('mc-d-time', ch.planned.slice(11, 16), 'inputmode="numeric"'), '', true)}</div>${field('mc-d-why', L('Reason'), inp('mc-d-why', '', 'data-autofocus'), L('The executor and reviewer are told. Approval and history do not change.'), true)}<div class="acts"><button class="btn btn-pri" data-act="mc-c-date" data-id="${c.id}" data-ch="${i}">${L('Move planned date')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>` : ''}`).join('');
  const chSec = `${sec(L('Publication by channel'), `${pubCount(c)}/${c.channels.length}`)}<div class="rows">${chRows}</div>${schedBtn}`;
  const corrSec = c.corrections.length || (pubCount(c) && pub && !board) ? `${sec(L('Corrections and takedowns'), c.corrections.length)}${c.corrections.map(k => `<div class="quiet fm-box"><p class="t-small t-mute">${byAt(k.by, k.at)}</p><p>${nl(k.reason)}</p>${k.url ? linkOut(L('Evidence'), k.url) : ''}</div>`).join('')}
    ${pubCount(c) && pub && !board ? (f === 'c-corr' ? `${field('mc-k-why', L('What was corrected or taken down, and why'), txa('mc-k-why', '', 'data-autofocus'), '', true)}${field('mc-k-url', L('Evidence link'), inp('mc-k-url', '', 'placeholder="https://"'))}<div class="acts"><button class="btn btn-pri" data-act="mc-c-corr" data-id="${c.id}">${L('Record correction')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>` : `<div class="acts"><button class="btn btn-ghost" data-act="fm-form" data-f="c-corr">${L('Record a correction or takedown')}</button></div>`) : ''}` : '';
  const canCancel = !['published', 'cancelled', 'archived'].includes(c.stage) && (mcLead(m) || c.createdBy === m.id || rev) && !board;
  const cancel = c.cancel ? note('info', 'close', L('Canceled'), L('{who}: {r}', {who: pname(c.cancel.by), r: c.cancel.reason})) : '';
  const cancelForm = canCancel ? (f === 'c-cancel' ? `${field('mc-x-why', L('Reason for canceling'), txa('mc-x-why', '', 'data-autofocus'), L('Ends reminders and publication duties. History stays.'), true)}<div class="acts"><button class="btn btn-danger" data-act="mc-c-cancel" data-id="${c.id}">${L('Cancel content')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Keep it')}</button></div>` : `<div class="acts fm-foot"><button class="btn btn-ghost" data-act="fm-form" data-f="c-cancel">${L('Cancel content')}</button></div>`) : '';
  const hist = `${sec(L('History'), c.history.length)}<div class="fm-hist">${c.history.slice().reverse().map(h => `<div class="fm-hist-r">${av(h.by, 'av-xs')}<span><b>${esc(first(h.by))}</b> ${esc(L(h.what, h.v))}</span><time>${esc(fmtDT(h.at))}</time></div>`).join('')}</div>`;
  return {crumb: cr, content: `<div class="page fm-page">${head}${CORDER.includes(c.stage) ? steps(['Idea', 'Drafting', 'In review', 'Approved', 'Scheduled', 'Published'], {idea: 0, drafting: 1, review: 2, revision: 1, approved: 3, scheduled: 4, published: 6}[c.stage]) : ''}
    <div class="fm-next">${icon('flag', 'ic-sm')}<div><b>${L('Next')}</b><span>${next[0] ? `${who(next[0])} ` : ''}${esc(next[1])}</span></div></div>${cancel}${dates}${info}${startBtn}${verSec}${chSec}${corrSec}${hist}${cancelForm}</div>`};
}

// ---------- MCIT Requests: IT queue and content briefs (marketing_it_requests, flow-it-support, blueprint §6) ----------
function itRequestsPage(r) {
  ensureMc(); const m = me(); useWs(MC); const cr = crumb(MC, [['it-requests', L('Requests')]]);
  if (r.id === 'new') return newItPage(r.sub);
  if (r.id) { const x = itOf(r.id) || brOf(r.id); if (!x) return {crumb: cr, content: denied()};
    if (itOf(r.id)) return canSeeIt(x) ? itPage(x) : {crumb: cr, content: denied()};
    return (mcFull(m) || x.requester === m.id || x.createdBy === m.id || unitLead(m, x.unit)) ? briefPage(x) : {crumb: cr, content: denied()}; }
  const full = mcFull(m), v = ui.view.mcreq || 'it';
  const iRow = x => `<tr data-act="go" data-h="it-requests/${x.id}" tabindex="0" role="link"><td><b>${esc(x.title)}</b><small class="t-mute">${L(ITYPE[x.type])}</small></td><td>${accOf(x.service) && seeAcc(accOf(x.service)) ? esc(accOf(x.service).service) : `<span class="t-mute">${L('Not listed')}</span>`}</td><td>${who(x.requester)} <small class="t-mute">${esc(unitName(x.unit))}</small></td><td>${who(x.owner)}</td><td>${x.priority ? esc(L(PRIO[x.priority])) : `<span class="t-mute">${L('Not triaged')}</span>`}</td><td class="t-num">${esc(dShort(x.createdAt.slice(0, 10)))}</td><td>${chip(IT[x.stage])}</td></tr>`;
  const bRow = x => `<tr data-act="go" data-h="it-requests/${x.id}" tabindex="0" role="link"><td><b>${esc(x.title)}</b><small class="t-mute">${esc(x.deliverable)}</small></td><td>${who(x.requester)} <small class="t-mute">${esc(unitName(x.unit))}</small></td><td>${esc(chName(x.channel))}</td><td>${neededTag(x.desired)}</td><td>${chip(BST[x.state])}</td></tr>`;
  const hrRows = (typeof window.ensureHrData === 'function' && full) ? (window.ensureHrData(), ((db.hr || {}).packets || []).filter(pk => pk.state !== 'draft')) : [];
  const iHead = `<tr><th>${L('Request')}</th><th>${L('Service')}</th><th>${L('Requested by')}</th><th>${L('Owner')}</th><th>${L('Priority')}</th><th>${L('Opened')}</th><th>${L('State')}</th></tr>`, bHead = `<tr><th>${L('Brief')}</th><th>${L('Requested by')}</th><th>${L('Channel')}</th><th>${L('Wanted by')}</th><th>${L('State')}</th></tr>`;
  const tbl = (h, rows) => `<div class="fm-scroll"><table class="tbl fm-tbl"><thead>${h}</thead><tbody>${rows}</tbody></table></div>`;
  const newBtns = isBoardP(m) ? '' : `<div class="ph-r"><a class="btn" href="#/it-requests/new/brief">${icon('sparkles')}${L('Content brief')}</a><a class="btn btn-pri" href="#/it-requests/new/it">${icon('settings')}${L('IT request')}</a></div>`;
  const accLink = `<p class="t-small hint">${icon('shield', 'ic-sm')} <a href="#/accounts-register">${L('Find who looks after an account and how to get access')}</a></p>`;
  if (!full) { const mi = db.mcit.it.filter(x => x.requester === m.id || unitLead(m, x.unit)), mb = db.mcit.briefs.filter(x => x.requester === m.id || unitLead(m, x.unit));
    return {crumb: cr, content: `<div class="page wide fm-page"><div class="ph"><div><h1 class="t-title">${L('Requests to MCIT')}</h1><p class="sub">${L('Ask IT for help with an account, the website or a tool, or ask Marketing for content. Never type passwords here.')}</p></div>${newBtns}</div>${accLink}
      ${mi.length ? `${sec(L('Your IT requests'), mi.length)}${tbl(iHead, mi.map(iRow).join(''))}` : ''}${mb.length ? `${sec(L('Your content briefs'), mb.length)}${tbl(bHead, mb.map(bRow).join(''))}` : ''}${!mi.length && !mb.length ? emptyBox(L('You have no requests yet'), L('Start an IT request or a content brief.')) : ''}</div>`}; }
  const its = db.mcit.it.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)), brs = db.mcit.briefs;
  const tabs = `<div class="tabs fm-tabs" role="tablist">${[['it', 'IT', its.filter(x => !['closed', 'cancelled'].includes(x.stage)).length], ['briefs', 'Briefs', brs.filter(b => b.state === 'submitted').length + hrRows.filter(pk => pk.state === 'requested').length]].map(([k, t, n]) => `<button class="${v === k ? 'on' : ''}" data-act="view" data-scope="mcreq" data-v="${k}" role="tab" aria-selected="${v === k}">${L(t)} <span class="n">${n}</span></button>`).join('')}</div>`;
  const body = v === 'it' ? tbl(iHead, its.map(iRow).join('')) : `${tbl(bHead, brs.map(bRow).join(''))}${hrRows.length ? `${sec(L('Publication requests from HR'), hrRows.length)}<div class="rows">${hrRows.map(pk => `<a class="row" href="#/recognition/${esc(pk.round)}">${icon('heart')}<div class="t"><b>${esc(pk.title)}</b><small>${L('Named receiver {who}. Needed by {d}. HR keeps grades and reasons; only the approved packet comes to MCIT.', {who: first(pk.receiver), d: fmtD(pk.neededBy)})}</small></div>${chip(BST[pk.state === 'fulfilled' || pk.state === 'accepted' ? 'accepted' : pk.state === 'returned' ? 'returned' : 'submitted'], '')}</a>`).join('')}</div>` : ''}`;
  return {crumb: cr, content: `<div class="page wide fm-page"><div class="ph"><div><h1 class="t-title">${L('Requests')}</h1><p class="sub">${L('IT help and content briefs from every unit. A request never authorizes a deployment or an access change by itself.')}</p></div>${newBtns}</div>${accLink}
    <div class="fm-bar">${tabs}${v === 'it' ? `<button class="btn btn-sm" data-act="mc-it-export">${icon('download')}${L('Export CSV')}</button>` : ''}</div>${body}${grantsBox(db.mcit.grants, ['triage', 'tech', 'review'])}</div>`};
}
function newItPage(kind) {
  const m = me(); kind = kind === 'brief' ? 'brief' : 'it'; const cr = crumb(MC, [['it-requests', L('Requests')], ['', kind === 'it' ? L('New IT request') : L('New content brief')]]);
  if (isBoardP(m)) return {crumb: cr, content: denied()};
  const d = draftOf(kind, 'mcit'), dv = (k, def = '') => d[k] != null ? d[k] : def, inD = k => `data-input="fm-draft" data-store="mcit" data-kind="${kind}" data-k="${k}"`;
  const seg = `<div class="seg fm-seg" role="radiogroup" aria-label="${esc(L('Request type'))}"><button class="${kind === 'it' ? 'on' : ''}" data-act="go" data-h="it-requests/new/it" role="radio" aria-checked="${kind === 'it'}">${L('IT')}</button><button class="${kind === 'brief' ? 'on' : ''}" data-act="go" data-h="it-requests/new/brief" role="radio" aria-checked="${kind === 'brief'}">${L('Content brief')}</button></div>`;
  const form = kind === 'it' ? `${note('warn', 'lock', L('Never type passwords, codes or tokens'), L('Describe the problem only. If access is the issue, IT routes you to the account custodian.'))}<div class="fm-form">
    <div class="fm-2">${field('mc-i-type', L('Kind of help'), `<select class="input" id="mc-i-type" ${inD('type')}>${opts(Object.keys(ITYPE).map(k => [k, L(ITYPE[k])]), dv('type', 'access'))}</select>`, '', true)}${field('mc-i-svc', L('Service'), `<select class="input" id="mc-i-svc" ${inD('service')}>${opts(db.mcit.accounts.filter(a => !a.hidden).map(a => [a.id, a.service]), dv('service'), L('Not listed'))}</select>`)}</div>
    ${field('mc-i-title', L('Title'), inp('mc-i-title', dv('title'), inD('title')), '', true)}${field('mc-i-sym', L('What happens'), txa('mc-i-sym', dv('symptom'), inD('symptom')), '', true)}${field('mc-i-exp', L('What should happen'), txa('mc-i-exp', dv('expected'), inD('expected')), '', true)}
    <div class="fm-2">${field('mc-i-imp', L('Who is affected'), `<select class="input" id="mc-i-imp" ${inD('impact')}>${opts([['one', L('Only me')], ['team', L('My team')], ['all', L('Everyone or the public')]], dv('impact', 'one'))}</select>`)}${field('mc-i-ev', L('Screenshot or evidence link'), inp('mc-i-ev', dv('evidence'), inD('evidence') + ' placeholder="https://"'), L('A safe screenshot. Crop out personal data.'))}</div>
    ${field('mc-i-steps', L('Steps to see it'), txa('mc-i-steps', dv('steps'), inD('steps')))}</div>`
    : `<div class="fm-form">${field('mc-b-title', L('Title'), inp('mc-b-title', dv('title'), inD('title')), '', true)}${field('mc-b-purpose', L('Purpose'), txa('mc-b-purpose', dv('purpose'), inD('purpose')), '', true)}
    <div class="fm-2">${field('mc-b-aud', L('Audience'), inp('mc-b-aud', dv('audience'), inD('audience')))}${field('mc-b-ch', L('Channel'), `<select class="input" id="mc-b-ch" ${inD('channel')}>${opts(Object.keys(CH).map(k => [k, CH[k]]), dv('channel', 'instagram'))}</select>`)}</div>
    <div class="fm-2">${field('mc-b-del', L('Deliverable'), inp('mc-b-del', dv('deliverable'), inD('deliverable') + ` placeholder="${esc(L('One carousel, four slides'))}"`), '', true)}${field('mc-b-date', L('Wanted by'), `<input type="date" class="input" id="mc-b-date" value="${esc(dv('desired'))}" ${inD('desired')}>`, L('A wish, not an agreed date. MCIT confirms when it accepts.'), true)}</div>
    ${field('mc-b-src', L('Source material'), txa('mc-b-src', dv('sources'), inD('sources')), L('Facts, photos with consent, approved wording. Links only.'))}${field('mc-b-appr', L('Approving owner in your unit'), `<select class="input" id="mc-b-appr" ${inD('approver')}>${pOpts(db.people.filter(p => p.status === 'active' && p.div === m.div && rank(p) >= 2).map(p => p.id), dv('approver'), L('Choose'))}</select>`)}</div>`;
  return {crumb: cr, content: `<div class="page fm-page"><div class="ph"><div><h1 class="t-title">${kind === 'it' ? L('New IT request') : L('New content brief')}</h1><p class="sub">${kind === 'it' ? L('IT triages it, names an owner and links the work. You confirm whether it is solved.') : L('MCIT checks it is complete, then accepts it as a content item or returns it with a reason.')}</p></div>${seg}</div>${form}
    <div class="acts fm-acts"><button class="btn btn-pri" data-act="mc-new-submit" data-kind="${kind}">${L('Submit request')}</button>${d._at ? `<span class="t-caption fm-saved">${L('Draft saved {t}', {t: d._at.slice(11, 16)})}</span>` : '<span class="t-caption fm-saved"></span>'}</div></div>`};
}
function itPage(x) {
  const m = me(), cr = crumb(MC, [['it-requests', L('Requests')], ['', x.title]]), f = ui.form || '', req = x.requester === m.id, tri = MG('triage'), tech = MG('tech') || x.owner === m.id, board = isBoardP(m), acc = accOf(x.service);
  const next = {new: [db.mcit.grants.triage[0], L('IT triages it and names an owner. No response time is promised.')], triaged: [x.owner, L('{who} plans the work.', {who: first(x.owner)})], working: [x.owner, L('{who} is working on it.', {who: first(x.owner)})], waiting: [x.blocker ? x.owner : x.requester, x.blocker ? L('Blocked: {r}', {r: x.blocker.action}) : L('Waiting for your answer.')],
    resolved: [x.requester, L('{who} confirms it is solved or reopens it.', {who: first(x.requester)})], closed: [null, L('Closed after the requester confirmed it.')], reopened: [x.owner, L('Reopened with new facts. {who} looks again.', {who: first(x.owner)})], cancelled: [null, L('Canceled. The history stays.')]}[x.stage];
  const head = `<div class="ph"><div><h1 class="t-title">${esc(x.title)}</h1><p class="sub">${L(ITYPE[x.type])}${acc && seeAcc(acc) ? ` · ${esc(acc.service)}` : ''}</p></div><div class="ph-r">${chip(IT[x.stage], 'pill-o')}</div></div>`;
  const info = meta([[L('Created by'), byAt(x.createdBy, x.createdAt)], [L('Requester'), who(x.requester)], [L('Unit'), esc(unitName(x.unit))], [L('Owner'), who(x.owner)], [L('Priority'), x.priority ? esc(L(PRIO[x.priority])) : `<span class="t-mute">${L('Not triaged')}</span>`],
    [L('Service'), acc && seeAcc(acc) ? `<a href="#/accounts-register">${esc(acc.service)}</a> · ${L('custodian')} ${acc.custodian ? who(acc.custodian) : `<span class="tag tag-unknown">${L('Unknown')}</span>`}` : `<span class="t-mute">${L('Not listed')}</span>`], [L('Who is affected'), esc(L({one: 'Only me', team: 'My team', all: 'Everyone or the public'}[x.impact] || 'Only me'))],
    [L('What happens'), nl(x.symptom)], [L('What should happen'), nl(x.expected)], x.steps ? [L('Steps to see it'), nl(x.steps)] : null, x.evidence ? [L('Evidence'), linkOut(x.evidence.label, x.evidence.url)] : null]);
  const triage = ['new', 'reopened'].includes(x.stage) && tri && !board ? `${sec(L('Triage'), null)}<div class="fm-2">${field('mc-t-owner', L('Owner'), `<select class="input" id="mc-t-owner">${pOpts([...new Set([...db.mcit.grants.tech, ...db.mcit.grants.triage])], x.owner || db.mcit.grants.tech[0])}</select>`)}${field('mc-t-prio', L('Priority'), `<select class="input" id="mc-t-prio">${opts(Object.keys(PRIO).map(k => [k, L(PRIO[k])]), x.priority || 'medium')}</select>`, L('Priority is not a response-time promise.'))}</div>
    <div class="acts"><button class="btn btn-pri" data-act="mc-it-triage" data-id="${x.id}">${L('Assign')}</button><button class="btn" data-act="fm-form" data-f="i-ask">${L('Ask for information')}</button></div>${f === 'i-ask' ? `${field('mc-ask-q', L('What do you need to know?'), txa('mc-ask-q', '', 'data-autofocus'), '', true)}<div class="acts"><button class="btn btn-pri" data-act="mc-it-ask" data-id="${x.id}">${L('Send question')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>` : ''}` : '';
  const qa = x.info.length ? `${sec(L('Questions'), x.info.length)}${x.info.map((q, i) => `<div class="quiet fm-box"><p class="t-small t-mute">${byAt(q.by, q.at)}</p><p>${nl(q.q)}</p>${q.a ? `<p class="fm-ans"><b>${L('Answer')}</b> ${nl(q.a)}</p>` : req && !board ? `${field(`mc-ans-${i}`, L('Your answer'), txa(`mc-ans-${i}`, '', 'data-autofocus'), L('Never paste passwords or codes.'), true)}<div class="acts"><button class="btn btn-pri" data-act="mc-it-answer" data-id="${x.id}" data-i="${i}">${L('Send answer')}</button></div>` : `<p class="t-small t-mute">${L('Waiting for the requester.')}</p>`}</div>`).join('')}` : '';
  const tasks = x.tasks.map(taskOf).filter(Boolean);
  const work = !['new', 'cancelled'].includes(x.stage) ? `${sec(L('Linked work'), tasks.length)}${tasks.length ? `<div class="rows">${tasks.map(t => `<div class="row" data-act="open-task" data-id="${t.id}" tabindex="0">${av(t.owner, 'av-sm')}<div class="t"><b>${esc(t.title)}</b><small>${esc(first(t.owner))}${t.due ? ` · ${esc(dShort(t.due))}` : ''}</small></div>${taskState(t, true)}</div>`).join('')}</div>` : `<p class="t-small t-mute">${L('No task linked yet.')}</p>`}
    ${(tech || tri) && !board && !['closed', 'resolved'].includes(x.stage) ? (f === 'i-task' ? `<div class="quiet fm-box"><div class="fm-2">${field('mc-k-title', L('Task'), inp('mc-k-title', '', 'data-autofocus'), '', true)}${field('mc-k-due', L('Due'), `<input type="date" class="input" id="mc-k-due" value="${addDays(today(), 2)}">`)}</div><div class="acts"><button class="btn btn-pri" data-act="mc-it-task" data-id="${x.id}">${L('Create task')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div><p class="t-small t-mute">${L('One task, linked here. It shows in the owner’s My Work.')}</p></div>` : `<div class="acts"><button class="btn" data-act="fm-form" data-f="i-task">${icon('plus')}${L('Create linked task')}</button></div>`) : ''}` : '';
  const blk = x.blocker ? `<div class="notice n-warn"><i class="n-ic" style="--m:${maskUrl(A.ui.warning)}"></i><div><b>${L('Blocked')}</b><p>${esc(x.blocker.text)}</p><p>${L('Next action: {a}', {a: x.blocker.action})} · ${esc(pname(x.blocker.by))}, ${esc(fmtDT(x.blocker.at))}</p></div>${(tech || tri) && !board ? `<div class="acts"><button class="btn btn-sm" data-act="mc-it-unblock" data-id="${x.id}">${L('Blocker cleared')}</button></div>` : ''}</div>`
    : (tech || tri) && !board && ['triaged', 'working', 'reopened'].includes(x.stage) ? (f === 'i-blk' ? `<div class="quiet fm-box">${field('mc-b-text', L('What blocks the work'), txa('mc-b-text', '', 'data-autofocus'), '', true)}${field('mc-b-act', L('Action needed'), inp('mc-b-act'), '', true)}<div class="acts"><button class="btn btn-pri" data-act="mc-it-block" data-id="${x.id}">${L('Record blocker')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>` : `<div class="acts"><button class="btn btn-ghost" data-act="fm-form" data-f="i-blk">${L('Record a blocker')}</button></div>`) : '';
  const res = x.resolution ? `${sec(L('Resolution'), null)}<div class="quiet fm-box"><p>${nl(x.resolution.text)}</p>${meta([[L('Recorded by'), byAt(x.resolution.by, x.resolution.at)], x.resolution.url ? [L('Evidence'), linkOut(L('Fix evidence'), x.resolution.url)] : null, x.resolution.version ? [L('Version'), esc(x.resolution.version)] : null])}<p class="t-small t-mute">${L('A closed request is not a security test result.')}</p></div>` : '';
  const resolveForm = tech && !board && ['working', 'triaged', 'reopened'].includes(x.stage) && !x.blocker ? (f === 'i-res' ? `<div class="quiet fm-box">${field('mc-r-text', L('What was done'), txa('mc-r-text', '', 'data-autofocus'), L('Changes to live systems follow the release steps outside this request.'), true)}<div class="fm-2">${field('mc-r-url', L('Evidence link'), inp('mc-r-url', '', 'placeholder="https://"'))}${field('mc-r-ver', L('Version or change reference'), inp('mc-r-ver'))}</div><div class="acts"><button class="btn btn-pri" data-act="mc-it-resolve" data-id="${x.id}">${L('Mark resolved')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>` : `<div class="acts"><button class="btn btn-pri" data-act="fm-form" data-f="i-res">${icon('check')}${L('Mark resolved')}</button></div>`) : '';
  const confirm = x.stage === 'resolved' && req ? `${sec(L('Is it solved?'), null)}${f === 'i-reopen' ? `${field('mc-o-why', L('What still happens'), txa('mc-o-why', '', 'data-autofocus'), L('New facts help IT. The request keeps its history.'), true)}<div class="acts"><button class="btn btn-danger" data-act="mc-it-reopen" data-id="${x.id}">${L('Reopen')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>`
    : `<div class="acts"><button class="btn btn-pri" data-act="mc-it-confirm" data-id="${x.id}">${icon('check')}${L('Yes, it is solved')}</button><button class="btn" data-act="fm-form" data-f="i-reopen">${L('No, reopen it')}</button></div>`}` : x.confirm ? `<p class="t-small">${chip(['Confirmed solved', 'check', 'green'], '')} ${byAt(x.confirm.by, x.confirm.at)}${x.confirm.note ? ` · ${esc(x.confirm.note)}` : ''}</p>` : '';
  const priv = `${sec(L('IT notes'), null)}${itPriv() ? (x.priv ? `<p>${nl(x.priv)}</p>` : `<p class="t-small t-mute">${L('No notes.')}</p>`) : locked(L('Restricted to IT'))}`;
  const cancel = req && ['new', 'triaged'].includes(x.stage) ? `<div class="acts fm-foot"><button class="btn btn-ghost" data-act="mc-it-cancel" data-id="${x.id}">${L('Cancel request')}</button></div>` : '';
  const hist = `${sec(L('History'), x.history.length)}<div class="fm-hist">${x.history.slice().reverse().map(h => `<div class="fm-hist-r">${av(h.by, 'av-xs')}<span><b>${esc(first(h.by))}</b> ${esc(L(h.what, h.v))}</span><time>${esc(fmtDT(h.at))}</time></div>`).join('')}</div>`;
  return {crumb: cr, content: `<div class="page fm-page">${head}${steps(['New', 'Triaged', 'Working', 'Resolved', 'Closed'], {new: 0, reopened: 2, triaged: 1, working: 2, waiting: 2, resolved: 3, closed: 5}[x.stage] ?? 0)}<div class="fm-next">${icon('flag', 'ic-sm')}<div><b>${L('Next')}</b><span>${next[0] ? `${who(next[0])} ` : ''}${esc(next[1])}</span></div></div>${blk}${info}${triage}${qa}${work}${res}${resolveForm}${confirm}${priv}${hist}${cancel}</div>`};
}
function briefPage(b) {
  const m = me(), cr = crumb(MC, [['it-requests', L('Requests')], ['', b.title]]), f = ui.form || '', lead = (mcLead(m) || MG('review')) && !isBoardP(m), req = b.requester === m.id, ct = b.content && ctOf(b.content);
  return {crumb: cr, content: `<div class="page fm-page"><div class="ph"><div><h1 class="t-title">${esc(b.title)}</h1><p class="sub">${L('Content brief from {u}', {u: unitName(b.unit)})}</p></div><div class="ph-r">${chip(BST[b.state], 'pill-o')}</div></div>
    ${b.state === 'returned' ? note('warn', 'undo', L('Returned'), esc(b.returnNote)) : ''}
    ${meta([[L('Created by'), byAt(b.createdBy, b.createdAt)], [L('Requester'), who(b.requester)], [L('Approving owner'), who(b.approver)], [L('Purpose'), nl(b.purpose)], [L('Audience'), esc(b.audience || L('Not given'))], [L('Channel'), esc(chName(b.channel))], [L('Deliverable'), esc(b.deliverable)], [L('Wanted by'), `${neededTag(b.desired)} <span class="t-small t-mute">${L('Not agreed until MCIT accepts.')}</span>`], [L('Source material'), nl(b.sources || L('Not given'))], ct ? [L('Content item'), `<a href="#/content/${ct.id}">${esc(ct.title)}</a> ${chip(CST[ct.stage], '')}`] : null])}
    ${b.state === 'submitted' && lead ? (f === 'b-ret' ? `${field('mc-br-why', L('What is missing'), txa('mc-br-why', '', 'data-autofocus'), L('Return unclear briefs instead of promising a date.'), true)}<div class="acts"><button class="btn btn-pri" data-act="mc-b-return" data-id="${b.id}">${L('Return')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div>`
      : `<div class="acts"><a class="btn btn-pri" href="#/content/new/${b.id}">${L('Accept and create content')}</a><button class="btn" data-act="fm-form" data-f="b-ret">${L('Return')}</button></div>`) : ''}
    ${b.state === 'returned' && req ? `${field('mc-br-ans', L('Your answer'), txa('mc-br-ans', '', 'data-autofocus'), '', true)}<div class="acts"><button class="btn btn-pri" data-act="mc-b-resubmit" data-id="${b.id}">${L('Send again')}</button></div>` : ''}</div>`};
}

// ---------- Accounts register (marketing_account_register, integration-credentials, access_hidden_it, S045) ----------
function accountsPage() {
  ensureMc(); const m = me(); useWs(MC); const cr = crumb(MC, [['accounts-register', L('Accounts')]]), q = (ui.mcAccQ || '').toLowerCase(), f = ui.form || '';
  const list = db.mcit.accounts.filter(seeAcc).filter(a => !q || `${a.service} ${a.purpose} ${pname(a.custodian)}`.toLowerCase().includes(q));
  const stOf = a => !a.custodian ? 'unknown' : !a.verifiedAt || daysBetween(a.verifiedAt, today()) > 90 ? 'unverified' : 'verified', canCust = MG('custody') || m.admin;
  const row = a => `<div class="sheet fm-acc"><div class="fm-between"><div><b>${esc(a.service)}</b>${a.hidden ? ` <span class="tag tag-ink">${L('Hidden account')}</span>` : ''}<p class="t-small t-mute">${esc(a.purpose)}</p></div>${chip(ACST[stOf(a)])}</div>
    ${meta([[L('Custodian'), a.custodian ? who(a.custodian) : `<span class="tag tag-unknown">${L('Unknown')}</span>`], [L('Backup'), a.backup ? who(a.backup) : '–'], [L('How to get access'), esc(a.access)], [L('Vault entry'), a.vault ? `${esc(a.vault)} <span class="t-small t-mute">${L('(name only)')}</span>` : `<span class="t-mute">${L('None')}</span>`], a.renewal ? [L('Renewal'), esc(fmtD(a.renewal))] : null, [L('Last verified'), a.verifiedAt ? `${esc(fmtD(a.verifiedAt))} ${who(a.verifiedBy)}` : `<span class="t-mute">${L('Never')}</span>`], a.request && itOf(a.request) ? [L('Open request'), `<a href="#/it-requests/${a.request}">${esc(itOf(a.request).title)}</a>`] : null])}
    <div class="acts">${!isBoardP(m) && !a.hidden ? `<button class="btn btn-sm" data-act="mc-acc-req" data-id="${a.id}">${L('Request access')}</button>` : ''}${canCust && a.custodian ? `<button class="btn btn-sm btn-ghost" data-act="mc-acc-verify" data-id="${a.id}">${L('Confirm custodian')}</button>` : ''}${canCust ? `<button class="btn btn-sm btn-ghost" data-act="fm-form" data-f="acc-${a.id}">${L('Change custodian')}</button>` : ''}</div>
    ${f === `acc-${a.id}` ? `<div class="quiet fm-box"><div class="fm-2">${field('mc-ac-who', L('New custodian'), `<select class="input" id="mc-ac-who">${pOpts(db.people.filter(p => p.status === 'active' && p.div).map(p => p.id), a.custodian || '')}</select>`)}${field('mc-ac-why', L('Handover note'), inp('mc-ac-why', '', 'data-autofocus'), L('Ownership is verified in the provider. No password is copied here.'), true)}</div><div class="acts"><button class="btn btn-pri" data-act="mc-acc-change" data-id="${a.id}">${L('Save custodian')}</button><button class="btn btn-ghost" data-act="fm-form" data-f="">${L('Cancel')}</button></div></div>` : ''}</div>`;
  return {crumb: cr, content: `<div class="page fm-page"><div class="ph"><div><h1 class="t-title">${L('Accounts register')}</h1><p class="sub">${L('Who looks after each organization account and how to get access.')}</p></div></div>
    ${note('info', 'lock', L('No passwords here'), L('Passwords, recovery codes and tokens are never stored in this register, in search or in exports. Logins live in the organization password manager.'))}
    <label class="search fm-search">${icon('search')}<input id="mc-acc-q" value="${esc(ui.mcAccQ || '')}" placeholder="${esc(L('Search accounts or custodians'))}" aria-label="${esc(L('Search accounts or custodians'))}"></label>
    <div class="fm-accs">${list.map(row).join('') || emptyBox(L('No account matches'), L('Try another name, or ask in Requests to MCIT.'))}</div>${grantsBox(db.mcit.grants, ['custody', 'triage'])}</div>`};
}

// ---------- MCIT actions ----------
const mcUndo = (find, msg, link) => mkUndo('mcit', find, msg, MC, link);
Object.assign(ACT, {
  'mc-day': el => { ui.mcDay = el.dataset.d; render(); },
  'mc-month': el => { ui.mcMonth = el.dataset.m; ui.mcDay = el.dataset.m === today().slice(0, 7) ? today() : `${el.dataset.m}-01`; render(); },
  'mc-c-create': el => { const m = me(); if (!canMakeContent(m)) return; const title = $v('#mc-n-title'), chs = $$('input[name="mc-n-ch"]:checked').map(i => i.value), plan = $v('#mc-n-plan'), time = $v('#mc-n-time') || '19:00', ex = $v('#mc-n-exec'), rv = $v('#mc-n-rev'), due = $v('#mc-n-due'), asset = $v('#mc-n-asset');
    $$('.fm-form .field.invalid').forEach(x => x.classList.remove('invalid'));
    if (!title) return bad('#mc-n-title', L('Give the content a title.')); if (!chs.length) return toast(L('Choose at least one channel.')); if (!okDate(plan)) return bad('#mc-n-plan', L('Choose the planned publication date.')); if (!/^\d{2}:\d{2}$/.test(time)) return bad('#mc-n-time', L('Use HH:MM, for example 19:00.'));
    if (!ex) return bad('#mc-n-exec', L('Choose the executor.')); if (!okDate(due)) return bad('#mc-n-due', L('Choose the internal due date.')); if (asset && !safeUrl(asset)) return bad('#mc-n-asset', L('Links must start with https://.'));
    if (ex === rv) return bad('#mc-n-rev', L('The reviewer must be someone other than the executor.'));
    const b = el.dataset.brief && brOf(el.dataset.brief), c = {id: uid('ct-'), title, campaign: $v('#mc-n-cmp') || null, kind: $v('#mc-n-kind') || L('Post'), channels: chs.map(k => ({ch: k, planned: `${plan}T${time}`, pub: null, failed: null})), executor: ex, reviewer: rv, due, stage: 'idea', approvedV: null, versions: [], brief: $v('#mc-n-brief'), assets: asset ? [{label: L('Asset'), url: asset}] : [], task: null, corrections: [], fromBrief: b ? b.id : null, history: [], createdBy: m.id, createdAt: nowStamp()};
    hist(c, 'Created'); db.mcit.content.push(c); logChange(MC, 'created content', cLink(c)); upd(ex, 'mc-assigned', c.title, `content/${c.id}`);
    if (b) { b.state = 'accepted'; b.content = c.id; b.acceptedBy = m.id; b.acceptedAt = nowStamp(); upd(b.requester, 'mc-brief-reply', b.title, `it-requests/${b.id}`); if (b.unit !== MC) logChange(b.unit, 'had a content brief accepted by MCIT', tgt(b.id, b.title, `it-requests/${b.id}`)); }
    save(); go(`content/${c.id}`); toast(L('Content created. {who} was told.', {who: first(ex)})); },
  'mc-c-start': (el, id) => { const c = ctOf(id); if (!c || c.stage !== 'idea') return; const u = mcUndo(() => ctOf(id), L('Drafting'), cLink(c)); c.stage = 'drafting'; hist(c, 'Drafting started'); logChange(MC, 'started drafting', cLink(c), 'Idea', 'Drafting'); done(L('Drafting started'), u); },
  'mc-c-ver': (el, id) => { const c = ctOf(id), label = $v('#mc-v-label'), url = $v('#mc-v-url'); if (!c || c.executor !== session.me) return; if (!label) return bad('#mc-v-label', L('Say what changed.')); if (!safeUrl(url)) return bad('#mc-v-url', L('Paste the https link to this version.'));
    const u = mcUndo(() => ctOf(id), L('Version'), cLink(c)), v = (cLatest(c) ? cLatest(c).v : 0) + 1, prev = c.stage; c.versions.push({v, label, url, by: session.me, at: nowStamp(), decision: null}); c.stage = 'review';
    hist(c, c.approvedV ? 'Version {v} sent for review; the version {a} approval does not carry over' : 'Version {v} sent for review', {v, a: c.approvedV}); logChange(MC, c.approvedV ? 'sent a new version for review' : 'sent a version for review', cLink(c), CST[prev][0], 'In review');
    upd(c.reviewer, 'mc-review', `${c.title}, v${v}`, `content/${c.id}`); done(c.approvedV ? L('Version {v} sent. The earlier approval is now stale.', {v}) : L('Version {v} sent to {who}', {v, who: first(c.reviewer)}), u); },
  'mc-c-decide': (el, id) => { const c = ctOf(id), o = el.dataset.o, v = +el.dataset.v, lv = c && cLatest(c), why = $v('#mc-rv-why'); if (!c || !MG('review') || c.stage !== 'review') return;
    if (!lv || lv.v !== v) { toast(L('Version {v} was replaced. Nothing was recorded; review the current version.', {v})); return render(); }
    if (lv.by === session.me) return toast(L('You made this version, so another reviewer decides.')); if (o === 'revision' && !why) return bad('#mc-rv-why', L('Say what must change.'));
    const u = mcUndo(() => ctOf(id), L('Review'), cLink(c)); lv.decision = {kind: o, by: session.me, at: nowStamp(), reason: why};
    if (o === 'approved') { c.approvedV = v; c.stage = c.channels.some(ch => ch.pub) ? 'scheduled' : 'approved'; hist(c, 'Version {v} approved', {v}); }
    else { c.stage = 'revision'; hist(c, 'Changes requested on version {v}', {v}); const t = addTask(L('Revise {t} (v{v})', {t: c.title, v}), {owner: c.executor, due: c.due && c.due >= today() ? c.due : addDays(today(), 2), div: MC, notes: why}); if (t) { c.revTasks = (c.revTasks || []).concat(t.id); upd(c.executor, 'mc-revise', c.title, `content/${c.id}`); } }
    logChange(MC, o === 'approved' ? 'approved a version of' : 'requested changes on', cLink(c), 'In review', CST[c.stage][0]); if (o === 'approved') upd(c.executor, 'mc-approved', `${c.title}, v${v}`, `content/${c.id}`);
    done(o === 'approved' ? L('Version {v} approved', {v}) : L('Changes requested. A revision task went to {who}.', {who: first(c.executor)}), o === 'approved' ? u : undefined); },
  'mc-c-sched': (el, id) => { const c = ctOf(id); if (!c || !MG('publish') || c.stage !== 'approved' || stale(c)) return; const u = mcUndo(() => ctOf(id), L('Scheduled'), cLink(c)); c.stage = 'scheduled'; hist(c, 'Scheduled version {v}', {v: c.approvedV});
    logChange(MC, 'scheduled', cLink(c), 'Approved', 'Scheduled'); upd(c.executor, 'mc-sched', c.title, `content/${c.id}`); done(L('Scheduled. Record each channel after it is posted.'), u); },
  'mc-c-pub': (el, id) => { const c = ctOf(id), ch = c && c.channels[+el.dataset.ch]; if (!ch || !MG('publish') || ch.pub) return; if (stale(c) || !c.approvedV) return toast(L('The current version is not approved. Only an approved version can be recorded as published.'));
    const basis = $v('#mc-p-basis') || 'url', url = $v('#mc-p-url'), date = $v('#mc-p-date'), time = $v('#mc-p-time'), n = $v('#mc-p-note');
    if (basis === 'url' && !safeUrl(url)) return bad('#mc-p-url', L('Paste the https link to the public post.')); if (basis === 'attest' && !n) return bad('#mc-p-note', L('Say who saw it and where.'));
    if (!okDate(date) || !/^\d{2}:\d{2}$/.test(time) || `${date}T${time}` > nowStamp()) return bad('#mc-p-date', L('Use the actual publication time, not a future one.'));
    const u = mcUndo(() => ctOf(id), L('Publication'), cLink(c)); ch.pub = {url: basis === 'url' ? url : '', at: `${date}T${time}`, by: session.me, basis, v: c.approvedV, note: n, recordedAt: nowStamp()}; ch.failed = null;
    hist(c, 'Publication recorded on {ch}', {ch: chName(ch.ch)}); if (c.channels.every(x => x.pub)) { c.stage = 'published'; hist(c, 'Published on every channel'); }
    logChange(MC, 'recorded a publication for', cLink(c), null, chName(ch.ch)); done(c.stage === 'published' ? L('Published on every channel') : L('Recorded on {ch}. {n} channel still open.', {ch: chName(ch.ch), n: c.channels.filter(x => !x.pub).length}), u); },
  'mc-c-fail': (el, id) => { const c = ctOf(id), ch = c && c.channels[+el.dataset.ch], why = $v('#mc-f-why'); if (!ch || !MG('publish')) return; if (!why) return bad('#mc-f-why', L('Say what went wrong.'));
    const t = addTask(L('Retry {t} on {ch}', {t: c.title, ch: chName(ch.ch)}), {owner: c.executor, due: addDays(today(), 1), div: MC, notes: why}); ch.failed = {reason: why, by: session.me, at: nowStamp(), task: t ? t.id : null};
    hist(c, 'Publication failed on {ch}', {ch: chName(ch.ch)}); logChange(MC, 'recorded a failed publication for', cLink(c)); upd(c.executor, 'mc-retry', c.title, `content/${c.id}`); done(L('Failure recorded. A follow-up task went to {who}.', {who: first(c.executor)})); },
  'mc-c-date': (el, id) => { const c = ctOf(id), ch = c && c.channels[+el.dataset.ch], d = $v('#mc-d-date'), t = $v('#mc-d-time'), why = $v('#mc-d-why'); if (!ch || !MG('publish') || ch.pub) return;
    if (!okDate(d) || !/^\d{2}:\d{2}$/.test(t)) return bad('#mc-d-date', L('Choose a date and a time.')); if (!why) return bad('#mc-d-why', L('Give the reason.'));
    const u = mcUndo(() => ctOf(id), L('Planned date'), cLink(c)), from = ch.planned; ch.planned = `${d}T${t}`; hist(c, 'Planned date on {ch} moved: {r}', {ch: chName(ch.ch), r: why});
    logChange(MC, 'moved the planned date of', cLink(c), fmtDT(from), fmtDT(ch.planned)); upd(c.executor, 'mc-date', c.title, `content/${c.id}`); upd(c.reviewer, 'mc-date', c.title, `content/${c.id}`); done(L('Planned date moved. Approval and history are unchanged.'), u); },
  'mc-c-corr': (el, id) => { const c = ctOf(id), why = $v('#mc-k-why'), url = $v('#mc-k-url'); if (!c || !MG('publish')) return; if (!why) return bad('#mc-k-why', L('Say what changed and why.')); if (url && !safeUrl(url)) return bad('#mc-k-url', L('Links must start with https://.'));
    const u = mcUndo(() => ctOf(id), L('Correction'), cLink(c)); c.corrections.push({reason: why, url, by: session.me, at: nowStamp()}); hist(c, 'Correction or takedown recorded'); logChange(MC, 'recorded a correction on', cLink(c)); done(L('Correction recorded'), u); },
  'mc-c-cancel': (el, id) => { const c = ctOf(id), why = $v('#mc-x-why'); if (!c) return; if (!why) return bad('#mc-x-why', L('Give a reason.')); const u = mcUndo(() => ctOf(id), L('Canceled'), cLink(c)), prev = c.stage;
    c.stage = 'cancelled'; c.cancel = {reason: why, by: session.me, at: nowStamp()}; hist(c, 'Canceled: {r}', {r: why}); logChange(MC, 'canceled', cLink(c), CST[prev][0], 'Canceled'); upd(c.executor, 'mc-cancel', c.title, `content/${c.id}`); done(L('Content canceled'), u); },
  'mc-export': () => { if (!mcFull(me())) return;
    csv(`dwdg-mcit-content-${today()}.csv`, ['id', 'title', 'campaign', 'channel', 'executor', 'internal_due', 'planned_publication', 'actual_publication', 'evidence_url', 'approved_version', 'latest_version', 'state'],
      db.mcit.content.flatMap(c => c.channels.map(ch => [c.id, c.title, (cmpOf(c.campaign) || {}).name || '', chName(ch.ch), pname(c.executor), c.due || '', ch.planned, ch.pub ? ch.pub.at : 'not recorded', ch.pub ? ch.pub.url : '', c.approvedV || '', (cLatest(c) || {}).v || '', c.stage])));
    logChange(MC, 'exported content records', tgt('content', L('Content'), 'content')); save(); toast(L('Content exported. Planned and actual dates stay in separate columns.')); },
  'mc-it-export': () => { if (!mcFull(me())) return;
    csv(`dwdg-mcit-it-${today()}.csv`, ['id', 'title', 'type', 'service', 'requester_unit', 'owner', 'priority', 'state', 'opened', 'resolved'], db.mcit.it.map(x => [x.id, x.title, x.type, (accOf(x.service) && !accOf(x.service).hidden ? accOf(x.service).service : ''), x.unit, pname(x.owner), x.priority || '', x.stage, x.createdAt, x.resolution ? x.resolution.at : '']));
    logChange(MC, 'exported IT requests', tgt('it-requests', L('Requests'), 'it-requests')); save(); toast(L('IT requests exported. Notes and credentials are never included.')); },
  'mc-new-submit': el => { const kind = el.dataset.kind, m = me(), d = draftOf(kind, 'mcit'); $$('.fm-form .field.invalid').forEach(x => x.classList.remove('invalid'));
    if (d._made && (itOf(d._made) || brOf(d._made))) { const id = d._made; db.mcit.drafts[m.id][kind] = {}; save(); return go(`it-requests/${id}`); }
    if (kind === 'it') { const title = $v('#mc-i-title'), sym = $v('#mc-i-sym'), exp = $v('#mc-i-exp'), ev = $v('#mc-i-ev'), steps0 = $v('#mc-i-steps');
      if (!title) return bad('#mc-i-title', L('Give the request a title.')); if (!sym) return bad('#mc-i-sym', L('Say what happens.')); if (!exp) return bad('#mc-i-exp', L('Say what should happen.')); if (ev && !safeUrl(ev)) return bad('#mc-i-ev', L('Links must start with https://.'));
      if (hasSecret(title, sym, exp, steps0)) return bad('#mc-i-sym', L('This looks like a password or code. Remove it; IT never needs it here.'));
      if (failSave()) return toast(L('Could not submit. Your draft is kept here; try again.'));
      const x = {id: uid('it-'), title, type: $v('#mc-i-type') || 'access', service: $v('#mc-i-svc') || null, symptom: sym, expected: exp, impact: $v('#mc-i-imp') || 'one', steps: steps0, evidence: ev ? {label: L('Screenshot'), url: ev} : null, requester: m.id, unit: m.div, owner: null, priority: null, stage: 'new', tasks: [], info: [], blocker: null, resolution: null, confirm: null, priv: '', history: [], createdBy: m.id, createdAt: nowStamp()};
      hist(x, 'Submitted'); db.mcit.it.push(x); d._made = x.id; db.mcit.drafts[m.id][kind] = {}; logChange(MC, 'received an IT request', iLink(x)); if (m.div && m.div !== MC) logChange(m.div, 'sent an IT request to MCIT', iLink(x));
      db.mcit.grants.triage.forEach(p => upd(p, 'mc-it-new', x.title, `it-requests/${x.id}`)); save(); go(`it-requests/${x.id}`); toast(L('Request sent to IT'));
    } else { const title = $v('#mc-b-title'), purpose = $v('#mc-b-purpose'), del = $v('#mc-b-del'), date = $v('#mc-b-date');
      if (!title) return bad('#mc-b-title', L('Give the brief a title.')); if (!purpose) return bad('#mc-b-purpose', L('Say what it is for.')); if (!del) return bad('#mc-b-del', L('Say what you need delivered.')); if (!okDate(date)) return bad('#mc-b-date', L('Choose the date you would like it by.'));
      const b = {id: uid('br-'), title, unit: m.div, requester: m.id, purpose, audience: $v('#mc-b-aud'), channel: $v('#mc-b-ch') || 'instagram', deliverable: del, desired: date, sources: $v('#mc-b-src'), approver: $v('#mc-b-appr') || null, state: 'submitted', content: null, returnNote: '', createdBy: m.id, createdAt: nowStamp()};
      db.mcit.briefs.push(b); d._made = b.id; db.mcit.drafts[m.id][kind] = {}; logChange(MC, 'received a content brief', tgt(b.id, b.title, `it-requests/${b.id}`)); db.mcit.grants.review.forEach(p => upd(p, 'mc-brief', b.title, `it-requests/${b.id}`)); save(); go(`it-requests/${b.id}`); toast(L('Brief sent to MCIT')); } },
  'mc-b-return': (el, id) => { const b = brOf(id), why = $v('#mc-br-why'); if (!b) return; if (!why) return bad('#mc-br-why', L('Say what is missing.')); b.state = 'returned'; b.returnNote = why; b.returnedBy = session.me; logChange(MC, 'returned a content brief', tgt(b.id, b.title, `it-requests/${b.id}`)); upd(b.requester, 'mc-brief-reply', b.title, `it-requests/${b.id}`); done(L('Returned to {who}', {who: first(b.requester)})); },
  'mc-b-resubmit': (el, id) => { const b = brOf(id), a = $v('#mc-br-ans'); if (!b || b.requester !== session.me) return; if (!a) return bad('#mc-br-ans', L('Write your answer.')); b.sources = `${b.sources}\n${L('Answer')}: ${a}`; b.state = 'submitted'; b.returnNote = ''; logChange(MC, 'received an updated content brief', tgt(b.id, b.title, `it-requests/${b.id}`)); upd(b.returnedBy || db.mcit.grants.review[0], 'mc-brief', b.title, `it-requests/${b.id}`); done(L('Brief sent again')); },
  'mc-it-triage': (el, id) => { const x = itOf(id); if (!x || !MG('triage')) return; const u = mcUndo(() => itOf(id), L('Triage'), iLink(x)), prev = x.stage; x.owner = $v('#mc-t-owner') || session.me; x.priority = $v('#mc-t-prio') || 'medium'; x.stage = prev === 'reopened' ? 'working' : 'triaged';
    hist(x, 'Triaged and assigned to {who}', {who: first(x.owner)}); logChange(MC, 'triaged', iLink(x), IT[prev][0], IT[x.stage][0]); upd(x.owner, 'mc-it-assigned', x.title, `it-requests/${x.id}`); upd(x.requester, 'mc-it-moved', x.title, `it-requests/${x.id}`); done(L('Assigned to {who}', {who: first(x.owner)}), u); },
  'mc-it-ask': (el, id) => { const x = itOf(id), q = $v('#mc-ask-q'); if (!x || !(MG('triage') || x.owner === session.me)) return; if (!q) return bad('#mc-ask-q', L('Say what you need to know.')); x.info.push({q, by: session.me, at: nowStamp(), a: '', aAt: null}); x.prevStage = x.stage; x.stage = 'waiting'; hist(x, 'Asked the requester for information');
    logChange(MC, 'asked for information on', iLink(x)); upd(x.requester, 'mc-it-info', x.title, `it-requests/${x.id}`); done(L('Question sent')); },
  'mc-it-answer': (el, id) => { const x = itOf(id), i = +el.dataset.i, a = $v(`#mc-ans-${i}`); if (!x || x.requester !== session.me || !x.info[i]) return; if (!a) return bad(`#mc-ans-${i}`, L('Write your answer.')); if (hasSecret(a)) return bad(`#mc-ans-${i}`, L('This looks like a password or code. Remove it; IT never needs it here.'));
    x.info[i].a = a; x.info[i].aAt = nowStamp(); x.stage = x.prevStage && x.prevStage !== 'waiting' ? x.prevStage : (x.owner ? 'working' : 'new'); hist(x, 'Answered'); upd(x.owner || x.info[i].by, 'mc-it-moved', x.title, `it-requests/${x.id}`); done(L('Answer sent')); },
  'mc-it-task': (el, id) => { const x = itOf(id), t0 = $v('#mc-k-title'); if (!x || !(MG('tech') || MG('triage') || x.owner === session.me)) return; if (!t0) return bad('#mc-k-title', L('Name the task.'));
    const t = addTask(t0, {owner: x.owner || session.me, due: $v('#mc-k-due') || null, div: MC, notes: L('From the IT request "{t}".', {t: x.title})}); if (!t) return; x.tasks.push(t.id); if (['triaged', 'reopened', 'new'].includes(x.stage)) x.stage = 'working';
    hist(x, 'Task created'); logChange(MC, 'linked a task to', iLink(x)); if (t.owner !== session.me) notify(t.owner, 'tadded', {type: 'task', id: t.id}); done(L('Task created and linked')); },
  'mc-it-block': (el, id) => { const x = itOf(id), t = $v('#mc-b-text'), a = $v('#mc-b-act'); if (!x) return; if (!t) return bad('#mc-b-text', L('Say what blocks the work.')); if (!a) return bad('#mc-b-act', L('Name the action needed.'));
    const u = mcUndo(() => itOf(id), L('Blocker'), iLink(x)); x.blocker = {text: t, action: a, by: session.me, at: nowStamp()}; x.prevStage = x.stage; x.stage = 'waiting'; hist(x, 'Waiting: {r}', {r: a}); logChange(MC, 'recorded a blocker on', iLink(x)); upd(x.requester, 'mc-it-moved', x.title, `it-requests/${x.id}`); done(L('Blocker recorded'), u); },
  'mc-it-unblock': (el, id) => { const x = itOf(id); if (!x || !x.blocker) return; const u = mcUndo(() => itOf(id), L('Blocker'), iLink(x)); x.blocker = null; x.stage = 'working'; hist(x, 'Blocker cleared'); logChange(MC, 'cleared a blocker on', iLink(x)); done(L('Blocker cleared'), u); },
  'mc-it-resolve': (el, id) => { const x = itOf(id), t = $v('#mc-r-text'), url = $v('#mc-r-url'); if (!x || !(MG('tech') || x.owner === session.me)) return; if (!t) return bad('#mc-r-text', L('Say what was done.')); if (url && !safeUrl(url)) return bad('#mc-r-url', L('Links must start with https://.')); if (hasSecret(t)) return bad('#mc-r-text', L('This looks like a password or code. Remove it; IT never needs it here.'));
    const u = mcUndo(() => itOf(id), L('Resolved'), iLink(x)), prev = x.stage; x.resolution = {text: t, url, version: $v('#mc-r-ver'), by: session.me, at: nowStamp()}; x.stage = 'resolved'; x.confirm = null; hist(x, 'Resolved: {r}', {r: t});
    logChange(MC, 'resolved an IT request', iLink(x), IT[prev][0], 'Resolved'); upd(x.requester, 'mc-it-resolved', x.title, `it-requests/${x.id}`); done(L('Marked resolved. {who} confirms it.', {who: first(x.requester)}), u); },
  'mc-it-confirm': (el, id) => { const x = itOf(id); if (!x || x.requester !== session.me || x.stage !== 'resolved') return; const u = mcUndo(() => itOf(id), L('Confirmed'), iLink(x)); x.confirm = {kind: 'solved', by: session.me, at: nowStamp(), note: ''}; x.stage = 'closed'; hist(x, 'Confirmed solved');
    logChange(MC, 'confirmed solved', iLink(x), 'Resolved', 'Closed'); upd(x.owner, 'mc-it-moved', x.title, `it-requests/${x.id}`); done(L('Thanks. The request is closed.'), u); },
  'mc-it-reopen': (el, id) => { const x = itOf(id), why = $v('#mc-o-why'); if (!x || x.requester !== session.me) return; if (!why) return bad('#mc-o-why', L('Say what still happens.')); if (hasSecret(why)) return bad('#mc-o-why', L('This looks like a password or code. Remove it; IT never needs it here.'));
    const u = mcUndo(() => itOf(id), L('Reopened'), iLink(x)); x.stage = 'reopened'; x.resolution = null; hist(x, 'Reopened: {r}', {r: why}); logChange(MC, 'reopened', iLink(x), 'Resolved', 'Reopened'); upd(x.owner, 'mc-it-reopened', x.title, `it-requests/${x.id}`); done(L('Reopened. {who} was told.', {who: first(x.owner)}), u); },
  'mc-it-cancel': (el, id) => { const x = itOf(id); if (!x || x.requester !== session.me) return; const u = mcUndo(() => itOf(id), L('Canceled'), iLink(x)), prev = x.stage; x.stage = 'cancelled'; hist(x, 'Canceled by the requester'); logChange(MC, 'canceled', iLink(x), IT[prev][0], 'Canceled'); done(L('Request canceled'), u); },
  'mc-acc-req': (el, id) => { const a = accOf(id); if (!a || !db.mcit) return; const d = draftOf('it', 'mcit'); Object.assign(d, {type: 'access', service: a.id, title: L('Access to {s}', {s: a.service}), expected: L('I can use {s} for my work.', {s: a.service}), _at: nowStamp()}); save(); go('it-requests/new/it'); },
  'mc-acc-verify': (el, id) => { const a = accOf(id); if (!a || !(MG('custody') || me().admin)) return; const prev = {verifiedBy: a.verifiedBy, verifiedAt: a.verifiedAt}; a.verifiedBy = session.me; a.verifiedAt = today(); logChange(MC, 'confirmed the custodian of', tgt(a.id, a.service, 'accounts-register'));
    done(L('Custodian confirmed today'), () => { Object.assign(a, prev); logChange(MC, 'undid a custodian confirmation on', tgt(a.id, a.service, 'accounts-register')); rerender(); }); },
  'mc-acc-change': (el, id) => { const a = accOf(id), w = $v('#mc-ac-who'), why = $v('#mc-ac-why'); if (!a || !(MG('custody') || me().admin)) return; if (!w) return bad('#mc-ac-who', L('Choose the new custodian.')); if (!why) return bad('#mc-ac-why', L('Write the handover note.')); if (hasSecret(why)) return bad('#mc-ac-why', L('This looks like a password or code. Remove it; IT never needs it here.'));
    const prev = {custodian: a.custodian, verifiedBy: a.verifiedBy, verifiedAt: a.verifiedAt}; a.custodian = w; a.verifiedBy = session.me; a.verifiedAt = today(); logChange(MC, 'changed the custodian of', tgt(a.id, a.service, 'accounts-register'), prev.custodian ? pname(prev.custodian) : 'Unknown', pname(w)); upd(w, 'mc-custody', a.service, 'accounts-register');
    done(L('Custodian changed. Verify ownership in the provider too.'), () => { Object.assign(a, prev); logChange(MC, 'undid a custodian change on', tgt(a.id, a.service, 'accounts-register')); rerender(); }); },
});
ON_CHANGE['mc-cmp-f'] = el => { ui.view.mccmp = el.value; render(); };
ON_INPUT['mc-acc-q'] = el => { ui.mcAccQ = el.value; const pos = el.selectionStart; render(); const n = $('#mc-acc-q'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch {} } };

// ---------- Updates labels (work_updates; legal_events, finance_events, marketing_events). Sensitive values never go in the text. ----------
if (typeof UPD === 'object') Object.assign(UPD, {
  'fnl-review': '{who} sent a legal document for your review', 'fnl-urgent': '{who} asked for an urgent exception', 'fnl-submitted': '{who} sent a legal request', 'fnl-assigned': '{who} asked you to draft a legal document',
  'fnl-moved': '{who} updated a legal request of yours', 'fnl-info': '{who} needs information for your legal request', 'fnl-answered': '{who} answered your question', 'fnl-decided': '{who} reviewed your draft', 'fnl-signed': '{who} recorded the last signature',
  'fnl-gate-check': '{who} recorded every BAST signature. Check the delivery evidence', 'fnl-exception': '{who} recorded a gate exception in your name', 'fnl-gate': '{who} sent you a ready-for-invoice gate', 'fnl-gate-reply': '{who} answered your ready-for-invoice gate',
  'fnl-f-review': '{who} sent a finance request for approval', 'fnl-f-approved': '{who} approved your finance request. It is not paid yet', 'fnl-f-returned': '{who} updated your finance request', 'fnl-pay-ready': '{who} approved a request that is ready for payment',
  'fnl-paid': '{who} recorded a payment on your request', 'fnl-alloc': '{who} proposed a budget allocation', 'fnl-alloc-done': '{who} decided on your allocation proposal', 'fnl-disc': '{who} gave you a period review action',
  'mc-review': '{who} sent content for your review', 'mc-assigned': '{who} gave you a content item', 'mc-revise': '{who} asked for changes to your content', 'mc-approved': '{who} approved your content', 'mc-sched': '{who} scheduled your content',
  'mc-retry': '{who} recorded a failed publication. A retry is needed', 'mc-date': '{who} moved a planned publication date', 'mc-cancel': '{who} canceled a content item', 'mc-brief': '{who} sent a content brief', 'mc-brief-reply': '{who} answered your content brief',
  'mc-it-new': '{who} sent an IT request', 'mc-it-assigned': '{who} assigned an IT request to you', 'mc-it-moved': '{who} updated an IT request', 'mc-it-info': '{who} needs information for your IT request', 'mc-it-resolved': '{who} resolved your IT request. Is it solved?',
  'mc-it-reopened': '{who} reopened an IT request', 'mc-custody': '{who} made you the custodian of an account'});

// ---------- registration ----------
PAGES['fnl-requests'] = fnlRequestsPage;
PAGES.budget = budgetPage;
PAGES.register = registerPage;
PAGES['period-reviews'] = periodsPage;
PAGES.content = contentPage;
PAGES['it-requests'] = itRequestsPage;
PAGES['accounts-register'] = accountsPage;
(CAPS[FNL] = CAPS[FNL] || []).push(['fnl-requests', 'documents', 'Requests'], ['budget', 'wallet', 'Budget & transactions', p => fnlFull(p) || isBoardP(p)], ['register', 'file', 'Documents & register', p => fnlFull(p)], ['period-reviews', 'finance', 'Period reviews', p => fnlFull(p) || isBoardP(p)]);
(CAPS[MC] = CAPS[MC] || []).push(['content', 'calendar', 'Content'], ['it-requests', 'documents', 'Requests'], ['accounts-register', 'shield', 'Accounts']);
// Every member can ask FnL or MCIT from their own workspace (blueprint §6 step 1, §8 step 1). Hidden inside FnL and MCIT, where the division entries show.
(CAPS['*'] = CAPS['*'] || []).push(['fnl-requests', 'finance', 'Requests to FnL', p => !isBoardP(p) && ws() !== FNL], ['it-requests', 'globe', 'Requests to MCIT', p => !isBoardP(p) && ws() !== MC]);
PERSONAS_EXTRA.push('rafi', 'hana'); // FnL Legal drafter; MCIT member with the publication grant
window.ensureFnlData = () => ensureFnl(); window.ensureMcitData = () => ensureMc();
// Seed now so the first Updates for Daniel, Citra, Galih, Laras and Salsa exist before anyone opens these screens.
try { ensureFnl(); ensureMc(); } catch (e) { console.error('UXD3 seed', e); }
})();
