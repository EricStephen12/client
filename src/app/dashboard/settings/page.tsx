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
    const { getToken, userId: clerkUserId } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();
    
    const [name, setName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || '');
    const [isSaving, setIsSaving] = useState(false);
    const [teamEmail, setTeamEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);

    useEffect(() => {
        if (profile?.subscription_tier === 'studio' || profile?.subscription_tier === 'agency') {
            fetchTeam();
        }
    }, [profile]);

    const fetchTeam = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/team/list?userId=${user?.id}`);
            const data = await res.json();
            if (data.members) setTeamMembers(data.members);
        } catch (err) {
            console.error('Failed to fetch team');
        }
    };

    const handleInvite = async () => {
        if (!teamEmail) return;
        setIsInviting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/team/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            'agency': 'Agency Executive'
        };

        return planNames[planType] || 'Standard Access';
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
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setName(data.name || '');

                const notification = document.createElement('div');
                notification.className = "fixed bottom-8 right-8 bg-indigo-950 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-right font-bold text-xs uppercase tracking-widest";
                notification.innerText = "Identity Synchronized";
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
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
                    const res = await fetch(`/api/main/api/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setProfile(data);
                        setName(data.name || user?.fullName || '');
                        setEmail(data.email || user?.primaryEmailAddress?.emailAddress || '');
                    }
                } catch (err) {
                    console.error('Fetch user data failed', err);
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
            className="max-w-5xl mx-auto pb-20 sm:pb-32 space-y-12 sm:space-y-24 px-2 sm:px-4"
        >

            <header className="space-y-3 sm:space-y-4 pt-2 sm:pt-6">
                <motion.span 
                    variants={itemVariants}
                    className="text-[10px] font-bold tracking-[0.4em] uppercase text-purple-600 block italic"
                >
                    Account Configuration
                </motion.span>
                <motion.h2 
                    variants={itemVariants}
                    className="text-3xl sm:text-5xl md:text-7xl font-sans font-bold tracking-tight text-slate-900 leading-tight"
                >
                    Account <span className="italic font-serif text-slate-400">Settings.</span>
                </motion.h2>
            </header>

            <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-serif italic text-slate-900">Personal Identity</h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                        Update your director credentials and verify your contact information for elite feature access.
                    </p>
                </div>
                
                <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-10 md:p-12 space-y-8 sm:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                placeholder="E.g. Creative Director"
                            />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Email Relay</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full bg-slate-100 border-none rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-slate-400 cursor-not-allowed font-medium"
                            />
                        </div>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-slate-50 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-indigo-950 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-purple-500 hover:text-slate-950 transition-all shadow-xl shadow-indigo-950/10 disabled:opacity-50 active:scale-95"
                        >
                            {isSaving ? 'Updating Identity...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </motion.section>

            <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-serif italic text-slate-900">Subscription Plan</h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                        Manage your active subscription, view billing history, and upgrade your analysis capacity.
                    </p>
                </div>

                <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-10 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
                        <div className="space-y-1 sm:space-y-2 text-center md:text-left">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-600 block italic">Active Plan</span>
                            <h4 className="text-2xl sm:text-3xl font-serif italic text-slate-900">{getPlanDisplay()}</h4>
                        </div>
                        <button
                            onClick={() => router.push('/pricing')}
                            className="w-full md:w-auto px-10 py-4 sm:py-5 bg-indigo-950 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-purple-500 hover:text-slate-950 transition-all shadow-xl shadow-indigo-950/10"
                        >
                            View Plans
                        </button>
                    </div>
                </div>
            </motion.section>

            <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-serif italic text-slate-900">Team Collaboration</h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                        Invite your creative team to collaborate on strategies without sharing passwords.
                    </p>
                </div>

                <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-10 md:p-12 overflow-hidden relative">
                    {(profile?.subscription_tier === 'studio' || profile?.subscription_tier === 'agency') ? (
                        <div className="space-y-8 sm:space-y-10">
                            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                                <input
                                    type="email"
                                    value={teamEmail}
                                    onChange={(e) => setTeamEmail(e.target.value)}
                                    placeholder="Colleague's email..."
                                    className="flex-1 bg-slate-50 border-none rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                                <button
                                    onClick={handleInvite}
                                    disabled={isInviting}
                                    className="px-8 py-3 sm:py-4 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                                >
                                    {isInviting ? 'Inviting...' : 'Invite'}
                                </button>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">Team Members (Max 5)</span>
                                <div className="space-y-3 sm:space-y-4">
                                    {teamMembers.length > 0 ? teamMembers.map((member, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                                    {member.member_email[0]}
                                                </div>
                                                <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-[120px] sm:max-w-none">{member.member_email}</span>
                                            </div>
                                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Member</span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 sm:py-12 border-2 border-dashed border-slate-100 rounded-2xl sm:rounded-3xl">
                                            <p className="text-[10px] sm:text-sm text-slate-300 font-medium uppercase tracking-widest italic">No members yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 py-6 sm:py-10 text-center space-y-4 sm:space-y-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h4 className="text-xl sm:text-2xl font-serif italic text-slate-900">Unlock Team Collaboration</h4>
                            <p className="text-slate-400 max-w-sm mx-auto text-xs sm:text-sm leading-relaxed px-2">
                                Ready to scale? The Studio plan lets you add up to 5 team members to collaborate on your winning strategies.
                            </p>
                            <button
                                onClick={() => router.push('/pricing')}
                                className="px-8 sm:px-10 py-4 sm:py-5 bg-purple-500 text-slate-950 text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-purple-900/10"
                            >
                                Upgrade to Studio
                            </button>
                        </div>
                    )}
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
                            className="relative bg-white w-full max-w-lg rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="space-y-6 sm:space-y-8">
                                <div className="space-y-3 sm:space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-purple-600">Plan Management</span>
                                    <h3 className="text-3xl sm:text-4xl font-sans font-bold text-slate-900 leading-tight">Cancel <br /><span className="italic font-serif text-slate-400">Subscription?</span></h3>
                                    <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                                        Terminating your subscription will disconnect you from our Viral DNA engine and all saved strategy dossiers.
                                    </p>
                                </div>

                                <div className="p-4 sm:p-6 bg-purple-50 rounded-xl sm:rounded-3xl border border-purple-100">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Early Access Notice</p>
                                    <p className="text-[10px] sm:text-xs text-slate-600 mt-2 font-medium leading-relaxed">As an early adopter, your current rate is protected. If you dissolve now, future access will be at standard market rates.</p>
                                </div>

                                <div className="flex flex-col gap-3 sm:gap-4 pt-2">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="w-full py-4 sm:py-5 bg-indigo-950 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-purple-500 hover:text-slate-950 transition-all shadow-xl"
                                    >
                                        Keep My Subscription
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.open('https://polar.sh', '_blank');
                                            setShowCancelModal(false);
                                        }}
                                        className="w-full py-4 sm:py-5 border border-slate-100 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 rounded-xl sm:rounded-2xl hover:text-red-500 hover:bg-red-50/50 hover:border-red-100 transition-all"
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
