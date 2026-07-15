import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, Package, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PortalLayout from '@/components/layouts/PortalLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { getWallet, getKYC, createOrder } from '@/services/api';
import type { Wallet, KYCVerification } from '@/types/types';
import { toast } from 'sonner';

const PRODUCT_LABELS: Record<string, string> = {
  gold_bars: 'Gold Bars',
  gold_nuggets: 'Gold Nuggets',
  gold_dust: 'Gold Dust',
  bulk_supply: 'Bulk Supply',
};

export default function WalletPage() {
  const { user } = useAuth();
  const { goldPrice, refresh: refreshPrice } = useGoldPrice(30000);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [kyc, setKyc] = useState<KYCVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellGrams, setSellGrams] = useState('');
  const [sellProduct, setSellProduct] = useState('gold_bars');

  const loadData = async () => {
    if (!user) return;
    const [w, k] = await Promise.all([getWallet(user.id), getKYC(user.id)]);
    setWallet(w);
    setKyc(k);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleSell = async () => {
    if (!goldPrice || !sellGrams || parseFloat(sellGrams) <= 0) return;
    if (kyc?.status !== 'approved') {
      toast.error('KYC approval required before executing sell orders.');
      return;
    }
    setSellLoading(true);
    const result = await createOrder({
      productType: sellProduct,
      orderType: 'sell',
      weightGrams: parseFloat(sellGrams),
      spotPricePerOz: goldPrice.pricePerOz,
    });
    setSellLoading(false);
    if (result) {
      toast.success(`Sell order executed. Reference: ${result.referenceCode}`);
      setSellGrams('');
      loadData();
    } else {
      toast.error('Sell order failed. Check your vault balance and KYC status.');
    }
  };

  const portfolioUSD = wallet && goldPrice ? wallet.gold_grams * goldPrice.pricePerGram : 0;

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Secure Vault</p>
            <h1 className="text-2xl md:text-3xl text-foreground">Portfolio & Vault</h1>
          </div>
          <Button variant="ghost" size="icon" className="border border-border" onClick={() => { loadData(); refreshPrice(); }}>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* KYC Warning */}
        {kyc?.status !== 'approved' && (
          <div className="gold-border bg-primary/5 p-4 flex items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground flex-1 min-w-0">
              KYC approval required to execute sell orders.{' '}
              <Link to="/kyc" className="text-primary hover:underline">Complete verification →</Link>
            </p>
          </div>
        )}

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="gold-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Total Portfolio Value</p>
            <p className="text-2xl text-primary tabular-nums font-semibold">
              ${loading ? '—' : portfolioUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">USD</p>
          </div>
          <div className="gold-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Gold Holdings</p>
            <p className="text-2xl text-primary tabular-nums font-semibold">
              {loading ? '—' : `${wallet?.gold_grams.toFixed(4) ?? '0'}g`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{wallet?.gold_ounces.toFixed(6) ?? '0'} troy oz</p>
          </div>
          <div className="gold-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Cash Balance</p>
            <p className="text-2xl text-primary tabular-nums font-semibold">
              ${loading ? '—' : (wallet?.cash_balance_usd ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">USD</p>
          </div>
        </div>

        {/* Live Rate */}
        {goldPrice && (
          <div className="gold-border bg-card p-4 flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Live Spot</span>
            </div>
            <span className="text-sm text-primary tabular-nums font-semibold">
              ${goldPrice.pricePerOz.toLocaleString('en-US', { minimumFractionDigits: 2 })}/oz
            </span>
            <span className="text-xs text-muted-foreground">|</span>
            <span className="text-sm text-primary tabular-nums font-semibold">
              ${goldPrice.pricePerGram.toFixed(4)}/g
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              Updated {new Date(goldPrice.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Sell Panel */}
        <div className="gold-border bg-card p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-foreground tracking-wide">Liquidate Gold Holdings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Product Type</label>
              <select
                value={sellProduct}
                onChange={e => setSellProduct(e.target.value)}
                className="w-full h-10 bg-background border border-border text-foreground text-sm px-3"
              >
                {Object.entries(PRODUCT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Weight (grams)</label>
              <input
                type="number"
                min="0.1"
                max={wallet?.gold_grams ?? 0}
                step="0.1"
                value={sellGrams}
                onChange={e => setSellGrams(e.target.value)}
                placeholder="Enter grams"
                className="w-full h-10 bg-background border border-border text-foreground text-sm px-3"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Estimated Proceeds</label>
              <div className="h-10 bg-background border border-border px-3 flex items-center">
                <span className="text-sm tabular-nums text-primary">
                  {sellGrams && goldPrice
                    ? `$${((parseFloat(sellGrams) || 0) * goldPrice.pricePerGram * 0.985).toFixed(2)} USD`
                    : '—'
                  }
                </span>
              </div>
            </div>
          </div>

          {sellGrams && goldPrice && parseFloat(sellGrams) > 0 && (
            <div className="text-xs text-muted-foreground mb-4 p-3 bg-background border border-border">
              Net proceeds after 1.5% processing fee: <span className="text-primary tabular-nums font-semibold">
                ${((parseFloat(sellGrams) || 0) * goldPrice.pricePerGram * 0.985).toFixed(2)}
              </span>
            </div>
          )}

          <Button
            onClick={handleSell}
            disabled={sellLoading || !sellGrams || parseFloat(sellGrams) <= 0 || kyc?.status !== 'approved'}
            className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-10 hover:bg-primary/90 gap-2"
          >
            {sellLoading ? 'Processing…' : 'Execute Sell Order'}
          </Button>
        </div>

        {/* No Holdings */}
        {!loading && (!wallet || wallet.gold_grams <= 0) && (
          <div className="gold-border bg-card p-10 text-center">
            <Package className="h-10 w-10 text-primary/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Your vault is empty. Purchase gold to start building your portfolio.</p>
            <Button className="bg-primary text-primary-foreground text-xs tracking-widest uppercase h-10 gap-2" asChild>
              <Link to="/catalog">Browse Products <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
