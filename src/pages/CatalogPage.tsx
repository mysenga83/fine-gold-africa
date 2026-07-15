import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Info, Video, Upload, X, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/types/types';
import { supabase } from '@/db/supabase';

// Products are loaded from Supabase; this interface mirrors the DB columns
interface DBProduct {
  id: string;
  product_type: string;
  name: string;
  subtitle: string;
  description: string;
  purity_range: string;
  image_url: string | null;
  video_url: string | null;
  min_weight_grams: number;
  active: boolean;
  sort_order: number;
}

function toProduct(p: DBProduct): Product & { videoUrl?: string } {
  return {
    id: p.product_type as Product['id'],
    name: p.name,
    subtitle: p.subtitle,
    description: p.description,
    purityRange: p.purity_range,
    imageUrl: p.image_url || '',
    minWeightGrams: p.min_weight_grams,
    videoUrl: p.video_url || undefined,
  };
}

/* ── Video Player Component ─────────────────────────────────── */
function VideoPlayer({ remoteUrl }: { remoteUrl?: string }) {
  const [videoSrc, setVideoSrc] = useState<string | null>(remoteUrl || null);
  const [usingRemote] = useState(!!remoteUrl);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) return;
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setPlaying(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); } else { videoRef.current.play(); }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const fullscreen = () => videoRef.current?.requestFullscreen?.();

  const remove = () => {
    if (videoSrc && !usingRemote) URL.revokeObjectURL(videoSrc);
    setVideoSrc(null);
    setPlaying(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (!videoSrc) {
    return (
      <div
        className="border border-dashed border-primary/30 bg-background/50 flex flex-col items-center justify-center gap-3 p-6 cursor-pointer hover:border-primary/60 transition-colors"
        style={{ minHeight: 140 }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-6 w-6 text-primary/60" />
        <p className="text-xs text-muted-foreground tracking-widest uppercase text-center">Upload Product Video</p>
        <p className="text-xs text-muted-foreground/60 text-center">MP4, WebM, MOV from device</p>
        <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
      </div>
    );
  }

  return (
    <div className="relative bg-black group">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full"
        style={{ maxHeight: 200 }}
        onEnded={() => setPlaying(false)}
        playsInline
      />
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <div className="flex-1" />
        <button onClick={fullscreen} className="text-white hover:text-primary transition-colors">
          <Maximize2 className="h-4 w-4" />
        </button>
        <button onClick={remove} className="text-white hover:text-destructive transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute top-2 left-2">
        <Badge className="bg-primary/80 text-primary-foreground text-xs border-0">
          <Video className="h-3 w-3 mr-1" /> Preview
        </Badge>
      </div>
    </div>
  );
}

function ProductCard({ product }: {
  product: Product & { videoUrl?: string };
}) {
  const { user } = useAuth();
  // Only admin users (email ends with mysenga83.com) can see the video toggle
  const isAdmin = !!user?.email?.endsWith('mysenga83.com');
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="gold-border bg-card h-full flex flex-col gold-glow-hover transition-all duration-300 opacity-0 intersect:opacity-100">
      {/* Media */}
      <div className="aspect-[4/3] overflow-hidden relative">
        {showVideo ? (
          <VideoPlayer remoteUrl={product.videoUrl} />
        ) : (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        )}
        {/* Video toggle: only visible to admin */}
        {isAdmin && (
          <button
            onClick={() => setShowVideo(v => !v)}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm border border-primary/40 px-2 py-1 text-xs text-primary hover:bg-primary/10 transition-colors"
          >
            {showVideo ? <X className="h-3 w-3" /> : <Video className="h-3 w-3" />}
            {showVideo ? 'Photo' : 'Video'}
          </button>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
            <p className="text-xs text-muted-foreground tracking-wider uppercase">{product.subtitle}</p>
          </div>
          <Badge className="shrink-0 bg-primary/10 text-primary border border-primary/30 text-xs tracking-wider">
            {product.purityRange}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{product.description}</p>

        <Button
          className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-10 hover:bg-primary/90 gap-2 w-full mt-auto"
          asChild
        >
          <Link to={user ? `/purchase?product=${product.id}` : '/contact'}>
            {user ? 'Request Allocation' : 'Inquire Now'} <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [products, setProducts] = useState<(Product & { videoUrl?: string })[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .then(({ data }) => {
        setProducts((data as DBProduct[] || []).map(toProduct));
        setProductsLoading(false);
      });
  }, []);

  return (
    <MainLayout>
      {/* Hero with background */}
      <section
        className="relative section-gap pb-8"
        style={{
          backgroundImage: `url(https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/k.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="opacity-0 intersect:opacity-100 transition duration-700 mb-6">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Premium African Gold</p>
            <h1 className="text-4xl md:text-5xl text-white mb-4">Product Catalog</h1>
            <p className="text-gray-300 max-w-2xl">
              Physical gold product lines, all ethically sourced from Uganda and across the East African region. Contact us to request allocation.
            </p>
          </div>
        </div>
      </section>

      <div className="gold-divider mx-4 md:mx-8" />

      {/* Products Grid */}
      <section className="section-gap pt-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="gold-border bg-card h-96 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-sm">No products available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Compliance note */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="gold-border bg-card p-6 flex items-start gap-4">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Trading Compliance Notice</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All transactions on Fine Gold Africa require completed KYC verification. Identity documents and trading licenses must be approved before any purchase or liquidation order is executed. We operate under full compliance with Uganda's Minerals and Mining Act.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
