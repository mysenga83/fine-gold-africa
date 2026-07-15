import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Calculator, Loader2, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { getKYC, createOrder } from '@/services/api';
import type { KYCVerification, Product, ProductType } from '@/types/types';
import { toast } from 'sonner';

const PRODUCTS: Record<ProductType, Product> = {
  gold_bars: {
    id: 'gold_bars', name: 'Gold Bars', subtitle: 'Refined Bullion',
    description: 'LBMA-standard refined gold bars with assay certification.',
    purityRange: '99.5% – 99.99%',
    imageUrl: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_383da6be-f737-4e02-9c17-9877146627f7.jpg',
    minWeightGrams: 1,
  },
  gold_nuggets: {
    id: 'gold_nuggets', name: 'Gold Nuggets', subtitle: 'High-Purity Raw Form',
    description: 'Naturally formed alluvial gold nuggets from certified African operations.',
    purityRange: '97% – 99.5%',
    imageUrl: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d243eed4-ead0-4798-bd7f-5039e7958908.jpg',
    minWeightGrams: 5,
  },
  gold_dust: {
    id: 'gold_dust', name: 'Gold Dust', subtitle: 'Alluvial Composition',
    description: 'Fine alluvial gold dust from OECD-verified ASM operations.',
    purityRange: '96% – 98%',
    imageUrl: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3c0f72f7-c913-4e23-b523-29355b83c688.jpg',
    minWeightGrams: 10,
  },
  bulk_supply: {
    id: 'bulk_supply', name: 'Bulk Gold Supply', subtitle: 'Industrial Volume',
    description: 'Large-volume supply contracts for institutional buyers.',
    purityRange: '96% – 99.99%',
    imageUrl: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_55c343d9-d299-4cf3-8e3e-e325d4d46a79.jpg',
    minWeightGrams: 1000,
  },
};

export default function PurchasePage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { goldPrice, loading: priceLoading } = useGoldPrice(30000);
  const navigate = useNavigate();

  const productId = (searchParams.get('product') as ProductType) || 'gold_bars';
  const product = PRODUCTS[productId] || PRODUCTS.gold_bars;

  const [kyc, setKyc] = useState<KYCVerification | null>(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [weight, setWeight] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (!user) return;
    getKYC(user.id).then(k => { setKyc(k); setKycLoading(false); });
  }, [user]);

  const weightNum = parseFloat(weight) || 0;
  const subtotal = weightNum * (goldPrice?.pricePerGram ?? 0);
  const fee = subtotal * (goldPrice?.processingFeeRate ?? 0.015);
  const total = subtotal + fee;
  const kycApproved = kyc?.status === 'approved';

  const handlePurchase = async () => {
    if (!goldPrice || !kycApproved || weightNum <= 0) return;
    setOrdering(true);
    const result = await createOrder({
      productType: productId,
      orderType: 'buy',
      weightGrams: weightNum,
      spotPricePerOz: goldPrice.pricePerOz,
    });
    setOrdering(false);

    if (!result) {
      toast.error('Order creation failed. Please try again.');
      return;
    }

    if (result.checkoutUrl) {
      window.open(result.checkoutUrl, '_blank');
      toast.info('Redirected to secure payment. Return here after completing payment.');
    } else {
      toast.success(`Order confirmed. Reference: ${result.referenceCode}`);
      navigate('/orders');
    }
  };

  return (
    <MainLayout>
      <section className="section-gap">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-4">
              <Link to="/catalog" className="hover:text-foreground transition-colors">Products</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{product.name}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl text-foreground">Purchase {product.name}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Info */}
            <div>
              <div className="aspect-[4/3] overflow-hidden gold-border mb-5">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="gold-border bg-card p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{product.name}</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{product.subtitle}</p>
                  </div>
                  <Badge className="shrink-0 bg-primary/10 text-primary border border-primary/30 text-xs">{product.purityRange}</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Min Order</p>
                    <p className="text-sm text-foreground tabular-nums">{product.minWeightGrams}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Processing Fee</p>
                    <p className="text-sm text-foreground">1.5%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Panel */}
            <div className="space-y-4">
              {/* Live Price */}
              <div className="gold-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Live Market Rate</p>
                </div>
                {priceLoading ? (
                  <div className="h-8 bg-muted animate-pulse w-40" />
                ) : goldPrice ? (
                  <div className="space-y-1">
                    <p className="text-2xl text-primary tabular-nums font-semibold">
                      ${goldPrice.pricePerOz.toLocaleString('en-US', { minimumFractionDigits: 2 })}<span className="text-sm font-normal text-muted-foreground">/oz</span>
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      ${goldPrice.pricePerGram.toFixed(4)}/gram
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Price unavailable</p>
                )}
              </div>

              {/* KYC Gate */}
              {!kycLoading && !kycApproved && (
                <div className="border border-primary/30 bg-primary/5 p-5 flex items-start gap-3">
                  <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Trading Locked</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      KYC verification ({kyc?.status ?? 'not started'}) must be approved before executing orders.
                    </p>
                    <Button size="sm" className="bg-primary text-primary-foreground text-xs tracking-widest uppercase h-8 gap-2" asChild>
                      <Link to="/kyc"><ShieldCheck className="h-3 w-3" />Complete KYC</Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Order Form */}
              <div className="gold-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground tracking-wide">Order Calculator</p>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
                    Weight (grams) — Min {product.minWeightGrams}g
                  </label>
                  <Input
                    type="number"
                    min={product.minWeightGrams}
                    step="0.1"
                    placeholder={`Enter weight in grams`}
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="bg-background border-border text-foreground h-11 px-3"
                  />
                </div>

                {weightNum > 0 && goldPrice && (
                  <div className="space-y-2 p-4 bg-background border border-border mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Weight</span>
                      <span className="tabular-nums text-foreground">{weightNum.toFixed(2)}g / {(weightNum / 31.1035).toFixed(4)} oz</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Spot Rate</span>
                      <span className="tabular-nums text-foreground">${goldPrice.pricePerGram.toFixed(4)}/g</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Processing Fee (1.5%)</span>
                      <span className="tabular-nums text-foreground">${fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mt-1">
                      <span className="text-foreground">Total</span>
                      <span className="tabular-nums text-primary">${total.toFixed(2)} USD</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePurchase}
                  disabled={ordering || !kycApproved || weightNum < product.minWeightGrams || !goldPrice}
                  className="w-full bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-12 hover:bg-primary/90 gap-2"
                >
                  {ordering ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</> : <>Proceed to Payment <ArrowRight className="h-4 w-4" /></>}
                </Button>

                {weightNum > 0 && weightNum < product.minWeightGrams && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Minimum order is {product.minWeightGrams}g
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Payment processed securely via Stripe. Physical gold allocated to your vault upon confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
