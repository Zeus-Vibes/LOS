import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Store, ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">LOS</span>
            </Link>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6">Last updated: January 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground">We collect information you provide directly to us:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li><strong>Account Information:</strong> Name, email, phone number, address</li>
                <li><strong>Order Information:</strong> Delivery address, payment method, order history</li>
                <li><strong>Location Data:</strong> To show nearby shops and enable delivery</li>
                <li><strong>Device Information:</strong> Browser type, IP address for security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Process and deliver your orders</li>
                <li>Send order updates and notifications</li>
                <li>Improve our services and user experience</li>
                <li>Communicate about promotions (with your consent)</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
              <p className="text-muted-foreground">We share your information only in these circumstances:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li><strong>With Shopkeepers:</strong> To fulfill your orders (name, address, phone)</li>
                <li><strong>Service Providers:</strong> Payment processors, delivery partners</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
              </ul>
              <p className="text-muted-foreground mt-2">We never sell your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p className="text-muted-foreground">We implement appropriate security measures to protect your data:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Secure password storage</li>
                <li>Regular security audits</li>
                <li>Access controls for employee data access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p className="text-muted-foreground">You have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
              <p className="text-muted-foreground">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze site usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Children's Privacy</h2>
              <p className="text-muted-foreground">Our service is not intended for children under 13. We do not knowingly collect information from children under 13.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">We may update this policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
              <p className="text-muted-foreground">If you have questions about this Privacy Policy, please contact us at privacy@los.local</p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
