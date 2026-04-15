import { Intent, CommissionData, LeadStatus, MessageOption } from './types';
import { formatCurrency, getPeriodLabel } from './utils';

export class ResponseFormatter {
  formatCommissionSummary(data: CommissionData): { message: string; options: MessageOption[] } {
    const periodLabel = getPeriodLabel(data.period);
    const amount = formatCurrency(data.amount, data.currency);

    const message = `Commission amount for the ${periodLabel} is ${amount}`;

    const options: MessageOption[] = [
      {
        id: 'breakdown',
        label: 'Breakdown',
        value: 'breakdown',
        action: 'select_option',
      },
      {
        id: 'other',
        label: 'Something else',
        value: 'other',
        action: 'show_options',
      },
    ];

    return { message, options };
  }

  formatCommissionBreakdown(data: CommissionData, details?: any[]): { message: string; options: MessageOption[] } {
    const periodLabel = getPeriodLabel(data.period);
    const amount = formatCurrency(data.amount, data.currency);

    let detailsText = '';
    if (details && details.length > 0) {
      detailsText = '\n\nBreakdown:\n' + details.map(d => `• ${d.description}: ${formatCurrency(d.amount)}`).join('\n');
    }

    const message = `Commission breakdown for ${periodLabel}:\nTotal: ${amount}${detailsText}`;

    const options: MessageOption[] = [
      {
        id: 'check_commission_periods',
        label: 'Check commission periods',
        value: 'check_commission_periods',
        action: 'show_options',
      },
      {
        id: 'check_customers',
        label: 'Check customers or Leads',
        value: 'check_customers',
        action: 'show_options',
      },
      {
        id: 'calculate_commissions',
        label: 'Calculate Commissions',
        value: 'calculate_commissions',
        action: 'show_options',
      },
      {
        id: 'check_breakdown',
        label: 'Check a break down of commissions',
        value: 'check_breakdown',
        action: 'show_options',
      },
    ];

    return { message, options };
  }

  formatLeadStatus(lead: LeadStatus): { message: string; options: MessageOption[] } {
    const message = `Lead: ${lead.leadName}\nStatus: ${lead.status}\nLast Contact: ${lead.lastContact}${
      lead.conversionValue ? `\nConversion Value: ${formatCurrency(lead.conversionValue)}` : ''
    }`;

    const options: MessageOption[] = [
      {
        id: 'check_commission_periods',
        label: 'Check commission periods',
        value: 'check_commission_periods',
        action: 'show_options',
      },
      {
        id: 'check_customers',
        label: 'Check customers or Leads',
        value: 'check_customers',
        action: 'show_options',
      },
      {
        id: 'calculate_commissions',
        label: 'Calculate Commissions',
        value: 'calculate_commissions',
        action: 'show_options',
      },
      {
        id: 'check_breakdown',
        label: 'Check a break down of commissions',
        value: 'check_breakdown',
        action: 'show_options',
      },
    ];

    return { message, options };
  }

  formatGreeting(): { message: string; options: MessageOption[] } {
    const message =
      'Hi there! I\'m Tunda Assist, your AI commission assistant. What would you like to check?';

    const options: MessageOption[] = [
      {
        id: 'check_commissions',
        label: 'Check my commissions',
        value: 'commissions',
        action: 'select_option',
      },
      {
        id: 'check_leads',
        label: 'Check customer or Leads',
        value: 'leads',
        action: 'select_option',
      },
      {
        id: 'calculate',
        label: 'Calculate Commissions',
        value: 'calculate',
        action: 'select_option',
      },
    ];

    return { message, options };
  }

  formatCustomQuestion(question: string): { message: string; options: MessageOption[] } {
    const message = `I understand you're asking about: "${question}". I can help you with:\n\n1. Check commission periods\n2. Check customers or Leads\n3. Calculate Commissions\n4. Check a break down of commissions\n\nWhich would you prefer?`;

    const options: MessageOption[] = [
      {
        id: 'check_commission_periods',
        label: 'Check commission periods',
        value: 'check_commission_periods',
        action: 'show_options',
      },
      {
        id: 'check_customers',
        label: 'Check customers or Leads',
        value: 'check_customers',
        action: 'show_options',
      },
      {
        id: 'calculate_commissions',
        label: 'Calculate Commissions',
        value: 'calculate_commissions',
        action: 'show_options',
      },
      {
        id: 'check_breakdown',
        label: 'Check a break down of commissions',
        value: 'check_breakdown',
        action: 'show_options',
      },
    ];

    return { message, options };
  }

  formatUnknown(): { message: string; options: MessageOption[] } {
    const message = "I didn't quite understand that. Can you rephrase your question?";

    const options: MessageOption[] = [
      {
        id: 'commissions',
        label: 'Check my commissions',
        value: 'commissions',
        action: 'select_option',
      },
      {
        id: 'leads',
        label: 'Check customers or Leads',
        value: 'leads',
        action: 'select_option',
      },
    ];

    return { message, options };
  }
}

export const responseFormatter = new ResponseFormatter();
