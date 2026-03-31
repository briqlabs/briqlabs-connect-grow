import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  const openForm = () => {};

  return (
    <div className="min-h-screen bg-background">
      <Navbar openForm={openForm} />
      <main className="container mx-auto px-6 pt-24 pb-16 max-w-3xl">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide directly, including your name, email address, phone number, and business details when you fill out forms, request demos, or contact us. We also collect usage data such as IP address, browser type, and pages visited through cookies and similar technologies.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, maintain, and improve our AI products and services</li>
              <li>To communicate with you about updates, promotions, and support</li>
              <li>To process your requests and respond to inquiries</li>
              <li>To analyze usage patterns and optimize user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">3. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with trusted service providers who assist in operating our platform, subject to confidentiality agreements. We may also disclose information when required by law or to protect our rights.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">5. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information. You may opt out of marketing communications at any time. To exercise these rights, contact us at the details provided below.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">6. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:hello@briqlabs.com" className="text-primary hover:underline">hello@briqlabs.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
