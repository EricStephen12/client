'use client';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const { getToken, userId: clerkUserId } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (!isLoaded) return;
            if (!clerkUserId) {
                router.push('/login');
                return;
            }

            try {
                try {
                    const token = await getToken();
                    const res = await fetch(`/api/main/api/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        const profileData = await res.json();
                        setProfile(profileData);

                        if (profileData.is_admin || (user?.publicMetadata as any)?.is_admin) {
                            fetchAdminData();
                        } else {
                            router.push('/dashboard');
                        }
                    } else {
                        router.push('/dashboard');
                    }
                } catch (err) {
                    console.error('Access check failed', err);
                    router.push('/dashboard');
                }
            };

            checkAccess();
        }, [isLoaded, clerkUserId, user, router, getToken]);

    const fetchAdminData = async () => {
        try {
            const token = await getToken();
            const [statsRes, usersRes] = await Promise.all([
                fetch(`/api/main/api/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`/api/main/api/admin/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (statsRes.ok && usersRes.ok) {
                setStats(await statsRes.json());
                setUsers(await usersRes.json());
            }
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-600 mb-2 block">Control Center</span>
                    <h1 className="text-4xl md:text-6xl font-serif italic text-gray-900 tracking-tight">Platform Overview.</h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchAdminData} className="px-6 py-3 bg-white border border-purple-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-50 transition-all shadow-sm">
                        Refresh Data
                    </button>
                    <div className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-purple-200">
                        Admin Root
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Total Users', value: stats?.totalUsers || 0, trend: '+12% this week' },
                    { label: 'Platform Scans', value: stats?.totalScans || 0, trend: 'High Activity' },
                    { label: 'Live Sessions', value: users.filter(u => u.subscription_status === 'active').length, trend: 'Revenue Active' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow group">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">{stat.label}</p>
                        <p className="text-5xl font-serif italic text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{stat.value}</p>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">{stat.trend}</p>
                    </div>
                ))}
            </div>

            {/* Main User Table */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-purple-50 flex justify-between items-center">
                    <h2 className="text-xl font-serif italic text-gray-900">User Growth Directory</h2>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Showing Last 100 Signups</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-purple-50/30 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-purple-50">
                                <th className="p-6">User / Identity</th>
                                <th className="p-6">Plan Status</th>
                                <th className="p-6">Product Usage</th>
                                <th className="p-6">Registered</th>
                                <th className="p-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 flex items-center justify-center font-bold text-xs uppercase">
                                                {user.email[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{user.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${user.plan_type === 'free' ? 'bg-gray-100 text-gray-500' : 'bg-purple-100 text-purple-600'
                                            }`}>
                                            {user.plan_type}
                                        </span>
                                    </td>
                                    <td className="p-6 text-xs font-mono text-gray-400">
                                        {user.scans} Scans
                                    </td>
                                    <td className="p-6 text-[10px] text-gray-400 uppercase tracking-widest">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-6">
                                        <button className="text-[10px] font-bold text-purple-600 hover:text-purple-800 uppercase tracking-widest">
                                            Support
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
