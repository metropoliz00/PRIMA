import React, { useState } from 'react';
import { Database, FileSpreadsheet, Copy, Check, Code, Search, Layers, HelpCircle, Server, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export interface SheetSchemaInfo {
  sheetName: string;
  moduleName: string;
  description: string;
  headers: {
    colLetter: string;
    colName: string;
    dataType: string;
    isRequired: boolean;
    description: string;
    sampleValue: string;
  }[];
}

export const SHEET_SCHEMAS: SheetSchemaInfo[] = [
  {
    sheetName: 'Users',
    moduleName: 'Manajemen Akun Pengguna',
    description: 'Menyimpan data seluruh akun yang terdaftar dalam aplikasi (Admin, Guru, dan Murid).',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID unik pengguna', sampleValue: 'usr-01 / stud-101' },
      { colLetter: 'B', colName: 'username', dataType: 'String', isRequired: true, description: 'Username login', sampleValue: 'andi5a' },
      { colLetter: 'C', colName: 'name', dataType: 'String', isRequired: true, description: 'Nama lengkap pengguna', sampleValue: 'Andi Pratama' },
      { colLetter: 'D', colName: 'role', dataType: 'Enum', isRequired: true, description: 'Peran akun: ADMIN, TEACHER, atau STUDENT', sampleValue: 'STUDENT' },
      { colLetter: 'E', colName: 'nip', dataType: 'String', isRequired: false, description: 'NIP/NIK khusus Guru atau Admin', sampleValue: '198501012010011002' },
      { colLetter: 'F', colName: 'grade', dataType: 'Number', isRequired: false, description: 'Tingkat kelas siswa/pengampuan guru', sampleValue: '5' },
      { colLetter: 'G', colName: 'schoolName', dataType: 'String', isRequired: false, description: 'Nama instansi sekolah', sampleValue: 'SDN Merdeka 01' },
      { colLetter: 'H', colName: 'phone', dataType: 'String', isRequired: false, description: 'Nomor HP/WhatsApp aktif', sampleValue: '081234567890' },
      { colLetter: 'I', colName: 'password', dataType: 'String', isRequired: true, description: 'Kata sandi akun', sampleValue: '123456' },
      { colLetter: 'J', colName: 'createdAt', dataType: 'DateTime', isRequired: false, description: 'Waktu pendaftaran akun', sampleValue: '2026-10-04T07:00:00.000Z' },
      { colLetter: 'K', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan akun terakhir', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'Subjects',
    moduleName: 'Mata Pelajaran',
    description: 'Menyimpan daftar mata pelajaran beserta tema warna, ikon, dan deskripsi.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID unik mata pelajaran', sampleValue: 'ipas' },
      { colLetter: 'B', colName: 'name', dataType: 'String', isRequired: true, description: 'Nama resmi mata pelajaran', sampleValue: 'IPAS (Sains & Sosial)' },
      { colLetter: 'C', colName: 'icon', dataType: 'String', isRequired: true, description: 'Emoji atau ikon visual', sampleValue: '🌿' },
      { colLetter: 'D', colName: 'color', dataType: 'String', isRequired: true, description: 'Kelas warna Tailwind UI', sampleValue: 'from-emerald-500 to-teal-600' },
      { colLetter: 'E', colName: 'bgGradient', dataType: 'String', isRequired: false, description: 'Gradien latar belakang kartu', sampleValue: 'bg-emerald-50' },
      { colLetter: 'F', colName: 'description', dataType: 'String', isRequired: false, description: 'Deskripsi cakupan mata pelajaran', sampleValue: 'Eksplorasi alam dan lingkungan sosial' },
      { colLetter: 'G', colName: 'grade', dataType: 'Number', isRequired: true, description: 'Tingkat kelas sasaran', sampleValue: '5' },
      { colLetter: 'H', colName: 'status', dataType: 'Enum', isRequired: true, description: 'Status mata pelajaran: PUBLISHED atau DRAFT', sampleValue: 'PUBLISHED' },
      { colLetter: 'I', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan terakhir', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'Materials',
    moduleName: 'Materi Pembelajaran & Misi',
    description: 'Menyimpan modul materi pembelajaran, alur tujuan pembelajaran (ATP), dan isi bacaan.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID unik materi', sampleValue: 'mat-101' },
      { colLetter: 'B', colName: 'subjectId', dataType: 'String', isRequired: true, description: 'ID mata pelajaran terhubung', sampleValue: 'ipas' },
      { colLetter: 'C', colName: 'grade', dataType: 'Number', isRequired: true, description: 'Tingkat kelas sasaran', sampleValue: '5' },
      { colLetter: 'D', colName: 'topicTitle', dataType: 'String', isRequired: true, description: 'Judul Topik Pembelajaran', sampleValue: 'Ekosistem & Rantai Makanan Sawah' },
      { colLetter: 'E', colName: 'learningObjectives', dataType: 'String', isRequired: false, description: 'Tujuan Pembelajaran (TP)', sampleValue: 'Siswa dapat mengidentifikasi produsen dan konsumen' },
      { colLetter: 'F', colName: 'description', dataType: 'String', isRequired: false, description: 'Ringkasan singkat modul', sampleValue: 'Mempelajari hubungan antar mahluk hidup' },
      { colLetter: 'G', colName: 'contentBody', dataType: 'Text/HTML', isRequired: true, description: 'Isi lengkap teks materi bacaan', sampleValue: 'Ekosistem adalah hubungan timbal balik...' },
      { colLetter: 'H', colName: 'mediaType', dataType: 'Enum', isRequired: false, description: 'Jenis media: DOCUMENT, INFOGRAPHIC, PRESENTATION', sampleValue: 'DOCUMENT' },
      { colLetter: 'I', colName: 'mediaUrl', dataType: 'String', isRequired: false, description: 'URL lampiran gambar/file', sampleValue: 'https://images.unsplash.com/...' },
      { colLetter: 'J', colName: 'status', dataType: 'Enum', isRequired: true, description: 'Status terbit: TERBIT atau DRAFT', sampleValue: 'TERBIT' },
      { colLetter: 'K', colName: 'createdAt', dataType: 'DateTime', isRequired: false, description: 'Tanggal rilis', sampleValue: '2026-10-04' },
      { colLetter: 'L', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan terakhir', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'Videos',
    moduleName: 'Video Interaktif & Checkpoint Pausa',
    description: 'Menyimpan tautan video YouTube/Drive dan daftar checkpoint kuis jeda pausa otomatis.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID unik video', sampleValue: 'vid-01' },
      { colLetter: 'B', colName: 'title', dataType: 'String', isRequired: true, description: 'Judul video pembelajaran', sampleValue: 'Petualangan Rantai Makanan Sawah' },
      { colLetter: 'C', colName: 'subjectId', dataType: 'String', isRequired: true, description: 'ID mata pelajaran terhubung', sampleValue: 'ipas' },
      { colLetter: 'D', colName: 'videoUrl', dataType: 'String', isRequired: true, description: 'URL YouTube / Google Drive Preview', sampleValue: 'https://www.youtube.com/watch?v=kYJ_f_Y_vS4' },
      { colLetter: 'E', colName: 'grade', dataType: 'Number', isRequired: false, description: 'Tingkat kelas', sampleValue: '5' },
      { colLetter: 'F', colName: 'checkpointsCount', dataType: 'Number', isRequired: false, description: 'Jumlah kuis jeda pausa', sampleValue: '2' },
      { colLetter: 'G', colName: 'checkpoints', dataType: 'JSON Array', isRequired: false, description: 'String JSON daftar checkpoint [{timeInSeconds, question, options, correctAnswer}]', sampleValue: '[{"timeInSeconds":15,"question":"Siapa produsen?","options":["Padi","Belalang"],"correctAnswer":0}]' },
      { colLetter: 'H', colName: 'createdAt', dataType: 'DateTime', isRequired: false, description: 'Tanggal pembuatan', sampleValue: '2026-10-04' },
      { colLetter: 'I', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan terakhir', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'Questions',
    moduleName: 'Bank Soal AKM (PG, PGK, BS)',
    description: 'Menyimpan butir soal standar AKM lengkap dengan stimulus, pilihan jawaban, dan kunci.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID unik soal', sampleValue: 'qb-01' },
      { colLetter: 'B', colName: 'subjectId', dataType: 'String', isRequired: true, description: 'ID mata pelajaran', sampleValue: 'ipas' },
      { colLetter: 'C', colName: 'type', dataType: 'Enum', isRequired: true, description: 'Jenis soal: PG (Pilihan Ganda), PGK (Kompleks), BS (Benar/Salah)', sampleValue: 'PG' },
      { colLetter: 'D', colName: 'level', dataType: 'Enum', isRequired: true, description: 'Tingkat kognitif: LOTS, MOTS, HOTS', sampleValue: 'MOTS' },
      { colLetter: 'E', colName: 'stimulus', dataType: 'Text', isRequired: false, description: 'Teks wacana / stimulus bacaan', sampleValue: 'Pada musim panen, petani menemukan...' },
      { colLetter: 'F', colName: 'questionText', dataType: 'String', isRequired: true, description: 'Teks pertanyaan soal', sampleValue: 'Manakah mahluk hidup yang berperan sebagai produsen?' },
      { colLetter: 'G', colName: 'options', dataType: 'JSON Array', isRequired: false, description: 'String JSON array pilihan [A, B, C, D] untuk PG/PGK', sampleValue: '["Padi 🌾","Belalang 🦗","Katak 🐸","Ular 🐍"]' },
      { colLetter: 'H', colName: 'correctAnswer', dataType: 'Number/String', isRequired: false, description: 'Indeks benar untuk PG (0, 1, 2, atau 3)', sampleValue: '0' },
      { colLetter: 'I', colName: 'correctAnswers', dataType: 'JSON Array', isRequired: false, description: 'String JSON array indeks benar untuk PGK [0, 2]', sampleValue: '[0, 2]' },
      { colLetter: 'J', colName: 'statements', dataType: 'JSON Array', isRequired: false, description: 'String JSON array pernyataan untuk BS [{text, isTrue}]', sampleValue: '[{"text":"Padi produsen","isTrue":true}]' },
      { colLetter: 'K', colName: 'explanation', dataType: 'Text', isRequired: false, description: 'Pembahasan & kunci lengkap', sampleValue: 'Padi adalah produsen karena fotosintesis.' },
      { colLetter: 'L', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan terakhir', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'Assessments',
    moduleName: 'Asesmen & Paket Kuis Formatif/Sumatif',
    description: 'Menyimpan daftar paket tes/kuis terstruktur beserta aturan durasi dan KKTP target.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID unik paket asesmen', sampleValue: 'ass-01' },
      { colLetter: 'B', colName: 'title', dataType: 'String', isRequired: true, description: 'Judul kuis / asesmen', sampleValue: 'Asesmen Formatif Bab 1 IPAS' },
      { colLetter: 'C', colName: 'subjectId', dataType: 'String', isRequired: true, description: 'ID mata pelajaran', sampleValue: 'ipas' },
      { colLetter: 'D', colName: 'grade', dataType: 'Number', isRequired: true, description: 'Tingkat kelas', sampleValue: '5' },
      { colLetter: 'E', colName: 'durationMinutes', dataType: 'Number', isRequired: true, description: 'Durasi pengerjaan dalam menit', sampleValue: '30' },
      { colLetter: 'F', colName: 'kktpTarget', dataType: 'Number', isRequired: true, description: 'Target KKM / KKTP tuntas', sampleValue: '75' },
      { colLetter: 'G', colName: 'totalQuestions', dataType: 'Number', isRequired: true, description: 'Total butir soal terpasang', sampleValue: '5' },
      { colLetter: 'H', colName: 'questions', dataType: 'JSON Array', isRequired: false, description: 'String JSON array ID soal atau objek soal lengkap', sampleValue: '["qb-01", "qb-02", "qb-03"]' },
      { colLetter: 'I', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan terakhir', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'CodingChallenges',
    moduleName: 'Coding Challenge & Berpikir Komputasional',
    description: 'Menyimpan tantangan logika berbasis balok visual (robot maze, petualangan logika).',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID tantangan coding', sampleValue: 'cod-01' },
      { colLetter: 'B', colName: 'title', dataType: 'String', isRequired: true, description: 'Judul tantangan coding', sampleValue: 'Membantu Robot Menyiram Padi' },
      { colLetter: 'C', colName: 'subjectId', dataType: 'String', isRequired: true, description: 'ID mata pelajaran terhubung', sampleValue: 'ipas' },
      { colLetter: 'D', colName: 'allowedBlocksCount', dataType: 'Number', isRequired: false, description: 'Batas jumlah balok perintah', sampleValue: '6' },
      { colLetter: 'E', colName: 'characterIcon', dataType: 'String', isRequired: false, description: 'Emoji karakter', sampleValue: '🤖' },
      { colLetter: 'F', colName: 'gridSize', dataType: 'Number', isRequired: false, description: 'Ukuran grid papan maze', sampleValue: '4' },
      { colLetter: 'G', colName: 'startPos', dataType: 'JSON Object', isRequired: false, description: 'Posisi awal robot {x, y}', sampleValue: '{"x":0,"y":0}' },
      { colLetter: 'H', colName: 'targetPos', dataType: 'JSON Object', isRequired: false, description: 'Posisi target sasaran {x, y}', sampleValue: '{"x":3,"y":3}' },
      { colLetter: 'I', colName: 'targetGoal', dataType: 'String', isRequired: false, description: 'Tujuan misi', sampleValue: 'Siram semua tanaman padi' },
      { colLetter: 'J', colName: 'availableBlocks', dataType: 'JSON Array', isRequired: false, description: 'String JSON daftar balok perintah yang tersedia', sampleValue: '[{"id":"b-maju","text":"Maju 1 Langkah"}]' },
      { colLetter: 'K', colName: 'expectedSequence', dataType: 'JSON Array', isRequired: false, description: 'String JSON urutan balok jawaban benar', sampleValue: '["b-maju","b-kanan","b-maju"]' },
      { colLetter: 'L', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan terakhir', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'Progress',
    moduleName: 'Progres & Skor Belajar Siswa',
    description: 'Menyimpan pencapaian XP, level gamifikasi, jumlah topik selesai, dan nilai kuis siswa.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID rekaman progres', sampleValue: 'prog-101' },
      { colLetter: 'B', colName: 'studentId', dataType: 'String', isRequired: true, description: 'ID akun siswa', sampleValue: 'stud-101' },
      { colLetter: 'C', colName: 'studentName', dataType: 'String', isRequired: true, description: 'Nama lengkap siswa', sampleValue: 'Andi Pratama' },
      { colLetter: 'D', colName: 'xp', dataType: 'Number', isRequired: true, description: 'Total Poin Pengalaman (XP)', sampleValue: '450' },
      { colLetter: 'E', colName: 'level', dataType: 'Number', isRequired: true, description: 'Level capaian siswa', sampleValue: '5' },
      { colLetter: 'F', colName: 'completedTopicsCount', dataType: 'Number', isRequired: true, description: 'Jumlah topik/misi yang tuntas', sampleValue: '4' },
      { colLetter: 'G', colName: 'streakDays', dataType: 'Number', isRequired: false, description: 'Jumlah hari aktif berturut-turut', sampleValue: '3' },
      { colLetter: 'H', colName: 'topicScores', dataType: 'JSON Object', isRequired: false, description: 'String JSON rekap nilai kuis per topik {"topik-1": 90, "topik-2": 85}', sampleValue: '{"topik-1": 90, "topik-2": 85}' },
      { colLetter: 'I', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu simpan terakhir', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'Reflections',
    moduleName: 'Jurnal Refleksi Siswa & Feedback Guru',
    description: 'Menyimpan ungkapan perasaan, catatan jurnal siswa, dan umpan balik balasan guru.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID jurnal refleksi', sampleValue: 'refl-01' },
      { colLetter: 'B', colName: 'studentId', dataType: 'String', isRequired: true, description: 'ID akun siswa', sampleValue: 'stud-101' },
      { colLetter: 'C', colName: 'studentName', dataType: 'String', isRequired: true, description: 'Nama lengkap siswa', sampleValue: 'Andi Pratama' },
      { colLetter: 'D', colName: 'topicId', dataType: 'String', isRequired: false, description: 'ID topik pembelajaran terkait', sampleValue: 'topik-1' },
      { colLetter: 'E', colName: 'subjectId', dataType: 'String', isRequired: false, description: 'ID mata pelajaran', sampleValue: 'ipas' },
      { colLetter: 'F', colName: 'feeling', dataType: 'Enum', isRequired: true, description: 'Perasaan siswa: SENANG, BINGUNG, TANTANGAN', sampleValue: 'SENANG' },
      { colLetter: 'G', colName: 'notes', dataType: 'Text', isRequired: true, description: 'Catatan refleksi belajar dari siswa', sampleValue: 'Saya sangat paham perbedaan rantai makanan dan jaring makanan.' },
      { colLetter: 'H', colName: 'teacherFeedback', dataType: 'Text', isRequired: false, description: 'Balasan / apresiasi dari Guru', sampleValue: 'Hebat Andi! Pertahankan pemahaman positifmu.' },
      { colLetter: 'I', colName: 'createdAt', dataType: 'DateTime', isRequired: false, description: 'Tanggal pembuatan', sampleValue: '2026-10-04' },
      { colLetter: 'J', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan balasan guru', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'Announcements',
    moduleName: 'Pengumuman Kelas',
    description: 'Menyimpan pesan, berita, dan arahan tugas dari guru untuk seluruh siswa.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID pengumuman', sampleValue: 'ann-01' },
      { colLetter: 'B', colName: 'title', dataType: 'String', isRequired: true, description: 'Judul pengumuman', sampleValue: 'Persiapan Asesmen Formatif Bab 1 IPAS' },
      { colLetter: 'C', colName: 'content', dataType: 'Text', isRequired: true, description: 'Isi pengumuman lengkap', sampleValue: 'Anak-anak hebat, besok kita akan kuis online...' },
      { colLetter: 'D', colName: 'author', dataType: 'String', isRequired: false, description: 'Nama penulis pengumuman', sampleValue: 'Ibu Rahma, S.Pd.' },
      { colLetter: 'E', colName: 'targetGrade', dataType: 'String', isRequired: false, description: 'Kelas target sasaran', sampleValue: '5 / Semua Kelas' },
      { colLetter: 'F', colName: 'date', dataType: 'String', isRequired: false, description: 'Tanggal rilis', sampleValue: '4 Oktober 2026' },
      { colLetter: 'G', colName: 'createdAt', dataType: 'DateTime', isRequired: false, description: 'Timestamp pembuatan', sampleValue: '2026-10-04' },
      { colLetter: 'H', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'Classes',
    moduleName: 'Rombongan Belajar (Kelas)',
    description: 'Menyimpan data rombel kelas, wali kelas, dan kuota siswa.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID kelas/rombel', sampleValue: 'cls-5a' },
      { colLetter: 'B', colName: 'name', dataType: 'String', isRequired: true, description: 'Nama resmi kelas', sampleValue: 'Kelas 5-A Unggulan' },
      { colLetter: 'C', colName: 'grade', dataType: 'Number', isRequired: true, description: 'Tingkat kelas', sampleValue: '5' },
      { colLetter: 'D', colName: 'teacherName', dataType: 'String', isRequired: false, description: 'Nama Wali Kelas / Pengampu', sampleValue: 'Ibu Rahma, S.Pd.' },
      { colLetter: 'E', colName: 'studentCount', dataType: 'Number', isRequired: false, description: 'Jumlah total murid terdaftar', sampleValue: '28' },
      { colLetter: 'F', colName: 'status', dataType: 'Enum', isRequired: true, description: 'Status rombel: AKTIF atau NONAKTIF', sampleValue: 'AKTIF' },
      { colLetter: 'G', colName: 'createdAt', dataType: 'DateTime', isRequired: false, description: 'Tanggal pembuatan rombel', sampleValue: '2026-10-04' },
      { colLetter: 'H', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'Analytics',
    moduleName: 'Analitik & Rekapitulasi Ketercapaian Pembelajaran',
    description: 'Menyimpan data agregat analitik kelas, rata-rata skor per mata pelajaran, tingkat ketuntasan KKTP, dan statistik belajar siswa.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID unik rekaman analitik', sampleValue: 'analytics-2026-10' },
      { colLetter: 'B', colName: 'date', dataType: 'String', isRequired: true, description: 'Tanggal periode pencatatan analitik', sampleValue: '2026-10-04' },
      { colLetter: 'C', colName: 'totalStudents', dataType: 'Number', isRequired: true, description: 'Total murid terdaftar di kelas', sampleValue: '28' },
      { colLetter: 'D', colName: 'averageXp', dataType: 'Number', isRequired: false, description: 'Rata-rata poin XP siswa', sampleValue: '412' },
      { colLetter: 'E', colName: 'averageScore', dataType: 'Number', isRequired: false, description: 'Rata-rata nilai kuis kelas (skala 0-100)', sampleValue: '85.5' },
      { colLetter: 'F', colName: 'kktpCompletionRate', dataType: 'Number', isRequired: true, description: 'Persentase ketuntasan KKTP kelas (%)', sampleValue: '89.2' },
      { colLetter: 'G', colName: 'completedReflectionsCount', dataType: 'Number', isRequired: false, description: 'Jumlah jurnal refleksi siswa terisi', sampleValue: '18' },
      { colLetter: 'H', colName: 'subjectBreakdown', dataType: 'JSON Object', isRequired: false, description: 'String JSON rekapitulasi nilai per mata pelajaran', sampleValue: '{"ipas":{"avgScore":88,"kktpRate":92},"matematika":{"avgScore":82,"kktpRate":85}}' },
      { colLetter: 'I', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu kalkulasi analitik terakhir', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'AITutorConfig',
    moduleName: 'Konfigurasi Pedagogis PRIMA AI Tutor',
    description: 'Menyimpan konfigurasi persona AI Tutor, alur tujuan pembelajaran, gaya komunikasi, dan aturan scaffolding pedagogis guru.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID unik konfigurasi AI Tutor', sampleValue: 'ai-ipas-01' },
      { colLetter: 'B', colName: 'subjectId', dataType: 'String', isRequired: true, description: 'ID mata pelajaran terhubung', sampleValue: 'ipas' },
      { colLetter: 'C', colName: 'topicTitle', dataType: 'String', isRequired: true, description: 'Judul topik / bab pembelajaran', sampleValue: 'Ekosistem & Rantai Makanan Sawah' },
      { colLetter: 'D', colName: 'tutorName', dataType: 'String', isRequired: true, description: 'Nama panggilan persona AI Tutor', sampleValue: 'Kak Prima (Tutor IPAS)' },
      { colLetter: 'E', colName: 'learningGoal', dataType: 'Text', isRequired: true, description: 'Tujuan pembelajaran khusus yang dipandu AI', sampleValue: 'Membimbing siswa memahami peran produsen dan konsumen' },
      { colLetter: 'F', colName: 'communicationStyle', dataType: 'String', isRequired: false, description: 'Gaya komunikasi AI (Ramah, Socratic, Motivatif)', sampleValue: 'Ramah, Bertanya Socratic, & Interaktif' },
      { colLetter: 'G', colName: 'rulesAndScaffolding', dataType: 'Text', isRequired: false, description: 'Instruksi pedagogis & batasan scaffolding untuk AI', sampleValue: 'Jangan berikan jawaban langsung, ajukan pertanyaan pemancing' },
      { colLetter: 'H', colName: 'starterPrompts', dataType: 'JSON Array', isRequired: false, description: 'String JSON array pertanyaan pemantik awal', sampleValue: '["Apa yang kamu ketahui tentang rantai makanan?","Mengapa padi disebut produsen?"]' },
      { colLetter: 'I', colName: 'maxTokensLimit', dataType: 'Number', isRequired: false, description: 'Batas maksimum token generasi respon AI', sampleValue: '1000' },
      { colLetter: 'J', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan konfigurasi', sampleValue: '2026-10-04T07:00:00.000Z' },
    ],
  },
  {
    sheetName: 'AIChatLogs',
    moduleName: 'Riwayat Percakapan PRIMA AI Tutor',
    description: 'Menyimpan log riwayat percakapan tanya-jawab antara siswa dengan AI Tutor untuk pemantauan kognitif oleh guru.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID unik log percakapan', sampleValue: 'log-chat-101' },
      { colLetter: 'B', colName: 'studentId', dataType: 'String', isRequired: true, description: 'ID akun siswa', sampleValue: 'stud-101' },
      { colLetter: 'C', colName: 'studentName', dataType: 'String', isRequired: true, description: 'Nama lengkap siswa', sampleValue: 'Andi Pratama' },
      { colLetter: 'D', colName: 'subjectId', dataType: 'String', isRequired: false, description: 'ID mata pelajaran', sampleValue: 'ipas' },
      { colLetter: 'E', colName: 'topicTitle', dataType: 'String', isRequired: false, description: 'Judul topik diskusi', sampleValue: 'Ekosistem Sawah' },
      { colLetter: 'F', colName: 'userMessage', dataType: 'Text', isRequired: true, description: 'Pertanyaan / pesan yang diketik siswa', sampleValue: 'Kak, kenapa ular makan katak di sawah?' },
      { colLetter: 'G', colName: 'aiResponse', dataType: 'Text', isRequired: true, description: 'Tanggapan & penjelasan pembimbingan dari AI Tutor', sampleValue: 'Pertanyaan hebat Andi! Dalam ekosistem, ular adalah karnivora...' },
      { colLetter: 'H', colName: 'timestamp', dataType: 'DateTime', isRequired: true, description: 'Waktu terjadinya percakapan', sampleValue: '2026-10-04T07:30:00.000Z' },
    ],
  },
  {
    sheetName: 'Leaderboard',
    moduleName: 'Gamifikasi & Papan Peringkat Siswa',
    description: 'Menyimpan peringkat gamifikasi siswa, akumulasi poin XP, level, streak hari belajar, dan jumlah lencana yang diraih.',
    headers: [
      { colLetter: 'A', colName: 'id', dataType: 'String', isRequired: true, description: 'ID unik catatan peringkat leaderboard', sampleValue: 'lb-stud-101' },
      { colLetter: 'B', colName: 'rank', dataType: 'Number', isRequired: true, description: 'Peringkat siswa dalam kelas (1, 2, 3, dst.)', sampleValue: '1' },
      { colLetter: 'C', colName: 'studentId', dataType: 'String', isRequired: true, description: 'ID akun siswa', sampleValue: 'stud-101' },
      { colLetter: 'D', colName: 'studentName', dataType: 'String', isRequired: true, description: 'Nama lengkap siswa', sampleValue: 'Andi Pratama' },
      { colLetter: 'E', colName: 'xp', dataType: 'Number', isRequired: true, description: 'Total Poin Pengalaman (XP) siswa', sampleValue: '850' },
      { colLetter: 'F', colName: 'level', dataType: 'Number', isRequired: true, description: 'Tingkat level gamifikasi siswa', sampleValue: '4' },
      { colLetter: 'G', colName: 'streakDays', dataType: 'Number', isRequired: false, description: 'Jumlah hari beruntun belajar aktif (Streak)', sampleValue: '7' },
      { colLetter: 'H', colName: 'completedTopicsCount', dataType: 'Number', isRequired: false, description: 'Jumlah topik bab yang telah diselesaikan', sampleValue: '5' },
      { colLetter: 'I', colName: 'badgesCount', dataType: 'Number', isRequired: false, description: 'Jumlah lencana pencapaian yang berhasil diraih', sampleValue: '6' },
      { colLetter: 'J', colName: 'lastUpdated', dataType: 'DateTime', isRequired: false, description: 'Waktu pembaruan poin gamifikasi', sampleValue: '2026-10-04T07:30:00.000Z' },
    ],
  },
];

