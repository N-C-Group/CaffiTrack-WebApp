import { motion } from "framer-motion";
import { ChevronLeft, Mail } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold mb-4">CaffiTrack Privacy Policy</h1>
          <p className="text-muted-foreground mb-8 text-lg">Effective Date: September 30, 2025</p>
          
          <div className="space-y-12 text-muted-foreground leading-relaxed">
            <section>
              <p>
                This Privacy Policy applies to the CaffiTrack mobile application (the “Application”), developed by Ismail (the “Service Provider”) and provided as a Freemium service. The Application is provided “AS IS.”
              </p>
              <p className="mt-4">
                CaffiTrack is a caffeine intake tracking app designed to help users log, monitor, and better understand their caffeine consumption.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Information Collection and Use</h2>
              <p>
                The Application collects limited, automatically generated information to ensure proper functionality and improve performance. This may include:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Device Internet Protocol (IP) address</li>
                <li>App usage information (such as screens visited, session duration, and interaction events)</li>
                <li>Crash reports and performance diagnostics</li>
                <li>Device operating system and version</li>
              </ul>
              <p className="mt-4">The Application does not collect precise location data.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Caffeine Intake Data (On-Device Only)</h2>
              <p>
                All caffeine intake data entered into the Application is stored locally on the user’s device.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-primary/90 font-medium">
                <li>The Service Provider does not collect, upload, store, or access caffeine intake data</li>
                <li>Caffeine intake data is not transmitted to external servers</li>
                <li>Data is not linked to any personal identity</li>
              </ul>
              <p className="mt-4">Users may delete their data at any time by clearing the app’s data or uninstalling the Application.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">AI Assistant</h2>
              <p>
                The Application includes an AI-powered assistant that helps users gain insights about their caffeine intake.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>The AI assistant analyzes only data stored locally on the user’s device</li>
                <li>User data is not stored, logged, or retained by the Service Provider</li>
                <li>AI responses are generated for informational purposes only</li>
                <li>The AI assistant does not create user profiles and does not store personal or health data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Import and Export Features</h2>
              <p>
                The Application allows users to import and export their caffeine intake data.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>These actions are user-initiated</li>
                <li>Data is handled locally on the device</li>
                <li>Imported or exported data is not transmitted to the Service Provider</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Third-Party Services</h2>
              <p>
                The Application uses third-party services to support analytics, crash reporting, and in-app purchases. These services may collect limited technical data under their own Privacy Policies:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Google Play Services</li>
                <li>Mixpanel</li>
                <li>Bugsnag</li>
                <li>RevenueCat</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Children’s Privacy</h2>
              <p>
                The Application is not intended for children under the age of 13. The Service Provider does not knowingly collect personal data from children.
              </p>
            </section>

            <section className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or data practices, please contact:
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
