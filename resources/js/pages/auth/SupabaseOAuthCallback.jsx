import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { backendBaseUrl } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function SupabaseOAuthCallback() {
    const { setUser, setToken } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Memproses login Google...');

    useEffect(() => {
        async function handleSupabaseCallback() {
            if (!supabase?.auth?.getSessionFromUrl) {
                setStatus('Google login belum dikonfigurasi.');
                toast.error('Login Google gagal.');
                return;
            }

            const { data, error } = await supabase.auth.getSessionFromUrl({
                storeSession: false,
            });

            if (error) {
                setStatus('Gagal memproses login Google: ' + error.message);
                toast.error('Login Google gagal.');
                return;
            }

            const session = data.session;
            if (!session || !session.access_token) {
                setStatus('Tidak ada token login Google yang diterima.');
                toast.error('Login Google gagal.');
                return;
            }

            try {
                const response = await fetch(
                    `${backendBaseUrl}/api/auth/supabase/google`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            access_token: session.access_token,
                        }),
                    },
                );

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Login Google gagal.');
                }

                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('token', result.token);
                setUser(result.user);
                setToken(result.token);
                toast.success('Login berhasil!');

                const nextRoute = localStorage.getItem('nextRoute') || '/menu';
                localStorage.removeItem('nextRoute');
                navigate(nextRoute, { replace: true });
            } catch (err) {
                setStatus('Login gagal: ' + err.message);
                toast.error(err.message || 'Login Google gagal.');
            }
        }

        handleSupabaseCallback();
    }, [navigate, setUser]);

    return (
        <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
                <h1 className="text-xl font-semibold text-navy-800">
                    Login Google Supabase
                </h1>
                <p className="mt-4 text-navy-500">{status}</p>
            </div>
        </div>
    );
}
