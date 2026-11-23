/* Indonesian for text the migration introduced: states the prototype never had because it saved in the browser
   (loading from Supabase, a failed load, a refused sign-in). Formal "Anda", like the rest of the dictionary. */
export const ADDED_ID: Record<string, string> = {
  Loading: 'Memuat',
  'Could not load the workspace. Check your connection and reload the page.':
    'Workspace tidak dapat dimuat. Periksa koneksi Anda lalu muat ulang halaman.',
  'This account has not been invited. Ask your director for an invite.':
    'Akun ini belum diundang. Minta undangan kepada direktur Anda.',
  'Could not sign in. Please try again.': 'Tidak dapat masuk. Silakan coba lagi.',
  'Wrong e-mail or password.': 'Email atau kata sandi salah.',
  'E-mail': 'Email',
  Password: 'Kata sandi',
  'Sign in': 'Masuk',
  'This division is not connected yet. Its records will appear here once it is switched on.':
    'Divisi ini belum terhubung. Datanya akan muncul di sini setelah divisi diaktifkan.',
  'Some of your changes were saved and some were not. The page now shows what was saved.':
    'Sebagian perubahan Anda tersimpan dan sebagian tidak. Halaman ini sekarang menampilkan yang tersimpan.',
  'This division cannot be reached right now. Try again in a few minutes.':
    'Divisi ini tidak dapat dijangkau saat ini. Coba lagi dalam beberapa menit.',
  // Competency matrix (HR) and its use in Staffing (Consulting).
  'Competency matrix': 'Matriks kompetensi',
  'A level per competency for every member. Consulting staffs engagements from it; HR keeps it current.':
    'Level setiap kompetensi untuk setiap anggota. Consulting menyusun tim engagement dari matriks ini; HR menjaganya tetap mutakhir.',
  'Framework {v} is a proposal': 'Kerangka {v} masih berupa usulan',
  'Agree the competencies and levels with Consulting Knowledge before the first full review.':
    'Sepakati kompetensi dan levelnya bersama Consulting Knowledge sebelum penilaian lengkap pertama.',
  'Members with a profile': 'Anggota yang sudah punya profil',
  '{p}% of the 100% target': '{p}% dari target 100%',
  'Thinnest competencies': 'Kompetensi paling tipis',
  'Fewest members at Independent or above': 'Paling sedikit anggota di level Mandiri ke atas',
  'Search by name': 'Cari berdasarkan nama',
  'Only members without a profile': 'Hanya anggota tanpa profil',
  Updated: 'Diperbarui',
  'No profile': 'Belum ada profil',
  'No one matches': 'Tidak ada yang cocok',
  'Change the search or the division.': 'Ubah pencarian atau divisinya.',
  Levels: 'Level',
  'Staffing shows Consulting only the competencies a member is ready for (Independent or above). Lower levels are for development with HR and are never shown there.':
    'Staffing hanya menampilkan kepada Consulting kompetensi yang sudah siap dijalankan anggota (Mandiri ke atas). Level di bawahnya untuk pengembangan bersama HR dan tidak pernah ditampilkan di sana.',
  'Not rated': 'Belum dinilai',
  'Competency profile': 'Profil kompetensi',
  'Last changed by {who}': 'Terakhir diubah oleh {who}',
  'No profile yet.': 'Belum ada profil.',
  '{n} earlier version': '{n} versi sebelumnya',
  '{n} earlier versions': '{n} versi sebelumnya',
  'Sectors known': 'Sektor yang dikuasai',
  'For example: retail, F&B, education': 'Contoh: ritel, F&B, pendidikan',
  Evidence: 'Bukti',
  'What the levels rest on: a module, a dummy case, a project. No private notes.':
    'Dasar penilaian level: modul, dummy case, atau proyek. Jangan tulis catatan pribadi.',
  'Save profile': 'Simpan profil',
  'Competency profile saved': 'Profil kompetensi tersimpan',
  'updated the competency profile of': 'memperbarui profil kompetensi',
  'recorded the competency profile of': 'mencatat profil kompetensi',
  'Problem structuring': 'Penstrukturan masalah',
  Structuring: 'Struktur',
  'Breaks a client question into an issue tree and hypotheses':
    'Memecah pertanyaan klien menjadi issue tree dan hipotesis',
  Research: 'Riset',
  'Desk research and interviews with sources others can check':
    'Riset pustaka dan wawancara dengan sumber yang bisa diperiksa orang lain',
  Analysis: 'Analisis',
  'Turns data into findings with spreadsheets or statistics':
    'Mengolah data menjadi temuan dengan spreadsheet atau statistik',
  'Solution development': 'Pengembangan solusi',
  Solution: 'Solusi',
  'Builds options and a recommendation from the findings': 'Menyusun pilihan dan rekomendasi dari temuan',
  'Feasibility and financials': 'Kelayakan dan keuangan',
  Feasibility: 'Kelayakan',
  'Tests options on cost, revenue and risk': 'Menguji pilihan dari sisi biaya, pendapatan, dan risiko',
  'Slides and writing': 'Slide dan penulisan',
  Slides: 'Slide',
  'Storyline, slides and reports to the DWDG standard': 'Alur cerita, slide, dan laporan sesuai standar DWDG',
  'Client communication': 'Komunikasi klien',
  Client: 'Klien',
  'Leads meetings, workshops and updates with a client': 'Memimpin rapat, lokakarya, dan pembaruan bersama klien',
  'Project management': 'Manajemen proyek',
  PM: 'PM',
  'Keeps a workplan, roles and deadlines for a team': 'Menjaga rencana kerja, peran, dan tenggat sebuah tim',
  'Not yet': 'Belum',
  'Has not done it yet': 'Belum pernah melakukannya',
  Basic: 'Dasar',
  'Knows the idea, for example from a module': 'Memahami konsepnya, misalnya dari modul',
  'With guidance': 'Dengan bimbingan',
  'Has done it with someone senior checking': 'Pernah melakukannya dengan diperiksa senior',
  Independent: 'Mandiri',
  'Does it alone to the agreed standard': 'Mengerjakannya sendiri sesuai standar yang disepakati',
  'Can teach': 'Bisa mengajari',
  'Reviews and coaches others': 'Mereview dan membimbing orang lain',
  'Competencies needed': 'Kompetensi yang dibutuhkan',
  'From the competency matrix. People ready for them are listed first.':
    'Dari matriks kompetensi. Orang yang sudah siap ditampilkan paling atas.',
  'Ready: {c}': 'Siap: {c}',
  'No competency profile': 'Belum ada profil kompetensi',
  'Evidence shown: role, declared availability, permitted TnD completion and the competencies asked that someone is ready for. HR scores, lower competency levels and private notes are never shown. Task counts never mean busy.':
    'Bukti yang ditampilkan: peran, ketersediaan yang dinyatakan, penyelesaian TnD yang diizinkan, dan kompetensi diminta yang sudah siap dijalankan. Skor HR, level kompetensi yang lebih rendah, dan catatan pribadi tidak pernah ditampilkan. Jumlah tugas tidak berarti sibuk.',
  // Organisation dashboard (Strategy & Growth).
  'Organisation dashboard': 'Dasbor organisasi',
  "Batch targets from each division brief, counted from records saved in dwdg'ONE. For the monthly review.":
    "Target batch dari brief setiap divisi, dihitung dari catatan yang tersimpan di dwdg'ONE. Untuk tinjauan bulanan.",
  'Batch {a} to {b}': 'Batch {a} sampai {b}',
  'Some divisions are not visible to you': 'Sebagian divisi tidak terlihat oleh Anda',
  'Their figures read Unknown, not zero. The President, the VP and the Admin see every division.':
    'Angkanya tertulis Tidak diketahui, bukan nol. Presiden, Wakil Presiden, dan Admin melihat semua divisi.',
  'Batch outcomes': 'Hasil batch',
  'Active members': 'Anggota aktif',
  'Active accounts, the Board left out. The base of every share.':
    'Akun aktif, tanpa Dewan Pengawas. Dasar setiap persentase.',
  "Not measured in dwdg'ONE yet": "Belum terukur di dwdg'ONE",
  'Targets in the briefs that no saved record can show yet. Agree with each division how to record them.':
    'Target di brief yang belum bisa ditunjukkan oleh catatan mana pun. Sepakati cara mencatatnya dengan setiap divisi.',
  'Counted on {d} from the records each division keeps. Unknown means not visible to you; No data yet means nothing to count. There is no overall score and no ranking.':
    'Dihitung pada {d} dari catatan setiap divisi. Tidak diketahui berarti tidak terlihat oleh Anda; Belum ada data berarti tidak ada yang bisa dihitung. Tidak ada skor keseluruhan dan tidak ada peringkat.',
  'Target met': 'Target tercapai',
  'Below target': 'Di bawah target',
  'No data yet': 'Belum ada data',
  'No numeric target': 'Tanpa target angka',
  'Not visible to you': 'Tidak terlihat oleh Anda',
  'Target: {x}': 'Target: {x}',
  'Tracked, no number set in the brief': 'Dipantau, brief tidak menetapkan angka',
  'Target: about {n}': 'Target: sekitar {n}',
  'Target: more than {n}': 'Target: lebih dari {n}',
  'Target: {n} to {m}': 'Target: {n} sampai {m}',
  'Target: 100%': 'Target: 100%',
  '{p}% of the target': '{p}% dari target',
  Monthly: 'Bulanan',
  'Qualified client pipeline': 'Pipeline klien yang memenuhi syarat',
  'Client opportunities from Qualified up to Agreement pending.':
    'Peluang klien dari tahap Memenuhi syarat sampai Menunggu perjanjian.',
  'Real clients secured': 'Klien nyata yang didapat',
  'Client opportunities marked Won.': 'Peluang klien yang ditandai Menang.',
  'Open opportunities with a next action': 'Peluang terbuka dengan langkah berikutnya',
  'Open opportunities that name a next action and its date.':
    'Peluang terbuka yang menyebut langkah berikutnya beserta tanggalnya.',
  'Won clients handed to Consulting': 'Klien menang yang diserahkan ke Consulting',
  'Won client opportunities whose hand-off Consulting accepted.':
    'Peluang klien menang yang serah terimanya diterima Consulting.',
  'Client engagements running': 'Engagement klien berjalan',
  'Engagements for a real client that are planned, active or in review.':
    'Engagement untuk klien nyata yang direncanakan, aktif, atau dalam tinjauan.',
  'Client projects delivered': 'Proyek klien selesai',
  'Engagements for a real client marked Completed.': 'Engagement untuk klien nyata yang ditandai Selesai.',
  'Delivered projects with a closure and lessons': 'Proyek selesai dengan penutupan dan pelajaran',
  'Delivered client engagements whose closure (outcome and lessons) is recorded.':
    'Engagement klien selesai yang penutupannya (hasil dan pelajaran) sudah dicatat.',
  'Analysts with real-client exposure': 'Analis yang pernah menangani klien nyata',
  'Active members (role Member) named on at least one client engagement as lead, PM or team.':
    'Anggota aktif (peran Anggota) yang tercatat di minimal satu engagement klien sebagai lead, PM, atau tim.',
  'Knowledge articles published': 'Artikel Knowledge yang terbit',
  'Articles in Knowledge with a published version.': 'Artikel di Knowledge yang punya versi terbit.',
  'Competency matrix coverage': 'Cakupan matriks kompetensi',
  'Active members with at least one competency level recorded.':
    'Anggota aktif yang minimal satu level kompetensinya sudah dicatat.',
  'Last HR cycle completed': 'Siklus HR terakhir yang tuntas',
  'Members of the last finalized 14-day cycle whose assessment is final or exempt.':
    'Anggota siklus 14 hari terakhir yang penilaiannya final atau dikecualikan.',
  'Client engagements with a signed agreement': 'Engagement klien dengan perjanjian yang ditandatangani',
  'Running or delivered client engagements with a legal document signed or registered.':
    'Engagement klien berjalan atau selesai yang dokumen hukumnya sudah ditandatangani atau diregistrasi.',
  'Period reviews closed': 'Tinjauan periode yang ditutup',
  'Finance period reviews marked Closed.': 'Tinjauan periode keuangan yang ditandai Ditutup.',
  'Finance requests waiting for FnL': 'Permintaan keuangan yang menunggu FnL',
  'Requests submitted or in review.': 'Permintaan yang diajukan atau sedang ditinjau.',
  'Posts published, last 30 days': 'Konten terbit, 30 hari terakhir',
  'Channel publications recorded in the content tracker.': 'Publikasi per kanal yang tercatat di content tracker.',
  'Reach recorded, last 30 days': 'Jangkauan tercatat, 30 hari terakhir',
  'Reach typed in by Communications for those posts. Posts without results are left out, not counted as 0.':
    'Jangkauan yang diisi Communications untuk konten tersebut. Konten tanpa hasil tidak dihitung, bukan dianggap 0.',
  'IT requests open': 'Permintaan IT yang terbuka',
  'Requests to IT that are new, triaged, in progress, waiting or reopened.':
    'Permintaan ke IT yang baru, sudah dipilah, dikerjakan, menunggu, atau dibuka kembali.',
  'Strategic priorities with an owner': 'Prioritas strategis yang punya penanggung jawab',
  'Initiatives approved and owned by a named person.': 'Inisiatif yang disetujui dan dipegang oleh orang tertentu.',
  'Decisions waiting': 'Keputusan yang menunggu',
  'Decision packets submitted and not yet decided.': 'Paket keputusan yang sudah diajukan dan belum diputuskan.',
  'Active mentors (3 to 4)': 'Mentor aktif (3 sampai 4)',
  'Client feedback completion': 'Kelengkapan umpan balik klien',
  'Member pulse response rate': 'Tingkat respons pulse anggota',
  'Budget variance and donation records': 'Selisih anggaran dan catatan donasi',
  'Template reuse and system adoption': 'Pemakaian ulang template dan adopsi sistem',
  'Benchmarking implementation rate': 'Tingkat implementasi benchmarking',
};
