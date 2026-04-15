export type MessageRole = 'user' | 'assistant';

export type Intent = 
  | 'commission_summary'
  | 'commission_breakdown'
  | 'lead_status'
  | 'custom_question'
  | 'greeting'
  | 'unknown';

export type CommissionPeriod = '14_days' | '30_days' | '60_days' | '90_days' | 'custom';

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

export interface CommissionData {
  period: CommissionPeriod;
  amount: number;
  currency: string;
  details?: CommissionDetail[];
}

export interface CommissionDetail {
  date: string;
  description: string;
  amount: number;
}

export interface LeadStatus {
  leadId: string;
  leadName: string;
  status: 'active' | 'closed' | 'pending' | 'qualified';
  lastContact: string;
  conversionValue?: number;
  notes?: string;
}

export interface ChatState {
  messages: Message[];
  currentIntent?: Intent;
  conversationPhase: 'greeting' | 'awaiting_input' | 'processing' | 'showing_results';
  selectedPeriod?: CommissionPeriod;
}
