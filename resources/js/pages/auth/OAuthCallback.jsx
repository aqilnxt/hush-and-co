import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Memproses login...');

    useEffect(() => {
        const token = searchParams.get('token');
        const nextRoute = searchParams.get('nextRoute') || '/menu';

        if (token) {
            localStorage.setItem('token', token);
            setStatus('Login berhasil, mengarahkan...');
            toast.success('Login berhasil!');
            window.location.href = nextRoute;
            return;
        }

        const error = searchParams.get('error');
        if (error) {
            setStatus('Login gagal: ' + error);
            toast.error('Login OAuth gagal.');
            return;
        }

        setStatus('Tidak ada informasi login yang diterima.');
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
                <h1 className="text-xl font-semibold text-navy-800">OAuth Login</h1>
                <p className="mt-4 text-navy-500">{status}</p>
            </div>
        </div>
    );
}
