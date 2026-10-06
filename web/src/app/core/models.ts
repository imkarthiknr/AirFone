/** Types mirroring the AirFone API (api/app/schemas.py). */

export type PlanCategory = 'prepaid' | 'postpaid' | 'broadband';
export const PLAN_CATEGORIES: PlanCategory[] = ['prepaid', 'postpaid', 'broadband'];
export type Role = 'customer' | 'admin';
export type Satisfaction = 'excellent' | 'good' | 'average' | 'bad';

export interface Plan {
  id: number;
  category: PlanCategory;
  name: string;
  price: number;
  validity_days: number;
  data: string;
  calls: string | null;
  sms: string | null;
  speed: string | null;
  post_fup_speed: string | null;
  is_popular: boolean;
}

export interface Customer {
  id: number;
  mobile_no: string;
  name: string;
  dob: string;
  email: string;
  occupation: string;
  aadhaar_masked: string;
  house_no: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  connection_type: PlanCategory;
  is_active: boolean;
  created_at: string;
}

export interface RegisterRequest {
  name: string;
  dob: string;
  email: string;
  password: string;
  occupation: string;
  aadhaar: string;
  house_no: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  connection_type: PlanCategory;
}

export interface Payment {
  reference: string;
  amount: number;
  card_brand: string;
  card_last4: string;
  created_at: string;
}

export interface Bill {
  id: number;
  invoice_no: string;
  category: PlanCategory;
  plan_name: string;
  benefits: string;
  amount: number;
  start_date: string;
  end_date: string;
  created_at: string;
  payment: Payment | null;
}

export interface CardDetails {
  cardholder_name: string;
  number: string;
  exp_month: number;
  exp_year: number;
  cvv: string;
}

export interface AccountSummary {
  customer: Customer;
  active_bill: Bill | null;
  days_left: number | null;
  total_spent: number;
  recharge_count: number;
  open_tickets: number;
}

export interface Ticket {
  id: number;
  ticket_no: string;
  description: string;
  assigned_to: string;
  status: 'open' | 'resolved';
  response: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface AdminTicket extends Ticket {
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
}

export interface Feedback {
  id: number;
  name: string;
  email: string;
  satisfaction: Satisfaction;
  comments: string | null;
  created_at: string;
}

export interface Notification {
  id: number;
  channel: 'email' | 'sms';
  recipient: string;
  subject: string;
  body: string;
  delivered: boolean;
  created_at: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface AdminStats {
  customers_by_type: Record<PlanCategory, number>;
  open_tickets: number;
  revenue_this_month: number;
  recharges_this_month: number;
  feedback_breakdown: Partial<Record<Satisfaction, number>>;
}

export interface BillingReportRow {
  invoice_no: string;
  mobile_no: string;
  customer_name: string;
  email: string;
  category: PlanCategory;
  plan_name: string;
  amount: number;
  start_date: string;
}

export interface BillingReport {
  start: string;
  end: string;
  category: PlanCategory | null;
  rows: BillingReportRow[];
  total_amount: number;
  count: number;
}
