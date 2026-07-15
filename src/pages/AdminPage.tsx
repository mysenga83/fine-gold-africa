import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, ShieldCheck, Image, LogOut,
  Check, X, Trash2, RefreshCw, Plus, Menu,
  Package, Pencil, Video, ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/* ── Types ─────────────────────────────────────────────────── */
interface Lead {
  id: string; company_name: string; contact_person: string; corporate_email: string;
  phone_number: string; inquiry_type: string; volume_scale: string; message: string;
  status: string; created_at: string;
}
interface BannerSlide {
  id: string; title: string; subtitle: string; media_url: string;
  media_type: string; sort_order: number; active: boolean;
}
interface AdminProduct {
  id: string; product_type: string; name: string; subtitle: string;
  description: string; purity_range: string; image_url: string | null;
  video_url: string | null; min_weight_grams: number; active: boolean; sort_order: number;
}

type Tab = 'overview' | 'products' | 'leads' | 'banners' | 'kyc';

const SIDEBAR_ITEMS: { tab: Tab; label: string; icon: React.ElementType }[] = [
  { tab: 'overview', label: 'Overview', icon: LayoutDashboard },
  { tab: 'products', label: 'Products', icon: Package },
  { tab: 'leads', label: 'Inbound Leads', icon: Users },
  { tab: 'banners', label: 'Banner Slides', icon: Image },
  { tab: 'kyc', label: 'KYC Reviews', icon: ShieldCheck },
];

const SUPABASE_URL = 'https://zwltvxqbxknkwybjgrmq.supabase.co';

