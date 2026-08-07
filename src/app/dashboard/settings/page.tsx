'use client';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
    return <SettingsContent />;
}

function SettingsContent() {
    const { user, isLoaded } = useUser();
    const { getToken, userId: clerkUserId, signOut } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();
    
    const [name, setName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || '');
    const [isSaving, setIsSaving] = useState(false);
    const [teamEmail, setTeamEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        if (profile?.subscription_tier === 'studio' || profile?.subscription_tier === 'agency') {
            fetchTeam();
        }
    }, [profile]);

    const fetchTeam = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/team/list?userId=${user?.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.members) setTeamMembers(data.members);
        } catch (err) {
        }
    };

    const handleInvite = async () => {
        if (!teamEmail) return;
        setIsInviting(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/team/invite`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: teamEmail, userId: user?.id })
            });
            const data = await res.json();
            if (res.ok) {
                setTeamEmail('');
                fetchTeam();
                alert('Invite sent successfully!');
            } else {
                alert(data.error || 'Failed to invite');
            }
        } catch (err) {
            alert('Error sending invite');
        } finally {
            setIsInviting(false);
        }
    };
    const [isSyncing, setIsSyncing] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const getPlanDisplay = () => {
        const sessionPlan = (user?.publicMetadata as any)?.plan_type;
        const planType = profile?.plan_type || sessionPlan || 'free';

        const planNames: Record<string, string> = {
            'free': 'Standard Access',
            'founding': 'Founding Member',
            'studio': 'The Studio',
            'agency': 'The Studio', // Legacy
            'creator': 'Creator'
        };

        return planNames[planType] || 'Standard Access';
    };

    const getSubscriptionStatus = () => {
        if (!profile) return null;
        const status = profile.subscription_status;
        const isPaid = profile.plan_type === 'founding' || profile.plan_type === 'studio' || profile.plan_type === 'agency' || profile.plan_type === 'creator';
        if (!isPaid || status === 'inactive') return null;
        if (profile.next_billing_date) {
            const date = new Date(profile.next_billing_date);
            return `Next Billing: ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
        return status === 'active' ? 'Active Membership' : null;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/main/api/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, userId: user?.id }),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setName(data.name || '');

                const notification = document.createElement('div');
                notification.className = "fixed bottom-8 right-8 bg-lime-400 text-slate-950 px-8 py-4 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-right font-bold text-xs uppercase tracking-widest";
                notification.innerText = "Identity Synchronized";
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            }
        } catch (error) {

        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (isLoaded && !clerkUserId) {
            router.push('/login');
            return;
        }

        if (isLoaded && clerkUserId && !profile && !isSyncing) {
            const fetchUserData = async () => {
                setIsSyncing(true);
                try {
                    const token = await getToken();
                    const res = await fetch(`/api/main/api/me?userId=${user?.id}&email=${encodeURIComponent(user?.primaryEmailAddress?.emailAddress || '')}&name=${encodeURIComponent(user?.fullName || '')}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setProfile(data);
                        setName(data.name || user?.fullName || '');
                        setEmail(data.email || user?.primaryEmailAddress?.emailAddress || '');
                    }
                } catch (err) {

                } finally {
                    setIsSyncing(false);
                }
            };
            fetchUserData();
        }
    }, [isLoaded, clerkUserId, profile, user]);

    useEffect(() => {
        if (user) {
            if (!name) setName(user.fullName || '');
            if (!email) setEmail(user.primaryEmailAddress?.emailAddress || '');
        }
    }, [user]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto pb-20 sm:pb-32 space-y-12 sm:space-y-24 px-2 sm:px-4"
        >

            <header className="pt-2 sm:pt-6 mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-white/10 pb-8">
                <div className="space-y-2">
                    <motion.span 
                        variants={itemVariants}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-lime-400 block italic"
                    >
                        Account Configuration
                    </motion.span>
                    <motion.h2 
                        variants={itemVariants}
                        className="text-3xl sm:text-5xl md:text-6xl font-sans font-bold tracking-tight text-stone-100 leading-tight"
                    >
                        Account <br className="hidden md:block" /><span className="italic font-serif text-stone-500">Settings.</span>
                    </motion.h2>
                </div>
            </header>

            <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-serif italic text-stone-100">Personal Identity</h3>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
                        Update your director credentials and verify your contact information for premium feature access.
                    </p>
                </div>
                
                <div className="lg:col-span-8 bg-white/[0.03] rounded-2xl sm:rounded-[2.5rem] border border-white/10 p-6 sm:p-10 md:p-12 space-y-8 sm:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-stone-100 placeholder:text-stone-600 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all font-medium"
                                placeholder="E.g. Creative Director"
                            />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Email Relay</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-stone-500 cursor-not-allowed font-medium"
                            />
                        </div>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-white/10 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-lime-400 text-slate-950 text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-lime-300 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {isSaving ? 'Updating Identity...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </motion.section>

            <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-serif italic text-stone-100">Subscription Plan</h3>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
                        Manage your active subscription, view billing history, and upgrade your analysis capacity.
                    </p>
                </div>

                <div className="lg:col-span-8 bg-white/[0.03] rounded-2xl sm:rounded-[2.5rem] border border-white/10 p-6 sm:p-10 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
                        <div className="space-y-1 sm:space-y-2 text-center md:text-left">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime-400 block italic">Active Plan</span>
                            <h4 className="text-2xl sm:text-3xl font-serif italic text-stone-100">{getPlanDisplay()}</h4>
                        </div>
                        <button
                            onClick={() => router.push('/pricing')}
                            className="w-full md:w-auto px-10 py-4 sm:py-5 bg-lime-400 text-slate-950 text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-lime-300 transition-all"
                        >
                            View Plans
                        </button>
                    </div>
                </div>
            </motion.section>

            {/* Team collaboration — coming soon in v2
            <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-serif italic text-stone-50">Team Collaboration</h3>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
                        Invite your creative team to collaborate on strategies without sharing passwords.
                    </p>
                </div>

                <div className="lg:col-span-8 bg-white/[0.03] rounded-2xl sm:rounded-[2.5rem] border border-white/10 shadow-sm p-6 sm:p-10 md:p-12 overflow-hidden relative">
                    {(profile?.subscription_tier === 'studio' || profile?.subscription_tier === 'agency') ? (
                        <div className="space-y-8 sm:space-y-10">
                            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                                <input
                                    type="email"
                                    value={teamEmail}
                                    onChange={(e) => setTeamEmail(e.target.value)}
                                    placeholder="Colleague's email..."
                                    className="flex-1 bg-white/[0.04] border-none rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base focus:ring-2 focus:ring-slate-500 transition-all font-medium"
                                />
                                <button
                                    onClick={handleInvite}
                                    disabled={isInviting}
                                    className="px-8 py-3 sm:py-4 bg-slate-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                                >
                                    {isInviting ? 'Inviting...' : 'Invite'}
                                </button>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 block">Team Members (Max 5)</span>
                                <div className="space-y-3 sm:space-y-4">
                                    {teamMembers.length > 0 ? teamMembers.map((member, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 sm:p-6 bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-white/10">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-stone-400 font-bold text-xs uppercase">
                                                    {member.member_email[0]}
                                                </div>
                                                <span className="text-xs sm:text-sm font-semibold text-stone-50 truncate max-w-[120px] sm:max-w-none">{member.member_email}</span>
                                            </div>
                                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-stone-500 whitespace-nowrap">Member</span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 sm:py-12 border-2 border-dashed border-white/10 rounded-2xl sm:rounded-3xl">
                                            <p className="text-[10px] sm:text-sm text-stone-400 font-medium uppercase tracking-widest italic">No members yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 py-6 sm:py-10 text-center space-y-4 sm:space-y-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h4 className="text-xl sm:text-2xl font-serif italic text-stone-50">Unlock Team Collaboration</h4>
                            <p className="text-stone-500 max-w-sm mx-auto text-xs sm:text-sm leading-relaxed px-2">
                                Ready to scale? The Studio plan lets you add up to 5 team members to collaborate on your winning strategies.
                            </p>
                            <button
                                onClick={() => router.push('/pricing')}
                                className="px-8 sm:px-10 py-4 sm:py-5 bg-lime-400 text-slate-950 text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-lime-900/10"
                            >
                                Upgrade to Studio
                            </button>
                        </div>
                    )}
                </div>
            </motion.section>
            */}

            <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-serif italic text-stone-100">Preferences</h3>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
                        Customize your workspace experience and toggle alerts.
                    </p>
                </div>

                <div className="lg:col-span-8 bg-white/[0.03] rounded-2xl sm:rounded-[2.5rem] border border-white/10 p-6 sm:p-10 md:p-12 space-y-8 sm:space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-sm sm:text-base font-bold text-stone-100">Push Notifications</h4>
                            <p className="text-[10px] sm:text-xs text-stone-500 font-medium">Receive alerts for completed analyses.</p>
                        </div>
                        <button 
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full p-1 transition-colors ${notifications ? 'bg-lime-400' : 'bg-white/10'}`}
                        >
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-stone-100 rounded-full transition-transform shadow-sm ${notifications ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-8 sm:pt-10">
                        <div className="space-y-1">
                            <h4 className="text-sm sm:text-base font-bold text-stone-100">Dark Mode</h4>
                            <p className="text-[10px] sm:text-xs text-stone-500 font-medium">Coming in Eixora v2.0</p>
                        </div>
                        <button 
                            disabled
                            className="w-12 h-6 sm:w-14 sm:h-7 rounded-full p-1 bg-white/[0.06] transition-colors cursor-not-allowed opacity-50"
                        >
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-stone-500 rounded-full shadow-sm" />
                        </button>
                    </div>
                </div>
            </motion.section>

            <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-serif italic text-stone-100">System</h3>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
                        App information and account actions.
                    </p>
                </div>

                <div className="lg:col-span-8 bg-white/[0.03] rounded-2xl sm:rounded-[2.5rem] border border-white/10 p-6 sm:p-10 md:p-12 space-y-6 sm:space-y-8">
                    <button
                        onClick={() => router.push('/about')}
                        className="w-full text-left flex items-center justify-between p-4 sm:p-6 bg-white/[0.04] rounded-xl sm:rounded-2xl hover:bg-white/[0.06] transition-all border border-transparent hover:border-white/10 group"
                    >
                        <div className="space-y-1">
                            <h4 className="text-sm sm:text-base font-bold text-stone-100">About Eixora</h4>
                            <p className="text-[10px] sm:text-xs text-stone-500 font-medium">Version 1.0.0</p>
                        </div>
                        <svg className="w-5 h-5 text-stone-500 group-hover:text-stone-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div className="pt-2">
                        <button
                            onClick={async () => {
                                await signOut();
                                router.push('/');
                            }}
                            className="w-full px-10 py-4 sm:py-5 border border-white/10 bg-white/[0.03] text-stone-100 text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-white/[0.06] hover:border-white/20 transition-all active:scale-95"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </motion.section>

            <AnimatePresence>
                {showCancelModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCancelModal(false)}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#0e1210] w-full max-w-lg rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 overflow-hidden border border-white/10"
                        >
                            <div className="space-y-6 sm:space-y-8">
                                <div className="space-y-3 sm:space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lime-400">Plan Management</span>
                                    <h3 className="text-3xl sm:text-4xl font-sans font-bold text-stone-100 leading-tight">Cancel <br /><span className="italic font-serif text-stone-500">Subscription?</span></h3>
                                    <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
                                        Terminating your subscription will disconnect you from our Viral DNA engine and all saved strategy dossiers.
                                    </p>
                                </div>

                                <div className="p-4 sm:p-6 bg-lime-400/10 rounded-xl sm:rounded-3xl border border-lime-400/20">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-lime-400">Early Access Notice</p>
                                    <p className="text-[10px] sm:text-xs text-stone-300 mt-2 font-medium leading-relaxed">As an early adopter, your current rate is protected. If you dissolve now, future access will be at standard market rates.</p>
                                </div>

                                <div className="flex flex-col gap-3 sm:gap-4 pt-2">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="w-full py-4 sm:py-5 bg-lime-400 text-slate-950 text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-lime-300 transition-all"
                                    >
                                        Keep My Subscription
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.open('https://polar.sh', '_blank');
                                            setShowCancelModal(false);
                                        }}
                                        className="w-full py-4 sm:py-5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 rounded-xl sm:rounded-2xl hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-all"
                                    >
                                        Cancel Subscription
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
