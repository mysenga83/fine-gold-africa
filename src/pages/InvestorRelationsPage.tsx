import { useState } from 'react';
import { TrendingUp, Users, Globe2, Building2, CheckCircle, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import MainLayout from '@/components/layouts/MainLayout';
import { supabase } from '@/db/supabase';

type FormType = 'bulk_purchase' | 'investor_relations';

interface LeadForm {
  company_name: string;
  contact_person: string;
  corporate_email: string;
  phone_number: string;
  volume_scale: string;
  message: string;
}

const EMPTY_FORM: LeadForm = {
  company_name: '',
  contact_person: '',
  corporate_email: '',
  phone_number: '',
  volume_scale: '',
  message: '',
};

const VOLUME_OPTIONS_BULK = ['1 – 10 kg', '10 – 50 kg', '50 – 200 kg', '200 kg – 1 tonne', '1+ tonne (Institutional)'];
const VOLUME_OPTIONS_INVESTOR = ['< $500K', '$500K – $2M', '$2M – $10M', '$10M – $50M', '$50M+ (Sovereign / Fund)'];

const TRUST_SIGNALS = [
  { icon: Globe2, text: '12+ African Source Countries' },
  { icon: Building2, text: 'Bank-Grade Vault Custody' },
  { icon: CheckCircle, text: '100% Chain-of-Custody' },
  { icon: TrendingUp, text: 'Institutional Settlement Protocols' },
];

function LeadForm({ type, onSuccess }: { type: FormType; onSuccess: () => void }) {
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof LeadForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_person || !form.corporate_email || !form.phone_number) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('inbound_leads').insert({ ...form, inquiry_type: type });
    setLoading(false);
    if (error) {
      toast.error('Submission failed. Please try again.');
    } else {
      toast.success('Inquiry submitted. Our executive team will respond within 48 hours.');
      setForm(EMPTY_FORM);
      onSuccess();
    }
  };

  const volumes = type === 'bulk_purchase' ? VOLUME_OPTIONS_BULK : VOLUME_OPTIONS_INVESTOR;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Company Name *</label>
          <Input value={form.company_name} onChange={set('company_name')} placeholder="Acme Capital Ltd" className="bg-background border-border h-11 px-3" />
        </div>
        <div>
          <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Contact Person *</label>
          <Input value={form.contact_person} onChange={set('contact_person')} placeholder="John Smith" className="bg-background border-border h-11 px-3" />
        </div>
        <div>
          <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Corporate Email *</label>
          <Input type="email" value={form.corporate_email} onChange={set('corporate_email')} placeholder="j.smith@company.com" className="bg-background border-border h-11 px-3" />
        </div>
        <div>
          <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Phone Number *</label>
          <Input value={form.phone_number} onChange={set('phone_number')} placeholder="+1 234 567 8900" className="bg-background border-border h-11 px-3" />
        </div>
      </div>
      <div>
        <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">
          {type === 'bulk_purchase' ? 'Purchase Volume Scale' : 'Investment Scale'}
        </label>
        <select
          value={form.volume_scale}
          onChange={set('volume_scale')}
          className="w-full h-11 px-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
        >
          <option value="">Select a range…</option>
          {volumes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Message / Requirements</label>
        <Textarea
          value={form.message}
          onChange={set('message')}
          placeholder={type === 'bulk_purchase' ? 'Describe your product requirements, delivery timeline, and any certification needs…' : 'Describe your investment mandate, structure, and preferred engagement model…'}
          rows={4}
          className="bg-background border-border px-3 resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-12 hover:bg-primary/90 gap-2"
      >
        <Send className="h-4 w-4" />
        {loading ? 'Submitting…' : type === 'bulk_purchase' ? 'Submit Bulk Inquiry' : 'Submit Investor Inquiry'}
      </Button>
    </form>
  );
}

