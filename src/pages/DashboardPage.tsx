import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PortalLayout from '@/components/layouts/PortalLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { getWallet, getKYC, getOrders } from '@/services/api';
import type { Wallet, KYCVerification, Order } from '@/types/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PRODUCT_LABELS: Record<string, string> = {
  gold_bars: 'Gold Bars',
  gold_nuggets: 'Gold Nuggets',
  gold_dust: 'Gold Dust',
  bulk_supply: 'Bulk Supply',
};

// Generate synthetic portfolio history from orders
function buildPortfolioHistory(orders: Order[], pricePerGram: number) {
  const now = Date.now();
  const days = 30;
  const points: { date: string; value: number }[] = [];
  let cumGrams = 0;
  const sortedOrders = [...orders].filter(o => o.status === 'completed').sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    sortedOrders.forEach(o => {
      const orderDate = new Date(o.created_at);
      if (orderDate <= date) {
        if (o.order_type === 'buy') cumGrams += o.weight_grams;
        else cumGrams -= o.weight_grams;
      }
    });
    const grams = Math.max(0, cumGrams);
    const priceVariation = 1 + (Math.sin(i * 0.3) * 0.02);
    points.push({ date: dateStr, value: Number((grams * pricePerGram * priceVariation).toFixed(2)) });
  }
  return points;
}

