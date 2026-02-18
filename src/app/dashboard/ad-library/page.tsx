'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ScriptGeneratorModal from '@/components/ScriptGeneratorModal';
import { createClient } from '@/utils/supabase/client';

interface Ad {
    id: number;
    niche: string;
    thumbnail: string;
    videoUrl: string;
    title: string;
    engagement: { views: string; likes: string; comments: string };
    date: string;
}

export default function AdLibraryPage() {
    const [libraryType, setLibraryType] = useState<'curated' | 'vault'>('curated');
    const [ads, setAds] = useState<Ad[]>([]);
    const [niche, setNiche] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isScraping, setIsScraping] = useState(false);
    const [scriptModalState, setScriptModalState] = useState<{ isOpen: boolean; adId?: string; adTitle?: string }>({ isOpen: false });
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
    }, []);

    const fetchAds = async (search?: string, currentNiche?: string, type: 'curated' | 'vault' = 'curated') => {
        setIsLoading(true);
        try {
            let endpoint = type === 'curated' ? '/api/ads' : '/api/user-ads';
            let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${endpoint}`;
            const params = new URLSearchParams();

            if (search) {
                params.append('search', search);
            } else if (currentNiche && currentNiche !== 'all') {
                params.append('niche', currentNiche);
            }

            if (type === 'vault' && user) {
                params.append('userId', user.id);
            }

            // Only show verified ads in curated
            if (type === 'curated' && !search) {
                params.append('verifiedOnly', 'true');
            }

            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url);
            const data = await res.json();

            if (Array.isArray(data)) {
                if (data.length === 0 && search && type === 'curated') {
                    // Auto-trigger scrape if no results for search in curated
                    await handleAutoScrape(search);
                } else {
                    setAds(data);
                }
            } else {
                setAds([]);
            }
        } catch (err) {
            console.error('Failed to fetch ads', err);
            setAds([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoScrape = async (term: string) => {
        setIsScraping(true);
        try {
            // Trigger Apify Scrape
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/scrape-ads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchQuery: term })
            });

            // Re-fetch ads after scrape (give it a moment or rely on Apify wait?)
            // Our server awaits Apify, so we can fetch immediately after.
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/ads?search=${term}`);
            const data = await res.json();
            if (Array.isArray(data)) setAds(data);

        } catch (err) {
            console.error('Scrape failed', err);
        } finally {
            setIsScraping(false);
        }
    };

    useEffect(() => {
        if (!searchQuery) {
            fetchAds(undefined, niche, libraryType);
        }
    }, [niche, libraryType]);

    const handleSearch = (term: string) => {
        setSearchQuery(term);
        fetchAds(term, undefined);
    };

    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in-up">
                <div className="mb-12 border-b border-purple-100 pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="flex-1">
                        <span className="text-xs font-bold tracking-[0.4em] uppercase text-purple-600 mb-2 block">AI Ad Database</span>
                        <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 tracking-tighter">
                            {libraryType === 'curated' ? 'Winning Ad ' : 'Private Ad '}
                            <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{libraryType === 'curated' ? 'Library.' : 'Vault.'}</span>
                        </h2>
                        <div className="flex items-center gap-8 mt-6">
                            <button
                                onClick={() => setLibraryType('curated')}
                                className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${libraryType === 'curated' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
                            >
                                Featured Winners
                            </button>
                            <button
                                onClick={() => setLibraryType('vault')}
                                className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${libraryType === 'vault' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
                            >
                                My Private Vault
                            </button>
                        </div>
                        <p className="text-gray-500 mt-6 text-lg font-light max-w-2xl leading-relaxed">
                            {libraryType === 'curated'
                                ? 'Discover the top curated viral creatives, pre-scanned for DNA replication.'
                                : 'Access your saved ads and detailed analysis here.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search products (e.g. 'neck massager')..."
                                className="w-full bg-transparent border-b border-purple-100 py-3 pr-10 text-xl font-serif italic focus:border-purple-600 focus:outline-none transition-all placeholder:text-gray-200 text-gray-900"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e.currentTarget.value);
                                    }
                                }}
                            />
                            <div className="absolute right-0 top-3 text-purple-300 group-focus-within:text-purple-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scraping Loading State */}
                {isScraping && (
                    <div className="flex flex-col items-center justify-center py-24 animate-fade-in text-center space-y-6">
                        <div className="w-20 h-20 border-4 border-gray-100 border-t-purple-600 rounded-full animate-spin shadow-sm"></div>
                        <div>
                            <h3 className="text-2xl font-serif text-gray-900 italic">Analyzing TikTok Trends...</h3>
                            <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto font-medium">Finding the best viral ads for "{searchQuery}". This takes about 20 seconds.</p>
                        </div>
                    </div>
                )}

                {isLoading && !isScraping ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-[9/16] bg-purple-50/50 animate-pulse rounded-[2.5rem]"></div>
                        ))}
                    </div>
                ) : !isScraping && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {ads.map((ad) => (
                            <div key={ad.id} className="group bg-white border border-purple-50 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-700 rounded-[2.5rem] overflow-hidden">
                                <div
                                    className="relative aspect-[9/16] bg-gray-900 overflow-hidden cursor-pointer"
                                    onClick={() => setSelectedVideo(ad.videoUrl)}
                                >
                                    <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                                    <div className="absolute inset-0 bg-purple-900/10 group-hover:bg-purple-900/40 transition-colors duration-500"></div>

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                                        <button className="bg-white text-purple-600 rounded-full p-6 shadow-2xl hover:scale-110 transition-transform">
                                            <svg className="w-8 h-8 fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </button>
                                    </div>

                                    <div className="absolute top-6 left-6">
                                        <span className="bg-purple-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.2em] shadow-lg">
                                            {ad.niche}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-tight line-clamp-2 italic leading-[1.1]">"{ad.title}"</h3>
                                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 border-t border-gray-50 pt-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-600">Views</span> <span>{ad.engagement.views}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600">Likes</span> <span>{ad.engagement.likes}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setScriptModalState({ isOpen: true, adId: ad.id.toString(), adTitle: ad.title })}
                                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:shadow-xl hover:shadow-purple-200 transition-all shadow-lg transform active:scale-[0.98]"
                                    >
                                        Generate Script
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setSelectedVideo(null)}>
                    <div className="relative w-full max-w-sm h-[80vh] bg-black shadow-2xl overflow-hidden rounded-lg flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 z-10 text-white/50 hover:text-white transition-colors bg-black/20 rounded-full p-2"
                            onClick={() => setSelectedVideo(null)}
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* TikTok Embed */}
                        <iframe
                            src={`https://www.tiktok.com/embed/v2/${selectedVideo.split('/video/')[1]?.split('?')[0] || selectedVideo}`}
                            className="w-full h-full border-0"
                            allow="autoplay; encrypted-media;"
                        ></iframe>
                    </div>
                </div>
            )}

            {/* Script Generator Modal */}
            <ScriptGeneratorModal
                isOpen={scriptModalState.isOpen}
                onClose={() => setScriptModalState({ isOpen: false })}
                adId={scriptModalState.adId}
                adTitle={scriptModalState.adTitle}
            />
        </DashboardLayout>
    );
}
