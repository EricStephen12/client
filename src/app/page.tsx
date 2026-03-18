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
    const isLoggedIn = status === 'authenticated';

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
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-purple-200 transition-all duration-300">
                <div className="w-full px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-4xl font-signature hover:opacity-70 transition-opacity">
                        Eixora.
                    </Link>
                    <div className="flex items-center gap-12">
                        <Link href="/pricing" className="hidden md:block text-xs font-medium tracking-[0.2em] uppercase hover:underline underline-offset-4 decoration-1 decoration-purple-400">
                            Pricing
                        </Link>
                        <Link href="/login" className="hidden md:block text-xs font-medium tracking-[0.2em] uppercase hover:underline underline-offset-4 decoration-1 decoration-purple-400">
                            Sign In
                        </Link>
                        <Link href={isLoggedIn ? "/dashboard/analyze" : "/signup"} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 text-xs font-medium tracking-[0.2em] uppercase hover:from-purple-700 hover:to-blue-700 border-0 transition-all shadow-lg hover:shadow-xl">
                            {isLoggedIn ? "Enter Studio" : "Try Free"}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Refined Editorial */}
            <section className="pt-20 min-h-[85vh] grid md:grid-cols-2 border-b border-purple-200">

                {/* Left: Focused Value Prop */}
                <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 border-r border-purple-200 bg-white">
                    <RevealOnScroll delay={100}>
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-6 text-purple-600 block">AI Ad Intelligence</span>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.1] mb-8 tracking-tight">
                            Stop Guessing. <br />
                            <span className="italic bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent underline decoration-purple-200 decoration-4 underline-offset-8">Start Scaling.</span>
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll delay={300}>
                        <p className="text-lg font-light leading-relaxed max-w-sm mb-10 text-gray-600">
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
                                Extract DNA &rarr;
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
                    <span className="text-4xl font-serif italic mx-8 uppercase">Retention DNA</span>
                    <span className="text-xs tracking-[0.3em] uppercase mx-8">Driven by Data</span>
                    <span className="text-4xl font-serif italic mx-8 uppercase">Direct Response</span>
                    <span className="text-xs tracking-[0.3em] uppercase mx-8">Driven by Data</span>
                    <span className="text-4xl font-serif italic mx-8 uppercase">Scaling Logic</span>
                    <span className="text-xs tracking-[0.3em] uppercase mx-8">Driven by Data</span>
                    <span className="text-4xl font-serif italic mx-8 uppercase">Conversion Engine</span>
                    <span className="text-xs tracking-[0.3em] uppercase mx-8">Driven by Data</span>
                </div>
            </section>

            {/* Video Carousel Section */}
            <VideoCarousel />

            {/* The Manifesto / How It Works */}
            <section className="grid lg:grid-cols-2 border-b border-purple-200">
                <div className="p-12 lg:p-24 border-b lg:border-b-0 lg:border-r border-purple-200 flex items-center bg-gradient-to-br from-purple-50 to-transparent">
                    <RevealOnScroll>
                        <h2 className="text-6xl md:text-8xl font-serif leading-none tracking-tight">
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
            <section className="py-32 px-6 border-b border-purple-200 bg-white">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll className="text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-serif mb-6 italic">How EIXORA Works</h2>
                        <p className="text-xs tracking-[0.4em] uppercase text-purple-600">From Viral Link to Winning Ad in 60 Seconds</p>
                    </RevealOnScroll>

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-12">
                            {[
                                { step: "Extract", desc: "Paste any viral link. Our AI decodes the hook, pacing, and visual triggers that drive engagement." },
                                { step: "Analyze", desc: "We extract the 'Retention DNA' and blueprint the exact reasons why the ad is scaling." },
                                { step: "Deploy", desc: "Get an actionable creative brief with hook variations, pacing notes, and visual direction to replicate the win." }
                            ].map((p, i) => (
                                <RevealOnScroll key={i} delay={i * 200} className="relative pl-12">
                                    <span className="absolute left-0 top-0 text-3xl font-serif italic text-purple-200">0{i + 1}</span>
                                    <h3 className="text-2xl font-serif mb-3 italic">{p.step}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed font-light">{p.desc}</p>
                                </RevealOnScroll>
                            ))}
                        </div>

                        <RevealOnScroll delay={400} className="relative group p-4 bg-gray-50 rounded-3xl border border-purple-100 overflow-hidden shadow-2xl">
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
                                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50 group-hover:scale-110 transition-all">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent translate-x-1"></div>
                                    </div>
                                </div>
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                    <span className="text-[10px] font-bold tracking-widest bg-purple-600 text-white px-3 py-1 rounded uppercase">Live DNA Extraction</span>
                                </div>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* Feature Grid - Brutalist */}
            <section className="grid grid-cols-1 md:grid-cols-2 border-b border-purple-200">
                {[
                    { title: "Ad Analysis", subtitle: "Data-Driven Creative", img: "/retention-dna.png" },
                    { title: "Hook Engineering", subtitle: "Engineered to Convert", img: "/hook-engineering.png" },
                ].map((feature, i) => (
                    <div key={i} className={`group border-b md:border-b-0 border-purple-200 ${i !== 1 ? 'md:border-r border-purple-200' : ''} h-[80vh] relative overflow-hidden`}>
                        <Image
                            src={feature.img}
                            alt={feature.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-purple-600/10 group-hover:bg-transparent transition-colors duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-full p-8 bg-white border-t-2 border-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                            <RevealOnScroll>
                                <span className="text-xs tracking-[0.2em] uppercase block mb-2">{feature.subtitle}</span>
                                <h3 className="text-3xl font-serif">{feature.title}</h3>
                            </RevealOnScroll>
                        </div>
                        <div className="absolute top-8 left-8 text-white drop-shadow-lg">
                            <span className="text-xs font-mono border-2 border-white bg-purple-600/80 backdrop-blur-sm px-3 py-1.5 rounded-full">0{i + 1}</span>
                        </div>
                    </div>
                ))}
            </section>

            {/* The Math - Editorial Table Style */}
            <section className="py-32 px-6 border-b border-purple-200">
                <div className="max-w-4xl mx-auto">
                    <RevealOnScroll className="text-center mb-24">
                        <h2 className="text-5xl font-serif mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent italic">The Ad Blueprint</h2>
                        <p className="text-xs tracking-[0.3em] uppercase text-purple-600">Built for Results</p>
                    </RevealOnScroll>

                    <RevealOnScroll>
                        <div className="border-2 border-purple-600 rounded-lg overflow-hidden shadow-xl">
                            {[
                                { l: "Input", r: "Any Viral TikTok You Love" },
                                { l: "Result", r: "Full Breakdown of the Hook & Moves" },
                                { l: "Blueprint", r: "A Clear Plan for Your Brand" },
                                { l: "Goal", r: "Ads That People Actually Watch" }
                            ].map((row, i) => (
                                <div key={i} className="grid grid-cols-2 border-b border-purple-200 last:border-b-0 hover:bg-gradient-to-r hover:bg-purple-600 hover:text-white transition-all duration-300 group">
                                    <div className="p-8 border-r border-purple-200 font-serif text-xl italic">{row.l}</div>
                                    <div className="p-8 text-sm uppercase tracking-widest flex items-center">{row.r}</div>
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
                    className="flex overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory px-6 md:px-[calc((100vw-80rem)/2)]"
                >
                    {[
                        {
                            name: "Cole Baker",
                            role: "CEO Wave LLC",
                            quote: "Honestly? I was winging it in Apple Notes like a caveman before. I saw ads for 'AI tools' but they were all trash. I was skeptical of EIXORA too—thought it was just another prompt wrapper. Then I ran the DNA Extraction on my competitor's best ad. It caught the exact pacing shift at 3 seconds that I was missing. My hooks finally have power and I've 3x'd my ROAS in 10 days."
                        },
                        {
                            name: "Yedam Lee",
                            role: "Re:stage",
                            quote: "Absolute lifesaver for our team. We aren't 'marketing experts' so we were literally pulling our hair out trying to plan videos. EIXORA's 'Big Idea' analyzer is a savior. It doesn't just tell you what works—it breaks down the psychology of WHY the ad works. Completely solved our biggest creative headache."
                        },
                        {
                            name: "Elina",
                            role: "Founder",
                            quote: "The 'Hook Power' grade is the real game changer. I used to guess if my intros were good, now I actually have a score based on viral DNA. The visual suggestions made a massive difference in my retention. I've seen a huge improvement in my clients' videos since we started using the Studio."
                        },
                        {
                            name: "Julian",
                            role: "Scaling",
                            quote: "Antes da EIXORA, meu processo era uma bagunça total. Eu perdia horas tentando organizar as ideias. O jogo mudou com o 'Visual DNA'. Agora minhas postagens têm estratégia real por trás. Ferramenta indispensável para quem leva o digital a sério e quer escala de verdade."
                        },
                        {
                            name: "Mike",
                            role: "Creator",
                            quote: "The wins are real. My views are finally up because the 'Viral Checklist' actually keeps me on track. EIXORA took the 'ugh' out of planning. I'm actually having fun creating again because I know my strategy is backed by data, not just luck."
                        }
                    ].map((t, i) => (
                        <div key={i} className="min-w-[85vw] md:min-w-[45vw] snap-start pr-12 relative group">
                            <RevealOnScroll delay={i * 50} className="h-full flex flex-col border-l border-purple-100/50 pl-10 py-8 hover:border-purple-400 transition-all duration-1000 bg-white/50 hover:bg-white rounded-r-3xl relative overflow-visible">
                                <p className="text-sm md:text-base font-light leading-relaxed text-gray-500 mb-8 whitespace-pre-wrap">"{t.quote}"</p>
                                {/* Floating Heart Emojis - Inside card so they're visible */}
                                <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 pointer-events-none">
                                    <span className="animate-heart text-xl" style={{ animationDelay: `${i * 0.7}s` }}>❤️</span>
                                    <span className="animate-heart text-base" style={{ animationDelay: `${i * 0.7 + 1.2}s` }}>🧡</span>
                                    <span className="animate-heart text-sm" style={{ animationDelay: `${i * 0.7 + 2.1}s` }}>💜</span>
                                </div>
                                <div className="mt-auto flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center text-[10px] font-black text-purple-600 uppercase tracking-widest border border-purple-100">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">{t.name}</h4>
                                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{t.role}</p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        </div>
                    ))}
                    {/* Spacer */}
                    <div className="min-w-[20vw] flex-shrink-0"></div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 px-6 border-b border-purple-200 bg-white">
                <div className="max-w-4xl mx-auto">
                    <RevealOnScroll className="text-center mb-24">
                        <span className="text-[10px] font-black tracking-[0.5em] uppercase text-purple-600 mb-4 block">Information</span>
                        <h2 className="text-5xl font-serif italic mb-6">Frequently Asked</h2>
                    </RevealOnScroll>

                    <div className="space-y-4">
                        {[
                            { q: "What exactly is EIXORA?", a: "EIXORA is the first AI-powered 'DNA Extraction' tool for TikTok ad creative. We use intelligence-grade models to decode viral ads and blueprint their mechanics so you can replicate their success with your own product." },
                            { q: "Does it work for any niche?", a: "Yes. Whether it's home decor, tech, personal care, or coaching—if there is a viral video for it, EIXORA can blueprint it for you." },
                            { q: "How long does an analysis take?", a: "DNA Extraction usually takes less than 60 seconds per link. You paste the URL, we do the heavy lifting." },
                            { q: "Can I use EIXORA on mobile?", a: "Absolutely. Our Studio is fully responsive. You can find inspiration on the TikTok app and paste it directly into EIXORA on your phone." },
                            { q: "What do I get from an extraction?", a: "You get a full Viral DNA report including hook power score, retention analysis, pacing blueprint, psychology breakdown, and actionable creative direction." }
                        ].map((faq, i) => (
                            <RevealOnScroll key={i} delay={i * 100}>
                                <details className="group border border-purple-100 rounded-3xl overflow-hidden bg-white hover:border-purple-300 transition-all duration-300">
                                    <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                                        <h3 className="text-lg font-serif italic text-gray-900">{faq.q}</h3>
                                        <span className="text-purple-600 group-open:rotate-180 transition-transform duration-300">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" /></svg>
                                        </span>
                                    </summary>
                                    <div className="px-8 pb-8 text-sm font-light leading-relaxed text-gray-500">
                                        {faq.a}
                                    </div>
                                </details>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </section>



            {/* Footer - Massive */}
            <footer className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white pt-32 pb-12 px-6 border-t-4 border-purple-600">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 mb-32">
                        <div>
                            <RevealOnScroll>
                                <h2 className="text-[10vw] leading-[0.8] font-serif tracking-tighter opacity-20">
                                    START.
                                </h2>
                            </RevealOnScroll>
                        </div>

                        {/* Mobile Contact & Legal - Visible only on mobile */}
                        <div className="space-y-6 md:hidden">
                            <RevealOnScroll delay={200}>
                                <h3 className="text-xs font-bold tracking-[0.3em] uppercase mb-6 text-purple-400">Support</h3>
                                <div className="space-y-4 text-sm font-light opacity-80">
                                    <a href="mailto:eixoraservicecenter@gmail.com" className="flex items-center gap-3">
                                        <span className="text-purple-400 font-bold">E:</span> eixoraservicecenter@gmail.com
                                    </a>
                                </div>

                                <h3 className="text-xs font-bold tracking-[0.3em] uppercase mt-12 mb-6 text-purple-400">Legal</h3>
                                <div className="flex flex-col gap-4 text-xs font-light opacity-60">
                                    <Link href="/pricing" className="hover:text-purple-400 transition-colors underline decoration-purple-200/30 underline-offset-4">Pricing</Link>
                                    <Link href="/privacy" className="hover:text-purple-400 transition-colors underline decoration-purple-200/30 underline-offset-4">Privacy Policy</Link>
                                    <Link href="/terms" className="hover:text-purple-400 transition-colors underline decoration-purple-200/30 underline-offset-4">Terms & Conditions</Link>
                                    <Link href="/refund" className="hover:text-purple-400 transition-colors underline decoration-purple-200/30 underline-offset-4">Refund Policy</Link>
                                </div>
                            </RevealOnScroll>
                        </div>

                        <div className="hidden md:block">
                            {/* Empty middle column for spacing on desktop to keep it minimal */}
                        </div>

                        <div className="flex flex-col justify-end items-start md:items-end">
                            <RevealOnScroll delay={300} className="w-full text-left md:text-right">
                                <Link href="/signup" className="text-4xl md:text-6xl font-serif hover:italic transition-all underline decoration-1 underline-offset-8 mb-8 inline-block">
                                    Launch Engine &rarr;
                                </Link>
                                <p className="text-sm opacity-50 max-w-md ml-auto">
                                    Join the elite agents using EIXORA to dominate the attention economy. <br />
                                    Limited access. Professional grade.
                                </p>
                            </RevealOnScroll>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/20 gap-8">
                        {/* Desktop Legal Links - Visible only on desktop */}
                        <div className="hidden md:flex flex-wrap items-center justify-start gap-8 text-[10px] tracking-[0.2em] uppercase opacity-50">
                            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
                            <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
                            <a href="mailto:eixoraservicecenter@gmail.com" className="hover:text-white transition-colors">Support: eixoraservicecenter@gmail.com</a>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex gap-8">
                                <Link href="#" className="text-[10px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity">Instagram</Link>
                                <Link href="#" className="text-[10px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity">Twitter</Link>
                                <Link href="#" className="text-[10px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity">TikTok</Link>
                            </div>
                            <p className="text-xs tracking-[0.2em] uppercase opacity-50">&copy; 2026 EIXORA BY EXRICX. ALL RIGHTS RESERVED.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

