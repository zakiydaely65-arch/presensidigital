'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function JamPelajaranPage() {
    const [activeTab, setActiveTab] = useState('rekap'); // 'rekap', 'input', 'jadwal'
    
    // State for Rekap
    const [rekapData, setRekapData] = useState([]);
    const [rekapFilter, setRekapFilter] = useState('');
    const [rekapPeriod, setRekapPeriod] = useState('semua');
    
    // State for Input
    const [inputDate, setInputDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }));
    const [inputSiswa, setInputSiswa] = useState([]);
    const [inputJadwal, setInputJadwal] = useState([]);
    const [inputAbsensi, setInputAbsensi] = useState({}); // { [siswaId_jpKe]: true/false }
    
    // State for Jadwal
    const [jadwalList, setJadwalList] = useState([]);
    const [selectedHari, setSelectedHari] = useState('Senin');
    const [jadwalMode, setJadwalMode] = useState('template'); // 'template', 'custom'
    const [customDate, setCustomDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }));
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const { showToast, ToastContainer } = useToast();

    useEffect(() => {
        if (activeTab === 'rekap') fetchRekap();
        if (activeTab === 'input') fetchInputData();
        if (activeTab === 'jadwal') {
            if (jadwalMode === 'template') fetchJadwal(selectedHari);
            else fetchCustomJadwal(customDate);
        }
    }, [activeTab, rekapFilter, rekapPeriod, inputDate, selectedHari, jadwalMode, customDate]);

    // --- REKAP ---
    const fetchRekap = async () => {
        setLoading(true);
        try {
            let url = '/api/rekap-jp?';
            if (rekapFilter) url += `organisasi=${rekapFilter}&`;
            
            if (rekapPeriod !== 'semua') {
                const today = new Date();
                let start, end;
                if (rekapPeriod === 'hari_ini') {
                    start = end = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
                } else if (rekapPeriod === 'minggu_ini') {
                    const first = today.getDate() - today.getDay() + 1;
                    const last = first + 6;
                    start = new Date(today.setDate(first)).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
                    end = new Date(today.setDate(last)).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
                } else if (rekapPeriod === 'bulan_ini') {
                    start = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
                    end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
                }
                url += `startDate=${start}&endDate=${end}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            if (data.success) setRekapData(data.data);
        } catch (err) {
            console.error('Error fetching rekap:', err);
        } finally {
            setLoading(false);
        }
    };

    // --- INPUT ---
    const fetchInputData = async () => {
        setLoading(true);
        try {
            // Get Siswa
            const siswaRes = await fetch('/api/siswa');
            const siswaData = await siswaRes.json();
            
            // Get Jadwal for that day
            const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const dateObj = new Date(inputDate);
            const dayName = dayNames[dateObj.getDay()];
            
            // Try fetch custom first, fallback to day name
            const jadwalRes = await fetch(`/api/jadwal-jp?tanggal_custom=${inputDate}&hari=${dayName}`);
            const jadwalData = await jadwalRes.json();
            
            // Get existing attendance
            const absensiRes = await fetch(`/api/absensi-jp?tanggal=${inputDate}`);
            const absensiData = await absensiRes.json();

            if (siswaData.success) setInputSiswa(siswaData.data);
            if (jadwalData.success) setInputJadwal(jadwalData.data || []);
            
            // Build Map
            const newAbsMap = {};
            if (absensiData.success && absensiData.data) {
                absensiData.data.forEach(ab => {
                    newAbsMap[`${ab.siswa_id}_${ab.jp_ke}`] = ab.hadir;
                });
            }
            
            // Default check all if not exists
            if (siswaData.success && jadwalData.success) {
                siswaData.data.forEach(s => {
                    (jadwalData.data || []).forEach(j => {
                        const key = `${s.id}_${j.jp_ke}`;
                        if (newAbsMap[key] === undefined) {
                            newAbsMap[key] = true; // default present
                        }
                    });
                });
            }
            setInputAbsensi(newAbsMap);
            
        } catch (err) {
            console.error('Error fetching input data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleJp = (siswaId, jpKe) => {
        setInputAbsensi(prev => ({
            ...prev,
            [`${siswaId}_${jpKe}`]: !prev[`${siswaId}_${jpKe}`]
        }));
    };

    const toggleAllRow = (siswaId) => {
        const anyChecked = inputJadwal.some(j => inputAbsensi[`${siswaId}_${j.jp_ke}`]);
        const nextState = !anyChecked; // if any checked, uncheck all. else check all.
        const newAbs = { ...inputAbsensi };
        inputJadwal.forEach(j => {
            newAbs[`${siswaId}_${j.jp_ke}`] = nextState;
        });
        setInputAbsensi(newAbs);
    }

    const saveInput = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const payload = [];
            inputSiswa.forEach(s => {
                inputJadwal.forEach(j => {
                    payload.push({
                        siswa_id: s.id,
                        tanggal: inputDate,
                        jp_ke: j.jp_ke,
                        hadir: !!inputAbsensi[`${s.id}_${j.jp_ke}`]
                    });
                });
            });

            const res = await fetch('/api/absensi-jp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ absensi: payload })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSuccess('Catatan JP berhasil disimpan!');
            showToast('Catatan JP berhasil disimpan!', 'success');
        } catch (err) {
            setError(err.message);
            showToast(err.message || 'Gagal menyimpan presensi JP.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- JADWAL ---
    const fetchJadwal = async (hari) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/jadwal-jp?hari=${hari}`);
            const data = await res.json();
            if (data.success) {
                setJadwalList(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching jadwal:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomJadwal = async (date) => {
        setLoading(true);
        try {
            const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const dayName = dayNames[new Date(date).getDay()];
            const res = await fetch(`/api/jadwal-jp?tanggal_custom=${date}&hari=${dayName}`);
            const data = await res.json();
            if (data.success) {
                // Determine if the returned data is truly custom or fallback
                const isTrulyCustom = data.data.some(d => d.is_custom === true);
                // We map it to make sure we edit the custom version
                const list = data.data.map(d => ({
                    ...d, 
                    id: isTrulyCustom ? d.id : undefined, // clear id if fallback so it inserts new
                    is_custom: true, 
                    tanggal_custom: date 
                }));
                setJadwalList(list);
            }
        } catch (err) {
            console.error('Error fetching custom jadwal:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateJadwalItem = (idx, field, value) => {
        const newList = [...jadwalList];
        newList[idx][field] = value;
        setJadwalList(newList);
    };

    const addJpRow = () => {
        const jpKe = jadwalList.length > 0 ? Math.max(...jadwalList.map(j => j.jp_ke)) + 1 : 1;
        const newRow = {
            hari: selectedHari,
            jp_ke: jpKe,
            mulai: '07:00',
            durasi_menit: 30,
            is_custom: jadwalMode === 'custom',
            tanggal_custom: jadwalMode === 'custom' ? customDate : null
        };
        setJadwalList([...jadwalList, newRow]);
    };

    const deleteJpRow = (idx) => {
        const newList = [...jadwalList];
        newList.splice(idx, 1);
        // Re-calculate jp_ke
        newList.forEach((item, i) => item.jp_ke = i + 1);
        setJadwalList(newList);
    };

    const saveJadwal = async () => {
         setLoading(true);
         setError('');
         setSuccess('');
         try {
             // If custom mode, first clear existing custom for that date to replace cleanly
             if (jadwalMode === 'custom') {
                 await fetch(`/api/jadwal-jp?tanggal_custom=${customDate}`, { method: 'DELETE' });
             } else {
                 // For template mode, ideally we should delete all for that day and re-insert,
                 // but for simplicity we will just update existing ones and insert new ones.
                 // To allow deletion, we'd need a robust sync. Let's just update/insert.
                 // If the user deleted a row from UI, we should delete it in DB too.
                 // Since we don't track deleted items simply here, we will just delete all template for this day and reinsert!
                 await fetch(`/api/jadwal-jp?hari=${selectedHari}`, { method: 'DELETE' });
             }

             for (const j of jadwalList) {
                 // ensure proper payload
                 const payload = { ...j };
                 delete payload.id; // always insert as new to replace old
                 if (jadwalMode === 'custom') {
                     const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                     payload.hari = dayNames[new Date(customDate).getDay()];
                 }
                 
                 await fetch('/api/jadwal-jp', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(payload)
                 });
             }
             setSuccess(jadwalMode === 'custom' ? `Jadwal custom tanggal ${customDate} berhasil disimpan` : `Jadwal hari ${selectedHari} berhasil diperbarui`);
             showToast(jadwalMode === 'custom' ? `Jadwal custom ${customDate} berhasil disimpan` : `Jadwal ${selectedHari} berhasil diperbarui`, 'success');
             
             // Refresh list to get new IDs
             if (jadwalMode === 'template') fetchJadwal(selectedHari);
             else fetchCustomJadwal(customDate);
             
         } catch (err) {
             setError('Gagal menyimpan jadwal');
             showToast('Gagal menyimpan jadwal.', 'error');
         } finally {
             setLoading(false);
         }
    };

    // Validasi: hanya izinkan Senin-Jumat untuk custom jadwal
    const isWeekend = (dateStr) => {
        if (!dateStr) return false;
        const day = new Date(dateStr).getDay(); // 0=Minggu, 6=Sabtu
        return day === 0 || day === 6;
    };

    const handleCustomDateChange = (e) => {
        const val = e.target.value;
        if (isWeekend(val)) {
            setError('Jadwal custom hanya bisa dibuat untuk hari Senin sampai Jumat.');
            return;
        }
        setError('');
        setCustomDate(val);
    };

    const deleteCustomJadwal = async () => {        if(!confirm('Anda yakin ingin mereset jadwal custom tanggal ini kembali ke template default?')) return;
        setLoading(true);
        try {
            await fetch(`/api/jadwal-jp?tanggal_custom=${customDate}`, { method: 'DELETE' });
            setSuccess('Jadwal custom berhasil dihapus. Kembali ke default.');
            showToast('Jadwal custom berhasil dihapus.', 'success');
            fetchCustomJadwal(customDate);
        } catch (err) {
            setError('Gagal menghapus jadwal custom');
            showToast('Gagal menghapus jadwal custom.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderJadwalEditor = () => (
        <>
            {loading ? (
                <p className="font-bold">Memuat jadwal...</p>
            ) : jadwalList.length === 0 && jadwalMode === 'custom' ? (
                <div className="text-center py-8">
                    <p className="font-bold">Belum ada jadwal custom untuk tanggal ini.</p>
                    <p className="text-sm text-slate-500 mt-2 mb-4">Jika kosong, sistem akan menggunakan template reguler konstan secara otomatis.</p>
                    <button className="btn btn-primary py-2 px-6 font-black shadow-[3px_3px_0px_0px_#000]" onClick={addJpRow}>BUAT JADWAL CUSTOM BARU</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {jadwalList.map((j, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 p-3 border-2 border-black">
                            <div className="font-black w-24 bg-[#FFE600] px-3 py-2 border-2 border-black text-center">JP {j.jp_ke}</div>
                            <div className="flex-1 flex gap-4 w-full">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold tracking-widest uppercase mb-1 block">Mulai</label>
                                    <input type="time" className="input w-full py-2 disabled:bg-slate-200 disabled:opacity-70" value={j.mulai ? j.mulai.substring(0,5) : ''} onChange={(e) => updateJadwalItem(idx, 'mulai', e.target.value)} disabled={jadwalMode === 'template'} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold tracking-widest uppercase mb-1 block">Durasi (Menit)</label>
                                    <input type="number" className="input w-full py-2 disabled:bg-slate-200 disabled:opacity-70" value={j.durasi_menit || ''} onChange={(e) => updateJadwalItem(idx, 'durasi_menit', parseInt(e.target.value))} disabled={jadwalMode === 'template'} />
                                </div>
                            </div>
                            {jadwalMode === 'custom' && (
                                <button className="btn bg-[#FF3333] text-white p-2 border-2 border-black hover:bg-black transition-colors" onClick={() => deleteJpRow(idx)} title="Hapus JP">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="square" strokeLinejoin="miter" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {jadwalMode === 'custom' && (
                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <button className="btn border-2 border-black hover:bg-slate-100 py-3 px-6 font-black w-full sm:w-auto" onClick={addJpRow} disabled={loading}>
                                + TAMBAH JP
                            </button>
                            <button className="btn btn-primary shadow-[4px_4px_0px_0px_#000] py-3 px-8 font-black w-full sm:w-auto" onClick={saveJadwal} disabled={loading}>
                                {loading ? 'MENYIMPAN...' : (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    SIMPAN JADWAL
                                </span>
                            )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            <ToastContainer />
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 pb-4 md:pb-6 border-b-4 border-black">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-black tracking-tight">Akumulasi Jam Pelajaran</h1>
                    <p className="text-black font-bold mt-1 md:mt-2 text-sm md:text-base">Kelola dan pantau jam pelajaran yang diikuti oleh anggota.</p>
                </div>
            </header>

            {success && (
                <div className="alert alert-success border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <span className="font-bold text-sm">{success}</span>
                    <button onClick={() => setSuccess('')} className="ml-auto opacity-50 hover:opacity-100">×</button>
                </div>
            )}
            
            {error && (
                <div className="alert alert-error border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <span className="font-bold text-sm">{error}</span>
                    <button onClick={() => setError('')} className="ml-auto opacity-50 hover:opacity-100">×</button>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-x-auto">
                {[
                    { id: 'rekap',  label: 'REKAP JP SISWA',    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                    { id: 'input',  label: 'INPUT JP HARIAN',   iconPath: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                    { id: 'jadwal', label: 'PENGATURAN JADWAL', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
                ].map(t => (
                    <button
                        key={t.id}
                        className={`flex-1 py-4 px-4 font-black text-xs sm:text-sm uppercase tracking-widest whitespace-nowrap transition-colors border-r-2 border-black last:border-r-0 flex items-center justify-center gap-2 ${
                            activeTab === t.id ? 'bg-[#FFE600] text-black shadow-[inset_0_-4px_0_0_#000]' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                        onClick={() => { setError(''); setSuccess(''); setActiveTab(t.id); }}
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={t.iconPath} />
                        </svg>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT: REKAP */}
            {activeTab === 'rekap' && (
                <div className="space-y-4">
                    <div className="card p-4 md:p-6 flex flex-col sm:flex-row justify-between gap-4 border-t-4 border-t-[#FF90E8]">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organisasi</label>
                                <select className="select py-2 text-sm" value={rekapFilter} onChange={(e) => setRekapFilter(e.target.value)}>
                                    <option value="">SEMUA ORGANISASI</option>
                                    <option value="OSIS">OSIS</option>
                                    <option value="MPK">MPK</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode</label>
                                <select className="select py-2 text-sm" value={rekapPeriod} onChange={(e) => setRekapPeriod(e.target.value)}>
                                    <option value="semua">SEPANJANG WAKTU</option>
                                    <option value="hari_ini">HARI INI</option>
                                    <option value="minggu_ini">MINGGU INI</option>
                                    <option value="bulan_ini">BULAN INI</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="card overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-black border-b-2 border-black">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-black text-[#FFE600] uppercase tracking-widest text-center">Peringkat</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-[#FFE600] uppercase tracking-widest">Nama Siswa</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-[#FFE600] uppercase tracking-widest">Kelas</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-[#FFE600] uppercase tracking-widest">Organisasi</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-[#FFE600] uppercase tracking-widest text-right">Total JP Diikuti</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-black">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center font-bold">Memuat data...</td></tr>
                                ) : rekapData.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center font-bold">Tidak ada data JP yang ditemukan</td></tr>
                                ) : (
                                    rekapData.map((r, idx) => (
                                        <tr key={r.id} className="hover:bg-[#FFE600]/20">
                                            <td className="px-6 py-4 font-black text-center">{idx + 1}</td>
                                            <td className="px-6 py-4 font-bold">{r.nama}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{r.kelas}</td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${r.organisasi === 'OSIS' ? 'badge-primary' : 'badge-accent'}`}>
                                                    {r.organisasi}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-black font-mono text-xl text-right text-[#FF3333]">
                                                {r.totalJp} <span className="text-sm text-black">JP</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: INPUT */}
            {activeTab === 'input' && (
                <div className="space-y-4">
                    <div className="card p-4 md:p-6 flex flex-col sm:flex-row justify-between items-end gap-4 border-t-4 border-t-[#00FF94]">
                        <div className="w-full sm:w-auto">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pilih Tanggal Presensi</label>
                            <input 
                                type="date" 
                                className="input py-2 text-sm w-full"
                                value={inputDate}
                                onChange={(e) => setInputDate(e.target.value)}
                            />
                        </div>
                        <button 
                            className="btn btn-primary font-black py-2.5 shadow-[4px_4px_0px_0px_#000] w-full sm:w-auto"
                            onClick={saveInput}
                            disabled={loading || inputSiswa.length === 0 || inputJadwal.length === 0}
                        >
                            {loading ? 'MENYIMPAN...' : (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                SIMPAN PRESENSI JP
                            </span>
                        )}
                        </button>
                    </div>

                    {inputJadwal.length === 0 ? (
                        <div className="card p-8 text-center">
                            <p className="font-bold text-slate-500">Tidak ada jadwal JP yang ditemukan untuk tanggal ini.</p>
                            <p className="text-sm mt-2">Silakan periksa pengaturan jadwal untuk hari yang dipilih.</p>
                        </div>
                    ) : (
                        <div className="card overflow-x-auto border-2 border-black">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead className="bg-[#FFE600] border-b-2 border-black">
                                    <tr>
                                        <th className="px-4 py-4 border-r-2 border-black font-black text-xs uppercase w-[250px] sticky left-0 bg-[#FFE600] z-10">Nama Siswa</th>
                                        {inputJadwal.map(j => (
                                            <th key={j.jp_ke} className="px-2 py-4 border-r-2 border-black text-center min-w-[60px]">
                                                <div className="font-black text-xs">JP {j.jp_ke}</div>
                                                <div className="text-[10px] font-bold opacity-60 font-mono mt-1">{j.mulai.substring(0,5)}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-black">
                                    {loading && inputSiswa.length === 0 ? (
                                        <tr><td colSpan={inputJadwal.length + 1} className="p-8 text-center font-bold">Memuat siswa...</td></tr>
                                    ) : (
                                        inputSiswa.map(s => (
                                            <tr key={s.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 border-r-2 border-black sticky left-0 bg-white z-10">
                                                    <div className="font-bold text-sm cursor-pointer hover:text-primary transition-colors" onClick={() => toggleAllRow(s.id)}>
                                                        {s.nama}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-bold mt-1 whitespace-nowrap">{s.kelas} • {s.organisasi}</div>
                                                </td>
                                                {inputJadwal.map(j => (
                                                    <td key={j.jp_ke} className="px-2 py-3 border-r-2 border-black text-center align-middle hover:bg-slate-100 cursor-pointer" onClick={() => toggleJp(s.id, j.jp_ke)}>
                                                        <div className="flex justify-center items-center h-full">
                                                            <div className={`w-6 h-6 border-2 border-black flex items-center justify-center transition-colors ${inputAbsensi[`${s.id}_${j.jp_ke}`] ? 'bg-[#00FF94] shadow-[2px_2px_0px_0px_#000]' : 'bg-white'}`}>
                                                                {inputAbsensi[`${s.id}_${j.jp_ke}`] && (
                                                                    <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: JADWAL */}
            {activeTab === 'jadwal' && (
                <div className="space-y-6">
                    {/* Toggle Mode */}
                    <div className="flex border-2 border-black w-full sm:w-max bg-white">
                        <button 
                            className={`flex-1 sm:flex-none px-6 py-3 font-black text-xs uppercase tracking-widest transition-colors ${jadwalMode === 'template' ? 'bg-[#FFE600] text-black shadow-[inset_0_-4px_0_0_#000]' : 'text-slate-500 hover:bg-slate-100'}`}
                            onClick={() => { setJadwalMode('template'); setError(''); setSuccess(''); }}
                        >
                            TEMPLATE REGULER
                        </button>
                        <button 
                            className={`flex-1 sm:flex-none border-l-2 border-black px-6 py-3 font-black text-xs uppercase tracking-widest transition-colors ${jadwalMode === 'custom' ? 'bg-black text-[#FFE600] shadow-[inset_0_-4px_0_0_#FF90E8]' : 'text-slate-500 hover:bg-slate-100'}`}
                            onClick={() => { setJadwalMode('custom'); setError(''); setSuccess(''); }}
                        >
                            CUSTOM JADWAL HARI TERTENTU
                        </button>
                    </div>

                    {jadwalMode === 'template' ? (
                        <>
                            <div className="flex flex-wrap gap-2">
                                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(h => (
                                    <button
                                        key={h}
                                        className={`btn border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-black uppercase ${selectedHari === h ? 'bg-primary text-white translate-y-[2px] translate-x-[2px] shadow-[1px_1px_0px_0px_#000]' : 'bg-white text-black hover:bg-slate-50'}`}
                                        onClick={() => setSelectedHari(h)}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                            <div className="card p-6 border-t-4 border-t-[#FF3333]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-black text-xl">Template Jadwal: <span className="text-primary">{selectedHari.toUpperCase()}</span></h3>
                                </div>
                                {renderJadwalEditor()}
                            </div>
                        </>
                    ) : (
                        <div className="card p-6 border-t-4 border-t-black">
                            <div className="mb-6 space-y-4">
                                <h3 className="font-black text-xl">Custom Jadwal Untuk Acara/Event</h3>
                                <p className="text-sm font-bold text-slate-500">Jadwal custom akan menggantikan template reguler khusus pada tanggal yang dipilih. Berguna jika ada pulang cepat atau acara khusus.</p>
                                
                                <div className="flex flex-col sm:flex-row items-end gap-4">
                                    <div className="w-full sm:w-auto">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Pilih Tanggal (Senin – Jumat)</label>
                                        <input 
                                            type="date" 
                                            className="input py-2 text-sm w-full"
                                            value={customDate}
                                            onChange={handleCustomDateChange}
                                        />
                                        {customDate && (() => {
                                            const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                                            const day = dayNames[new Date(customDate).getDay()];
                                            const isWE = day === 'Sabtu' || day === 'Minggu';
                                            return (
                                                <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${isWE ? 'text-[#FF3333]' : 'text-slate-400'}`}>
                                                    {isWE ? `${day} — tidak tersedia` : day}
                                                </p>
                                            );
                                        })()}
                                    </div>
                                    {jadwalList.some(j => j.is_custom) && (
                                        <button className="btn bg-[#FF3333] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] py-2 px-4 font-black text-xs flex items-center gap-2" onClick={deleteCustomJadwal}>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                            HAPUS JADWAL CUSTOM (RESET)
                                        </button>
                                    )}
                                </div>
                            </div>
                            {renderJadwalEditor()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