function getPublicUrl(bucket: string, path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/* ── Media Upload Helper ────────────────────────────────────── */
function MediaUploadButton({
  bucket, accept, label, icon: Icon, onUploaded
}: {
  bucket: string; accept: string; label: string;
  icon: React.ElementType; onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    setUploading(false);
    if (error) { toast.error(`Upload failed: ${error.message}`); return; }
    const url = getPublicUrl(bucket, path);
    onUploaded(url);
    toast.success('Uploaded successfully');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      <Button
        type="button"
        variant="ghost"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="border border-border text-muted-foreground hover:text-primary text-xs tracking-widest uppercase h-9 px-3 gap-2"
      >
        <Icon className="h-3.5 w-3.5" />
        {uploading ? 'Uploading…' : label}
      </Button>
    </>
  );
}

/* ── Overview tab ───────────────────────────────────────────── */
function OverviewTab() {
  const [stats, setStats] = useState({ leads: 0, newLeads: 0, banners: 0, kyc: 0, products: 0 });
  useEffect(() => {
    Promise.all([
      supabase.from('inbound_leads').select('id, status', { count: 'exact' }),
      supabase.from('banner_slides').select('id', { count: 'exact' }),
      supabase.from('kyc_verifications').select('id', { count: 'exact' }),
      supabase.from('products').select('id', { count: 'exact' }),
    ]).then(([leads, banners, kyc, products]) => {
      const newLeads = (leads.data || []).filter((l: {status: string}) => l.status === 'new').length;
      setStats({ leads: leads.count || 0, newLeads, banners: banners.count || 0, kyc: kyc.count || 0, products: products.count || 0 });
    });
  }, []);
  return (
    <div>
      <h2 className="text-2xl text-foreground mb-6">Admin Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats.leads, sub: `${stats.newLeads} new` },
          { label: 'Products', value: stats.products, sub: 'Active listings' },
          { label: 'Banner Slides', value: stats.banners, sub: 'Active slides' },
          { label: 'KYC Submissions', value: stats.kyc, sub: 'All time' },
        ].map((s, i) => (
          <div key={i} className="gold-border bg-card p-5">
            <p className="text-2xl text-primary mb-1">{s.value}</p>
            <p className="text-xs text-foreground font-medium">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Products tab ───────────────────────────────────────────── */
const EMPTY_PRODUCT = {
  product_type: 'gold_bars', name: '', subtitle: '', description: '',
  purity_range: '', image_url: '', video_url: '', min_weight_grams: 1,
};

function ProductsTab() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('sort_order');
    setProducts(data as AdminProduct[] || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_PRODUCT });
    setShowForm(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({
      product_type: p.product_type, name: p.name, subtitle: p.subtitle,
      description: p.description, purity_range: p.purity_range,
      image_url: p.image_url || '', video_url: p.video_url || '',
      min_weight_grams: p.min_weight_grams,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name || !form.product_type) { toast.error('Name and type are required'); return; }
    setSaving(true);
    const payload = {
      ...form,
      image_url: form.image_url || null,
      video_url: form.video_url || null,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from('products').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('products').insert({ ...payload, active: true, sort_order: products.length + 1 }));
    }
    setSaving(false);
    if (error) { toast.error(error.message); } else { toast.success(editing ? 'Product updated' : 'Product added'); setShowForm(false); load(); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('products').update({ active: !active }).eq('id', id);
    setProducts(p => p.map(x => x.id === id ? { ...x, active: !active } : x));
  };

  const del = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    toast.success('Product removed');
    setProducts(p => p.filter(x => x.id !== id));
    if (editing?.id === id) setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-foreground">Products</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={load} className="border border-border text-muted-foreground hover:text-primary w-9 h-9"><RefreshCw className="h-4 w-4" /></Button>
          <Button className="bg-primary text-primary-foreground text-xs tracking-widest uppercase font-semibold h-9 px-4 gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="gold-border bg-card p-6 mb-6">
          <p className="text-xs tracking-widest uppercase text-primary font-semibold mb-4">
            {editing ? 'Edit Product' : 'New Product'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Product Type</label>
              <select
                value={form.product_type}
                onChange={e => setForm(f => ({ ...f, product_type: e.target.value }))}
                className="w-full h-10 px-3 bg-background border border-border text-foreground text-sm focus:outline-none"
              >
                <option value="gold_bars">Gold Bars</option>
                <option value="gold_nuggets">Gold Nuggets</option>
                <option value="gold_dust">Gold Dust</option>
                <option value="bulk_supply">Bulk Supply</option>
              </select>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-background border-border h-10 px-3" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Subtitle</label>
              <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="bg-background border-border h-10 px-3" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Purity Range</label>
              <Input value={form.purity_range} placeholder="e.g. 99.5% – 99.99%" onChange={e => setForm(f => ({ ...f, purity_range: e.target.value }))} className="bg-background border-border h-10 px-3" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Min Weight (grams)</label>
              <Input type="number" value={form.min_weight_grams} onChange={e => setForm(f => ({ ...f, min_weight_grams: +e.target.value }))} className="bg-background border-border h-10 px-3" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="bg-background border-border px-3 resize-none" />
            </div>

            {/* Image */}
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Product Image</label>
              <div className="flex gap-2 items-center">
                <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="URL or upload below" className="bg-background border-border h-10 px-3 flex-1 min-w-0" />
                <MediaUploadButton
                  bucket="product-media"
                  accept="image/*"
                  label="Upload"
                  icon={ImageIcon}
                  onUploaded={url => setForm(f => ({ ...f, image_url: url }))}
                />
              </div>
              {form.image_url && (
                <div className="mt-2 w-20 h-14 overflow-hidden border border-border">
                  <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Video */}
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Product Video</label>
              <div className="flex gap-2 items-center">
                <Input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="URL or upload below" className="bg-background border-border h-10 px-3 flex-1 min-w-0" />
                <MediaUploadButton
                  bucket="product-media"
                  accept="video/*"
                  label="Upload"
                  icon={Video}
                  onUploaded={url => setForm(f => ({ ...f, video_url: url }))}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground text-xs tracking-widest uppercase font-semibold h-9 px-6">
              {saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}
            </Button>
            <Button variant="ghost" className="border border-border text-xs h-9 px-4" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products yet.</p>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className={`gold-border bg-card flex items-center gap-4 p-3 ${!p.active ? 'opacity-50' : ''}`}>
              <div className="w-14 h-10 bg-muted overflow-hidden shrink-0">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.subtitle} · {p.purity_range}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.video_url && <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">Video</Badge>}
                <Button variant="ghost" className={`border text-xs h-8 px-3 ${p.active ? 'border-green-500/40 text-green-400' : 'border-border text-muted-foreground'}`} onClick={() => toggleActive(p.id, p.active)}>
                  {p.active ? 'Active' : 'Off'}
                </Button>
                <Button variant="ghost" size="icon" className="border border-border text-muted-foreground hover:text-primary w-8 h-8" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="border border-destructive/40 text-destructive hover:bg-destructive/10 w-8 h-8" onClick={() => del(p.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Leads tab ─────────────────────────────────────────────── */
function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('inbound_leads').select('*').order('created_at', { ascending: false });
    setLeads(data as Lead[] || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('inbound_leads').update({ status }).eq('id', id);
    toast.success(`Lead marked as ${status}`);
    setLeads(l => l.map(x => x.id === id ? { ...x, status } : x));
  };
  const deleteLead = async (id: string) => {
    await supabase.from('inbound_leads').delete().eq('id', id);
    toast.success('Lead removed');
    setLeads(l => l.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const statusColor: Record<string, string> = {
    new: 'bg-primary/10 text-primary border-primary/30',
    contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    qualified: 'bg-green-500/10 text-green-400 border-green-500/30',
    closed: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 min-h-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-foreground">Inbound Leads</h2>
          <Button variant="ghost" size="icon" onClick={load} className="border border-border text-muted-foreground hover:text-primary w-9 h-9"><RefreshCw className="h-4 w-4" /></Button>
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads yet.</p>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[60vh]">
            {leads.map(lead => (
              <div key={lead.id} className={`gold-border bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors ${selected?.id === lead.id ? 'border-primary/60 bg-primary/5' : ''}`} onClick={() => setSelected(lead)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{lead.company_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.contact_person} · {lead.corporate_email}</p>
                  </div>
                  <Badge className={`text-xs border shrink-0 ${statusColor[lead.status] || ''}`}>{lead.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {lead.inquiry_type === 'bulk_purchase' ? '📦 Bulk Purchase' : '📈 Investor'} · {new Date(lead.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <div className="w-full md:w-80 gold-border bg-card p-5 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">Lead Detail</p>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setSelected(null)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-3 text-xs">
            {([['Company', selected.company_name], ['Contact', selected.contact_person], ['Email', selected.corporate_email], ['Phone', selected.phone_number], ['Type', selected.inquiry_type], ['Volume', selected.volume_scale || '—'], ['Date', new Date(selected.created_at).toLocaleString()]] as [string,string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-border pb-2">
                <span className="text-muted-foreground uppercase tracking-wider">{k}</span>
                <span className="text-foreground text-right truncate max-w-[60%]">{v}</span>
              </div>
            ))}
            {selected.message && <div><p className="text-muted-foreground uppercase tracking-wider mb-1">Message</p><p className="text-foreground leading-relaxed">{selected.message}</p></div>}
          </div>
          <div className="mt-4 space-y-2">
            {['contacted', 'qualified', 'closed'].map(s => (
              <Button key={s} variant="ghost" className="w-full border border-border text-xs tracking-widest uppercase h-8 justify-start" onClick={() => updateStatus(selected.id, s)}>
                <Check className="h-3 w-3 mr-2" /> Mark {s}
              </Button>
            ))}
            <Button variant="ghost" className="w-full border border-destructive/40 text-destructive text-xs tracking-widest uppercase h-8 hover:bg-destructive/10" onClick={() => deleteLead(selected.id)}>
              <Trash2 className="h-3 w-3 mr-2" /> Delete Lead
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Banners tab ────────────────────────────────────────────── */
function BannersTab() {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', media_url: '', media_type: 'image', sort_order: 0 });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('banner_slides').select('*').order('sort_order');
    setSlides(data as BannerSlide[] || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveSlide = async () => {
    if (!newSlide.media_url) { toast.error('Media is required'); return; }
    setSaving(true);
    const { error } = await supabase.from('banner_slides').insert({ ...newSlide, active: true });
    setSaving(false);
    if (error) { toast.error('Failed to add slide'); } else { toast.success('Slide added!'); setAdding(false); setNewSlide({ title: '', subtitle: '', media_url: '', media_type: 'image', sort_order: 0 }); load(); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('banner_slides').update({ active: !active }).eq('id', id);
    setSlides(s => s.map(x => x.id === id ? { ...x, active: !active } : x));
  };

  const deleteSlide = async (id: string) => {
    await supabase.from('banner_slides').delete().eq('id', id);
    toast.success('Slide removed');
    setSlides(s => s.filter(x => x.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-foreground">Banner Slides</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={load} className="border border-border text-muted-foreground hover:text-primary w-9 h-9"><RefreshCw className="h-4 w-4" /></Button>
          <Button className="bg-primary text-primary-foreground text-xs tracking-widest uppercase font-semibold h-9 px-4 gap-2" onClick={() => setAdding(!adding)}>
            <Plus className="h-4 w-4" /> Add Slide
          </Button>
        </div>
      </div>

      {adding && (
        <div className="gold-border bg-card p-5 mb-6 space-y-4">
          <p className="text-xs tracking-widest uppercase text-primary font-semibold">New Slide</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Title" value={newSlide.title} onChange={e => setNewSlide(n => ({ ...n, title: e.target.value }))} className="bg-background border-border h-10 px-3" />
            <Input placeholder="Subtitle" value={newSlide.subtitle} onChange={e => setNewSlide(n => ({ ...n, subtitle: e.target.value }))} className="bg-background border-border h-10 px-3" />
            <div className="md:col-span-2">
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Media (Image or Video)</label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Paste URL or upload →"
                  value={newSlide.media_url}
                  onChange={e => setNewSlide(n => ({ ...n, media_url: e.target.value }))}
                  className="bg-background border-border h-10 px-3 flex-1 min-w-0"
                />
                <MediaUploadButton
                  bucket="banner-media"
                  accept="image/*"
                  label="Image"
                  icon={ImageIcon}
                  onUploaded={url => setNewSlide(n => ({ ...n, media_url: url, media_type: 'image' }))}
                />
                <MediaUploadButton
                  bucket="banner-media"
                  accept="video/*"
                  label="Video"
                  icon={Video}
                  onUploaded={url => setNewSlide(n => ({ ...n, media_url: url, media_type: 'video' }))}
                />
              </div>
              {newSlide.media_url && newSlide.media_type === 'image' && (
                <div className="mt-2 h-16 w-28 overflow-hidden border border-border">
                  <img src={newSlide.media_url} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <label className="text-xs text-muted-foreground">Type:</label>
              {['image', 'video'].map(t => (
                <label key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input type="radio" value={t} checked={newSlide.media_type === t} onChange={() => setNewSlide(n => ({ ...n, media_type: t }))} className="accent-primary" />
                  {t}
                </label>
              ))}
            </div>
            <Input type="number" placeholder="Sort order" value={newSlide.sort_order} onChange={e => setNewSlide(n => ({ ...n, sort_order: +e.target.value }))} className="bg-background border-border h-10 px-3" />
          </div>
          <div className="flex gap-2">
            <Button onClick={saveSlide} disabled={saving} className="bg-primary text-primary-foreground text-xs tracking-widest uppercase font-semibold h-9 px-4">
              {saving ? 'Saving…' : 'Save Slide'}
            </Button>
            <Button variant="ghost" className="border border-border text-xs h-9 px-4" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : slides.length === 0 ? (
        <p className="text-sm text-muted-foreground">No slides yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {slides.map(slide => (
            <div key={slide.id} className={`gold-border bg-card p-3 flex items-center gap-4 ${!slide.active ? 'opacity-50' : ''}`}>
              <div className="w-16 h-10 bg-muted overflow-hidden shrink-0">
                {slide.media_type === 'image' ? (
                  <img src={slide.media_url} alt={slide.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">▶ Video</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{slide.title || '(No title)'}</p>
                <p className="text-xs text-muted-foreground truncate">{slide.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" className={`border text-xs h-8 px-3 ${slide.active ? 'border-green-500/40 text-green-400' : 'border-border text-muted-foreground'}`} onClick={() => toggleActive(slide.id, slide.active)}>
                  {slide.active ? 'Active' : 'Off'}
                </Button>
                <Button variant="ghost" size="icon" className="border border-destructive/40 text-destructive hover:bg-destructive/10 w-8 h-8" onClick={() => deleteSlide(slide.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── KYC tab ────────────────────────────────────────────────── */
function KYCTab() {
  const [kycs, setKYCs] = useState<{ id: string; user_id: string; status: string; created_at: string; document_type?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('kyc_verifications').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setKYCs(data || []);
      setLoading(false);
    });
  }, []);

  const update = async (id: string, status: string) => {
    await supabase.from('kyc_verifications').update({ status }).eq('id', id);
    setKYCs(k => k.map(x => x.id === id ? { ...x, status } : x));
    toast.success(`KYC marked ${status}`);
  };

  return (
    <div>
      <h2 className="text-xl text-foreground mb-6">KYC Reviews</h2>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : kycs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No KYC submissions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-border">
                {['User ID', 'Document', 'Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs tracking-widest uppercase text-muted-foreground py-2 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kycs.map(k => (
                <tr key={k.id} className="border-b border-border/50">
                  <td className="py-3 pr-4 text-foreground text-xs font-mono truncate max-w-[100px]">{k.user_id.slice(0, 8)}…</td>
                  <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{k.document_type || '—'}</td>
                  <td className="py-3 pr-4">
                    <Badge className={`text-xs border ${k.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/30' : k.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/30' : 'bg-primary/10 text-primary border-primary/30'}`}>{k.status}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap text-xs">{new Date(k.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" className="border border-green-500/40 text-green-400 hover:bg-green-500/10 text-xs h-7 px-2" onClick={() => update(k.id, 'approved')}><Check className="h-3 w-3" /></Button>
                      <Button variant="ghost" className="border border-destructive/40 text-destructive hover:bg-destructive/10 text-xs h-7 px-2" onClick={() => update(k.id, 'rejected')}><X className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Main Admin Page ──────────────────────────────────────── */
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const content: Record<Tab, React.ReactNode> = {
    overview: <OverviewTab />,
    products: <ProductsTab />,
    leads: <LeadsTab />,
    banners: <BannersTab />,
    kyc: <KYCTab />,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col w-56 shrink-0 border-r border-border bg-card fixed lg:static inset-y-0 left-0 z-50`}>
        <div className="p-4 border-b border-border">
          <Link to="/" className="text-xs tracking-widest uppercase text-primary font-semibold">← Fine Gold Africa</Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.tab} onClick={() => { setTab(item.tab); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${tab === item.tab ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive h-9" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-background/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-border bg-card px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden w-8 h-8" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-semibold text-foreground tracking-widest uppercase">Admin Panel</h1>
          </div>
          <p className="text-xs text-muted-foreground truncate hidden md:block">{user?.email}</p>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {content[tab]}
        </main>
      </div>
    </div>
  );
}
