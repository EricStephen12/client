import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function RefundPolicy() {
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
                    <h1 className="text-5xl md:text-7xl font-serif mb-12 tracking-tight">Refund Policy</h1>
                    <p className="text-sm text-gray-500 mb-16 uppercase tracking-widest font-medium">Last Updated: February 28, 2026</p>
                </RevealOnScroll>

                <article className="prose prose-stone max-w-none space-y-12 text-gray-700 leading-relaxed font-light">
                    <RevealOnScroll delay={100}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">1. No-Refund Policy for Digital Products</h2>
                            <p>
                                Due to the nature of digital products and the immediate delivery of credits and analysis reports, EIXORA generally does not offer refunds once a purchase has been made and credits have been added to your account.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">2. Credit Usage</h2>
                            <p>
                                Once credits are utilized for ad script generation or video DNA analysis, they are considered consumed. We do not refund credits used for generating content, even if the user is dissatisfied with the generated output, as the underlying AI compute has already been initiated and completed.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={300}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">3. Performance Disclaimer</h2>
                            <p>
                                EIXORA provides AI-generated ad scripts and creative direction based on historical data. We do not guarantee specific marketing results, ROI, or viral success. As results can vary based on numerous external factors (ad spend, platform algorithms, product quality), a lack of sales or engagement does not constitute grounds for a refund.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={400}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">4. Technical Issues</h2>
                            <p>
                                In the event of a documented technical failure (e.g., system error resulting in non-delivery of a report despite credits being deducted), please contact support. We will prioritize either re-crediting your account or providing the manual output of your analysis.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={500}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">5. Contact Support</h2>
                            <p>
                                For any concerns regarding your purchase or billing, please reach out to our support team at: <a href="mailto:support@eixora.com" className="text-purple-600 underline">support@eixora.com</a>
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
