'use client';
import RevealOnScroll from '@/components/RevealOnScroll';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    return <SettingsContent />;
}

function SettingsContent() {

    // 1. All State Definitions
    const { user, isLoaded } = useUser();
    const { getToken, userId: clerkUserId } = useAuth();
    const [profile, setProfile] = useState<any>(null);

    const router = useRouter();
    const [name, setName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // 2. Logic Definitions
    const getPlanDisplay = () => {
        const sessionPlan = (user?.publicMetadata as any)?.plan_type;
        const planType = profile?.plan_type || sessionPlan || 'free';

        const planNames: Record<string, string> = {
            'free': 'No paid plan. Upgrade bro',
            'founding': 'Founding Member',
            'agency': 'Agency Plan'
        };

        return planNames[planType] || 'No paid plan. Upgrade bro';
    };

    const getSubscriptionStatus = () => {
        if (!profile) return null;
        const status = profile.subscription_status;
        const isPaid = profile.plan_type === 'founding' || profile.plan_type === 'agency';
        if (!isPaid || status === 'inactive') return null;
        if (profile.next_billing_date) {
            const date = new Date(profile.next_billing_date);
            return `Next Billing: ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
        return status === 'active' ? 'Active Subscription' : null;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setName(data.name || '');
                setTimeout(() => setIsSaving(false), 800);
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setIsSaving(false);
        }
    };

    // 3. Lifecycle Hooks
    useEffect(() => {
        // Redirect to login if not logged in
        if (isLoaded && !clerkUserId) {
            router.push('/login');
            return;
        }

        if (isLoaded && clerkUserId && !profile && !isSyncing) {
            const fetchUserData = async () => {
                setIsSyncing(true);
                try {
                    const token = await getToken();
                    const res = await fetch(`/api/main/api/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setProfile(data);
                        if (!name) setName(data.name || '');
                        if (!email) setEmail(data.email || '');
                    }
                } catch (err) {
                    console.error('Fetch user data failed', err);
                } finally {
                    setIsSyncing(false);
                }
            };
            fetchUserData();
        }
    }, [isLoaded, clerkUserId, router, profile, isSyncing, getToken]);


    const [showCancelModal, setShowCancelModal] = useState(false);

    return (
        <div className="max-w-4xl space-y-16 pb-20 mt-8">
            {/* Cancellation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowCancelModal(false)}></div>
                    <RevealOnScroll>
                        <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-12 overflow-hidden shadow-2xl border border-purple-100">
                            <div className="absolute top-0 right-0 p-8">
                                <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-purple-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600">Membership Management</span>
                                    <h3 className="text-4xl font-serif italic text-gray-900 leading-tight">We'll miss you, <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{name.split(' ')[0] || 'Member'}.</span></h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        You're about to end your access toViral DNA Scans and AI Intelligence. Is there anything we can do to change your mind?
                                    </p>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-600">Free Beta Access</p>
                                        <p className="text-xs text-gray-500 mt-1">Platform is currently unlocked for all early adopters.</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 pt-4">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="w-full py-5 border border-gray-100 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 rounded-xl hover:bg-gray-50 transition-all"
                                    >
                                        Wait, keep my plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            )}

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

                <div className="md:col-span-2 p-10 rounded-[2.5rem] border border-purple-100 bg-purple-50/50 relative overflow-hidden group">
                    <div className="flex items-center justify-between gap-8 mb-6 relative z-10">
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
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/dashboard/upgrade"
                                className="px-6 py-3 border border-purple-200 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-100 transition-all bg-white text-center shadow-sm"
                            >
                                {((user?.publicMetadata as any)?.plan_type || profile?.plan_type) === 'free' || !((user?.publicMetadata as any)?.plan_type || profile?.plan_type) ? 'Upgrade Plan' : 'Manage Subscription'}
                            </Link>

                            {((user?.publicMetadata as any)?.plan_type || profile?.plan_type) !== 'free' && (
                                <div className="flex flex-col items-end gap-2 pr-2">
                                    <a
                                        href="https://gumroad.com/library"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hover:text-purple-600 transition-colors"
                                    >
                                        Billing History / Update Card
                                    </a>
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="text-[9px] text-gray-400 font-medium uppercase tracking-widest hover:text-red-500 transition-colors"
                                    >
                                        Cancel Membership
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {profile?.plan_type === 'free' && (
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-purple-100 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Scans</p>
                                <p className="text-sm font-medium text-purple-900">{profile.monthly_usage?.scans || 0} / 3 Used</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Extractions</p>
                                <p className="text-sm font-medium text-purple-900">{profile.monthly_usage?.scripts || 0} / 3 Used</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
