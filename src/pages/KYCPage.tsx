import { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Upload, CheckCircle2, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PortalLayout from '@/components/layouts/PortalLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getKYC, submitKYC, approveDemoKYC } from '@/services/api';
import { supabase } from '@/db/supabase';
import type { KYCVerification } from '@/types/types';
import { toast } from 'sonner';

function StatusIcon({ status }: { status: KYCVerification['status'] | 'none' }) {
  if (status === 'approved') return <CheckCircle2 className="h-6 w-6 text-primary" />;
  if (status === 'rejected') return <AlertTriangle className="h-6 w-6 text-destructive" />;
  if (status === 'pending') return <Clock className="h-6 w-6 text-yellow-400" />;
  return <ShieldCheck className="h-6 w-6 text-muted-foreground" />;
}

const STEPS = [
  { label: 'Account Created', done: true },
  { label: 'Documents Submitted', status: ['pending', 'approved', 'rejected'] },
  { label: 'Under Review', status: ['pending', 'approved', 'rejected'] },
  { label: 'KYC Approved', status: ['approved'] },
];

export default function KYCPage() {
  const { user } = useAuth();
  const [kyc, setKyc] = useState<KYCVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const licenseRef = useRef<HTMLInputElement>(null);

  const loadKYC = async () => {
    if (!user) return;
    const k = await getKYC(user.id);
    setKyc(k);
    setLoading(false);
  };

  useEffect(() => { loadKYC(); }, [user]);

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('kyc-documents')
      .upload(path, file, { contentType: file.type, upsert: true });
    if (error) { console.error('Upload error:', error.message); return null; }
    return data.path;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let docPath: string | null = null;
    let licensePath: string | null = null;

    if (docFile) {
      docPath = await uploadFile(docFile, `${user!.id}/government_id_${Date.now()}`);
    }
    if (licenseFile) {
      licensePath = await uploadFile(licenseFile, `${user!.id}/trading_license_${Date.now()}`);
    }

    const result = await submitKYC(docPath ?? undefined, licensePath ?? undefined);
    setSubmitting(false);

    if (result) {
      toast.success(result.message);
      loadKYC();
    } else {
      toast.error('Submission failed. Please try again.');
    }
  };

  const handleDemoApprove = async () => {
    setDemoLoading(true);
    const result = await approveDemoKYC();
    setDemoLoading(false);
    if (result) {
      toast.success(result.message);
      loadKYC();
    }
  };

  const kycStatus: KYCVerification['status'] | 'none' = kyc?.status ?? 'none';

  const statusColors: Record<string, string> = {
    approved: 'bg-primary/10 text-primary border-primary/30',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    rejected: 'bg-destructive/10 text-destructive border-destructive/30',
    none: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <PortalLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Identity Compliance</p>
          <h1 className="text-2xl md:text-3xl text-foreground">KYC Verification</h1>
        </div>

        {/* Status Card */}
        <div className="gold-border bg-card p-6 mb-6 flex items-start gap-4">
          <StatusIcon status={kycStatus} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <p className="text-base font-semibold text-foreground">Verification Status</p>
              <Badge className={`text-xs ${statusColors[kycStatus]}`}>
                {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
              </Badge>
            </div>
            {kycStatus === 'none' && (
              <p className="text-sm text-muted-foreground">Submit your identity documents to begin trading. Approval typically takes 24–48 hours.</p>
            )}
            {kycStatus === 'pending' && (
              <p className="text-sm text-muted-foreground">Your documents are under review. You will be notified once approved.</p>
            )}
            {kycStatus === 'approved' && (
              <p className="text-sm text-muted-foreground">Your identity has been verified. You are authorized to execute buy and sell orders.</p>
            )}
            {kycStatus === 'rejected' && (
              <p className="text-sm text-muted-foreground">
                Reason: {kyc?.admin_notes || 'Documents could not be verified. Please resubmit clear, valid documents.'}
              </p>
            )}
            {kyc?.submitted_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Submitted: {new Date(kyc.submitted_at).toLocaleString()}
              </p>
            )}
            {kyc?.reviewed_at && (
              <p className="text-xs text-muted-foreground">
                Reviewed: {new Date(kyc.reviewed_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="gold-border bg-card p-5 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Verification Progress</p>
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const isActive = step.done || (Array.isArray(step.status) && step.status.includes(kycStatus));
              const isLast = i === STEPS.length - 1;
              return (
                <div key={i} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isActive ? 'border-primary bg-primary/20' : 'border-border bg-background'
                    }`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <p className={`text-xs text-center mt-1 whitespace-nowrap px-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} style={{ fontSize: '10px' }}>
                      {step.label}
                    </p>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-px mb-5 ${isActive ? 'bg-primary/40' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Form */}
        {kycStatus !== 'approved' && (
          <div className="gold-border bg-card p-6 mb-6">
            <p className="text-sm font-semibold text-foreground mb-4">Submit Verification Documents</p>

            <div className="space-y-4">
              {/* Government ID */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
                  Government-Issued ID <span className="text-primary">*</span>
                </label>
                <div
                  className="border border-dashed border-border p-5 text-center cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => docRef.current?.click()}
                >
                  <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {docFile ? docFile.name : 'Click to upload passport, national ID, or driver\'s license'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — max 5MB</p>
                  <input ref={docRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setDocFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>

              {/* Trading License */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
                  Trading License <span className="text-muted-foreground">(Corporate / Optional)</span>
                </label>
                <div
                  className="border border-dashed border-border p-5 text-center cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => licenseRef.current?.click()}
                >
                  <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {licenseFile ? licenseFile.name : 'Click to upload trading license or business registration'}
                  </p>
                  <input ref={licenseRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setLicenseFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || kycStatus === 'pending'}
              className="mt-5 bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-10 hover:bg-primary/90 gap-2"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading…</> : 'Submit for Review'}
            </Button>
          </div>
        )}

        {/* Demo Auto-Approve */}
        {kycStatus !== 'approved' && (
          <div className="gold-border bg-muted/30 p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Demo Mode</p>
            <p className="text-xs text-muted-foreground mb-3">
              For testing purposes, instantly approve your KYC to unlock trading functionality.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="border border-primary/30 text-primary hover:bg-primary/10 text-xs tracking-widest uppercase gap-2"
              onClick={handleDemoApprove}
              disabled={demoLoading}
            >
              {demoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Approve KYC (Demo)
            </Button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
