import { Outlet, useLocation, Link } from 'react-router-dom';

export default function AuthLayout() {
    const location = useLocation();
    const path = location.pathname;

    const mode = path === '/register'
        ? 'register'
        : path === '/staff/login'
            ? 'staff'
            : path === '/admin/login'
                ? 'admin'
                : 'customer';

    const leftPanel = {
        customer: {
            title: 'Your quiet place is waiting.',
            description:
                'Masuk ke akun Hush & Co. atau lanjut sebagai tamu untuk langsung memesan kopi tanpa repot.',
        },
        register: {
            title: 'Start your journey with us.',
            description:
                'Daftar dan mulai nikmati pengalaman memesan di Hush & Co. — lebih mudah, lebih menyenangkan.',
        },
        staff: {
            title: 'Staff access only.',
            description:
                'Masuk dengan email dan password kerja. Google login tidak tersedia untuk staf.',
        },
        admin: {
            title: 'Admin access only.',
            description:
                'Akses admin hanya lewat email dan password. Google login tidak tersedia untuk admin.',
        },
    }[mode];

    return (
        <div className="min-h-screen bg-navy-900 flex">
            <div className="hidden lg:flex w-[45%] relative bg-navy-800 overflow-hidden">
                <img
                    src="/images/hush-co-cafe.png"
                    alt="Hush & Co. cafe"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/95 via-navy-900/50 to-transparent" />
                <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition inline-flex self-start">
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-navy-800">
                            <img
                                src="/images/hush-co-logo.png"
                                alt="Hush & Co"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement.innerHTML =
                                        '<span class="font-playfair text-sm text-cream-100 w-full h-full flex items-center justify-center">H</span>';
                                }}
                            />
                        </div>
                        <span className="font-playfair text-lg font-medium tracking-[-0.02em] text-cream-100">
                            Hush &amp; Co
                        </span>
                    </Link>
                    <div className="max-w-md">
                        <h2 className="font-playfair text-4xl font-medium text-white mb-4 leading-tight">
                            {leftPanel.title}
                        </h2>
                        <p className="text-white/70 text-sm leading-relaxed">
                            {leftPanel.description}
                        </p>
                        <div className="flex items-center gap-4 mt-8">
                            <div className="flex -space-x-3">
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                                    className="size-10 rounded-full border-2 border-navy-800 object-cover"
                                    alt=""
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"
                                    className="size-10 rounded-full border-2 border-navy-800 object-cover"
                                    alt=""
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                                    className="size-10 rounded-full border-2 border-navy-800 object-cover"
                                    alt=""
                                />
                                <div className="size-10 rounded-full border-2 border-navy-800 bg-white flex items-center justify-center text-xs font-bold text-navy-800">
                                    +1k
                                </div>
                            </div>
                            <span className="text-sm font-medium text-white/80">
                                Ribuan pelanggan setia
                            </span>
                        </div>
                    </div>
                    <p className="font-playfair italic text-cream-400 text-sm">
                        "A quiet place to think, sip &amp; stay."
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 bg-cream-100">
                <div className="w-full max-w-md">
                    <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-8 hover:opacity-90 transition">
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-navy-900/10 flex-shrink-0 bg-navy-800">
                            <img
                                src="/images/hush-co-logo.png"
                                alt="Hush & Co"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement.innerHTML =
                                        '<span class="font-playfair text-sm text-cream-100 w-full h-full flex items-center justify-center">H</span>';
                                }}
                            />
                        </div>
                        <span className="font-playfair text-xl font-medium tracking-[-0.02em] text-navy-800">
                            Hush &amp; Co
                        </span>
                    </Link>
                    <h2 className="font-playfair text-3xl font-medium text-navy-900 mb-1">
                        {mode === 'register'
                            ? 'Buat akun baru'
                            : mode === 'staff'
                                ? 'Masuk Staff'
                                : mode === 'admin'
                                    ? 'Masuk Admin'
                                    : 'Selamat datang'}
                    </h2>
                    <p className="text-navy-400 text-sm mb-8">
                        {mode === 'register'
                            ? 'Daftar dan mulai nikmati pengalaman memesan di Hush & Co.'
                            : mode === 'staff' || mode === 'admin'
                                ? 'Masuk dengan email dan password Anda.'
                                : 'Masuk ke akun Hush & Co. untuk mulai memesan.'}
                    </p>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
