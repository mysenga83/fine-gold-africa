import { Gem, Globe2, Shield, TrendingUp, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layouts/MainLayout';

const LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260704/Gemini_Generated_Image_485gui485gui485g(1).png';

const VALUES = [
  { icon: Shield, title: 'Integrity', body: 'Every transaction and sourcing claim is independently verifiable. We publish compliance reports and never misrepresent purity or provenance.' },
  { icon: Globe2, title: 'African Excellence', body: "We exist to demonstrate that Africa's mineral wealth can be traded on the world stage with institutional rigor and sovereign pride." },
  { icon: TrendingUp, title: 'Institutional Standards', body: 'From KYC to vault custody to settlement logic — every process is built to bank-grade specifications, not approximated.' },
  { icon: Users, title: 'Client Partnership', body: 'Whether an individual investor or a sovereign refinery, every client receives dedicated account support and transparent fee structures.' },
  { icon: Gem, title: 'Physical Primacy', body: 'We deal exclusively in physical, allocated gold. No derivatives, no ETF proxies. Your ownership is real, vaulted, and fully auditable.' },
  { icon: Award, title: 'Certified Quality', body: 'All gold is independently tested and certificated before acceptance. We do not source from operations that cannot provide chain-of-custody documentation.' },
];

export default function AboutPage() {
  return (
    <MainLayout>
      {/* Hero with background image */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: `url(https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/b.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="opacity-0 intersect:opacity-100 transition duration-700">
              <p className="text-xs tracking-widest uppercase text-primary mb-3">About Fine Gold Africa</p>
              <h1 className="text-4xl md:text-5xl text-white mb-6">Uganda's Institutional Gold Exchange</h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-6">
                Fine Gold Africa was founded on a single conviction: that the African continent's gold assets deserve to be traded with the same institutional sophistication, transparency, and security as any major global commodity exchange.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                We connect verified buyers — from individual investors to industrial refineries — directly with ethically sourced, certified physical gold. Our infrastructure is built on bank-grade custody, independent assay, and rigorous compliance across all 12+ sourcing countries.
              </p>
            </div>
            <div className="flex justify-center opacity-0 intersect:opacity-100 transition duration-1000">
              <div className="relative w-64 h-64 overflow-hidden gold-border">
                <img
                  src="https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/j.jpg"
                  alt="Fine Gold Africa certified gold bars"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-primary/80" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-primary/80" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary/80" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-primary/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider mx-4 md:mx-8" />

      {/* Mission */}
      <section className="section-gap bg-card">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center opacity-0 intersect:opacity-100 transition duration-700">
          <p className="text-xs tracking-widest uppercase text-primary mb-4">Mission</p>
          <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed">
            "To make physical African gold accessible, traceable, and institutionally trusted — for every buyer, in every market."
          </blockquote>
        </div>
      </section>

      {/* Values */}
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Principles</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="gold-border bg-card p-6 gold-glow-hover opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <v.icon className="h-5 w-5 text-primary mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center opacity-0 intersect:opacity-100 transition duration-700">
          <div className="gold-border bg-card p-8 shimmer relative">
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-primary/60" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-primary/60" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-primary/60" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-primary/60" />
            <h2 className="text-2xl text-foreground mb-3">Ready to Trade?</h2>
            <p className="text-sm text-muted-foreground mb-6">Open a verified account and begin building your physical gold portfolio.</p>
            <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs px-8 h-11 hover:bg-primary/90" asChild>
              <Link to="/register">Open Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
