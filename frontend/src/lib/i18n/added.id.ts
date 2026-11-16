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
};
