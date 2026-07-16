'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
    const { getToken } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const token = await getToken();
                const res = await fetch('/api/main/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setUsers(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [getToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-serif text-slate-900 mb-2">User Directory</h1>
                    <p className="text-slate-500 text-sm">Manage your platform's members and their subscription tiers.</p>
                </div>
                <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-xl font-bold text-sm">
                    Total: {users.length}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">User</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Plan</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Scans</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Status</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{user.name || 'Anonymous'}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                            user.plan_type === 'studio' ? 'bg-purple-100 text-purple-800' :
                                            user.plan_type === 'creator' ? 'bg-blue-100 text-blue-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                            {user.plan_type || 'free'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-slate-900">{user.scans || 0}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            user.status === 'active' ? 'text-lime-600 bg-lime-50' : 'text-slate-500 bg-slate-100'
                                        }`}>
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(user.created_at).toLocaleDateString()}
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
