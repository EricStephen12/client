'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import CursorEffect from '@/components/CursorEffect';
import MagneticButton from '@/components/MagneticButton';
import RevealOnScroll from '@/components/RevealOnScroll';
import VideoCarousel from '@/components/VideoCarousel';

export default function LandingPage() {
    const [url, setUrl] = useState('');
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsLoggedIn(status === 'authenticated');
    }, [status]);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
                }
            }
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleDirectAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        router.push(`/dashboard/analyze?url=${encodeURIComponent(url)}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 text-gray-900 selection:bg-purple-600 selection:text-white overflow-x-hidden">
            <CursorEffect />

            {/* Navigation - Minimalist & Bordered */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-purple-100 transition-all duration-300">
                <div className="w-full px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-3xl md:text-4xl font-signature hover:opacity-70 transition-opacity">
                        Eixora.
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-12">
                        <Link href="/pricing" className="text-xs font-medium tracking-[0.2em] uppercase hover:underline underline-offset-4 decoration-1 decoration-purple-400">
                            Pricing
                        </Link>
                        <Link href="/login" className="text-xs font-medium tracking-[0.2em] uppercase hover:underline underline-offset-4 decoration-1 decoration-purple-400">
                            Sign In
                        </Link>
                        <Link href={isLoggedIn ? "/dashboard/analyze" : "/signup"} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 text-xs font-medium tracking-[0.2em] uppercase hover:from-purple-700 hover:to-blue-700 border-0 transition-all shadow-lg hover:shadow-xl">
                            {isLoggedIn ? "Enter Studio" : "Try Free"}
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-gray-900 p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-purple-100 animate-slide-down">
                        <div className="flex flex-col p-8 gap-6 text-center">
                            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-500">Pricing</Link>
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-500">Sign In</Link>
                            <Link
                                href={isLoggedIn ? "/dashboard/analyze" : "/signup"}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 text-[10px] font-black tracking-[0.4em] uppercase rounded-xl"
                            >
                                {isLoggedIn ? "Enter Studio" : "Start Free Access"}
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section - Refined Editorial */}
            <section className="pt-20 min-h-[85vh] flex flex-col md:grid md:grid-cols-2 border-b border-purple-200 overflow-hidden">
                <div className="flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-24 py-16 md:py-24 border-b md:border-b-0 md:border-r border-purple-200 bg-white">
                    <RevealOnScroll delay={100}>
                        <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase mb-4 md:mb-6 text-purple-600 block">Viral Intelligence Studio</span>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.2] md:leading-[1.1] mb-6 md:mb-8 tracking-tight">
                            Stop Guessing. <br className="hidden sm:block" />
                            <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent underline decoration-purple-200 decoration-4 underline-offset-8">Start Scaling.</span>
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll delay={300}>
                        <p className="text-base sm:text-lg font-light leading-relaxed max-w-sm mb-8 md:mb-10 text-gray-600">
                            Reverse-engineer any viral TikTok ad. Extract the exact hooks and triggers that drive $10k+ days.
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll delay={400}>
                        <form onSubmit={handleDirectAnalyze} className="max-w-md flex flex-col gap-4">
                            <div className="relative group p-1 bg-gray-50 rounded-xl border border-purple-100 focus-within:ring-2 focus-within:ring-purple-600/10 transition-all">
                                <input
                                    type="text"
                                    placeholder="Paste Winning TikTok URL..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium px-4 py-3"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gray-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg active:scale-95"
                            >
                                Extract Blueprint &rarr;
                            </button>
                        </form>
                    </RevealOnScroll>
                </div>

                {/* Right: Localized Hero Video */}
                <div className="relative h-[70vh] md:h-auto overflow-hidden bg-black flex items-center justify-center">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    >
                        <source src="/hero-video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
            </section>

            {/* Marquee - "Ticker" */}
            <section className="py-4 border-b border-purple-200 overflow-hidden whitespace-nowrap bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
                <div className="inline-block animate-marquee">
                    <span className="text-xl sm:text-4xl font-serif italic mx-4 sm:mx-8 uppercase">Viral Blueprinting</span>
                    <span className="text-[10px] tracking-[0.3em] uppercase mx-4 sm:mx-8">Alpha Status</span>
                    <span className="text-xl sm:text-4xl font-serif italic mx-4 sm:mx-8 uppercase">Direct Response</span>
                    <span className="text-[10px] tracking-[0.3em] uppercase mx-4 sm:mx-8">Logic First</span>
                    <span className="text-xl sm:text-4xl font-serif italic mx-4 sm:mx-8 uppercase">Scaling Logic</span>
                    <span className="text-[10px] tracking-[0.3em] uppercase mx-4 sm:mx-8">Growth Bound</span>
                    <span className="text-xl sm:text-4xl font-serif italic mx-4 sm:mx-8 uppercase">Conversion Engine</span>
                    <span className="text-[10px] tracking-[0.3em] uppercase mx-4 sm:mx-8">Winning DNA</span>
                </div>
            </section>

            {/* Video Carousel Section */}
            <VideoCarousel />

            {/* The Manifesto / How It Works */}
            <section className="flex flex-col lg:grid lg:grid-cols-2 border-b border-purple-200">
                <div className="p-12 sm:p-16 lg:p-24 border-b lg:border-b-0 lg:border-r border-purple-200 flex items-center bg-gradient-to-br from-purple-50 to-transparent">
                    <RevealOnScroll>
                        <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif leading-none tracking-tight">
                            SCALE FAST. <br />
                            <span className="text-transparent stroke-text">DOMINATE.</span>
                        </h2>
                    </RevealOnScroll>
                </div>
                <div className="p-12 lg:p-24 flex flex-col justify-center">
                    <RevealOnScroll delay={200}>
                        <p className="text-xl md:text-2xl font-light leading-relaxed mb-12 max-w-md">
                            Winning ads follow a pattern. We extract that pattern so you can scale your winners without the guesswork.
                        </p>
                    </RevealOnScroll>

                    <ul className="space-y-6">
                        {['Intelligence Gathering', 'Retention Blueprinting', 'Scalable Production'].map((item, i) => (
                            <RevealOnScroll key={i} delay={300 + (i * 100)}>
                                <li className="flex items-center gap-6 group cursor-pointer">
                                    <span className="text-xs font-mono border-2 border-purple-600 w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:text-white transition-all">{i + 1}</span>
                                    <span className="text-xl font-serif italic decoration-1 underline-offset-4 group-hover:underline">{item}</span>
                                </li>
                            </RevealOnScroll>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Process Section - How It Works */}
            <section className="py-20 md:py-32 px-6 border-b border-purple-200 bg-white">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll className="text-center mb-16 md:mb-24">
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif mb-6 italic">How EIXORA Works</h2>
                        <p className="text-[10px] tracking-[0.4em] uppercase text-purple-600">From Viral Link to Winning Ad in 60 Seconds</p>
                    </RevealOnScroll>

                    <div className="flex flex-col md:grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        <div className="space-y-10 md:space-y-12 order-2 md:order-1">
                            {[
                                { step: "Gather", desc: "Paste any viral link. Our engine decodes the hook, pacing, and visual triggers that drive engagement." },
                                { step: "Deconstruct", desc: "We extract the 'Viral Blueprint' and map the exact reasons why the ad is scaling." },
                                { step: "Produce", desc: "Get an actionable creative brief with hook variations, pacing notes, and visual direction to repeat the win." }
                            ].map((p, i) => (
                                <RevealOnScroll key={i} delay={i * 200} className="relative pl-10 md:pl-12">
                                    <span className="absolute left-0 top-0 text-2xl md:text-3xl font-serif italic text-purple-200">0{i + 1}</span>
                                    <h3 className="text-xl md:text-2xl font-serif mb-2 md:mb-3 italic">{p.step}</h3>
                                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-light">{p.desc}</p>
                                </RevealOnScroll>
                            ))}
                        </div>

                        <RevealOnScroll delay={400} className="relative group p-3 md:p-4 bg-gray-50 rounded-3xl border border-purple-100 overflow-hidden shadow-2xl order-1 md:order-2">
                            <div className="aspect-video relative rounded-2xl overflow-hidden bg-black">
                                <video
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-1000"
                                >
                                    <source src="/videos/v7.mp4" type="video/mp4" />
                                </video>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-all">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50 group-hover:scale-110 transition-all">
                                        <div className="w-0 h-0 border-t-[8px] md:border-t-[10px] border-t-transparent border-l-[14px] md:border-l-[18px] border-l-white border-b-[8px] md:border-b-[10px] border-b-transparent translate-x-1"></div>
                                    </div>
                                </div>
                                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                                    <span className="text-[8px] md:text-[10px] font-bold tracking-widest bg-purple-600 text-white px-2 md:px-3 py-1 rounded uppercase">Live Logic Blueprinting</span>
                                </div>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Feature Grid - Intelligence Modules */}
            <section className="flex flex-col md:grid md:grid-cols-2 border-b border-purple-200">
                {[
                    { title: "Ad Analysis", subtitle: "Data-Driven Creative", img: "/retention-dna.png" },
                    { title: "Hook Engineering", subtitle: "Engineered to Convert", img: "/hook-engineering.png" },
                ].map((feature, i) => (
                    <div key={i} className={`group border-b md:border-b-0 border-purple-200 ${i !== 1 ? 'md:border-r border-purple-200' : ''} h-[60vh] md:h-[80vh] relative overflow-hidden`}>
                        <Image
                            src={feature.img}
                            alt={feature.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-purple-600/10 group-hover:bg-transparent transition-colors duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 bg-white border-t-2 border-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                            <RevealOnScroll>
                                <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase block mb-1 md:mb-2">{feature.subtitle}</span>
                                <h3 className="text-2xl md:text-3xl font-serif">{feature.title}</h3>
                            </RevealOnScroll>
                        </div>
                        <div className="absolute top-4 left-4 md:top-8 md:left-8 text-white drop-shadow-lg">
                            <span className="text-[10px] font-mono border-2 border-white bg-purple-600/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full">0{i + 1}</span>
                        </div>
                    </div>
                ))}
            </section>

            {/* The Math - Editorial Table Style */}
            <section className="py-32 px-6 border-b border-purple-200">
                <div className="max-w-4xl mx-auto">
                    <RevealOnScroll className="text-center mb-24">
                        <h2 className="text-5xl font-serif mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent italic">The Unit Economics</h2>
                        <p className="text-xs tracking-[0.3em] uppercase text-purple-600">Built for Results</p>
                    </RevealOnScroll>

                    <RevealOnScroll>
                        <div className="border border-purple-600 rounded-3xl overflow-hidden shadow-xl bg-white">
                            {[
                                { l: "Input", r: "Any Viral TikTok" },
                                { l: "Result", r: "Full DNA Breakdown" },
                                { l: "Strategy", r: "Actionable Brief" },
                                { l: "Goal", r: "Retention Dominance" }
                            ].map((row, i) => (
                                <div key={i} className="flex flex-col sm:grid sm:grid-cols-2 border-b border-purple-100 last:border-b-0 hover:bg-purple-600 hover:text-white transition-all duration-300 group">
                                    <div className="p-6 sm:p-8 border-b sm:border-b-0 sm:border-r border-purple-100 font-serif text-lg md:text-xl italic bg-purple-50/30 sm:bg-transparent group-hover:bg-transparent">{row.l}</div>
                                    <div className="p-6 sm:p-8 text-[10px] sm:text-xs uppercase tracking-widest flex items-center font-bold">{row.r}</div>
                                </div>
                            ))}
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* The Evidence - Luxury Social Proof Carousel */}
            <section className="py-24 border-b border-purple-100 bg-white overflow-hidden">
                <div className="px-6 mb-16 max-w-7xl mx-auto">
                    <RevealOnScroll>
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-600/60 mb-3 block text-center md:text-left">What They're Saying</span>
                        <h2 className="text-4xl md:text-6xl font-luxury italic mb-4 tracking-tight text-gray-900 line-clamp-2 text-center md:text-left">The Evidence.</h2>
                        <p className="text-sm font-light text-gray-400 max-w-lg mx-auto md:mx-0 text-center md:text-left">Honest stories from creators who finally found the winning formula.</p>
                    </RevealOnScroll>
                </div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory px-6"
                >
                    {[
                        {
                            name: "Cole Baker",
                            role: "CEO Wave LLC",
                            quote: "Honestly? I was winging it in Apple Notes like a caveman before. I saw ads for 'AI tools' but they were all trash. My hooks finally have power and I've 3x'd my ROAS in 10 days."
                        },
                        {
                            name: "Yedam Lee",
                            role: "Re:stage",
                            quote: "Absolute lifesaver for our team. We aren't 'marketing experts' so we were literally pulling our hair out trying to plan videos. EIXORA's analyzer is a savior."
                        },
                        {
                            name: "Elina",
                            role: "Founder",
                            quote: "The 'Hook Power' grade is the real game changer. I used to guess if my intros were good, now I actually have a score based on viral DNA. Visual suggestions made a massive difference."
                        },
                        {
                            name: "Julian",
                            role: "Scaling",
                            quote: "Antes da EIXORA, meu processo era uma bagunça total. Eu perdia horas tentando organizar as ideias. O jogo mudou com o 'Visual DNA'. Agora minhas postagens têm estratégia real."
                        },
                        {
                            name: "Mike",
                            role: "Creator",
                            quote: "The wins are real. My views are finally up because the 'Viral Checklist' actually keeps me on track. EIXORA took the 'ugh' out of planning. I'm actually having fun creating again."
                        }
                    ].map((t, i) => (
                        <div key={i} className="min-w-[85vw] sm:min-w-[60vw] md:min-w-[45vw] lg:min-w-[30vw] snap-start pr-6 relative group">
                            <RevealOnScroll delay={i * 50} className="h-full flex flex-col border border-purple-100/50 p-6 md:p-8 hover:border-purple-400 transition-all duration-1000 bg-white rounded-3xl relative">
                                <p className="text-xs md:text-sm font-light leading-relaxed text-gray-500 mb-6 whitespace-pre-wrap italic">"{t.quote}"</p>
                                <div className="mt-auto flex items-center gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center text-[10px] font-black text-purple-600 uppercase tracking-widest border border-purple-100">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">{t.name}</h4>
                                        <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{t.role}</p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        </div>
                    ))}
                    {/* Spacer */}
                    <div className="min-w-[5vw] flex-shrink-0"></div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 md:py-32 px-6 border-b border-purple-200 bg-white">
                <div className="max-w-4xl mx-auto">
                    <RevealOnScroll className="text-center mb-16 md:mb-24">
                        <span className="text-[10px] font-black tracking-[0.5em] uppercase text-purple-600 mb-4 block">Information</span>
                        <h2 className="text-4xl md:text-5xl font-serif italic mb-6">Frequently Asked</h2>
                    </RevealOnScroll>

                    <div className="space-y-4">
                        {[
                            { q: "What exactly is EIXORA?", a: "EIXORA is the first high-end 'Blueprint' tool for TikTok ad creative. We decode viral ads and map their mechanics so you can replicate their success with your own product." },
                            { q: "Does it work for any niche?", a: "Yes. Whether it's home decor, tech, personal care, or coaching—if there is a viral video for it, EIXORA can blueprint it for you." },
                            { q: "How long does blueprinting take?", a: "Blueprint generation usually takes less than 60 seconds. You paste the URL, we do the heavy lifting." },
                            { q: "Can I use EIXORA on mobile?", a: "Absolutely. Our Studio is fully responsive. You can find inspiration on the TikTok app and paste it directly into EIXORA on your phone." },
                            { q: "What do I get from an analysis?", a: "You get a full Viral Blueprint report including hook power score, retention analysis, pacing map, and actionable creative direction." }
                        ].map((faq, i) => (
                            <RevealOnScroll key={i} delay={i * 100}>
                                <details className="group border border-purple-100 rounded-2xl overflow-hidden bg-white hover:border-purple-300 transition-all duration-300">
                                    <summary className="flex items-center justify-between p-6 md:p-8 cursor-pointer list-none">
                                        <h3 className="text-base md:text-lg font-serif italic text-gray-900 pr-4">{faq.q}</h3>
                                        <span className="text-purple-600 group-open:rotate-180 transition-transform duration-300">
                                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" /></svg>
                                        </span>
                                    </summary>
                                    <div className="px-6 md:px-8 pb-6 md:pb-8 text-xs md:text-sm font-light leading-relaxed text-gray-500">
                                        {faq.a}
                                    </div>
                                </details>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>



            {/* Footer - Massive */}
            <footer className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white pt-20 md:pt-32 pb-12 px-6 border-t border-white/10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:grid md:grid-cols-3 gap-12 md:gap-32 mb-20 md:mb-32">
                        <div>
                            <RevealOnScroll>
                                <h2 className="text-[15vw] md:text-[8vw] leading-[0.8] font-serif tracking-tighter opacity-10">
                                    SCALE.
                                </h2>
                            </RevealOnScroll>
                        </div>

                        <div className="space-y-12">
                            <RevealOnScroll delay={200}>
                                <div>
                                    <h3 className="text-[10px] font-black tracking-[0.4em] uppercase mb-6 text-purple-400">Intelligence</h3>
                                    <div className="flex flex-col gap-4 text-xs font-light opacity-60">
                                        <Link href="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link>
                                        <Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link>
                                        <Link href="/terms" className="hover:text-purple-400 transition-colors">Terms & Conditions</Link>
                                    </div>
                                </div>
                                <div className="mt-12">
                                    <h3 className="text-[10px] font-black tracking-[0.4em] uppercase mb-6 text-purple-400">Support</h3>
                                    <a href="mailto:support@eixora.store" className="text-xs font-light opacity-60 hover:text-purple-400 transition-colors">support@eixora.store</a>
                                </div>
                            </RevealOnScroll>
                        </div>

                        <div className="flex flex-col justify-end items-start md:items-end">
                            <RevealOnScroll delay={300} className="w-full text-left md:text-right">
                                <Link href="/signup" className="text-4xl md:text-6xl font-serif hover:italic transition-all underline decoration-1 underline-offset-8 mb-8 inline-block decoration-purple-500">
                                    Start Analysis &rarr;
                                </Link>
                                <p className="text-xs md:text-sm opacity-40 max-w-sm md:ml-auto">
                                    Join the elite agents using EIXORA to dominate. <br className="hidden md:block" />
                                    Limited access. Professional grade.
                                </p>
                            </RevealOnScroll>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-8 font-mono text-[9px] tracking-widest uppercase opacity-30">
                        <div className="flex gap-8">
                            <Link href="#" className="hover:text-white transition-opacity">Instagram</Link>
                            <Link href="#" className="hover:text-white transition-opacity">Twitter</Link>
                            <Link href="#" className="hover:text-white transition-opacity">TikTok</Link>
                        </div>
                        <p>&copy; 2026 EIXORA BY EXRICX. ALL RIGHTS RESERVED.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

