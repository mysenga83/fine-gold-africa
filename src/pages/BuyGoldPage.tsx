import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle, FileText, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';

const GOLD_PRODUCTS = [
  {
    name: 'Gold Bars',
    purity: '99.5% – 99.99%',
    minOrder: '100g',
    desc: 'Refined and certified gold bars sourced from licensed Ugandan and East African refineries. Each bar bears assay certification and unique serial number.',
    img: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/j.jpg',
  },
  {
    name: 'Gold Nuggets',
    purity: '96% – 99%',
    minOrder: '50g',
    desc: 'Raw alluvial gold nuggets sourced from artisanal mining cooperatives in Uganda and DRC. Fully verified origin and purity documentation provided.',
    img: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/b.jpg',
  },
  {
    name: 'Gold Dust',
    purity: '96% – 98%',
    minOrder: '50g',
    desc: 'Alluvial gold dust from East African river mining operations. Ideal for industrial buyers, refineries, and small investment allocations.',
    img: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/g.jpg',
  },
  {
    name: 'Bulk Gold Supply',
    purity: '96% – 99.99%',
    minOrder: '1kg',
    desc: 'Large-volume supply for institutional buyers, commodity desks, and export traders. Full export documentation, customs clearance, and insurance included.',
    img: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/o.jpg',
  },
];

const STEPS = [
  { n: '01', title: 'Register & KYC', desc: 'Create your account and complete KYC verification. Provide company registration, trading licence, and ID documents.' },
  { n: '02', title: 'Select Product', desc: 'Browse our product catalog and select the gold type, purity, and quantity that meets your requirements.' },
  { n: '03', title: 'Receive Quotation', desc: 'Our team sends a formal quotation based on current market rates and your specified volume within 24 hours.' },
  { n: '04', title: 'Sign Agreement', desc: 'Review and sign the purchase agreement. We prepare all documentation including assay certificates and country-of-origin certificates.' },
  { n: '05', title: 'Payment & Dispatch', desc: 'Make payment via bank transfer or approved method. Gold is dispatched with full insurance and chain-of-custody documentation.' },
  { n: '06', title: 'Receive Your Gold', desc: 'Collect in person at our Kampala office, arrange insured courier delivery, or opt for secure vault storage.' },
];

export default function BuyGoldPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: `url(https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/j.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl opacity-0 intersect:opacity-100 transition duration-700">
            <Badge className="mb-4 bg-primary/20 text-primary border border-primary/40 text-xs tracking-widest uppercase">
              Uganda's Premier Gold Supplier
            </Badge>
            <h1 className="text-4xl md:text-5xl text-white mb-5 leading-tight">Buy Physical Gold</h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Purchase certified, ethically sourced physical gold directly from Fine Gold Africa — Uganda's licensed gold trading and export company. We serve B2B buyers, investors, refineries, and export traders.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs px-8 h-12 hover:bg-primary/90 gap-2" asChild>
                <Link to="/catalog">View Products <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" className="border border-primary/50 text-primary hover:bg-primary/10 tracking-widest uppercase text-xs px-6 h-12 gap-2" asChild>
                <Link to="/contact"><Phone className="h-4 w-4" /> Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">What We Offer</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Gold Products Available</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {GOLD_PRODUCTS.map((p, i) => (
              <div key={i} className="gold-border bg-card flex flex-col opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-foreground">{p.name}</h3>
                    <Badge className="shrink-0 bg-primary/10 text-primary border border-primary/30 text-xs">{p.purity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 flex-1">{p.desc}</p>
                  <p className="text-xs text-primary tracking-widest uppercase mb-4">Min. Order: {p.minOrder}</p>
                  <Button className="bg-primary text-primary-foreground text-xs tracking-widest uppercase h-9 hover:bg-primary/90 gap-1 mt-auto" asChild>
                    <Link to="/contact">Inquire <ArrowRight className="h-3 w-3" /></Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Buy */}
      <section className="section-gap bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl text-foreground">How to Buy Gold</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <div key={i} className="gold-border bg-background p-6 opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl font-bold text-primary/20 leading-none shrink-0">{s.n}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">{s.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="section-gap">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Uganda Licensed', desc: 'Operating under Uganda Minerals and Mining Act. Full UCDA compliance.' },
              { icon: CheckCircle, title: 'Independently Assayed', desc: 'Every batch certified by accredited laboratories. Certificates provided with every purchase.' },
              { icon: FileText, title: 'Full Documentation', desc: 'Assay certificate, origin certificate, purchase agreement, and export papers included.' },
            ].map((item, i) => (
              <div key={i} className="gold-border bg-card p-5 flex items-start gap-4 opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 100}ms` }}>
                <item.icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <div className="gold-border bg-card p-10 relative shimmer">
            <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-primary/60" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-primary/60" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-primary/60" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-primary/60" />
            <h2 className="text-2xl md:text-3xl text-foreground mb-4">Ready to Buy Gold?</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Contact our Kampala team today. We respond to all qualified inquiries within 24 hours.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs px-8 h-11 hover:bg-primary/90 gap-2" asChild>
                <Link to="/contact"><Phone className="h-4 w-4" /> Contact Our Team</Link>
              </Button>
              <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 tracking-widest uppercase text-xs px-6 h-11 gap-2"
                onClick={() => window.open('https://wa.me/256764473988?text=I%20want%20to%20buy%20gold', '_blank')}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </Button>
            </div>
            <p className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 text-primary" /> Plot 7, Nakasero Road, Kampala, Uganda
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
