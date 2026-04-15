export type MessageRole = 'user' | 'assistant';

export type Intent =
  | 'commission_summary'
  | 'commission_breakdown'
  | 'lead_status'
  | 'custom_question'
  | 'greeting'
  | 'unknown';

export type CommissionPeriod = '14_days' | '30_days' | '60_days' | '90_days' | 'custom';

/**
 * Conversation phases that drive the guided flow:
 *  greeting          → initial menu
 *  awaiting_period   → user must pick a commission period
 *  showing_summary   → summary shown, ask "want breakdown?"
 *  showing_breakdown → breakdown shown
 *  awaiting_lead_id  → user must provide lead identifier
 *  showing_lead      → lead info shown
 *  feedback          → "was this helpful?"
 *  done              → conversation ended / restart
 */
export type ConversationPhase =
  | 'greeting'
  | 'awaiting_period'
  | 'showing_summary'
  | 'showing_breakdown'
  | 'awaiting_lead_id'
  | 'showing_lead'
  | 'feedback'
  | 'done';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  options?: MessageOption[];
  metadata?: {
    intent?: Intent;
    period?: CommissionPeriod;
    leadId?: string;
  };
}

export interface MessageOption {
  id: string;
  label: string;
  value: string;
  action?: 'select_option' | 'show_options';
}

export interface IntentDetectionResult {
  intent: Intent;
  confidence: number;
  parameters: {
    period?: CommissionPeriod;
    leadId?: string;
    customInput?: string;
  };
}

// ── Commission types ──

export interface SalesCommissionDetail {
  customer: string;
  amount: number;
}

export interface TransportCommissionDetail {
  week: string;
  amount: number;
}

export interface CommissionData {
  period: CommissionPeriod;
  totalCommission: number;
  transportCommission: number;
  salesCommission: number;
  currency: string;
  salesBreakdown: SalesCommissionDetail[];
  transportBreakdown: TransportCommissionDetail[];
}

export interface CommissionDetail {
  date: string;
  description: string;
  amount: number;
}

// ── Lead types ──

export interface LeadStatus {
  leadId: string;
  leadName: string;
  status: 'active' | 'closed' | 'pending' | 'qualified';
  lastContact: string;
  conversionValue?: number;
  notes?: string;
}

// ── Chat state ──

export interface ChatState {
  messages: Message[];
  currentIntent?: Intent;
  conversationPhase: ConversationPhase;
  selectedPeriod?: CommissionPeriod;
  /** Cache last fetched commission data so breakdown doesn't re-fetch */
  lastCommissionData?: CommissionData;
}
