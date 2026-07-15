import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Shield, FileText, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layouts/MainLayout';

const GUIDE_SECTIONS = [
  {
    icon: BookOpen,
    title: 'Understanding Physical Gold',
    content: [
      'Physical gold is the most direct form of gold investment. Unlike ETFs or paper gold, physical gold gives you direct ownership of the metal.',
      'Gold is measured in troy ounces (oz) or grams. 1 troy ounce = 31.1035 grams.',
      'Purity is expressed as a percentage or in "fineness" (parts per thousand). 24-karat gold = 99.99% pure = 999.9 fineness.',
      'Common forms include bars (cast or minted), coins, nuggets, and dust. Fine Gold Africa supplies bars, nuggets, dust, and bulk alluvial gold.',
    ],
  },
  {
    icon: Shield,
    title: 'Buying Safely — What to Look For',
    content: [
      'Always purchase from a licensed dealer. Fine Gold Africa is fully licensed under Uganda\'s Minerals and Mining Act.',
      'Demand an assay certificate with every purchase. This confirms the purity and weight of your gold from an accredited independent laboratory.',
      'Verify the country-of-origin documentation. Uganda requires all exported gold to carry certificates of origin.',
      'Ensure your transaction is accompanied by a formal purchase agreement stating weight, purity, price per gram, and total value.',
      'Never purchase gold without physical inspection or independent assay certification.',
    ],
  },
  {
    icon: FileText,
    title: 'Required Documentation',
    content: [
      'Valid government-issued ID or company registration certificate.',
      'Trading licence (for business buyers) or investor identification.',
      'Bank statement or proof of funds for large orders.',
      'KYC (Know Your Customer) form — required by Uganda\'s Anti-Money Laundering regulations.',
      'For exports: Export licence, Mineral Export Permit from DGSM (Directorate of Geological Survey and Mines), and assay certificate.',
    ],
  },
  {
    icon: AlertCircle,
    title: 'Avoiding Gold Scams',
    content: [
      'Be cautious of sellers offering gold at prices significantly below the international spot price — this is almost always fraudulent.',
      'Never wire money to an unknown seller before inspecting and assaying the gold.',
      'Always use a licensed, established dealer with verifiable office premises in Uganda.',
      'Demand independent assay testing before finalising any large purchase.',
      'Work with legal counsel and due diligence for purchases above USD 50,000.',
    ],
  },
];

const FAQS = [
  { q: 'What is the minimum amount of gold I can buy?', a: 'Fine Gold Africa\'s minimum order is 50 grams for gold dust and nuggets, and 100 grams for refined gold bars. Bulk orders start from 1 kilogram.' },
  { q: 'How is gold priced?', a: 'Gold is priced in USD per gram or per troy ounce, based on the international spot price (London Bullion Market Association benchmark). We do not charge hidden markups — all fees are disclosed in the quotation.' },
  { q: 'Can I export gold from Uganda?', a: 'Yes. Uganda legally permits the export of gold under Mineral Export Permits issued by the Directorate of Geological Survey and Mines (DGSM). Fine Gold Africa assists buyers with all export documentation.' },
  { q: 'How is purity verified?', a: 'All our gold undergoes independent fire assay and XRF (X-ray fluorescence) testing at accredited laboratories. You receive a copy of the assay certificate with every purchase.' },
  { q: 'Is Fine Gold Africa regulated?', a: 'Yes. We operate under full compliance with the Uganda Minerals and Mining Act, UCDA licensing regulations, and the Bank of Uganda\'s foreign exchange controls.' },
  { q: 'Can I store gold with Fine Gold Africa?', a: 'Yes. We offer secure vault storage at our Kampala facility for a monthly fee. You receive a digital certificate of holding and can arrange collection at any time with 48-hour notice.' },
];

export default function BuyerGuidePage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: `url(https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/o.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/82" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Knowledge Centre</p>
            <h1 className="text-4xl md:text-5xl text-white mb-5">Buyer's Guide to Gold</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Everything you need to know before purchasing physical gold in Uganda — from understanding purity and pricing, to documentation, safety, and legal compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Guide Sections */}
      <section className="section-gap">
        <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-6">
          {GUIDE_SECTIONS.map((sec, i) => (
            <div key={i} className="gold-border bg-card p-7 opacity-0 intersect:opacity-100 transition duration-700"
              style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center shrink-0">
                  <sec.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{sec.title}</h2>
              </div>
              <ul className="space-y-3">
                {sec.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="section-gap bg-card">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Common Questions</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="gold-border bg-background p-6 opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="flex items-start gap-3 mb-3">
                  <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-foreground">{faq.q}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 section-gap">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center opacity-0 intersect:opacity-100 transition duration-700">
          <div className="gold-border bg-card p-10 relative shimmer">
            <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-primary/60" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-primary/60" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-primary/60" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-primary/60" />
            <h2 className="text-2xl text-foreground mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground text-sm mb-6">Our Kampala team is available to guide you through the buying process from start to finish.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs px-8 h-11 hover:bg-primary/90 gap-2" asChild>
                <Link to="/contact">Talk to Our Team <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 tracking-widest uppercase text-xs px-6 h-11" asChild>
                <Link to="/catalog">View Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
