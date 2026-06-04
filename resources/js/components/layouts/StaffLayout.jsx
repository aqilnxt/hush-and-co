import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { QueueListIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function StaffLayout() {
    const location = useLocation();

    const navItems = [
        {
            path: '/staff',
            label: 'Order Queue',
            icon: QueueListIcon,
            active: location.pathname === '/staff',
        },
        {
            path: '/staff/profile',
            label: 'Profil',
            icon: UserCircleIcon,
            active: location.pathname === '/staff/profile',
        },
    ];

    const routeMeta = {
        '/staff': {
            title: 'Live Order Dashboard',
            subtitle: 'Kelola order masuk secara realtime.',
        },
        '/staff/profile': {
            title: 'Profil',
            subtitle: 'Lihat detail akun dan informasi profil.',
        },
    };

    const { title, subtitle } =
        routeMeta[location.pathname] || routeMeta['/staff'];

    return (
        <DashboardLayout
            title={title}
            subtitle={subtitle}
            navItems={navItems}
            searchItems={[]}
            showSearch={true}
            showTime={true}
            logoPath="/"
        />
    );
}
