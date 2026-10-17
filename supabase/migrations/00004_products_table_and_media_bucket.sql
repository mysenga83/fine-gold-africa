import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  product_type: string;
  name: string;
  subtitle: string;
  description: string;
  purity_range: string;
  image_url: string | null;
  min_weight_grams: number;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    product_type: 'gold_bars',
    name: 'Gold Bars',
    subtitle: 'Refined Bullion',
    description: 'LBMA-standard refined gold bars, available from 1g to 400oz. Each bar is hallmarked with serial number, assay certificate, and purity stamp. Ideal for institutional allocation and reserve holdings.',
    purity_range: '99.5% – 99.99%',
    image_url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_383da6be-f737-4e02-9c17-9877146627f7.jpg',
    min_weight_grams: 1,
  },
  {
    id: '2',
    product_type: 'gold_dust',
    name: 'Gold Dust',
    subtitle: 'Alluvial Composition',
    description: 'Fine alluvial gold dust from artisanal and small-scale mining (ASM) operations verified under OECD compliance frameworks. Packaged in sealed, tamper-evident assay pouches.',
    purity_range: '96% – 98%',
    image_url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3c0f72f7-c913-4e23-b523-29355b83c688.jpg',
    min_weight_grams: 10,
  },
  {
    id: '3',
    product_type: 'bulk_supply',
    name: 'Bulk Gold Supply',
    subtitle: 'Industrial Volume',
    description: 'Large-volume gold supply contracts for refineries, jewellery manufacturers, and institutional buyers. Minimum 1kg lots with custom purity grading and dedicated account management.',
    purity_range: '96% – 99.99%',
    image_url: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_55c343d9-d299-4cf3-8e3e-e325d4d46a79.jpg',
    min_weight_grams: 1000,
  },
];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .neq('product_type', 'gold_nuggets')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    }
    fetchProducts();
  }, []);

  return (
    <MainLayout>
      <section className="py-16 md:py-24 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border border-primary/30 uppercase tracking-widest text-xs px-3 py-1">
            Physical Bullion & Raw Gold
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Product <span className="gold-text">Catalog</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed font-light">
            Explore our ethically sourced African physical gold offerings, fully traceable and certified for institutional and private allocations across the globe.
          </p>
        </div>
      </section>

      <section className="section-gap">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="gold-border bg-card overflow-hidden flex flex-col gold-glow-hover">
                <div className="aspect-video relative overflow-hidden bg-black/40">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Sparkles className="h-8 w-8 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/80 backdrop-blur-md border border-primary/40 text-primary text-xs">
                      {product.purity_range}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs tracking-widest text-primary uppercase font-semibold mb-1">
                      {product.subtitle}
                    </p>
                    <h3 className="text-xl font-bold text-foreground mb-3">{product.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Min Order</p>
                      <p className="text-xs font-semibold text-foreground">
                        {product.min_weight_grams >= 1000 
                          ? `${product.min_weight_grams / 1000} kg` 
                          : `${product.min_weight_grams} g`}
                      </p>
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-wider uppercase font-semibold gap-1.5" asChild>
                      <Link to="/contact">
                        Inquire <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 gold-border bg-card p-8 rounded-lg">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="text-base font-semibold text-foreground mb-1">Trading Compliance Notice</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All transactions on Fine Gold Africa require completed KYC verification. Identity documents and trading licenses must be approved before any purchase or liquidation order is executed. We operate under full compliance with Uganda's Minerals and Mining Act.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