export default function InvestorRelationsPage() {
  const [activeForm, setActiveForm] = useState<FormType>('investor_relations');
  const [submitted, setSubmitted] = useState(false);

  return (
    <MainLayout>
      {/* Hero with background */}
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
          <div className="max-w-3xl opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Investor Relations & Partnerships</p>
            <h1 className="text-4xl md:text-5xl text-white mb-5">Strategic Partnerships &amp; Capital Allocation</h1>
            <p className="text-base text-gray-300 leading-relaxed">
              Fine Gold Africa invites institutional investors, sovereign wealth vehicles, commodity traders, and bulk buyers to engage with our executive management for structured partnership evaluation. All inquiries are treated with full confidentiality.
            </p>
          </div>
        </div>
      </section>

      <div className="gold-divider mx-4 md:mx-8" />

      {/* Why Partner */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_SIGNALS.map((s, i) => (
              <div key={i} className="gold-border bg-card p-5 text-center opacity-0 intersect:opacity-100 transition duration-700" style={{ transitionDelay: `${i * 80}ms` }}>
                <s.icon className="h-5 w-5 text-primary mx-auto mb-3" />
                <p className="text-xs text-muted-foreground tracking-wide">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Forms */}
      <section className="section-gap bg-card">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          {/* Form Toggle */}
          <div className="flex flex-col md:flex-row gap-3 mb-8 opacity-0 intersect:opacity-100 transition duration-700">
            <button
              onClick={() => { setActiveForm('investor_relations'); setSubmitted(false); }}
              className={`flex-1 flex items-center gap-3 px-6 py-4 border transition-all text-left ${activeForm === 'investor_relations' ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/30'}`}
            >
              <TrendingUp className={`h-5 w-5 shrink-0 ${activeForm === 'investor_relations' ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-sm font-semibold ${activeForm === 'investor_relations' ? 'text-foreground' : 'text-muted-foreground'}`}>Investor Relations Portal</p>
                <p className="text-xs text-muted-foreground">Venture partners, institutional backers, project funders</p>
              </div>
            </button>
            <button
              onClick={() => { setActiveForm('bulk_purchase'); setSubmitted(false); }}
              className={`flex-1 flex items-center gap-3 px-6 py-4 border transition-all text-left ${activeForm === 'bulk_purchase' ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/30'}`}
            >
              <Users className={`h-5 w-5 shrink-0 ${activeForm === 'bulk_purchase' ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-sm font-semibold ${activeForm === 'bulk_purchase' ? 'text-foreground' : 'text-muted-foreground'}`}>Inquire for Bulk Purchase</p>
                <p className="text-xs text-muted-foreground">Commodity traders, international buyers, refineries</p>
              </div>
            </button>
          </div>

          <div className="gold-border bg-background p-7 relative opacity-0 intersect:opacity-100 transition duration-1000">
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-primary/50" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-primary/50" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-primary/50" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-primary/50" />

            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl text-foreground mb-2">Inquiry Received</h3>
                <p className="text-sm text-muted-foreground mb-6">Our executive team will respond within 48 business hours.</p>
                <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 text-xs tracking-widest uppercase" onClick={() => setSubmitted(false)}>
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <>
                <p className="text-xs tracking-widest uppercase text-primary mb-1">
                  {activeForm === 'investor_relations' ? 'Investor Relations Portal' : 'Bulk Purchase Inquiry'}
                </p>
                <h2 className="text-2xl text-foreground mb-6">
                  {activeForm === 'investor_relations' ? 'Connect with Executive Management' : 'Request Corporate Briefing'}
                </h2>
                <LeadForm type={activeForm} onSuccess={() => setSubmitted(true)} />
              </>
            )}
          </div>

          {/* Document request note */}
          <div className="mt-6 flex items-start gap-3 opacity-0 intersect:opacity-100 transition duration-700">
            <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              After submitting your inquiry, you may also visit our{' '}
              <a href="/governance" className="text-primary hover:underline">Governance & Compliance</a>{' '}
              page to request our Corporate Presentation and Investment Proposal Brief directly.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
