import { Shield, Globe2, Award, Users, Gem, TrendingUp } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';

const SOURCING_REGIONS = [
  { name: 'West Africa', countries: 'Ghana, Mali, Guinea, Senegal', purity: '96–99.5%', type: 'Alluvial & Hard Rock', icon: '🇬🇭' },
  { name: 'Central Africa', countries: 'DRC, Cameroon, CAR', purity: '97–99.99%', type: 'Primary & Artisanal', icon: '🇨🇩' },
  { name: 'East Africa', countries: 'Tanzania, Uganda, Kenya', purity: '96–99%', type: 'Alluvial & Reef', icon: '🇹🇿' },
  { name: 'Southern Africa', countries: 'Zimbabwe, Zambia, Mozambique', purity: '98–99.99%', type: 'Industrial & Small-Scale', icon: '🇿🇼' },
];

const COMPLIANCE_ITEMS = [
  {
    icon: Shield,
    title: 'OECD Due Diligence',
    body: 'All supply chain partners comply with the OECD Due Diligence Guidance for Responsible Supply Chains of Minerals from Conflict-Affected and High-Risk Areas. We conduct annual third-party audits of all sourcing operations.',
  },
  {
    icon: Globe2,
    title: 'Chain-of-Custody Traceability',
    body: 'Every lot is tracked from point of extraction through transport, refining, assay, and vault storage. Digital certificates carry GPS coordinates of origin, extraction date, processing batch reference, and each custodian in the transfer chain.',
  },
  {
    icon: Award,
    title: 'Independent Assay & Certification',
    body: 'All gold undergoes independent fire assay and XRF spectrometry at accredited laboratories. Certified purity documentation accompanies every shipment. Minimum guaranteed fineness: 96% for dust, 99.5% for refined bars.',
  },
  {
    icon: Users,
    title: 'Community & Labour Standards',
    body: 'Zero tolerance for child or forced labour. All partner operations are required to demonstrate fair wage structures, safe working conditions, and community benefit programs. Non-compliant partners are immediately delisted.',
  },
  {
    icon: Gem,
    title: 'Environmental Responsibility',
    body: 'We require environmental impact assessments and post-extraction remediation bonds from all extractive partners. Alluvial operations must demonstrate riverbed restoration practices. Annual environmental compliance scoring is published.',
  },
  {
    icon: TrendingUp,
    title: 'Conflict-Free Guarantee',
    body: 'Our due diligence process is designed to ensure no revenue from gold sales finances armed groups or contributes to human rights abuses. We maintain a publicly available sourcing ethics policy and incident disclosure register.',
  },
];

export default function SourcingPage() {
  return (
    <MainLayout>
      {/* Hero with background */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: `url(https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/g.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Our Commitment</p>
            <h1 className="text-4xl md:text-5xl text-white mb-6">Trust & Sourcing</h1>
            <p className="text-base text-gray-300 leading-relaxed">
              Fine Gold Africa operates on an institutional model of transparency. Every gram we facilitate is documented, tested, and certified across a fully auditable chain-of-custody. Our compliance framework is designed for the most rigorous institutional standards.
            </p>
          </div>
        </div>
      </section>

      <div className="gold-divider mx-4 md:mx-8" />

      {/* Sourcing Map / Regions */}
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Origins</p>
            <h2 className="text-3xl md:text-4xl text-foreground">African Sourcing Regions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {SOURCING_REGIONS.map((r, i) => (
              <div
                key={i}
                className="gold-border bg-card p-5 gold-glow-hover opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="text-3xl mb-3">{r.icon}</div>
                <h3 className="text-base font-semibold text-foreground mb-1">{r.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{r.countries}</p>
                <div className="space-y-1 border-t border-border pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Purity Range</span>
                    <span className="text-primary tabular-nums">{r.purity}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground">{r.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Grid */}
      <section className="section-gap bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Standards</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Compliance Framework</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {COMPLIANCE_ITEMS.map((item, i) => (
              <div
                key={i}
                className="gold-border bg-background p-6 gold-glow-hover opacity-0 intersect:opacity-100 transition duration-700"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 border border-primary/30 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-0 intersect:opacity-100 transition duration-700">
            {[
              { label: 'Source Countries', value: '12+' },
              { label: 'Purity Range', value: '96–99.99%' },
              { label: 'Compliance Audits / Year', value: '4' },
              { label: 'Traceability Coverage', value: '100%' },
            ].map((s, i) => (
              <div key={i} className="gold-border bg-card p-5 text-center">
                <p className="text-2xl md:text-3xl font-semibold text-primary mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
