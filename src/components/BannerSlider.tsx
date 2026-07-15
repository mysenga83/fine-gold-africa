import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/db/supabase';

interface Slide {
  id: string;
  title?: string;
  subtitle?: string;
  media_url: string;
  media_type: 'image' | 'video';
  link_url?: string;
}

// Default slides shown before DB data loads or when DB is empty
const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'd1',
    title: 'Uganda\'s Premier Physical Gold Exchange',
    subtitle: 'Certified · Traceable · Institutional Grade',
    media_url: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/j.jpg',
    media_type: 'image',
    link_url: '/catalog',
  },
  {
    id: 'd2',
    title: 'Refined Gold Bars — 99.99% Purity',
    subtitle: 'Direct from Verified African Refineries',
    media_url: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/k.jpg',
    media_type: 'image',
    link_url: '/catalog',
  },
  {
    id: 'd3',
    title: 'Gold Nuggets & Alluvial Gold Dust',
    subtitle: 'Sourced from Uganda, DRC & East African Mines',
    media_url: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/b.jpg',
    media_type: 'image',
    link_url: '/catalog',
  },
  {
    id: 'd4',
    title: 'Bulk Supply for Institutional Buyers',
    subtitle: 'Minimum 1 KG · Export-Ready · Full Documentation',
    media_url: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/o.jpg',
    media_type: 'image',
    link_url: '/investor-relations',
  },
  {
    id: 'd5',
    title: 'From Mine to Market — Full Chain of Custody',
    subtitle: 'OECD-Compliant · Ethically Verified Supply Chain',
    media_url: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/g.jpg',
    media_type: 'image',
    link_url: '/governance',
  },
];

const INTERVAL_MS = 5000;

export default function BannerSlider() {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load slides from DB (falls back to defaults if empty)
  useEffect(() => {
    supabase
      .from('banner_slides')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setSlides(data as Slide[]);
      });
  }, []);

  const goTo = (idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent((idx + slides.length) % slides.length);
      setTransitioning(false);
    }, 300);
  };

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  useEffect(() => {
    if (!playing) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => goTo(current + 1), INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, current, slides.length]);

  const slide = slides[current];

  return (
    /* isolate stacking context so scale never bleeds outside */
    <div className="relative w-full bg-black isolate" style={{ height: 'clamp(280px, 52vw, 580px)', overflow: 'hidden' }}>
      {/* Slide background — no Ken-Burns to prevent reflow on mobile */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {slide.media_type === 'video' ? (
          <video key={slide.id} src={slide.media_url} autoPlay muted loop playsInline
            className="w-full h-full object-cover" style={{ willChange: 'auto' }} />
        ) : (
          <img
            key={slide.id}
            src={slide.media_url}
            alt={slide.title || ''}
            loading={current === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-full object-cover"
            style={{ willChange: 'auto' }}
          />
        )}
        {/* Layered dark overlay — heavier at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      </div>

      {/* Gold edge line — top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent z-10" />

      {/* Gold corner accents */}
      <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-primary/80 z-10" />
      <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-primary/80 z-10" />
      <div className="absolute bottom-12 left-5 w-8 h-8 border-b-2 border-l-2 border-primary/80 z-10" />
      <div className="absolute bottom-12 right-5 w-8 h-8 border-b-2 border-r-2 border-primary/80 z-10" />

      {/* Slide number badge */}
      <div className="absolute top-5 right-1/2 translate-x-1/2 z-20 px-3 py-1 bg-primary/20 border border-primary/40 backdrop-blur-sm">
        <span className="text-[10px] text-primary tracking-[0.25em] uppercase font-semibold">
          {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Text overlay — bottom-left aligned */}
      {(slide.title || slide.subtitle) && (
        <div className={`absolute bottom-16 left-0 right-0 px-6 md:px-14 z-10 transition-all duration-700 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <div className="max-w-3xl">
            {slide.subtitle && (
              <p className="text-xs md:text-sm text-primary tracking-[0.3em] uppercase font-semibold mb-3 flex items-center gap-2">
                <span className="inline-block w-8 h-px bg-primary" />
                {slide.subtitle}
              </p>
            )}
            {slide.title && (
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-white mb-5 leading-tight text-balance drop-shadow-lg">
                {slide.title}
              </h2>
            )}
            {slide.link_url && (
              <Button asChild size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold tracking-widest uppercase text-xs px-6 h-10 gap-2 shadow-lg">
                <Link to={slide.link_url}>
                  Explore Now <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/30 hover:bg-primary/60'}`}
            aria-label={`Go to slide ${i + 1}`} />
        ))}
      </div>

      {/* Navigation arrows */}
      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-primary/50 bg-black/40 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
        aria-label="Previous slide">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={next}
        className="absolute right-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-primary/50 bg-black/40 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
        aria-label="Next slide">
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Play/Pause */}
      <button onClick={() => setPlaying(!playing)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-primary/50 bg-black/40 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
        aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      {/* Progress bar */}
      {playing && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-primary/20 w-full z-20">
          <div key={`${current}-${playing}`} className="h-full bg-primary"
            style={{ animation: `progress-bar ${INTERVAL_MS}ms linear forwards` }} />
        </div>
      )}
    </div>
  );
}
