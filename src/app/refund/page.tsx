import LegalPageShell from '@/components/LegalPageShell';

export default function RefundPolicy() {
    return (
        <LegalPageShell title="Refund Policy" updated="March 10, 2026">
            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">1. 30-Day Money Back Guarantee</h2>
                <p>
                    We stand by the quality of EIXORA. If you are a new subscriber and are not satisfied with our service within the first 30 days of your initial purchase, you are eligible for a full refund. This guarantee applies to your first subscription payment only and does not apply to subsequent renewals.
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">2. Service Usage</h2>
                <p>
                    Once features are utilized for Viral DNA Extraction or ad intelligence analysis, the underlying AI compute has already been initiated and completed. We do not refund subscription fees based on dissatisfaction with AI-generated outputs, as the compute resources have been consumed.
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">3. Performance Disclaimer</h2>
                <p>
                    EIXORA provides AI-generated ad intelligence and creative direction based on historical data. We do not guarantee specific marketing results, ROI, or viral success. As results can vary based on numerous external factors (ad spend, platform algorithms, product quality), a lack of sales or engagement does not constitute grounds for a refund.
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">4. Technical Issues</h2>
                <p>
                    In the event of a documented technical failure (e.g., system error resulting in non-delivery of a DNA report), please contact support. We will prioritize resolving the issue and providing your analysis output.
                </p>
            </section>

            <section>
                <h2 className="font-serif text-xl text-white mb-3 tracking-tight">5. Contact Support</h2>
                <p>
                    For any concerns regarding your purchase or billing, please reach out to our support team at:{' '}
                    <a href="mailto:hello@eixora.store" className="text-lime-400 hover:text-lime-300 transition-colors">
                        hello@eixora.store
                    </a>
                </p>
            </section>
        </LegalPageShell>
    );
}
