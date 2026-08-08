import LegalPageShell from '@/components/LegalPageShell';

export default function PrivacyPolicy() {
    return (
        <LegalPageShell title="Privacy Policy" updated="February 28, 2026">
            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">1. Introduction</h2>
                <p>
                    Welcome to EIXORA. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">2. Data We Collect</h2>
                <p>
                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4 text-stone-400">
                    <li>Identity Data (First name, last name, username).</li>
                    <li>Contact Data (Email address).</li>
                    <li>Technical Data (IP address, browser type, location).</li>
                    <li>Usage Data (Information about how you use our website).</li>
                </ul>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">3. How We Use Your Data</h2>
                <p>
                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to provide our services, manage your account, and facilitate payments via Polar (our secure payment processor).
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">4. Data Security</h2>
                <p>
                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">5. Contact Us</h2>
                <p>
                    If you have any questions about this privacy policy or our privacy practices, please contact us at:{' '}
                    <a href="mailto:hello@eixora.store" className="text-lime-400 hover:text-lime-300 transition-colors">
                        hello@eixora.store
                    </a>
                </p>
            </section>
        </LegalPageShell>
    );
}
