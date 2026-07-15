import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe2, ChevronRight, FileText, Phone, MapPin, CheckCircle, TrendingUp, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import BannerSlider from '@/components/BannerSlider';
import { useGoldPrice } from '@/hooks/useGoldPrice';

const TICKER_ITEMS = [
  { label: '24K Gold Spot', suffix: '/oz' },
  { label: '24K Gold Spot', suffix: '/g' },
  { label: 'Gold Bars 99.99% Purity' },
  { label: 'Gold Nuggets 98.5% Avg Purity' },
  { label: 'Gold Dust 96–98% Purity' },
  { label: 'Bulk Supply — Min 1kg' },
  { label: 'Certified Ethical Sourcing' },
  { label: '100% African-Origin Assets' },
];

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: '100% Traceability',
    summary: 'Every gram tracked from mine to vault',
    detail: 'We implement end-to-end chain-of-custody records for every consignment. Each lot carries a unique certification number linked to its geographic origin, extraction date, refinery processing batch, and custodian transfer log — fully auditable by institutional clients.',
  },
  {
    icon: Globe2,
    title: 'Ethically Sourced',
    summary: 'OECD-compliant East African supply chains',
    detail: 'All sourcing partners comply with OECD Due Diligence Guidance for Responsible Supply Chains of Minerals from Conflict-Affected and High-Risk Areas. We conduct quarterly audits of mining operations across Uganda, DRC, and the wider East African region.',
  },
  {
    icon: Zap,
    title: 'Certified Purity',
    summary: '96% to 99.99% assayed and certified',
    detail: 'Each shipment undergoes independent third-party fire assay and XRF spectrometry testing. Certification is issued by accredited laboratories and accompanies every lot. Minimum delivered purity is 96% with premium allocations achieving 99.99% fineness.',
  },
  {
    icon: Award,
    title: 'Export Compliant',
    summary: 'Licensed under Uganda\'s mineral export framework',
    detail: 'Fine Gold Africa operates under full compliance with the Uganda Minerals and Mining Act, UCDA licensing, and Bank of Uganda foreign exchange regulations. All export documentation, permits, and assay certificates are prepared in advance of shipment.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Submit Inquiry', desc: 'Fill out our secure B2B enquiry form or contact our Kampala office directly. Specify product type, volume, and delivery requirements.' },
  { step: '02', title: 'KYC & Due Diligence', desc: 'Complete our streamlined KYC verification. We verify your company registration, trading licence, and beneficial ownership — typically within 48 hours.' },
  { step: '03', title: 'Price & Allocation', desc: 'Receive a live spot-based price quotation. Lock in your allocation with a purchase agreement. Minimum order from 100 grams.' },
  { step: '04', title: 'Assay & Certification', desc: 'Your gold is independently assayed, weighed, and certified before dispatch. Full chain-of-custody documentation provided.' },
  { step: '05', title: 'Secure Delivery', desc: 'Choose in-person collection at our Kampala facility, secure vault storage, or international export with full insurance cover.' },
  { step: '06', title: 'Ongoing Partnership', desc: 'Access your account dashboard, track orders, manage your portfolio, and receive live market alerts 24/7.' },
];

