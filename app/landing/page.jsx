import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <main className="min-h-screen relative overflow-hidden bg-[#F8FAFC] font-sans selection:bg-accent/20 selection:text-accent-dark text-slate-700">
            {/* Custom Animations for Interactive Connectors */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg) scale(1.05); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(-5deg) scale(0.95); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(10deg); }
                }
                @keyframes trace-line {
                    0% { top: -10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
                }
                .animate-trace-1 { animation: trace-line 12s linear infinite; }
                .animate-trace-2 { animation: trace-line 18s linear infinite 4s; }
                .animate-trace-3 { animation: trace-line 15s linear infinite 8s; }
                
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
                .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
            `}</style>

            {/* Unified Ambient Background (Tanpa Garis Grid) */}
            <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
                {/* Dynamic gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#f0f7ff] to-slate-50 opacity-80" />
                
                {/* Floating Glows (Mesh Gradient Feel) */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/10 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/10 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
                <div className="absolute bottom-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-emerald-400/10 blur-[140px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />

                {/* Interactive Vertikal Connectors (Lead the eye down the page) */}
                <div className="absolute left-[8%] md:left-[10%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-slate-200/60 to-transparent hidden md:block">
                     {/* Tracer dot / Meteor effect */}
                     <div className="absolute left-[-1px] w-[3px] h-32 bg-gradient-to-b from-transparent via-accent to-transparent animate-trace-1 rounded-full opacity-60"></div>
                </div>
                
                <div className="absolute right-[8%] md:right-[15%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-slate-200/60 to-transparent hidden md:block">
                     {/* Tracer dot / Meteor effect */}
                     <div className="absolute left-[-1px] w-[3px] h-24 bg-gradient-to-b from-transparent via-indigo-500 to-transparent animate-trace-2 rounded-full opacity-60"></div>
                </div>
                
                <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-slate-200/30 to-transparent hidden xl:block">
                     {/* Tracer dot / Meteor effect */}
                     <div className="absolute left-[-1px] w-[3px] h-40 bg-gradient-to-b from-transparent via-emerald-400 to-transparent animate-trace-3 rounded-full opacity-40"></div>
                </div>
            </div>

            {/* Decorative Floating Geometry (To connect spaces horizontally & add depth) */}
            <div className="absolute top-[18%] right-[8%] w-32 h-32 rounded-full border border-indigo-200/40 bg-gradient-to-br from-indigo-50/20 to-transparent animate-float-medium pointer-events-none hidden lg:block z-0 blur-[1px]"></div>
            <div className="absolute top-[45%] left-[5%] w-24 h-24 rounded-full border border-accent/20 bg-gradient-to-tl from-accent/5 to-transparent animate-float-slow pointer-events-none hidden lg:block z-0"></div>
            <div className="absolute top-[70%] right-[12%] w-40 h-40 rounded-full border border-emerald-200/30 bg-gradient-to-br from-emerald-50/30 to-transparent animate-float-medium pointer-events-none hidden lg:block z-0 blur-[2px]" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-[35%] left-[45%] w-12 h-12 rounded-full border border-blue-200/40 animate-float-fast pointer-events-none hidden xl:block z-0" style={{ animationDelay: '2s' }}></div>

            {/* Header */}
            <header className="px-6 py-8 lg:px-12 max-w-7xl mx-auto flex items-center justify-between z-20 relative">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-accent to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="text-xl font-extrabold text-primary tracking-tight">Presensi<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-indigo-600">Digital</span></span>
                </div>
                <div>
                     <Link href="/login" className="btn btn-sm text-slate-600 hover:text-primary hover:bg-white/60 font-semibold hidden md:inline-flex backdrop-blur-md rounded-xl transition-all border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md">
                        Masuk Admin
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative px-6 pt-12 pb-24 lg:pt-20 lg:pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 z-10">
                <div className="flex-1 text-center lg:text-left space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm text-accent font-bold text-sm mx-auto lg:mx-0 animate-fadeIn cursor-default group">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        <span>Aplikasi Presensi Generasi Baru</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-extrabold text-primary leading-[1.15] tracking-tight animate-slideUp">
                        Catat Kehadiran <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-indigo-500 to-blue-500">
                            Lebih Cepat & Akurat
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 animate-slideUp leading-relaxed" style={{ animationDelay: '100ms' }}>
                        Tingkatkan kedisiplinan bersinergi dengan kecepatan. Ekosistem presensi digital real-time menggunakan verifikasi geolokasi cerdas untuk sekolah Anda.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-slideUp" style={{ animationDelay: '200ms' }}>
                        <Link href="/siswa" className="btn btn-lg bg-gradient-to-r from-accent to-indigo-600 text-white w-full sm:w-auto group shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 border-0 hover:-translate-y-1 transition-all duration-300">
                            Mulai Presensi Sekarang
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        <Link href="/login" className="btn btn-lg bg-white/60 backdrop-blur-md border border-slate-200 text-primary w-full sm:w-auto hover:bg-white hover:border-slate-300 shadow-sm hover:-translate-y-1 transition-all duration-300">
                            Pelajari Dasbor
                        </Link>
                    </div>

                    <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-8 lg:gap-10 text-slate-500 animate-slideUp" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-500 hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="font-semibold text-sm text-primary">Sinkronisasi Real-time</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-accent hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="font-semibold text-sm text-primary">Validasi Lokasi Cerdas</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full relative animate-fadeIn" style={{ animationDelay: '400ms' }}>
                    <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square group max-w-lg mx-auto">
                        {/* Glow Behind Image */}
                        <div className="absolute inset-x-8 inset-y-8 bg-gradient-to-tr from-accent/40 via-indigo-400/20 to-transparent rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
                        
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl shadow-2xl shadow-indigo-900/5 rounded-[2.5rem] lg:rounded-[3rem] -rotate-2 group-hover:rotate-0 transition-transform duration-700 overflow-hidden border border-white p-2.5">
                            <div className="w-full h-full relative rounded-3xl lg:rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200/50">
                                <Image 
                                    src="/attendance_illustration.png" 
                                    alt="Ilustrasi Presensi Digital" 
                                    fill
                                    className="object-cover scale-[1.02] group-hover:scale-[1.05] transition-transform duration-1000"
                                    priority
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-white/10 pointer-events-none mix-blend-overlay"></div>
                            </div>
                        </div>

                        {/* Floating Action Badge 1 */}
                        <div className="absolute -bottom-4 -left-8 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-white flex items-center gap-4 hover:-translate-y-2 transition-transform duration-500 group-hover:-translate-y-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-inner">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="pr-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Berhasil Verifikasi</p>
                                <p className="text-sm font-extrabold text-primary">Kehadiran Masuk</p>
                            </div>
                        </div>

                        {/* Floating Time Badge 2 */}
                        <div className="absolute top-12 -right-6 bg-white/90 backdrop-blur-xl py-3 px-5 rounded-2xl shadow-xl shadow-slate-200/50 border border-white flex items-center gap-3 hover:-translate-y-2 transition-transform duration-500 delay-100 group-hover:-translate-y-2">
                            <div className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                            </div>
                            <p className="text-sm font-extrabold text-primary tracking-tight">07:05 WIB</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seamless Statistics Section */}
            <section className="relative z-10 pt-8 pb-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
                     {/* Horizontal connector line specifically for this section */}
                     <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent -z-10"></div>
                     
                     <div className="bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:bg-white/60 transition-colors duration-500">
                        {/* Shimmer effect inside card */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
                        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-100 to-transparent opacity-50"></div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-200/50">
                            <div className="space-y-3">
                                <h4 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-slate-600 group-hover:from-accent group-hover:to-indigo-500 transition-colors duration-500">100%</h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Digitalisasi Penuh</p>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-slate-600 group-hover:from-accent group-hover:to-indigo-500 transition-colors duration-500">&lt;2s</h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kecepatan Presensi</p>
                            </div>
                            <div className="space-y-3 hidden md:block">
                                <h4 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-slate-600 group-hover:from-accent group-hover:to-indigo-500 transition-colors duration-500">99.9%</h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uptime Server</p>
                            </div>
                            <div className="space-y-3 hidden md:block">
                                <h4 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-emerald-700">Aman</h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enkripsi Data</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                     <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-indigo-50/80 backdrop-blur-sm border border-indigo-100/50 text-indigo-600 text-xs font-bold uppercase tracking-widest cursor-default hover:bg-indigo-100/80 transition-colors">
                            Alur Sederhana
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-primary mb-6">Cara Kerja Pintar & Adaptif</h2>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Kami mendesain pengalaman yang tidak memerlukan panduan saking mudahnya. Hanya butuh beberapa detik menuju validasi absensi Anda.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-10 md:gap-4 relative">
                        {/* Connecting Line (Smooth Gradient Solid) */}
                        <div className="hidden md:block absolute top-[2.75rem] left-[15%] right-[15%] h-1 bg-gradient-to-r from-slate-200/50 via-indigo-200/50 to-emerald-200/50 rounded-full z-0 overflow-hidden">
                             {/* Animated fluid inside the horizontal line */}
                             <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50 animate-trace-1" style={{ animationDuration: '4s' }}></div>
                        </div>

                        {[
                            { step: 1, title: 'Identifikasi', desc: 'Masukkan Nomor Induk (NISN) di halaman portal aplikasi presensi.', color: 'text-accent', bg: 'bg-accent' },
                            { step: 2, title: 'Akses Lokasi', desc: 'Izinkan kalibrasi GPS memverifikasi keberadaan Anda secara otomatis.', color: 'text-indigo-500', bg: 'bg-indigo-500' },
                            { step: 3, title: 'Tentukan Status', desc: 'Pilih absensi (Hadir, Izin, Sakit) sesuai dengan kondisi faktual hari ini.', color: 'text-violet-500', bg: 'bg-violet-500' },
                            { step: 4, title: 'Rekap Instan', desc: 'Data berhasil masuk brankas cloud dan laporan diperbarui detik itu juga.', color: 'text-emerald-500', bg: 'bg-emerald-500', icon: true }
                        ].map((item, idx) => (
                            <div key={idx} className="relative z-10 flex flex-col items-center text-center group mt-4 md:mt-0">
                                <div className="w-24 h-24 mb-6 rounded-full bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/40 flex items-center justify-center border border-white relative transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                                    <div className={`absolute inset-0 ${item.bg} rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out opacity-10 -z-10`}></div>
                                    {!item.icon ? (
                                        <span className={`text-4xl font-black ${item.color}`}>{item.step}</span>
                                    ) : (
                                        <svg className={`w-10 h-10 ${item.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <h4 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">{item.title}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed px-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Capabilities Section */}
            <section className="pt-20 pb-32 relative z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                        <div className="flex-1 space-y-10">
                            <div>
                                <h2 className="text-3xl lg:text-5xl font-extrabold text-primary mb-6 leading-tight">Teknologi Inti <br/>Di Balik Layar</h2>
                                <p className="text-slate-600 text-lg">
                                    Semua alat kompleks telah diotomatisasi. Anda hanya perlu fokus pada peningkatan kedalaman pembelajaran dan organisasi.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Capability 1 */}
                                <div className="flex gap-5 p-6 rounded-3xl bg-white/40 hover:bg-white/80 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-default group">
                                    <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm border border-slate-100 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-colors duration-300 hover:scale-110">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-primary mb-2 transition-colors">Akurasi Geolocation GPS</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Sistem akan memvalidasi koordinat *latitude* & *longitude* anggota untuk memastikan presensi dilakukan secara aman di wilayah cakupan sekolah.
                                        </p>
                                    </div>
                                </div>

                                {/* Capability 2 */}
                                <div className="flex gap-5 p-6 rounded-3xl bg-white/40 hover:bg-white/80 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-default group">
                                    <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-colors duration-300 hover:scale-110">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-primary mb-2 transition-colors">Monitoring Dasbor Real-time</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Pantau siapa saja yang hadir, izin, atau tanpa kabar hari ini lewat *dashboard* admin yang responsif dengan fitur filter waktu tak terbatas.
                                        </p>
                                    </div>
                                </div>

                                {/* Capability 3 */}
                                <div className="flex gap-5 p-6 rounded-3xl bg-white/40 hover:bg-white/80 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-default group">
                                    <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-slate-100 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-colors duration-300 hover:scale-110">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-primary mb-2 transition-colors">Ekspor Satu Klik ke Spreadsheet</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Tarik seluruh log data mentah rekapitulasi ke format siap olah seperti XLSX dengan satu klik cerdas, sempurna untuk kebutuhan LPJ.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full bg-gradient-to-br from-indigo-50 to-slate-100 rounded-[3rem] p-6 md:p-10 relative overflow-hidden group shadow-inner border border-white">
                           {/* Blurs for UI depth */}
                           <div className="absolute top-[-20%] right-[-10%] w-[150%] h-[150%] bg-gradient-to-b from-transparent via-white/40 to-white backdrop-blur-[2px] z-10 pointer-events-none" />
                           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
                           <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px]" />
                           
                           {/* Decorative Layout simulating Dashboard App */}
                           <div className="relative w-full bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-900/10 border border-white overflow-hidden group-hover:scale-[1.03] group-hover:-translate-y-2 transition-all duration-700 z-0">
                                {/* App Header */}
                                <div className="px-6 py-4 border-b border-slate-100/80 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex gap-2.5">
                                        <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-rose-400 transition-colors"></div>
                                        <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-amber-400 transition-colors"></div>
                                        <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-emerald-400 transition-colors"></div>
                                    </div>
                                    <div className="w-32 h-4 bg-slate-200/50 rounded-full"></div>
                                </div>
                                {/* App Body */}
                                <div className="p-6 md:p-8 space-y-6">
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                                        <div className="space-y-2">
                                            <div className="w-20 h-3 bg-slate-200 rounded"></div>
                                            <div className="w-32 h-8 bg-slate-800 rounded-lg animate-pulse"></div>
                                        </div>
                                        <div className="w-24 h-10 bg-accent/10 border border-accent/20 rounded-xl"></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="h-24 bg-gradient-to-b from-emerald-50/50 to-emerald-100/50 rounded-2xl border border-emerald-100/50 p-4 space-y-2 hover:scale-105 transition-transform">
                                            <div className="w-6 h-6 rounded-full bg-emerald-200/50"></div>
                                            <div className="w-12 h-4 bg-emerald-600/20 rounded"></div>
                                        </div>
                                        <div className="h-24 bg-gradient-to-b from-amber-50/50 to-amber-100/50 rounded-2xl border border-amber-100/50 p-4 space-y-2 hover:scale-105 transition-transform">
                                            <div className="w-6 h-6 rounded-full bg-amber-200/50"></div>
                                            <div className="w-10 h-4 bg-amber-600/20 rounded"></div>
                                        </div>
                                        <div className="h-24 bg-gradient-to-b from-rose-50/50 to-rose-100/50 rounded-2xl border border-rose-100/50 p-4 space-y-2 hover:scale-105 transition-transform">
                                             <div className="w-6 h-6 rounded-full bg-rose-200/50"></div>
                                             <div className="w-8 h-4 bg-rose-600/20 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        {[1,2,3].map((i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner"></div>
                                                <div className="flex-1 space-y-2.5">
                                                    <div className="flex justify-between">
                                                        <div className="w-32 h-3.5 bg-slate-200 rounded"></div>
                                                        <div className="w-16 h-3.5 bg-emerald-100 rounded opacity-50"></div>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="w-3/4 h-full bg-slate-200"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seamless Transition to Dark CTA */}
            <div className="w-full h-24 bg-gradient-to-b from-transparent to-slate-900 relative z-0"></div>

            {/* Dark Premium CTA Section */}
            <section className="py-24 relative z-10 bg-slate-900 overflow-hidden rounded-t-[3rem] -mt-10 border-t border-slate-800 shadow-[0_-20px_50px_rgb(15,23,42,0.1)]">
                {/* Visual Glow Elements Inside */}
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-accent/20 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-[-10%] w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                        Wujudkan Transisi <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-accent">Kedisiplinan Secara Presisi</span>
                    </h2>
                    <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                        Bergabung dengan sistem modern yang menghilangkan kompleksitas kertas. Tinggalkan cara usang dan ambil kendali mutlak dalam satu jentikan jari hari ini juga.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Link href="/siswa" className="btn btn-lg bg-white text-slate-900 border border-white hover:bg-slate-50 hover:scale-[1.02] shadow-[0_0_30px_rgb(255,255,255,0.2)] hover:shadow-[0_0_40px_rgb(255,255,255,0.4)] transition-all duration-300 font-bold px-8">
                            Tertarik, Coba Sekarang
                            <svg className="w-5 h-5 ml-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Comprehensive Professional Footer (Dark Context Maintained) */}
            <footer className="bg-slate-950 pt-20 pb-10 relative z-10 overflow-hidden">
                {/* Outer Glow bleeding from CTA */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 relative z-10">
                    {/* Brand Info */}
                    <div className="lg:col-span-4 space-y-6 md:pr-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center border border-slate-700 shadow-inner group-hover:border-accent transition-colors">
                                <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">Presensi<span className="text-slate-500">Digital</span></span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Platform asisten administrasi digital untuk pelacakan absensi dan monitoring kedisiplinan organisasi. Sistem terkalibrasi waktu dan geolokasi berintensitas tinggi.
                        </p>
                    </div>

                    {/* Quick Navigation */}
                    <div className="lg:col-span-3">
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Platform</h4>
                        <ul className="space-y-4">
                            <li><Link href="/siswa" className="text-slate-400 text-sm hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-accent rounded-full opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></span>Portal Absensi</Link></li>
                            <li><Link href="/login" className="text-slate-400 text-sm hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-accent rounded-full opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></span>Dasbor Kontrol Utama</Link></li>
                            <li><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-accent rounded-full opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></span>Status Keamanan</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="lg:col-span-3">
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Perusahaan</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Tentang Sistem</a></li>
                            <li><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Kebijakan Privasi Data</a></li>
                            <li><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Syarat Penggunaan</a></li>
                            <li><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">Catatan Pembaruan (Changelog)</a></li>
                        </ul>
                    </div>

                    {/* Newsletter / Contact */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Dukungan</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="mailto:support@presensidigital.id" className="text-slate-400 text-sm hover:text-white transition-colors block">support@presensi.id</a>
                            </li>
                            <li className="pt-2">
                                <span className="text-slate-500 text-xs block mb-1">Pusat Bantuan OSIS</span>
                                <span className="text-slate-400 text-sm">Gedung OSI, Ruang Teknologi Informasi LT.2</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="max-w-7xl mx-auto px-6 lg:px-12 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} PresensiDigital Platform. Hak cipta dilindungi undang-undang.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex gap-4">
                             <a href="#" className="text-slate-500 hover:text-white hover:scale-110 transition-all" aria-label="Github">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                            </a>
                            <a href="#" className="text-slate-500 hover:text-white hover:scale-110 transition-all" aria-label="Twitter">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                            </a>
                        </div>
                        <span className="text-slate-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> System Ops</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
