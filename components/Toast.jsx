'use client';

import { useEffect, useState } from 'react';

/**
 * Toast notification component.
 * Usage:
 *   const { showToast, ToastContainer } = useToast();
 *   showToast('Berhasil disimpan!', 'success');
 *   showToast('Terjadi kesalahan.', 'error');
 *   <ToastContainer />
 */

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success', duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, visible: true }]);
        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 350);
        }, duration);
    };

    const dismissToast = (id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 350);
    };

    const ToastContainer = () => (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-[380px] border-2 border-black shadow-[5px_5px_0px_0px_#000] px-4 py-3 transition-all duration-300
                        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        ${toast.type === 'success' ? 'bg-[#00FF94]' : ''}
                        ${toast.type === 'error'   ? 'bg-[#FF3333] text-white' : ''}
                        ${toast.type === 'info'    ? 'bg-[#FFE600]' : ''}
                    `}
                >
                    {/* Icon */}
                    <div className="shrink-0 mt-0.5">
                        {toast.type === 'success' && (
                            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {toast.type === 'error' && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {toast.type === 'info' && (
                            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    {/* Message */}
                    <p className={`flex-1 text-sm font-black tracking-wide leading-snug ${toast.type === 'error' ? 'text-white' : 'text-black'}`}>
                        {toast.message}
                    </p>

                    {/* Dismiss */}
                    <button
                        onClick={() => dismissToast(toast.id)}
                        className={`shrink-0 ml-1 opacity-60 hover:opacity-100 transition-opacity font-black text-lg leading-none ${toast.type === 'error' ? 'text-white' : 'text-black'}`}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );

    return { showToast, ToastContainer };
}
