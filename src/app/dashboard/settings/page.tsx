'use client';
import DashboardLayout from '@/components/DashboardLayout';
import RevealOnScroll from '@/components/RevealOnScroll';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Set email from auth
            setEmail(user.email || '');

            // Fetch profile data
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setName(profileData.full_name || '');
            }
            setIsLoading(false);
        };

        fetchUserData();
    }, [supabase, router]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: name })
                .eq('id', user.id);

            if (error) throw error;

            // Update profile state
            setProfile({ ...profile, full_name: name });

            // Show success (you could add a toast notification here)
            setTimeout(() => setIsSaving(false), 1000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setIsSaving(false);
        }
    };

    const getPlanDisplay = () => {
        if (!profile) return 'Free Plan';

        const planType = profile.plan_type || 'free';
        const planNames: Record<string, string> = {
            'free': 'Free Plan',
            'pro': 'Pro Member',
            'agency': 'Agency Plan'
        };

        return planNames[planType] || 'Free Plan';
    };

    const getSubscriptionStatus = () => {
        if (!profile) return null;

        const status = profile.subscription_status;
        const isPaid = profile.plan_type === 'pro' || profile.plan_type === 'agency';

        if (!isPaid || status === 'inactive') {
            return null;
        }

        // If we have a next billing date, show it
        if (profile.next_billing_date) {
            const date = new Date(profile.next_billing_date);
            return `Next Billing: ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }

        return status === 'active' ? 'Active Subscription' : null;
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-2 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-400 text-sm font-medium">Loading settings...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl space-y-16 pb-20 mt-8">
                <div className="space-y-4">
                    <RevealOnScroll>
                        <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 block">Workspace Management</span>
                    </RevealOnScroll>
                    <RevealOnScroll delay={100}>
                        <h2 className="text-5xl lg:text-6xl font-serif font-medium tracking-tighter text-gray-900 leading-tight">
                            Personal <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Identity.</span>
                        </h2>
                    </RevealOnScroll>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div className="md:col-span-1 space-y-4">
                        <h3 className="text-lg font-serif text-gray-900 leading-tight">Profile Data</h3>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            Manage your public identity and workspace credentials.
                        </p>
                    </div>

                    <div className="md:col-span-2 space-y-8 bg-white p-10 rounded-[2.5rem] border border-purple-100 shadow-[0_20px_50px_-20px_rgba(168,85,247,0.05)]">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all font-medium"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full bg-gray-100 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-[10px] text-gray-400 italic">Email cannot be changed. Contact support if needed.</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {isSaving ? 'Syncing...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div className="md:col-span-1 space-y-4">
                        <h3 className="text-lg font-serif text-gray-900 leading-tight">Subscription Plan</h3>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            Manage your billing cycles and upgrade tiers.
                        </p>
                    </div>

                    <div className="md:col-span-2 p-10 rounded-[2.5rem] border border-purple-100 bg-purple-50/50 flex items-center justify-between gap-8">
                        <div>
                            <p className="text-lg font-serif text-purple-900">
                                Current Plan: <span className="italic">{getPlanDisplay()}</span>
                            </p>
                            {getSubscriptionStatus() && (
                                <p className="text-xs text-purple-600/60 font-medium uppercase tracking-widest mt-1">
                                    {getSubscriptionStatus()}
                                </p>
                            )}
                        </div>
                        <Link
                            href="/dashboard/upgrade"
                            className="px-6 py-3 border border-purple-200 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-100 transition-all bg-white"
                        >
                            {profile?.plan_type === 'free' ? 'Upgrade Plan' : 'Manage Billing'}
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