function GoldTicker({ pricePerOz, pricePerGram }: { pricePerOz: number; pricePerGram: number }) {
  const items = [
    `24K GOLD SPOT  $${pricePerOz.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/oz`,
    `24K GOLD SPOT  $${pricePerGram.toFixed(4)}/g`,
    'GOLD BARS  99.99% PURITY',
    'GOLD NUGGETS  98.5% AVG PURITY',
    'GOLD DUST  96–98% PURITY',
    'BULK SUPPLY — MIN 1KG',
    'CERTIFIED ETHICAL SOURCING',
    '100% AFRICAN-ORIGIN ASSETS',
  ];
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-card border-y border-primary/30 py-3">
      <div className="ticker-scroll flex gap-12 whitespace-nowrap w-max">
        {doubled.map((item, i) => (
          <span key={i} className="text-xs tracking-widest font-semibold text-primary uppercase flex items-center gap-4">
            {item}
            <span className="text-primary/40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function GoldHeroImage() {
  return (
    <div className="relative flex items-center justify-center w-full max-w-md mx-auto">
      {/* Gold image with frame — no spinning rings (performance) */}
      <div className="relative w-full aspect-square overflow-hidden gold-border gold-glow-hover">
        <img
          src="https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/j.jpg"
          alt="Fine Gold Africa — Certified Gold Bars"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Corner accents only */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-primary/80" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-primary/80" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary/80" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-primary/80" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { goldPrice, loading } = useGoldPrice(30000);
  const [expandedTrust, setExpandedTrust] = useState<number | null>(null);

  return (
    <MainLayout>
      {/* Live Ticker */}
      {goldPrice && (
        <GoldTicker pricePerOz={goldPrice.pricePerOz} pricePerGram={goldPrice.pricePerGram} />
      )}
      {!goldPrice && !loading && (
        <div className="w-full bg-card border-y border-primary/20 py-3 text-center text-xs text-muted-foreground tracking-widest uppercase">
          Market data loading…
        </div>
      )}

      {/* ── ANIMATED BANNER SLIDER (between ticker and hero) ── */}
      <BannerSlider />

      {/* Hero Section */}
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* No translate animation — opacity fade only prevents floating effect */}
            <div className="opacity-0 intersect:opacity-100 transition duration-700">
              <Badge className="mb-6 bg-primary/10 text-primary border border-primary/30 text-xs tracking-widest uppercase px-3 py-1">
                Africa's Premier Gold Exchange
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 text-foreground leading-tight">
                <span className="gold-text">Fine Gold Africa</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed max-w-lg font-light tracking-wide">
                Bridging Continental Asset Wealth with Global Institutional Capital.
              </p>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-lg">
                We facilitate ethically sourced, certified physical gold from across the African continent — from mine to institutional vault — with 100% chain-of-custody traceability and purity standards ranging from 96% to 99.99%.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs px-6 h-12 hover:bg-primary/90 gap-2" asChild>
                  <Link to="/investor-relations">
                    Request Corporate Briefing <FileText className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 tracking-widest uppercase text-xs px-6 h-12 gap-2" asChild>
                  <Link to="/contact">
                    Connect with Executive Management <Phone className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex justify-center opacity-0 intersect:opacity-100 transition duration-700">
              <GoldHeroImage />
            </div>
          </div>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="gold-divider mx-4 md:mx-8" />

      {/* Corporate Stats */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '5+', label: 'Source Countries' },
              { value: '99.99%', label: 'Max Purity' },
              { value: '100%', label: 'Traceability' },
              { value: 'Kampala', label: 'HQ — Uganda' },
            ].map((s, i) => (
              <div key={i} className="gold-border bg-background p-5 text-center opacity-0 intersect:opacity-100 transition duration-700" style={{ transitionDelay: `${i * 80}ms` }}>
                <p className="text-2xl md:text-3xl text-primary tabular-nums mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="gold-divider mx-4 md:mx-8" />

      {/* ── General Mbalwa Zinde Leadership Section ── */}
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch gold-border overflow-hidden">
            {/* Photo — full bleed, crisp */}
            <div className="relative w-full min-h-[340px] md:min-h-[460px] bg-black overflow-hidden opacity-0 intersect:opacity-100 transition duration-700">
              <img
                src="https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260709/n.jpg"
                alt="General Mbalwa Zinde — Chairman, Fine Gold Africa"
                className="w-full h-full object-cover object-top"
                loading="lazy"
                decoding="async"
                style={{ minHeight: '340px' }}
              />
              {/* Subtle gold gradient on right edge to blend with text panel */}
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-card hidden md:block" />
              {/* Name plate */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-6 py-5">
                <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold mb-1">Chairman & Founder</p>
                <p className="text-lg text-white font-bold tracking-wide">Gen. Mbalwa Zinde</p>
              </div>
            </div>

            {/* Text panel */}
            <div className="bg-card px-6 md:px-10 py-10 flex flex-col justify-center opacity-0 intersect:opacity-100 transition duration-700 delay-150">
              {/* Top accent line */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-primary" />
                <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">Leadership & Vision</p>
              </div>

              <h2 className="text-2xl md:text-3xl text-foreground mb-5 leading-snug">
                From National Leadership to<br className="hidden md:block" />
                <span className="gold-text"> Global Gold Trade Excellence</span>
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                At the helm of <span className="text-foreground font-semibold">Fine Gold Africa</span> stands{' '}
                <span className="text-primary font-semibold">General Mbalwa Zinde</span>, a man whose name symbolises{' '}
                <em>discipline, trust, and strategic leadership</em> across East Africa.
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                With a distinguished military career spanning decades, General Zinde has devoted his life to{' '}
                <strong className="text-foreground">protecting national interests, upholding justice, and leading complex operations with precision and integrity</strong>.
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Today, he brings that same level of{' '}
                <strong className="text-foreground">honour, discipline, and vision</strong> into the gold trading industry — positioning Fine Gold Africa as one of East Africa's most credible and secure mineral trading partners.
              </p>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Verified Leadership' },
                  { label: 'Military Integrity' },
                  { label: 'Uganda Licensed' },
                  { label: 'OECD Compliant' },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-2 border border-primary/25 px-3 py-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs text-muted-foreground tracking-wide">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Divider */}
      <div className="gold-divider mx-4 md:mx-8" />
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Our Standard</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Securing the Global Supply Chain</h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">of Ethically Sourced African Bullion</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRUST_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className={`gold-border bg-card p-6 cursor-pointer gold-glow-hover transition-all duration-300 opacity-0 intersect:opacity-100`}
                style={{ transitionDelay: `${idx * 100}ms` }}
                onClick={() => setExpandedTrust(expandedTrust === idx ? null : idx)}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 border border-primary/30 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                      <ChevronRight className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${expandedTrust === idx ? 'rotate-90' : ''}`} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                    {expandedTrust === idx && (
                      <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="section-gap bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Physical Asset Capabilities</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Our Product Showcase</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { name: 'Gold Bars', sub: 'Refined Bullion · 99.5–99.99%', img: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/j.jpg' },
              { name: 'Gold Nuggets', sub: 'Raw Alluvial · 96–99%', img: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/b.jpg' },
              { name: 'Gold Dust', sub: 'Alluvial Composition · 96–98%', img: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/g.jpg' },
              { name: 'Bulk Supply', sub: 'Industrial Volume · Min 1kg', img: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/o.jpg' },
            ].map((p, i) => (
              <Link
                to="/catalog"
                key={i}
                className="group gold-border bg-background gold-glow-hover block opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="aspect-square overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.sub}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs px-8 h-12 hover:bg-primary/90 gap-2" asChild>
              <Link to="/catalog">View Full Product Catalog <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Investor CTA Banner */}
      <section className="section-gap">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center opacity-0 intersect:opacity-100 transition duration-700">
          <div className="gold-border bg-card p-10 md:p-16 relative shimmer">
            <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-primary/60" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-primary/60" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-primary/60" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-primary/60" />
            <p className="text-xs tracking-widest uppercase text-primary mb-4">Capital Allocation & Scale Operations</p>
            <h2 className="text-3xl md:text-4xl mb-4 text-foreground">Strategic Partnerships &amp; Joint Ventures</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm leading-relaxed">
              We invite institutional backers, commodity traders, and sovereign investment vehicles to engage with Fine Gold Africa's executive team for formal partnership evaluation.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs px-10 h-12 hover:bg-primary/90" asChild>
                <Link to="/investor-relations">Request Corporate Briefing</Link>
              </Button>
              <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 tracking-widest uppercase text-xs px-6 h-12" asChild>
                <Link to="/contact">Connect with Executive Management</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-gap bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Simple & Transparent</p>
            <h2 className="text-3xl md:text-4xl text-foreground">How It Works</h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">From your first inquiry to secure delivery — a streamlined process built for trust</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="gold-border bg-background p-6 opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl font-bold text-primary/20 leading-none shrink-0 tabular-nums">{item.step}</span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Fine Gold Africa */}
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Uganda's Gold Standard</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Why Choose Fine Gold Africa</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, title: 'Uganda-Licensed Exporter', desc: 'Fully licensed under Uganda\'s Minerals and Mining Act. All transactions are UCDA-compliant and Bank of Uganda regulated.' },
              { icon: TrendingUp, title: 'Live Market Pricing', desc: 'Real-time gold spot price integration — no hidden margins. Prices update every 30 seconds against global commodity indices.' },
              { icon: Users, title: 'B2B & Retail Trading', desc: 'We serve both institutional buyers (banks, refineries, commodity desks) and individual investors seeking physical gold allocation.' },
              { icon: Shield, title: 'Secure Storage & Custody', desc: 'Fully insured, Class III certified vault facilities in Kampala. Allocated and unallocated storage options available.' },
              { icon: Globe2, title: 'International Export Ready', desc: 'Full export documentation — assay certificates, country-of-origin certificates, and customs clearance — prepared for every shipment.' },
              { icon: Award, title: 'Transparent Certification', desc: 'Every batch independently assayed by accredited laboratories. Purity certificates and weight certificates issued with every transaction.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 gold-border bg-card opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="shrink-0 w-10 h-10 border border-primary/30 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uganda Contact Strip */}
      <section className="py-10 bg-card border-y border-primary/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs tracking-widest uppercase text-primary mb-1">Visit Our Office</p>
              <p className="text-foreground font-semibold">Fine Gold Africa — Kampala, Uganda</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                Plot 7, Nakasero Road, Kampala, Uganda
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs tracking-widest uppercase text-primary mb-1">Contact Us</p>
              <a href="tel:+256764473988" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                <Phone className="h-3 w-3 text-primary shrink-0" /> +256 764 473 988
              </a>
              <a href="https://wa.me/256764473988" target="_blank" rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                <svg className="h-3 w-3 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp: +256 764 473 988
              </a>
            </div>
            <div>
              <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs px-8 h-11 hover:bg-primary/90 gap-2" asChild>
                <Link to="/contact">Get in Touch <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
