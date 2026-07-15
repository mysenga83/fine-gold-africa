import { useState } from 'react';
import { Shield, Globe2, Award, FileText, Download, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import MainLayout from '@/components/layouts/MainLayout';
import { supabase } from '@/db/supabase';

const PILLARS = [
  {
    icon: Shield,
    title: 'OECD Due Diligence Compliance',
    desc: 'All sourcing partners adhere to OECD Due Diligence Guidance for Responsible Mineral Supply Chains. Annual independent audits are conducted across all extraction concessions.',
  },
  {
    icon: Globe2,
    title: 'Mine-to-Market Traceability',
    desc: 'Every consignment carries a unique digital certificate linked to GPS-verified extraction origin, processing batch reference, assay result, and each custodian in the transfer chain.',
  },
  {
    icon: Award,
    title: 'Independent Assay Certification',
    desc: 'All gold is independently tested using fire assay and XRF spectrometry at accredited laboratories. Minimum guaranteed fineness: 96% for alluvial dust, 99.5% for refined bars.',
  },
  {
    icon: CheckCircle,
    title: 'Conflict-Free Guarantee',
    desc: 'Our due diligence framework ensures zero revenue from gold facilitates armed conflict or human rights violations. We maintain a publicly available incident disclosure register.',
  },
  {
    icon: FileText,
    title: 'Regulatory Compliance',
    desc: 'We operate in full compliance with ECOWAS export frameworks, SADC mining regulations, and international anti-money laundering (AML) and KYC standards in all jurisdictions.',
  },
  {
    icon: Shield,
    title: 'Environmental Responsibility',
    desc: 'All extractive partners must demonstrate environmental impact assessments, post-extraction remediation bonds, and annual environmental compliance scoring.',
  },
];

function DocumentGate() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid corporate email address.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('inbound_leads').insert({
      company_name: 'Document Request',
      contact_person: email,
      corporate_email: email,
      phone_number: 'N/A',
      inquiry_type: 'investor_relations',
      document_requested: true,
      document_email: email,
      message: 'Corporate Presentation / Governance Brief download request.',
    });
    setLoading(false);
    if (error) {
      toast.error('Request failed. Please try again.');
    } else {
      setSubmitted(true);
      toast.success('Document request received. You will receive the brief at your email within 2 business hours.');
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
        <p className="text-base font-semibold text-foreground mb-2">Request Received</p>
        <p className="text-sm text-muted-foreground">Our team will deliver the Governance & Compliance Brief to <span className="text-primary">{email}</span> within 2 business hours.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Enter your corporate email address to receive our Governance & Compliance Brief and Corporate Presentation.
      </p>
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@company.com"
          className="bg-background border-border h-11 px-3 flex-1"
        />
        <Button
          onClick={handleRequest}
          disabled={loading}
          className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-11 px-6 hover:bg-primary/90 gap-2 shrink-0"
        >
          <Download className="h-4 w-4" />
          {loading ? 'Processing…' : 'Request Document'}
        </Button>
      </div>
    </div>
  );
}

export default function GovernancePage() {
  return (
    <MainLayout>
      <section
        className="relative py-24"
        style={{
          backgroundImage: `url(https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/o.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Governance & Compliance</p>
            <h1 className="text-4xl md:text-5xl text-white mb-5">Our Compliance Framework</h1>
            <p className="text-base text-gray-300 leading-relaxed">
              Fine Gold Africa operates on a zero-compromise basis with respect to regulatory adherence, ethical sourcing, and transparency. Every process in our supply chain is designed to meet the most rigorous institutional standards.
            </p>
          </div>
        </div>
      </section>

      <div className="gold-divider mx-4 md:mx-8" />

      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Standards</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Governance Pillars</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {PILLARS.map((p, i) => (
              <div key={i} className="gold-border bg-card p-6 gold-glow-hover opacity-0 intersect:opacity-100 transition duration-700" style={{ transitionDelay: `${i * 80}ms` }}>
                <p.icon className="h-5 w-5 text-primary mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Document Download Gate */}
      <section className="pb-24">
        <div className="max-w-2xl mx-auto px-4 md:px-8 opacity-0 intersect:opacity-100 transition duration-700">
          <div className="gold-border bg-card p-8 relative shimmer">
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-primary/50" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-primary/50" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-primary/50" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-primary/50" />
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs tracking-widest uppercase text-primary font-semibold">Secure Document Access</p>
                <p className="text-xs text-muted-foreground">Governance Brief & Corporate Presentation</p>
              </div>
            </div>
            <DocumentGate />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
