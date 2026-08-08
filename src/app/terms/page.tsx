import LegalPageShell from '@/components/LegalPageShell';

export default function TermsAndConditions() {
    return (
        <LegalPageShell title="Terms & Conditions" updated="March 10, 2026">
            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">1. Acceptance of Terms</h2>
                <p>
                    By accessing and using EIXORA, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website&apos;s particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">2. Use of License</h2>
                <p>
                    Permission is granted to temporarily access the materials (information or software) on EIXORA website for personal, non-commercial transitory viewing only.
                </p>
                <p className="mt-4">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="list-disc pl-5 space-y-2 mt-4 text-stone-400">
                    <li>Modify or copy the materials.</li>
                    <li>Use the materials for any commercial purpose, or for any public display.</li>
                    <li>Attempt to decompile or reverse engineer any software contained on EIXORA.</li>
                    <li>Remove any copyright or other proprietary notations from the materials.</li>
                </ul>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">3. Subscriptions & Billing</h2>
                <p>
                    EIXORA is a subscription-based service. By subscribing, you agree to recurring monthly or annual payments as specified in your chosen plan. All payments are processed securely via Polar, our payment processor. You may cancel your subscription at any time through your account settings or by contacting support.
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">4. Disclaimer</h2>
                <p>
                    The materials on EIXORA&apos;s website are provided on an &apos;as is&apos; basis. EIXORA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">5. Limitations</h2>
                <p>
                    In no event shall EIXORA or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EIXORA&apos;s website.
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">6. Governing Law</h2>
                <p>
                    Any claim relating to EIXORA website shall be governed by the laws of the jurisdiction in which the company operates without regard to its conflict of law provisions.
                </p>
            </section>
        </LegalPageShell>
    );
}
