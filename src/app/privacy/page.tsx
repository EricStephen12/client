import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function PrivacyPolicy() {
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
                    <h1 className="text-5xl md:text-7xl font-serif mb-12 tracking-tight">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 mb-16 uppercase tracking-widest font-medium">Last Updated: February 28, 2026</p>
                </RevealOnScroll>

                <article className="prose prose-stone max-w-none space-y-12 text-gray-700 leading-relaxed font-light">
                    <RevealOnScroll delay={100}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">1. Introduction</h2>
                            <p>
                                Welcome to EIXORA. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">2. Data We Collect</h2>
                            <p>
                                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-4">
                                <li>Identity Data (First name, last name, username).</li>
                                <li>Contact Data (Email address).</li>
                                <li>Technical Data (IP address, browser type, location).</li>
                                <li>Usage Data (Information about how you use our website).</li>
                            </ul>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={300}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">3. How We Use Your Data</h2>
                            <p>
                                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to provide our services, manage your account, and improve our platform.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={400}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">4. Data Security</h2>
                            <p>
                                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                            </p>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={500}>
                        <section>
                            <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">5. Contact Us</h2>
                            <p>
                                If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:support@eixora.com" className="text-purple-600 underline">support@eixora.com</a>
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