export const DatabaseSchemaDocs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [copiedSheet, setCopiedSheet] = useState<string | null>(null);
  const [showGasScript, setShowGasScript] = useState(false);

  const filteredSchemas = SHEET_SCHEMAS.filter((schema) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      schema.sheetName.toLowerCase().includes(q) ||
      schema.moduleName.toLowerCase().includes(q) ||
      schema.headers.some((h) => h.colName.toLowerCase().includes(q) || h.description.toLowerCase().includes(q))
    );
  });

  const handleCopyHeadersCSV = (schema: SheetSchemaInfo) => {
    const csvLine = schema.headers.map((h) => h.colName).join(', ');
    navigator.clipboard.writeText(csvLine);
    setCopiedSheet(schema.sheetName);
    toast.success(`Baris Judul Kolom (${schema.sheetName}) berhasil disalin!`);
    setTimeout(() => setCopiedSheet(null), 2500);
  };

  const handleCopyAllGasScript = () => {
    const gasScriptCode = `/**
 * GOOGLE APPS SCRIPT BACKEND & AUTOMATIC TABLE SETUP
 * Aplikasi PRIMA Learning Portal
 */

function doGet(e) {
  var action = e.parameter.action;
  var sheetName = e.parameter.sheet;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'read' && sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    var headers = data[0];
    var result = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        if (key) obj[key] = row[j];
      }
      result.push(obj);
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("PRIMA Apps Script Ready");
}

function doPost(e) {
  try {
    var sheetName = e.parameter.sheet;
    var action = e.parameter.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    var payload = JSON.parse(e.postData.contents);
    var headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
    
    // Auto-create headers if sheet is empty
    if (sheet.getLastRow() === 0 || !headers[0]) {
      headers = Object.keys(payload);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    }
    
    if (action === 'create') {
      var rowData = [];
      for (var i = 0; i < headers.length; i++) {
        var val = payload[headers[i]];
        rowData.push(val !== undefined ? val : '');
      }
      sheet.appendRow(rowData);
      return ContentService.createTextOutput("Success");
    }
    
    if (action === 'update') {
      var data = sheet.getDataRange().getValues();
      var idIndex = headers.indexOf('id');
      if (idIndex !== -1 && payload.id) {
        for (var r = 1; r < data.length; r++) {
          if (String(data[r][idIndex]) === String(payload.id)) {
            for (var c = 0; c < headers.length; c++) {
              if (payload[headers[c]] !== undefined) {
                sheet.getRange(r + 1, c + 1).setValue(payload[headers[c]]);
              }
            }
            return ContentService.createTextOutput("Success");
          }
        }
      }
      // Fallback append if update target not found
      var newRow = [];
      for (var k = 0; k < headers.length; k++) {
        newRow.push(payload[headers[k]] !== undefined ? payload[headers[k]] : '');
      }
      sheet.appendRow(newRow);
      return ContentService.createTextOutput("Success");
    }
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString());
  }
}

/**
 * OTOMATIS MEMBUAT SELURUH TAB SHEET & JUDUL KOLOM DI SPREADSHEET
 * Jalankan fungsi 'autoSetupAllSheets' di Apps Script Editor!
 */
function autoSetupAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var schemas = ${JSON.stringify(
    SHEET_SCHEMAS.map((s) => ({
      name: s.sheetName,
      cols: s.headers.map((h) => h.colName),
    })),
    null,
    2
  )};
  
  schemas.forEach(function(s) {
    var sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, s.cols.length).setValues([s.cols]);
      sheet.getRange(1, 1, 1, s.cols.length).setFontWeight("bold").setBackground("#4f46e5").setFontColor("#ffffff");
    }
  });
  
  SpreadsheetApp.getUi().alert("🎉 Berhasil! Seluruh Tab Sheet & Judul Kolom Database PRIMA telah dibuat otomatis.");
}`;

    navigator.clipboard.writeText(gasScriptCode);
    toast.success('Kode Google Apps Script + Auto Setup Sheet berhasil disalin!');
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-extrabold uppercase tracking-wider">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Dokumentasi Resmi Database Google Sheets</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight">
              Panduan Nama Sheet & Judul Kolom Database PRIMA
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Gunakan panduan lengkap ini untuk membuat nama tab <strong>Sheet</strong> dan <strong>Baris Judul Kolom (Row 1)</strong> di Google Spreadsheet Anda agar seluruh data tersimpan akurat dan presisi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleCopyAllGasScript}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
            >
              <Code className="w-4 h-4" />
              <span>Salin Kode Auto-Setup Apps Script</span>
            </button>
            <button
              onClick={() => setShowGasScript(!showGasScript)}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Server className="w-4 h-4 text-sky-400" />
              <span>{showGasScript ? 'Sembunyikan Kode GAS' : 'Lihat Script Backend'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Apps Script Modal Code Preview */}
      {showGasScript && (
        <div className="p-6 rounded-3xl bg-slate-950 text-slate-200 border border-slate-800 space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              <h4 className="font-heading font-black text-white text-base">
                Kode Google Apps Script (Pembuat Tab & Kolom Otomatis)
              </h4>
            </div>
            <button
              onClick={handleCopyAllGasScript}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Semua Kode</span>
            </button>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-2xl text-[11px] text-slate-400 space-y-1 font-mono">
            <p className="text-emerald-400 font-bold">// Cara Penggunaan:</p>
            <p>1. Buka Google Spreadsheet Anda ➔ Klik menu <strong>Ekstensi ➔ Apps Script</strong>.</p>
            <p>2. Hapus seluruh isi default, lalu <strong>Paste (Tempel)</strong> kode di bawah ini.</p>
            <p>3. Jalankan fungsi <code>autoSetupAllSheets</code> ➔ Semua Tab Sheet & Kolom akan dibuat otomatis!</p>
            <p>4. Klik <strong>Terapkan ➔ Deploy sebagai Web App</strong> (Akses: <em>Anyone/Siapa Saja</em>).</p>
          </div>

          <pre className="p-4 bg-slate-900 rounded-2xl overflow-x-auto text-[11px] font-mono text-emerald-300 leading-relaxed border border-slate-800 max-h-96">
            {`/**
 * GOOGLE APPS SCRIPT BACKEND & AUTOMATIC TABLE SETUP
 * Aplikasi PRIMA Learning Portal
 */

function doGet(e) {
  var action = e.parameter.action;
  var sheetName = e.parameter.sheet;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'read' && sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    var headers = data[0];
    var result = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        if (key) obj[key] = row[j];
      }
      result.push(obj);
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("PRIMA Apps Script Ready");
}

function doPost(e) {
  try {
    var sheetName = e.parameter.sheet;
    var action = e.parameter.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    var payload = JSON.parse(e.postData.contents);
    var headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
    
    if (sheet.getLastRow() === 0 || !headers[0]) {
      headers = Object.keys(payload);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    }

    // Helper find ID column case-insensitive
    var idIndex = -1;
    for (var h = 0; h < headers.length; h++) {
      if (String(headers[h]).trim().toLowerCase() === 'id') {
        idIndex = h;
        break;
      }
    }
    
    // ACTION: CLEANUP DUPLICATES
    if (action === 'cleanupDuplicates') {
      var allData = sheet.getDataRange().getValues();
      if (allData.length <= 1) return ContentService.createTextOutput("Success");
      var headRow = allData[0];
      var seenIds = {};
      var dedupedRows = [headRow];
      var checkCol = idIndex !== -1 ? idIndex : 0;
      
      for (var r = 1; r < allData.length; r++) {
        var row = allData[r];
        var keyVal = String(row[checkCol] || row[1] || '').trim().toLowerCase();
        if (keyVal && !seenIds[keyVal]) {
          seenIds[keyVal] = true;
          dedupedRows.push(row);
        }
      }
      sheet.clearContents();
      sheet.getRange(1, 1, dedupedRows.length, headRow.length).setValues(dedupedRows);
      sheet.getRange(1, 1, 1, headRow.length).setFontWeight("bold").setBackground("#4f46e5").setFontColor("#ffffff");
      return ContentService.createTextOutput("Success: Duplicates Cleaned");
    }
    
    // ACTION: CREATE (dengan proteksi anti-dobel: jika id sudah ada, otomatis update)
    if (action === 'create') {
      var data = sheet.getDataRange().getValues();
      if (idIndex !== -1 && payload.id) {
        for (var r = 1; r < data.length; r++) {
          if (String(data[r][idIndex]).trim().toLowerCase() === String(payload.id).trim().toLowerCase()) {
            for (var c = 0; c < headers.length; c++) {
              if (payload[headers[c]] !== undefined) {
                sheet.getRange(r + 1, c + 1).setValue(payload[headers[c]]);
              }
            }
            return ContentService.createTextOutput("Success (Updated Existing)");
          }
        }
      }

      var rowData = [];
      for (var i = 0; i < headers.length; i++) {
        var val = payload[headers[i]];
        rowData.push(val !== undefined ? val : '');
      }
      sheet.appendRow(rowData);
      return ContentService.createTextOutput("Success");
    }
    
    // ACTION: UPDATE (pencarian ID case-insensitive)
    if (action === 'update') {
      var data = sheet.getDataRange().getValues();
      if (idIndex !== -1 && payload.id) {
        for (var r = 1; r < data.length; r++) {
          if (String(data[r][idIndex]).trim().toLowerCase() === String(payload.id).trim().toLowerCase()) {
            for (var c = 0; c < headers.length; c++) {
              if (payload[headers[c]] !== undefined) {
                sheet.getRange(r + 1, c + 1).setValue(payload[headers[c]]);
              }
            }
            return ContentService.createTextOutput("Success");
          }
        }
      }
      var newRow = [];
      for (var k = 0; k < headers.length; k++) {
        newRow.push(payload[headers[k]] !== undefined ? payload[headers[k]] : '');
      }
      sheet.appendRow(newRow);
      return ContentService.createTextOutput("Success");
    }
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString());
  }
}

/**
 * FUNGSI BERSIHKAN DATA DOBEL / GANDA PADA SHEET 'Subjects'
 * Berjalan 100% aman baik dari Editor Apps Script maupun Menu Spreadsheet
 */
function bersihkanDataDobelSubjects() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = null;
  var sheets = ss.getSheets();
  for (var s = 0; s < sheets.length; s++) {
    if (sheets[s].getName().trim().toLowerCase() === "subjects") {
      sheet = sheets[s];
      break;
    }
  }
  if (!sheet) {
    Logger.log("❌ Tab sheet 'Subjects' tidak ditemukan.");
    return;
  }
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1) {
    Logger.log("ℹ️ Sheet 'Subjects' masih kosong.");
    return;
  }
  var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = data[0];
  var idCol = 0;
  for (var h = 0; h < headers.length; h++) {
    if (String(headers[h]).trim().toLowerCase() === 'id') {
      idCol = h;
      break;
    }
  }
  var seen = {};
  var cleanRows = [headers];
  var removed = 0;
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rawId = String(row[idCol] || '').trim().toLowerCase().replace(/_/g, '-');
    var rawName = String(row[1] || '').trim().toLowerCase();
    var key = rawId || rawName;
    if (!key) continue;
    if (!seen[key]) {
      seen[key] = row;
      cleanRows.push(row);
    } else {
      removed++;
      var statusCol = -1;
      for (var sc = 0; sc < headers.length; sc++) {
        if (String(headers[sc]).trim().toLowerCase() === "status") {
          statusCol = sc;
          break;
        }
      }
      if (statusCol !== -1 && String(row[statusCol]).toUpperCase() === "PUBLISHED") {
        for (var k = 1; k < cleanRows.length; k++) {
          var kKey = String(cleanRows[k][idCol] || '').trim().toLowerCase().replace(/_/g, '-');
          if (kKey === key) {
            cleanRows[k] = row;
            break;
          }
        }
      }
    }
  }
  sheet.clear();
  sheet.getRange(1, 1, cleanRows.length, headers.length).setValues(cleanRows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#4f46e5").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
  var msg = "🎉 Berhasil! " + removed + " data mata pelajaran dobel berhasil dibersihkan. Tersisa " + (cleanRows.length - 1) + " mata pelajaran unik yang rapi.";
  Logger.log(msg);
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch(e) {
    // Berjalan aman jika dieksekusi dari editor Apps Script tanpa UI
  }
}

/**
 * FUNGSI KHUSUS: SETUP JUDUL KOLOM SHEET CODING CHALLENGES
 * Jalankan fungsi ini untuk langsung memasang 12 kolom resmi Coding Challenges!
 */
function setupCodingChallengesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cols = ["id", "title", "subjectId", "allowedBlocksCount", "characterIcon", "gridSize", "startPos", "targetPos", "targetGoal", "availableBlocks", "expectedSequence", "lastUpdated"];
  
  // Deteksi sheet coding dengan berbagai kemungkinan nama (CodingChallenges, Coding Challenges, coding chaleng, dll)
  var sheet = null;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var n = sheets[i].getName().trim().toLowerCase().replace(/[\s_-]+/g, "");
    if (n.indexOf("coding") !== -1 || n.indexOf("chaleng") !== -1 || n.indexOf("challenge") !== -1) {
      sheet = sheets[i];
      // Pastikan nama tab resmi: CodingChallenges
      try { sheet.setName("CodingChallenges"); } catch(e) {}
      break;
    }
  }

  if (!sheet) {
    sheet = ss.insertSheet("CodingChallenges");
  }

  // Tuliskan Baris Judul Kolom (Row 1)
  sheet.getRange(1, 1, 1, cols.length).setValues([cols]);
  sheet.getRange(1, 1, 1, cols.length)
    .setFontWeight("bold")
    .setBackground("#4f46e5")
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  // Jika belum ada data baris 2, tambahkan 1 contoh tantangan awal
  if (sheet.getLastRow() <= 1) {
    sheet.appendRow([
      "cod-01",
      "Misi Robot: Menyiram Padi Sawah",
      "ipas",
      6,
      "🤖",
      4,
      '{"x":0,"y":0}',
      '{"x":3,"y":3}',
      "Bantu robot melangkah menuju petak sawah untuk menyiram tanaman padi",
      '[{"id":"b-maju","text":"Maju 1 Langkah","color":"blue"},{"id":"b-kanan","text":"Belok Kanan","color":"amber"},{"id":"b-kiri","text":"Belok Kiri","color":"purple"}]',
      '["b-maju","b-maju","b-kanan","b-maju"]',
      new Date().toISOString()
    ]);
  }

  try {
    sheet.autoResizeColumns(1, cols.length);
  } catch(e) {}

  var msg = "🎉 Berhasil! Seluruh 12 kolom resmi untuk Sheet CodingChallenges telah terpasang dengan rapi.";
  Logger.log(msg);
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch(e) {}
}

/**
 * Menu otomatis di Spreadsheet untuk pembersihan & setup 1-klik
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("🚀 PRIMA Tools")
      .addItem("🛠️ Setup Semua Sheet & Kolom Otomatis", "autoSetupAllSheets")
      .addItem("🎮 Setup Sheet Coding Challenges", "setupCodingChallengesSheet")
      .addItem("🧹 Bersihkan Duplikat Subjects", "bersihkanDataDobelSubjects")
      .addToUi();
  } catch(e) {}
}

/**
 * OTOMATIS MEMBUAT SELURUH TAB SHEET & JUDUL KOLOM DI SPREADSHEET
 * Tinggal pilih fungsi ini dan klik ▶ Run di Apps Script!
 */
function autoSetupAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var schemas = ${JSON.stringify(
    SHEET_SCHEMAS.map((s) => ({
      name: s.sheetName,
      cols: s.headers.map((h) => h.colName),
    })),
    null,
    2
  )};
  
  var createdCount = 0;
  var updatedCount = 0;

  schemas.forEach(function(s) {
    // Cari sheet fleksibel (bahkan jika ada spasi, underscore, atau huruf kecil/besar)
    var sheet = null;
    var sheets = ss.getSheets();
    var cleanTarget = s.name.toLowerCase().replace(/[\s_-]+/g, "");

    for (var k = 0; k < sheets.length; k++) {
      var rawName = sheets[k].getName().trim().toLowerCase();
      var cleanRaw = rawName.replace(/[\s_-]+/g, "");
      if (rawName === s.name.toLowerCase() || cleanRaw === cleanTarget || (cleanTarget.indexOf("coding") !== -1 && cleanRaw.indexOf("coding") !== -1)) {
        sheet = sheets[k];
        // Standardisasi nama tab ke nama resmi
        if (sheets[k].getName() !== s.name) {
          try { sheets[k].setName(s.name); } catch(e) {}
        }
        break;
      }
    }

    if (!sheet) {
      sheet = ss.insertSheet(s.name);
      createdCount++;
    }

    // Cek baris 1 (Header)
    var needHeader = false;
    if (sheet.getLastRow() === 0) {
      needHeader = true;
    } else {
      var currentHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
      if (!currentHeaders[0] || String(currentHeaders[0]).trim() === '' || currentHeaders.length < s.cols.length) {
        needHeader = true;
      }
    }

    if (needHeader) {
      sheet.getRange(1, 1, 1, s.cols.length).setValues([s.cols]);
      updatedCount++;
    }

    // Percantik Header
    sheet.getRange(1, 1, 1, s.cols.length)
      .setFontWeight("bold")
      .setBackground("#4f46e5")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
      
    sheet.setFrozenRows(1);
    try {
      sheet.autoResizeColumns(1, s.cols.length);
    } catch(e) {}
  });

  // Khusus CodingChallenges, pastikan kolomnya terisi
  try {
    setupCodingChallengesSheet();
  } catch(e) {}

  // Jika sheet Subjects ada baris dobel, otomatis rapikan juga
  try {
    bersihkanDataDobelSubjects();
  } catch(e) {}

  var resultMessage = "🎉 Berhasil! Seluruh 15 Tab Sheet & Judul Kolom PRIMA telah dibuat/dirapikan dengan sempurna.";
  Logger.log(resultMessage);
  
  try {
    SpreadsheetApp.getUi().alert(resultMessage);
  } catch(e) {
    // Aman jika dijalankan dari editor Apps Script
  }
}`}
          </pre>
        </div>
      )}

      {/* Quick Filter Search & Statistics */}
      <div className="glass-card p-4 sm:p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama sheet (misal: Users, Videos, Materials) atau nama kolom..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 shrink-0">
          <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <Layers className="w-4 h-4" />
          </span>
          <span>
            Menampilkan <strong className="text-indigo-600">{filteredSchemas.length}</strong> dari {SHEET_SCHEMAS.length} Tab Sheet Database
          </span>
        </div>
      </div>

      {/* Grid of All Sheet Schemas */}
      <div className="space-y-6">
        {filteredSchemas.map((schema) => {
          const csvHeader = schema.headers.map((h) => h.colName).join(', ');
          const isCopied = copiedSheet === schema.sheetName;

          return (
            <div
              key={schema.sheetName}
              id={`sheet-${schema.sheetName.toLowerCase()}`}
              className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-5 shadow-sm hover:shadow-md transition-all bg-white"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl font-mono font-black text-sm shadow-md shrink-0">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 font-mono">
                        Sheet: {schema.sheetName}
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {schema.headers.length} Kolom Header
                      </span>
                    </div>
                    <h3 className="font-heading text-xl font-bold text-slate-900 mt-1">
                      {schema.moduleName}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyHeadersCSV(schema)}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all shrink-0 ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Tersalin!' : 'Salin Baris Header (CSV)'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {schema.description}
              </p>

              {/* Header Row Preview Badge */}
              <div className="p-3.5 bg-slate-900 rounded-2xl text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 flex items-center justify-between gap-3">
                <div className="truncate">
                  <span className="text-slate-500 font-bold select-none mr-2">Baris 1 (Row 1):</span>
                  <span className="font-bold">{csvHeader}</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-800 text-slate-300 rounded shrink-0">
                  Format Header Row 1
                </span>
              </div>

              {/* Table of Column Headers */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-12 text-center">Kolom</th>
                      <th className="p-3">Nama Header (Row 1)</th>
                      <th className="p-3">Tipe Data</th>
                      <th className="p-3">Wajib / Opsional</th>
                      <th className="p-3">Keterangan & Peruntukan</th>
                      <th className="p-3">Contoh Nilai Valid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {schema.headers.map((h, idx) => (
                      <tr key={h.colName} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3 text-center font-mono font-extrabold text-indigo-600 bg-indigo-50/30">
                          {h.colLetter}
                        </td>
                        <td className="p-3 font-mono font-extrabold text-slate-900">
                          <code>{h.colName}</code>
                        </td>
                        <td className="p-3 font-bold text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] border border-slate-200 font-mono">
                            {h.dataType}
                          </span>
                        </td>
                        <td className="p-3">
                          {h.isRequired ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                              WAJIB
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              Opsional
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-700 text-xs">
                          {h.description}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-indigo-900 bg-slate-50 rounded">
                          {h.sampleValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
