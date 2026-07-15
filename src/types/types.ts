export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole = 'individual' | 'corporate';
export type KYCStatus = 'pending' | 'approved' | 'rejected';
export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'failed';
export type ProductType = 'gold_bars' | 'gold_nuggets' | 'gold_dust' | 'bulk_supply';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface KYCVerification {
  id: string;
  user_id: string;
  document_type: string;
  document_path: string | null;
  license_path: string | null;
  status: KYCStatus;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  gold_ounces: number;
  gold_grams: number;
  cash_balance_usd: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_type: OrderType;
  product_type: ProductType;
  weight_grams: number;
  weight_ounces: number;
  spot_price_per_oz: number;
  spot_price_per_gram: number;
  subtotal_usd: number;
  processing_fee_usd: number;
  total_usd: number;
  status: OrderStatus;
  reference_code: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoldPrice {
  pricePerOz: number;
  pricePerGram: number;
  currency: string;
  purity: string;
  source: string;
  timestamp: string;
  processingFeeRate: number;
}

export interface Product {
  id: ProductType;
  name: string;
  subtitle: string;
  description: string;
  purityRange: string;
  imageUrl: string;
  minWeightGrams: number;
}
