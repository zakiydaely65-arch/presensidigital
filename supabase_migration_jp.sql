-- Tabel jadwal_jp
CREATE TABLE jadwal_jp (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hari        text NOT NULL,          
  jp_ke       integer NOT NULL,       
  mulai       time NOT NULL,          
  durasi_menit integer NOT NULL,      
  is_custom   boolean DEFAULT false,  
  tanggal_custom date,                
  created_at  timestamptz DEFAULT now()
);

-- Data awal (seed)
INSERT INTO jadwal_jp (hari, jp_ke, mulai, durasi_menit) VALUES
('Senin', 1, '07:00', 30), ('Senin', 2, '07:30', 30), ('Senin', 3, '08:00', 30), ('Senin', 4, '08:30', 30),
('Senin', 5, '09:15', 30), ('Senin', 6, '09:45', 30), ('Senin', 7, '10:15', 30), ('Senin', 8, '10:45', 30),
('Selasa', 1, '07:00', 30), ('Selasa', 2, '07:30', 30), ('Selasa', 3, '08:00', 30), ('Selasa', 4, '08:30', 30),
('Selasa', 5, '09:15', 30), ('Selasa', 6, '09:45', 30), ('Selasa', 7, '10:15', 30), ('Selasa', 8, '10:45', 30),
('Rabu', 1, '07:00', 30), ('Rabu', 2, '07:30', 30), ('Rabu', 3, '08:00', 30), ('Rabu', 4, '08:30', 30),
('Rabu', 5, '09:15', 30), ('Rabu', 6, '09:45', 30), ('Rabu', 7, '10:15', 30), ('Rabu', 8, '10:45', 30),
('Kamis', 1, '07:00', 30), ('Kamis', 2, '07:30', 30), ('Kamis', 3, '08:00', 30), ('Kamis', 4, '08:30', 30),
('Kamis', 5, '09:15', 30), ('Kamis', 6, '09:45', 30), ('Kamis', 7, '10:15', 30), ('Kamis', 8, '10:45', 30),
('Sabtu', 1, '07:00', 30), ('Sabtu', 2, '07:30', 30), ('Sabtu', 3, '08:00', 30), ('Sabtu', 4, '08:30', 30),
('Sabtu', 5, '09:15', 30), ('Sabtu', 6, '09:45', 30), ('Sabtu', 7, '10:15', 30), ('Sabtu', 8, '10:45', 30),
('Jumat', 1, '07:00', 30), ('Jumat', 2, '07:30', 30), ('Jumat', 3, '08:00', 30), ('Jumat', 4, '08:30', 30);

-- Tabel absensi_jp
CREATE TABLE absensi_jp (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id    uuid NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  tanggal     date NOT NULL,
  jp_ke       integer NOT NULL,    
  hadir       boolean NOT NULL DEFAULT true,  
  keterangan  text,                
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(siswa_id, tanggal, jp_ke)
);

-- Update RLS policies jika diperlukan (sementara disable RLS atau allow all if anon key is used with full access)
-- Karena aplikasi ini sepertinya menggunakan service_role key atau anon key yang diset up untuk full access,
-- maka tabel ini tidak dipasangi RLS spesifik, sama dengan tabel presensi yang sudah ada.
