import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  const openForm = () => {};

  return (
    <div className="min-h-screen bg-background">
      <Navbar openForm={openForm} />
      <main className="container mx-auto px-6 pt-24 pb-16 max-w-3xl">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Terms & Conditions</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using Briqlabs AI's services, website, or products, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">2. Services</h2>
            <p>Briqlabs AI provides AI-powered automation solutions including WhatsApp AI agents, Voice AI agents, and related services. We reserve the right to modify, suspend, or discontinue any part of our services at any time.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">3. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate and complete information when using our services</li>
              <li>Use our services only for lawful purposes</li>
              <li>Not attempt to reverse-engineer, copy, or redistribute our technology</li>
              <li>Maintain the confidentiality of your account credentials</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">4. Intellectual Property</h2>
            <p>All content, trademarks, and technology on this platform are owned by Briqlabs AI. You may not use, reproduce, or distribute any materials without prior written consent.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>Briqlabs AI shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid by you for the services in the preceding 12 months.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">6. Termination</h2>
            <p>We may terminate or suspend your access to our services at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or our business.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">7. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">8. Contact Us</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:hello@briqlabs.com" className="text-primary hover:underline">hello@briqlabs.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
