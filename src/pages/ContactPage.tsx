import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Linkedin, Twitter, Facebook, Instagram, Youtube, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import MainLayout from '@/components/layouts/MainLayout';
import { supabase } from '@/db/supabase';

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Telephone',
    lines: ['+256 764 473 988'],
    action: 'tel:+256764473988',
    actionLabel: 'Call Now',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    lines: ['+256 764 473 988', 'Available 8am – 6pm EAT (Mon–Sat)'],
    action: 'https://wa.me/256764473988?text=Hello%2C%20I%20am%20interested%20in%20Fine%20Gold%20Africa%20products.',
    actionLabel: 'Message on WhatsApp',
  },
  {
    icon: Mail,
    label: 'Email',
    lines: ['finegoldafrica@gmail.com'],
    action: 'mailto:finegoldafrica@gmail.com',
    actionLabel: 'Send Email',
  },
  {
    icon: MapPin,
    label: 'Head Office',
    lines: ['Plot 7, Nakasero Road', 'Kampala, Uganda'],
    action: 'https://maps.google.com/?q=Plot+7+Nakasero+Road+Kampala+Uganda',
    actionLabel: 'Get Directions',
  },
];

const SOCIALS = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/company/finegoldafrica', color: 'hover:text-blue-400' },
  { icon: Twitter, label: 'X / Twitter', href: 'https://twitter.com/finegoldafrica', color: 'hover:text-sky-400' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com/finegoldafrica', color: 'hover:text-blue-500' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/finegoldafrica', color: 'hover:text-pink-400' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com/@finegoldafrica', color: 'hover:text-red-500' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('inbound_leads').insert({
      company_name: 'Direct Contact',
      contact_person: form.name,
      corporate_email: form.email,
      phone_number: form.phone || 'N/A',
      inquiry_type: 'bulk_purchase',
      message: form.message,
    });
    setLoading(false);
    if (error) {
      toast.error('Failed to send message. Please try again.');
    } else {
      toast.success('Message sent. Our team will respond within 24 hours.');
      setForm({ name: '', email: '', phone: '', message: '' });
    }
  };

  return (
    <MainLayout>
      {/* Hero with background */}
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
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Reach Out</p>
            <h1 className="text-4xl md:text-5xl text-white mb-5">Contact Us</h1>
            <p className="text-base text-gray-300 leading-relaxed">
              Connect with our Kampala team for gold purchasing, export inquiries, or investor relations. We respond to all qualified inquiries within 24 business hours.
            </p>
          </div>
        </div>
      </section>

      <div className="gold-divider mx-4 md:mx-8" />

      {/* Contact Cards + Form */}
      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Contact info */}
            <div className="space-y-4">
              {CONTACT_INFO.map((c, i) => (
                <div key={i} className="gold-border bg-card p-5 gold-glow-hover opacity-0 intersect:opacity-100 transition duration-700" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-primary/30 flex items-center justify-center shrink-0">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs tracking-widest uppercase text-primary font-semibold mb-2">{c.label}</p>
                      {c.lines.map((line, j) => (
                        <p key={j} className="text-sm text-muted-foreground">{line}</p>
                      ))}
                      {c.action && (
                        <a href={c.action} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs text-primary tracking-widest uppercase hover:underline">
                          {c.actionLabel}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Socials */}
              <div className="gold-border bg-card p-5 opacity-0 intersect:opacity-100 transition duration-700">
                <p className="text-xs tracking-widest uppercase text-primary font-semibold mb-4">Follow Us</p>
                <div className="flex flex-wrap gap-3">
                  {SOCIALS.map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 text-sm text-muted-foreground transition-colors ${s.color} border border-border px-3 py-2 hover:border-primary/40`}
                      aria-label={s.label}
                    >
                      <s.icon className="h-4 w-4" />
                      <span className="text-xs tracking-wide">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Quick message form */}
            <div className="gold-border bg-card p-7 opacity-0 intersect:opacity-100 transition duration-1000">
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-primary/50" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-primary/50" />
              <p className="text-xs tracking-widest uppercase text-primary mb-2">Quick Message</p>
              <h2 className="text-2xl text-foreground mb-6">Send us a Note</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Full Name *</label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    className="bg-background border-border focus:border-primary/60 h-11 px-3"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Corporate Email *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@company.com"
                    className="bg-background border-border focus:border-primary/60 h-11 px-3"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Phone / WhatsApp</label>
                  <Input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+1 234 567 8900"
                    className="bg-background border-border focus:border-primary/60 h-11 px-3"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Message *</label>
                  <Textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your inquiry..."
                    rows={4}
                    className="bg-background border-border focus:border-primary/60 px-3 resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-12 hover:bg-primary/90 gap-2"
                >
                  {loading ? 'Sending…' : <><Send className="h-4 w-4" /> Send Message</>}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 opacity-0 intersect:opacity-100 transition duration-700">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Office Location</p>
            <h2 className="text-2xl md:text-3xl text-foreground">Find Our Head Office</h2>
            <p className="text-sm text-muted-foreground mt-2">Plot 7, Nakasero Road, Kampala — Uganda's Capital</p>
          </div>
          <div className="gold-border overflow-hidden opacity-0 intersect:opacity-100 transition duration-700">
            <iframe
              width="100%"
              height="400"
              frameBorder="0"
              style={{ border: 0 }}
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed/v1/place?key=AIzaSyB_LJOYJL-84SMuxNB7LtRGhxEQLjswvy0&language=en&region=UG&q=Nakasero+Road,+Kampala,+Uganda"
              allowFullScreen
              title="Fine Gold Africa Head Office"
            />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
