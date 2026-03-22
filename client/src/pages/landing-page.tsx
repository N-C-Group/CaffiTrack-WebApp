import { motion } from "framer-motion";
import { Zap, Database, ArrowRightLeft, ShieldCheck, Activity, Mail, Send, MoonStar, HeartPulse, Gauge } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema, type InsertContactMessage } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SiApple, SiGoogleplay } from "react-icons/si";
import heroBg from "@assets/generated_images/abstract_dark_blue_energy_background_without_text.png";
import aiScreenshotInitial from "@assets/5_1769249617361.png";
import aiScreenshotQuestion from "@assets/6_1769249617361.png";
import appScreenshot1 from "@assets/1_1769249251247.png";
import appScreenshot2 from "@assets/2_1769221378963.png";
import analyticsScreenshot from "@assets/3_1769249370228.png";
import reminderTime from "@assets/7_1769221308434.png";
import reminderNotif from "@assets/8_1769221308434.png";
import dbScreenshot from "@assets/4_1769249402616.png";
import appleHealthLogo from "@assets/apple-health-logo.png";
import healthConnectLogo from "@assets/health-connect-logo.png";

export default function LandingPage() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
        <img 
          src={heroBg} 
          alt="Background" 
          className="w-full h-full object-cover mix-blend-screen opacity-50"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-xl tracking-tight">CaffiTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, "features")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <a 
              href="#ai" 
              onClick={(e) => scrollToSection(e, "ai")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              AI Assistant
            </a>
            <a
              href="#health"
              onClick={(e) => scrollToSection(e, "health")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Health Integrations
            </a>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, "contact")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
            <Button 
              size="sm" 
              className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_hsl(var(--primary))]"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Get CaffiTrack
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.21, 1.02, 0.47, 0.98] }}
              className="space-y-8"
            >
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white">
                Track Your Daily <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300 text-glow">
                  Caffeine Intake
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Monitor your coffee, energy drinks, and tea consumption. 650+ drink database, personalized limits, and AI-powered insights to help you understand your caffeine habits.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base bg-white text-black hover:bg-white/90 font-semibold gap-3" 
                  data-testid="button-appstore"
                  onClick={() => window.open("https://apps.apple.com/gb/app/caffitrack/id6749832786", "_blank")}
                >
                  <SiApple className="h-5 w-5" />
                  App Store
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 text-base border-white/10 hover:bg-white/5 font-semibold gap-3" 
                  data-testid="button-playstore"
                  onClick={() => window.open("https://play.google.com/store/apps/details?id=org.ncgroup.caffitrack&utm_source=emea_Med", "_blank")}
                >
                  <SiGoogleplay className="h-5 w-5" />
                  Play Store
                </Button>
              </div>
            </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <img 
              src={appScreenshot1} 
              alt="CaffiTrack caffeine tracker app interface showing daily caffeine intake" 
              loading="lazy"
              className="relative z-10 mx-auto w-[300px] rounded-[3rem] border-8 border-white/5 shadow-2xl rotate-[-5deg] hover:rotate-0 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 bg-black/50 backdrop-blur-sm border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Master Your Intake</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Stay on top of your caffeine habits with CaffiTrack's powerful features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group flex flex-col items-center"
            >
              <div className="absolute inset-0 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all rounded-full scale-75" />
              <div className="relative z-10 w-full max-w-[240px] aspect-[9/19] rounded-[2rem] border-4 border-white/10 shadow-2xl overflow-hidden bg-black/40 group-hover:border-primary/50 transition-colors group-hover:scale-105 transition-transform duration-500">
                <img 
                  src={appScreenshot1} 
                  alt="CaffiTrack home dashboard showing daily caffeine intake tracking" 
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <p className="text-lg font-bold text-white mb-1">Home Dashboard</p>
                <p className="text-sm text-muted-foreground">Today's intake at a glance</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group flex flex-col items-center pt-8 lg:pt-16"
            >
              <div className="absolute inset-0 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all rounded-full scale-75" />
              <div className="relative z-10 w-full max-w-[240px] aspect-[9/19] rounded-[2rem] border-4 border-white/10 shadow-2xl overflow-hidden bg-black/40 group-hover:border-primary/50 transition-colors group-hover:scale-105 transition-transform duration-500">
                <img 
                  src={appScreenshot2} 
                  alt="Adding caffeine drinks to track daily consumption" 
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <p className="text-lg font-bold text-white mb-1">Easy Logging</p>
                <p className="text-sm text-muted-foreground">Add drinks in seconds</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative group flex flex-col items-center"
            >
              <div className="absolute inset-0 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all rounded-full scale-75" />
              <div className="relative z-10 w-full max-w-[240px] aspect-[9/19] rounded-[2rem] border-4 border-white/10 shadow-2xl overflow-hidden bg-black/40 group-hover:border-primary/50 transition-colors group-hover:scale-105 transition-transform duration-500">
                <img 
                  src={analyticsScreenshot} 
                  alt="Caffeine intake analytics showing weekly and monthly trends" 
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <p className="text-lg font-bold text-white mb-1">Analytics</p>
                <p className="text-sm text-muted-foreground">Weekly & monthly trends</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative group flex flex-col items-center pt-8 lg:pt-16"
            >
              <div className="absolute inset-0 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all rounded-full scale-75" />
              <div className="relative z-10 w-full max-w-[240px] aspect-[9/19] rounded-[2rem] border-4 border-white/10 shadow-2xl overflow-hidden bg-black/40 group-hover:border-primary/50 transition-colors group-hover:scale-105 transition-transform duration-500">
                <img 
                  src={dbScreenshot} 
                  alt="Caffeine database with 650+ drinks from Starbucks, Costa, and more" 
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <p className="text-lg font-bold text-white mb-1">600+ Drink DB</p>
                <p className="text-sm text-muted-foreground">Starbucks, Costa & more</p>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              index={0}
              icon={<ShieldCheck className="h-6 w-6 text-primary" />}
              title="Fully Private"
              description="Your data stays on your device. No account required, no sign-up, you own your data."
            />
            <FeatureCard 
              index={1}
              icon={<Database className="h-6 w-6 text-primary" />}
              title="600+ Drinks"
              description="Extensive verified database including Starbucks, Caffè Nero, Costa, energy drinks, and sodas."
            />
            <FeatureCard 
              index={2}
              icon={<ArrowRightLeft className="h-6 w-6 text-primary" />}
              title="Import / Export"
              description="Backup and restore your data anytime. Export to JSON for migration. No lock-in."
            />
            <FeatureCard 
              index={3}
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="Smart Warnings"
              description="Get notified when you reach your caffeine threshold. Customizable daily limits and warning levels."
            />
          </div>
        </div>
      </section>

      {/* AI Demo Section */}
      <section id="ai" className="relative z-10 py-32 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative grid grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-all rounded-full" />
                <img 
                  src={aiScreenshotInitial} 
                  alt="AI caffeine assistant helping track and analyze caffeine intake" 
                  loading="lazy"
                  className="relative z-10 rounded-2xl border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="relative group pt-8 lg:pt-16">
                <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-all rounded-full" />
                <img 
                  src={aiScreenshotQuestion} 
                  alt="Ask AI about caffeine consumption and health recommendations" 
                  loading="lazy"
                  className="relative z-10 rounded-2xl border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-4xl md:text-5xl font-bold">
                Your Personal <br />
                <span className="text-primary">AI Caffeine Assistant</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Get personalized caffeine advice. Ask about your intake patterns, daily safe limits, how to reduce caffeine consumption, or manage caffeine withdrawal symptoms.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Real-time half-life calculations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Sleep impact warnings</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reminders Section */}
      <section id="reminders" className="relative z-10 py-24 bg-black/30 backdrop-blur-sm border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold">
                Smart Caffeine <br />
                <span className="text-primary">Alerts & Reminders</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stay on top of your caffeine intake. Get daily reminders to log drinks and warnings when you approach your safe daily limit to help prevent caffeine addiction.
              </p>
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Customizable reminder times</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Warning alerts when you hit your limit</span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-6 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <img 
                  src={reminderTime} 
                  alt="Set caffeine tracking reminder times" 
                  loading="lazy"
                  className="relative z-10 rounded-2xl border border-white/10 shadow-2xl"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative flex flex-col gap-4"
              >
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/40">
                  <img 
                    src={reminderNotif} 
                    alt="Caffeine limit warning notification to help reduce caffeine addiction" 
                    loading="lazy"
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Health Integrations Section */}
      <section id="health" className="relative z-10 py-24 bg-black/30 backdrop-blur-sm border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 order-2"
            >
              <h2 className="text-4xl md:text-5xl font-bold">
                HealthKit & Health Connect <br />
                <span className="text-primary">Wellness Monitoring</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Connect CaffiTrack to Apple HealthKit and Google Health Connect to monitor sleep, heart rate, and blood pressure alongside your caffeine intake.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5">
                  <img
                    src={appleHealthLogo}
                    alt="Apple HealthKit icon"
                    loading="lazy"
                    className="h-4 w-4 rounded-sm object-cover object-center"
                  />
                  <span className="text-xs font-medium text-muted-foreground">HealthKit (iOS)</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5">
                  <img
                    src={healthConnectLogo}
                    alt="Google Health Connect icon"
                    loading="lazy"
                    className="h-4 w-4 object-contain"
                  />
                  <span className="text-xs font-medium text-muted-foreground">Health Connect (Android)</span>
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MoonStar className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground">Track sleep duration and quality trends</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <HeartPulse className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground">Correlate heart rate patterns with caffeine intake</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Gauge className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground">View blood pressure signals in one place</span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-6 items-center order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <img
                  src={analyticsScreenshot}
                  alt="Placeholder screenshot for sleep and heart rate trends from HealthKit and Health Connect"
                  loading="lazy"
                  className="relative z-10 rounded-2xl border border-white/10 shadow-2xl"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative flex flex-col gap-4 pt-8 lg:pt-16"
              >
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/40">
                  <img
                    src={appScreenshot2}
                    alt="Placeholder screenshot for blood pressure monitoring in CaffiTrack"
                    loading="lazy"
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-24 container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Get in Touch</h2>
              <p className="text-lg text-muted-foreground">
                Have questions or feedback about CaffiTrack? We'd love to hear from you. Our team is dedicated to making caffeine tracking accessible for everyone.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>Questions? Get in touch via our contact form.</span>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="font-heading font-bold text-lg block mb-4">CaffiTrack</span>
              <p className="text-sm text-muted-foreground">
                Monitor your daily caffeine intake and take control of your caffeine consumption.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Download</h4>
              <div className="space-y-2">
                <a href="https://apps.apple.com/gb/app/caffitrack/id6749832786" target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-white transition-colors">iOS App Store</a>
                <a href="https://play.google.com/store/apps/details?id=org.ncgroup.caffitrack" target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-white transition-colors">Google Play Store</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <div className="space-y-2">
                <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="block text-sm text-muted-foreground hover:text-white transition-colors">Caffeine Database</a>
                <a href="#ai" onClick={(e) => scrollToSection(e, "ai")} className="block text-sm text-muted-foreground hover:text-white transition-colors">AI Assistant</a>
                <a href="#health" onClick={(e) => scrollToSection(e, "health")} className="block text-sm text-muted-foreground hover:text-white transition-colors">Health Integrations</a>
                <a href="#reminders" onClick={(e) => scrollToSection(e, "reminders")} className="block text-sm text-muted-foreground hover:text-white transition-colors">Smart Reminders</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block text-sm text-muted-foreground hover:text-white transition-colors">Terms of Service</Link>
                <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="block text-sm text-muted-foreground hover:text-white transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 CaffiTrack. All rights reserved. Track your caffeine intake today.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactForm() {
  const { toast } = useToast();
  const form = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="bg-white/5 border-white/5">
      <CardContent className="p-6">
        <form 
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Input 
              {...form.register("name")}
              placeholder="Your Name"
              className="bg-white/5 border-white/10 focus:border-primary"
              data-testid="input-contact-name"
            />
          </div>
          <div className="space-y-2">
            <Input 
              {...form.register("email")}
              type="email"
              placeholder="Your Email"
              className="bg-white/5 border-white/10 focus:border-primary"
              data-testid="input-contact-email"
            />
          </div>
          <div className="space-y-2">
            <Textarea 
              {...form.register("message")}
              placeholder="How can we help?"
              className="bg-white/5 border-white/10 focus:border-primary min-h-[120px]"
              data-testid="textarea-contact-message"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
            disabled={mutation.isPending}
            data-testid="button-contact-submit"
          >
            {mutation.isPending ? "Sending..." : "Send Message"}
            {!mutation.isPending && <Send className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon, title, description, index }: { icon: React.ReactNode, title: string, description: string, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.21, 1.02, 0.47, 0.98], delay: index * 0.1 }}
    >
      <Card className="bg-white/5 border-white/5 hover:border-primary/50 transition-colors duration-300 h-full">
        <CardContent className="p-6 space-y-4">
          <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
