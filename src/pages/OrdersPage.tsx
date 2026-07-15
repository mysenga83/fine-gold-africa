import { useEffect, useState } from 'react';
import { RefreshCw, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PortalLayout from '@/components/layouts/PortalLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getOrders } from '@/services/api';
import type { Order } from '@/types/types';

const PRODUCT_LABELS: Record<string, string> = {
  gold_bars: 'Gold Bars',
  gold_nuggets: 'Gold Nuggets',
  gold_dust: 'Gold Dust',
  bulk_supply: 'Bulk Supply',
};

function StatusBadge({ status }: { status: Order['status'] }) {
  const classes: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-muted text-muted-foreground border-border',
    failed: 'bg-destructive/10 text-destructive border-destructive/30',
  };
  return (
    <Badge className={`text-xs whitespace-nowrap ${classes[status] || 'bg-muted text-muted-foreground border-border'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 20;

  const loadOrders = async (reset = false) => {
    if (!user) return;
    setLoading(true);
    const newOffset = reset ? 0 : offset;
    const data = await getOrders(user.id, PAGE_SIZE, newOffset);
    if (reset) {
      setOrders(data);
      setOffset(PAGE_SIZE);
    } else {
      setOrders(prev => [...prev, ...data]);
      setOffset(prev => prev + PAGE_SIZE);
    }
    setLoading(false);
  };

  useEffect(() => { loadOrders(true); }, [user]);

  return (
    <PortalLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Transaction Log</p>
            <h1 className="text-2xl md:text-3xl text-foreground">Order History</h1>
          </div>
          <Button variant="ghost" size="icon" className="border border-border" onClick={() => loadOrders(true)}>
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {orders.length === 0 && !loading ? (
          <div className="gold-border bg-card p-12 text-center">
            <ClipboardList className="h-10 w-10 text-primary/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No orders yet. Your transaction history will appear here.</p>
          </div>
        ) : (
          <div className="gold-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Reference', 'Date', 'Type', 'Product', 'Weight', 'Spot Price', 'Fee', 'Total', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs text-muted-foreground uppercase tracking-widest whitespace-nowrap first:pl-5 last:pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 first:pl-5 whitespace-nowrap">
                        <span className="text-xs font-mono text-primary">{order.reference_code}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge className={`text-xs ${order.order_type === 'buy' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border'}`}>
                          {order.order_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-foreground whitespace-nowrap">{PRODUCT_LABELS[order.product_type]}</td>
                      <td className="py-3 px-4 text-xs tabular-nums text-foreground whitespace-nowrap">{order.weight_grams.toFixed(2)}g</td>
                      <td className="py-3 px-4 text-xs tabular-nums text-foreground whitespace-nowrap">${order.spot_price_per_oz.toFixed(2)}/oz</td>
                      <td className="py-3 px-4 text-xs tabular-nums text-foreground whitespace-nowrap">${order.processing_fee_usd.toFixed(2)}</td>
                      <td className="py-3 px-4 text-xs tabular-nums text-primary font-semibold whitespace-nowrap">${order.total_usd.toFixed(2)}</td>
                      <td className="py-3 px-4 last:pr-5 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length >= PAGE_SIZE && (
              <div className="p-4 text-center border-t border-border">
                <Button variant="ghost" size="sm" className="border border-border text-xs tracking-widest uppercase" onClick={() => loadOrders(false)} disabled={loading}>
                  {loading ? 'Loading…' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
