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
                    <p className="text-sm text-gray-500 mb-16 uppercase tracking-widest font-medium">Last Updated: March 10, 2026</p>
                </RevealOnScroll>

                <article className="prose prose-stone max-w-none space-y-12 text-gray-700 leading-relaxed font-light">
                    <RevealOnScroll delay={100}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">1. 30-Day Money Back Guarantee</h2>
                            <p>
                                We stand by the quality of EIXORA. If you are a new subscriber and are not satisfied with our service within the first 30 days of your initial purchase, you are eligible for a full refund. This guarantee applies to your first subscription payment only and does not apply to subsequent renewals.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">2. Service Usage</h2>
                            <p>
                                Once features are utilized for Viral DNA Extraction or ad intelligence analysis, the underlying AI compute has already been initiated and completed. We do not refund subscription fees based on dissatisfaction with AI-generated outputs, as the compute resources have been consumed.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={300}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">3. Performance Disclaimer</h2>
                            <p>
                                EIXORA provides AI-generated ad intelligence and creative direction based on historical data. We do not guarantee specific marketing results, ROI, or viral success. As results can vary based on numerous external factors (ad spend, platform algorithms, product quality), a lack of sales or engagement does not constitute grounds for a refund.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={400}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">4. Technical Issues</h2>
                            <p>
                                In the event of a documented technical failure (e.g., system error resulting in non-delivery of a DNA report), please contact support. We will prioritize resolving the issue and providing your analysis output.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={500}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">5. Contact Support</h2>
                            <p>
                                For any concerns regarding your purchase or billing, please reach out to our support team at: <a href="mailto:support@eixora.store" className="text-purple-600 underline">support@eixora.store</a>
                            </p>
                        </section>
                    </RevealOnScroll>
                </article>
            </main>

            <footer className="border-t border-purple-100 py-12 text-center text-[10px] uppercase tracking-[0.3em] opacity-40">
                &copy; 2026 EIXORA BY EXRICX. All rights reserved.
            </footer>
        </div>
    );
}