function KYCBanner({ status }: { status: KYCVerification['status'] | 'none' }) {
  if (status === 'approved') return null;
  return (
    <div className={`p-4 border flex items-start gap-3 mb-6 ${
      status === 'rejected' ? 'border-destructive/50 bg-destructive/10' : 'border-primary/30 bg-primary/5'
    }`}>
      {status === 'rejected' ? (
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      ) : (
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground mb-1">
          {status === 'none' && 'KYC Verification Required'}
          {status === 'pending' && 'KYC Under Review'}
          {status === 'rejected' && 'KYC Verification Rejected'}
        </p>
        <p className="text-xs text-muted-foreground">
          {status === 'none' && 'Complete identity verification to unlock trading. It takes 24–48 hours.'}
          {status === 'pending' && 'Your documents are under review. Trading will be enabled upon approval.'}
          {status === 'rejected' && 'Your KYC was rejected. Please resubmit with valid documents.'}
        </p>
      </div>
      <Button size="sm" className="shrink-0 bg-primary text-primary-foreground text-xs tracking-widest uppercase h-8" asChild>
        <Link to="/kyc">{status === 'none' ? 'Verify Now' : 'View KYC'}</Link>
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { goldPrice, loading: priceLoading, refresh } = useGoldPrice(30000);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [kyc, setKyc] = useState<KYCVerification | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getWallet(user.id),
      getKYC(user.id),
      getOrders(user.id, 10),
    ]).then(([w, k, o]) => {
      setWallet(w);
      setKyc(k);
      setOrders(o);
    }).finally(() => setLoading(false));
  }, [user]);

  const kycStatus: KYCVerification['status'] | 'none' = kyc?.status ?? 'none';
  const portfolioUSD = wallet && goldPrice ? wallet.gold_grams * goldPrice.pricePerGram : 0;
  const chartData = orders.length > 0 && goldPrice ? buildPortfolioHistory(orders, goldPrice.pricePerGram) : [];

  return (
    <PortalLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Client Portal</p>
            <h1 className="text-2xl md:text-3xl text-foreground">
              Welcome, <span className="gold-text">{profile?.full_name?.split(' ')[0] || 'Investor'}</span>
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="border border-border text-muted-foreground hover:text-foreground shrink-0"
            onClick={refresh}
          >
            <RefreshCw className={`h-4 w-4 ${priceLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <KYCBanner status={kycStatus} />

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Portfolio Value',
              value: loading ? '—' : `$${portfolioUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              sub: 'USD',
            },
            {
              label: 'Gold Holdings',
              value: loading ? '—' : `${wallet?.gold_grams.toFixed(2) ?? '0.00'}g`,
              sub: `${wallet?.gold_ounces.toFixed(4) ?? '0'} oz`,
            },
            {
              label: 'Cash Balance',
              value: loading ? '—' : `$${(wallet?.cash_balance_usd ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              sub: 'USD',
            },
            {
              label: 'Gold Spot Price',
              value: goldPrice ? `$${goldPrice.pricePerOz.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
              sub: 'per troy oz',
            },
          ].map((stat, i) => (
            <div key={i} className="gold-border bg-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-xl font-semibold text-primary tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Portfolio Chart */}
        {chartData.length > 0 ? (
          <div className="gold-border bg-card p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Portfolio Performance</p>
                <p className="text-sm text-foreground mt-1">30-Day Gold Value Trend</p>
              </div>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="w-full min-w-0 overflow-hidden h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v.toLocaleString()}`} width={70} />
                  <Tooltip
                    contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '2px', fontSize: '12px' }}
                    labelStyle={{ color: '#FDFBF7' }}
                    formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Portfolio Value']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={1.5} fill="url(#goldGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="gold-border bg-card p-8 mb-8 text-center">
            <Package className="h-8 w-8 text-primary/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No portfolio data yet. Make your first gold purchase to start tracking.</p>
            <Button size="sm" className="mt-4 bg-primary text-primary-foreground text-xs tracking-widest uppercase" asChild>
              <Link to="/catalog">Browse Products <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </div>
        )}

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div className="gold-border bg-card p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Recent Transactions</p>
              <Button variant="ghost" size="sm" className="text-xs text-primary tracking-widest uppercase" asChild>
                <Link to="/orders">View All</Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    {['Reference', 'Type', 'Product', 'Weight', 'Total', 'Status'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 text-xs text-muted-foreground uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-3 pr-4 text-xs font-mono text-primary whitespace-nowrap">{order.reference_code}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <Badge className={`text-xs ${order.order_type === 'buy' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border'}`}>
                          {order.order_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-xs text-foreground whitespace-nowrap">{PRODUCT_LABELS[order.product_type]}</td>
                      <td className="py-3 pr-4 text-xs tabular-nums text-foreground whitespace-nowrap">{order.weight_grams.toFixed(2)}g</td>
                      <td className="py-3 pr-4 text-xs tabular-nums text-foreground whitespace-nowrap">${order.total_usd.toFixed(2)}</td>
                      <td className="py-3 whitespace-nowrap">
                        <Badge className={`text-xs ${
                          order.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                          order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                          'bg-muted text-muted-foreground border-border'
                        }`}>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/catalog" className="gold-border bg-card p-5 hover:bg-muted/30 transition-colors group block">
            <TrendingUp className="h-5 w-5 text-primary mb-3" />
            <p className="text-sm font-semibold text-foreground">Buy Gold</p>
            <p className="text-xs text-muted-foreground mt-1">Browse and purchase physical gold products</p>
          </Link>
          <Link to="/wallet" className="gold-border bg-card p-5 hover:bg-muted/30 transition-colors group block">
            <Package className="h-5 w-5 text-primary mb-3" />
            <p className="text-sm font-semibold text-foreground">Vault Portfolio</p>
            <p className="text-xs text-muted-foreground mt-1">Manage and liquidate your gold holdings</p>
          </Link>
          <Link to="/kyc" className="gold-border bg-card p-5 hover:bg-muted/30 transition-colors group block">
            <ShieldCheck className="h-5 w-5 text-primary mb-3" />
            <p className="text-sm font-semibold text-foreground">KYC Status</p>
            <p className="text-xs text-muted-foreground mt-1">
              Status: <span className={`font-medium ${kycStatus === 'approved' ? 'text-primary' : 'text-muted-foreground'}`}>{kycStatus}</span>
            </p>
          </Link>
        </div>
      </div>
    </PortalLayout>
  );
}
