import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Info, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';

const PURITY_GRADES = [
  { grade: '999.9 (24K)', label: 'Investment Grade', desc: 'The highest purity available. Used by central banks and institutional investors. Fine Gold Africa supplies 999.9 fineness gold bars.' },
  { grade: '999.5', label: 'Refined Bar', desc: 'Standard London Good Delivery bar purity. Accepted by all international commodity exchanges.' },
  { grade: '995', label: 'Industrial/Jewellery', desc: 'Common for jewellery manufacturing and industrial uses. Widely traded across East Africa.' },
  { grade: '96% – 98%', label: 'Alluvial Gold', desc: 'Raw gold dust and nuggets from artisanal mining. Purity varies by batch. Full assay provided.' },
];

const MARKET_NOTES = [
  'Gold is quoted in USD per troy ounce (31.1g) on international markets.',
  'The London Bullion Market Association (LBMA) publishes the global benchmark gold price twice daily.',
  'Uganda\'s gold exports are valued at the international LBMA spot price, converted to USD at Bank of Uganda rates.',
  'Fine Gold Africa provides quotations based on the prevailing LBMA AM/PM fix at the time of agreement.',
  'All transactions are quoted in USD. Payment accepted in USD, EUR, or UGX at current Bank of Uganda exchange rates.',
  'Prices fluctuate based on global economic conditions, USD strength, geopolitical events, and commodity market sentiment.',
];

const UGANDAN_CONTEXT = [
  {
    title: 'Uganda\'s Gold Production',
    body: 'Uganda is one of East Africa\'s significant gold producers, with artisanal and small-scale mining (ASM) concentrated in regions including Busia, Mubende, Bundibugyo, and Kasese. The country also benefits from transit trade from DRC and neighbouring countries.',
  },
  {
    title: 'Export Framework',
    body: 'Gold exports from Uganda are regulated by the Directorate of Geological Survey and Mines (DGSM) under the Ministry of Energy and Mineral Development. Exporters must hold a valid Mineral Export Permit and submit assay certificates for each shipment.',
  },
  {
    title: 'Bank of Uganda & FX Rates',
    body: 'All gold transactions involving foreign currency are subject to Bank of Uganda foreign exchange regulations. Fine Gold Africa ensures full regulatory compliance and provides proper FX documentation for all international transactions.',
  },
  {
    title: 'EACTI & Regional Trade',
    body: 'Uganda participates in the East African Community Trade and Industry framework. Regional buyers from Kenya, Tanzania, Rwanda, and South Sudan regularly source gold through Kampala-based dealers under EAC trade protocols.',
  },
];

export default function PriceChartsPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: `url(https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/k.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/82" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Market Intelligence</p>
            <h1 className="text-4xl md:text-5xl text-white mb-5">Gold Pricing & Market Overview</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Understanding how gold is priced, what drives market movements, and how Uganda's gold market connects to global commodity prices.
            </p>
          </div>
        </div>
      </section>

      {/* Request Quote CTA */}
      <section className="py-10 bg-primary/10 border-y border-primary/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Get a Live Quotation</p>
              <p className="text-xs text-muted-foreground">Contact our team for a real-time price based on current LBMA spot rates</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs px-6 h-10 hover:bg-primary/90 gap-2" asChild>
              <Link to="/contact"><Phone className="h-3 w-3" /> Request Quote</Link>
            </Button>
            <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 tracking-widest uppercase text-xs px-4 h-10"
              onClick={() => window.open('https://wa.me/256764473988?text=Please%20send%20me%20a%20gold%20price%20quotation', '_blank')}>
              WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Price Explanation */}
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">How Gold Is Priced</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Understanding Gold Prices</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MARKET_NOTES.map((note, i) => (
              <div key={i} className="flex items-start gap-3 gold-border bg-card p-5 opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 60}ms` }}>
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purity Grades */}
      <section className="section-gap bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Purity Standards</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Gold Purity Grades</h2>
            <p className="text-sm text-muted-foreground mt-3">Higher purity = higher price per gram. All Fine Gold Africa products come with laboratory-certified purity documentation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PURITY_GRADES.map((g, i) => (
              <div key={i} className="gold-border bg-background p-6 text-center opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <p className="text-2xl font-bold text-primary mb-1">{g.grade}</p>
                <Badge className="mb-3 bg-primary/10 text-primary border border-primary/30 text-xs tracking-wider">{g.label}</Badge>
                <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ugandan Market Context */}
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Local Market</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Uganda's Gold Market</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {UGANDAN_CONTEXT.map((item, i) => (
              <div key={i} className="gold-border bg-card p-6 opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 border border-primary/40 flex items-center justify-center text-primary text-xs">{i + 1}</span>
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 section-gap bg-card">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center opacity-0 intersect:opacity-100 transition duration-700">
          <p className="text-xs tracking-widest uppercase text-primary mb-3">Trade With Confidence</p>
          <h2 className="text-3xl text-foreground mb-4">Ready to Transact?</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
            Our team provides transparent, LBMA-referenced quotations. No hidden fees. Full documentation with every transaction.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs px-8 h-11 hover:bg-primary/90 gap-2" asChild>
              <Link to="/buy-gold">Buy Gold Now <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 tracking-widest uppercase text-xs px-6 h-11" asChild>
              <Link to="/buyer-guide">Buyer's Guide</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
