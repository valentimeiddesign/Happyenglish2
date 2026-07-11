export type ProductType = "course" | "subscription";
export type BillingPeriod = "one_time" | "monthly" | "quarterly" | "yearly";
export type PurchaseStatus =
  | "pending"
  | "paid"
  | "active"
  | "expired"
  | "cancelled"
  | "refunded";
export type AccessStatus = "pending" | "granted" | "revoked" | "failed";

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  type: ProductType;
  description: string | null;
  emoji: string | null;
  level: string | null;
  age: string | null;
  lessons: number | null;
  price: number;
  currency: string;
  billing_period: BillingPeriod;
  duration_days: number | null;
  image_url: string | null;
  payment_link: string | null;
  telegram_channel_id: string | null;
  telegram_channel_title: string | null;
  telegram_invite_link: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  telegram_id: number | null;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  source: string | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  customer_id: string | null;
  product_id: string | null;
  status: PurchaseStatus;
  amount: number | null;
  currency: string;
  payment_provider: string;
  payment_order_id: string | null;
  payment_id: string | null;
  started_at: string | null;
  expires_at: string | null;
  is_recurring: boolean;
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
  customer?: Customer | null;
  product?: Product | null;
}

export interface EventRow {
  id: string;
  type: string;
  customer_id: string | null;
  purchase_id: string | null;
  product_id: string | null;
  payload: Record<string, any>;
  created_at: string;
}

export type TestimonialType = "image" | "text";

export interface Testimonial {
  id: string;
  type: TestimonialType;
  author_name: string | null;
  author_role: string | null;
  avatar_url: string | null;
  image_url: string | null;
  rating: number | null;
  text: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  pending: "Очікує оплати",
  paid: "Оплачено",
  active: "Активна",
  expired: "Завершена",
  cancelled: "Скасована",
  refunded: "Повернено",
};
