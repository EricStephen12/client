import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-[#FAFAF9] text-[#1c1917] font-sans selection:bg-purple-100">
            {/* Small Header */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-purple-200">
                <div className="w-full px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-3xl font-signature">
                        Eixora.
                    </Link>
                    <Link href="/" className="text-xs font-medium tracking-[0.2em] uppercase hover:underline">
                        Back to Home
                    </Link>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 pt-40 pb-32">
                <RevealOnScroll>
                    <h1 className="text-5xl md:text-7xl font-serif mb-12 tracking-tight">Terms & Conditions</h1>
                    <p className="text-sm text-gray-500 mb-16 uppercase tracking-widest font-medium">Last Updated: February 28, 2026</p>
                </RevealOnScroll>

                <article className="prose prose-stone max-w-none space-y-12 text-gray-700 leading-relaxed font-light">
                    <RevealOnScroll delay={100}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using EIXORA, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">2. Use of License</h2>
                            <p>
                                Permission is granted to temporarily access the materials (information or software) on EIXORA website for personal, non-commercial transitory viewing only.
                            </p>
                            <p className="mt-4">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-4">
                                <li>Modify or copy the materials.</li>
                                <li>Use the materials for any commercial purpose, or for any public display.</li>
                                <li>Attempt to decompile or reverse engineer any software contained on EIXORA.</li>
                                <li>Remove any copyright or other proprietary notations from the materials.</li>
                            </ul>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={300}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">3. Credits & Subscription</h2>
                            <p>
                                EIXORA operates on a credit-based system. Credits are used to generate ad scripts and perform deep analysis. Subscriptions and one-time purchases are subject to the pricing listed on the platform at the time of purchase.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={400}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">4. Disclaimer</h2>
                            <p>
                                The materials on EIXORA's website are provided on an 'as is' basis. EIXORA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={500}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">5. Limitations</h2>
                            <p>
                                In no event shall EIXORA or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EIXORA's website.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={600}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">6. Governing Law</h2>
                            <p>
                                Any claim relating to EIXORA website shall be governed by the laws of the jurisdiction in which the company operates without regard to its conflict of law provisions.
                            </p>
                        </section>
                    </RevealOnScroll>
                </article>
            </main>

            <footer className="border-t border-purple-100 py-12 text-center text-[10px] uppercase tracking-[0.3em] opacity-40">
                &copy; 2026 EXRICX. All rights reserved.
            </footer>
        </div>
    );
}
