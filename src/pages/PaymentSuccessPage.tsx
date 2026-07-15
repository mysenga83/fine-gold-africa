import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layouts/MainLayout';
import { verifyPayment } from '@/services/api';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setStatus('failed'); return; }
    verifyPayment(sessionId).then(result => {
      if (result?.verified) {
        setStatus('success');
        setOrderId(result.orderId ?? null);
      } else {
        setStatus('failed');
      }
    });
  }, [sessionId]);

  return (
    <MainLayout>
      <section className="section-gap">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="glass-panel p-10 md:p-14 relative">
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary/60" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary/60" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary/60" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary/60" />

            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-6" />
                <h1 className="text-2xl text-foreground mb-2">Verifying Payment</h1>
                <p className="text-sm text-muted-foreground">Confirming your transaction with secure servers…</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-6" />
                <h1 className="text-2xl text-foreground mb-2">Payment Confirmed</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Your gold purchase has been confirmed. Physical gold has been allocated to your vault.
                </p>
                {orderId && (
                  <p className="text-xs text-muted-foreground mb-6">Order ID: <span className="text-primary font-mono">{orderId}</span></p>
                )}
                <div className="flex flex-col gap-3">
                  <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-11 gap-2" asChild>
                    <Link to="/dashboard">Go to Dashboard <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" className="border border-border text-xs tracking-widest uppercase h-11" asChild>
                    <Link to="/orders">View Orders</Link>
                  </Button>
                </div>
              </>
            )}

            {status === 'failed' && (
              <>
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-6" />
                <h1 className="text-2xl text-foreground mb-2">Verification Failed</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  We could not verify your payment. Please check your order history or contact support.
                </p>
                <div className="flex flex-col gap-3">
                  <Button className="bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-11 gap-2" asChild>
                    <Link to="/orders">Check Order History <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" className="border border-border text-xs tracking-widest uppercase h-11" asChild>
                    <Link to="/catalog">Return to Catalog</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
