import { supabase } from '@/db/supabase';
import type { Profile, KYCVerification, Wallet, Order, GoldPrice } from '@/types/types';

// ── Gold Price ────────────────────────────────────────────────
export async function fetchGoldPrice(): Promise<GoldPrice | null> {
  const { data, error } = await supabase.functions.invoke<{ code: string; data: GoldPrice }>(
    'gold-price',
    { method: 'GET' }
  );
  if (error) {
    const msg = await error?.context?.text?.();
    console.error('fetchGoldPrice error:', msg || error.message);
    return null;
  }
  return data?.data ?? null;
}

// ── Profile ───────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) console.error('getProfile error:', error.message);
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) console.error('updateProfile error:', error.message);
  return !error;
}

// ── KYC ───────────────────────────────────────────────────────
export async function getKYC(userId: string): Promise<KYCVerification | null> {
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) console.error('getKYC error:', error.message);
  return data;
}

export async function submitKYC(documentPath?: string, licensePath?: string): Promise<{ status: string; message: string } | null> {
  const { data, error } = await supabase.functions.invoke<{ code: string; data: { status: string; message: string } }>(
    'kyc-admin',
    {
      body: { action: 'submit', documentPath: documentPath ?? null, licensePath: licensePath ?? null },
      method: 'POST',
    }
  );
  if (error) {
    const msg = await error?.context?.text?.();
    console.error('submitKYC error:', msg || error.message);
    return null;
  }
  return data?.data ?? null;
}

export async function approveDemoKYC(): Promise<{ status: string; message: string } | null> {
  const { data, error } = await supabase.functions.invoke<{ code: string; data: { status: string; message: string } }>(
    'kyc-admin',
    { body: { action: 'approve_demo' }, method: 'POST' }
  );
  if (error) {
    const msg = await error?.context?.text?.();
    console.error('approveDemoKYC error:', msg || error.message);
    return null;
  }
  return data?.data ?? null;
}

// ── Wallet ────────────────────────────────────────────────────
export async function getWallet(userId: string): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) console.error('getWallet error:', error.message);
  return data;
}

// ── Orders ────────────────────────────────────────────────────
export async function getOrders(userId: string, limit = 20, offset = 0): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) console.error('getOrders error:', error.message);
  return Array.isArray(data) ? data : [];
}

export async function createOrder(params: {
  productType: string;
  orderType: string;
  weightGrams: number;
  spotPricePerOz: number;
}): Promise<{ orderId: string; referenceCode: string; checkoutUrl?: string; total: number; processingFee: number; subtotal: number; status?: string } | null> {
  const { data, error } = await supabase.functions.invoke<{ code: string; data: Record<string, unknown> }>(
    'create-order',
    { body: params, method: 'POST' }
  );
  if (error) {
    const msg = await error?.context?.text?.();
    console.error('createOrder error:', msg || error.message);
    return null;
  }
  return data?.data as never;
}

export async function verifyPayment(sessionId: string): Promise<{ verified: boolean; status: string; orderId?: string } | null> {
  const { data, error } = await supabase.functions.invoke<{ code: string; data: Record<string, unknown> }>(
    'verify-payment',
    { body: { sessionId }, method: 'POST' }
  );
  if (error) {
    const msg = await error?.context?.text?.();
    console.error('verifyPayment error:', msg || error.message);
    return null;
  }
  return data?.data as never;
}
