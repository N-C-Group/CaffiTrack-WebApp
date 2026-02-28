import { motion } from "framer-motion";
import { ChevronLeft, Mail, ShieldAlert, Scale, Info } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-12 group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-invert prose-primary max-w-none"
        >
          <h1 className="text-4xl font-bold mb-4">CaffiTrack Terms of Use</h1>
          <p className="text-muted-foreground mb-8 text-lg">Effective Date: September 30, 2025</p>
          
          <div className="space-y-12 text-muted-foreground leading-relaxed">
            <section>
              <p>
                These Terms of Use apply to the CaffiTrack mobile application (the “Application”), developed by Ismail (the “Service Provider”) and provided as a Freemium service.
              </p>
              <p className="mt-4 italic">
                By downloading or using the Application, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Use of the Application
              </h2>
              <p>
                The Application is provided to help users track and gain insights into their caffeine intake. The Application is provided “AS IS” and “AS AVAILABLE.”
              </p>
              <p className="mt-4 text-white font-medium">
                You agree to use the Application only for lawful purposes and in accordance with these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Intellectual Property Rights</h2>
              <p>
                The Application, including but not limited to its design, features, content, trademarks, and source code, is the exclusive property of the Service Provider.
              </p>
              <p className="mt-4">You may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Copy, modify, or distribute the Application or any part of it</li>
                <li>Attempt to extract or reverse-engineer the source code</li>
                <li>Translate the Application or create derivative works</li>
                <li>Use the Service Provider’s trademarks without prior written permission</li>
              </ul>
            </section>

            <section className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h2 className="text-2xl font-semibold mb-4 text-white">User Data and Device Security</h2>
              <p>
                CaffiTrack does not require account creation and does not collect personal information such as names, email addresses, or user IDs.
              </p>
              <p className="mt-4">
                All caffeine intake data entered by the user is stored locally on the user’s device. It is your responsibility to keep your device secure.
              </p>
            </section>

            <section className="bg-destructive/10 p-6 rounded-xl border border-destructive/20">
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Limitation of Liability
              </h2>
              <p>
                While the Service Provider strives to keep the Application accurate, reliable, and up to date, the Application may rely on third-party services or information and is provided on an “AS IS” and “AS AVAILABLE” basis.
              </p>
              <div className="mt-4 space-y-4 text-white font-medium">
                <p>To the maximum extent permitted by applicable law, the Service Provider shall not be liable for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Any direct or indirect loss or damage arising from reliance on the Application</li>
                  <li>Any loss of data resulting from device issues, data clearing, or removal of the Application</li>
                  <li>Any health, medical, or lifestyle decisions made based on information provided by the Application</li>
                </ul>
              </div>
              <p className="mt-6 p-4 bg-black/40 rounded border border-white/5 text-primary font-bold text-center uppercase tracking-wider">
                The Application is provided for informational purposes only and does not provide medical or health advice. Users are responsible for how they interpret and use the information provided by the Application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Third-Party Services</h2>
              <p>
                The Application uses third-party services that operate under their own Terms and Conditions, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Google Play Services</li>
                <li>Mixpanel</li>
                <li>Bugsnag</li>
                <li>RevenueCat</li>
              </ul>
            </section>

            <section className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                Contact Us
              </h2>
              <p>
                If you have any questions or suggestions regarding these Terms of Use, please contact:
              </p>
              <a href="mailto:ismailncgroup@gmail.com" className="text-primary font-bold mt-2 block hover:underline">
                ismailncgroup@gmail.com
              </a>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
