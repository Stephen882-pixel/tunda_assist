import { CommissionData, LeadStatus, MessageOption } from './types';
import { formatCurrency, getPeriodLabel } from './utils';

export class ResponseFormatter {
  // ── Step 2: Ask which period ──
  formatPeriodSelection(): { message: string; options: MessageOption[] } {
    const message = 'Please select a commission period:';
    const options: MessageOption[] = [
      { id: 'p_14', label: '14 days', value: '14_days' },
      { id: 'p_30', label: '30 days', value: '30_days' },
      { id: 'p_60', label: '60 days', value: '60_days' },
      { id: 'p_90', label: '90 days', value: '90_days' },
      { id: 'p_custom', label: 'Custom', value: 'custom' },
    ];
    return { message, options };
  }

  // ── Step 6: Commission summary ──
  formatCommissionSummary(data: CommissionData): { message: string; options: MessageOption[] } {
    const periodLabel = getPeriodLabel(data.period);
    const total = formatCurrency(data.totalCommission, data.currency);
    const transport = formatCurrency(data.transportCommission, data.currency);
    const sales = formatCurrency(data.salesCommission, data.currency);

    const message =
      `Commission amount for ${periodLabel} is ${total}\n` +
      `Total transport: ${transport}\n` +
      `Total sales commission: ${sales}`;

    // Step 7: ask for breakdown
    const options: MessageOption[] = [
      { id: 'breakdown_yes', label: 'Yes', value: 'breakdown_yes' },
      { id: 'breakdown_no', label: 'No', value: 'breakdown_no' },
    ];

    return { message, options };
  }

  // ── Ask "would you like a breakdown?" label ──
  formatBreakdownPrompt(): { message: string; options: MessageOption[] } {
    const message = 'Would you like a breakdown of the above?';
    const options: MessageOption[] = [
      { id: 'breakdown_yes', label: 'Yes', value: 'breakdown_yes' },
      { id: 'breakdown_no', label: 'No', value: 'breakdown_no' },
    ];
    return { message, options };
  }

  // ── Step 8: Detailed breakdown ──
  formatCommissionBreakdown(data: CommissionData): { message: string; options: MessageOption[] } {
    const periodLabel = getPeriodLabel(data.period);

    let msg = `📊 Commission Breakdown for ${periodLabel}\n\n`;

    msg += '💰 Sales Commissions:\n';
    data.salesBreakdown.forEach((s) => {
      msg += `  • ${s.customer}: ${formatCurrency(s.amount, data.currency)}\n`;
    });

    msg += '\n🚛 Transport Commissions:\n';
    data.transportBreakdown.forEach((t) => {
      msg += `  • ${t.week}: ${formatCurrency(t.amount, data.currency)}\n`;
    });

    // Step 10: Was this helpful?
    const options: MessageOption[] = [];

    return { message: msg.trim(), options };
  }

  // ── Step 10: Feedback ──
  formatFeedbackPrompt(): { message: string; options: MessageOption[] } {
    const message = 'Was this helpful?';
    const options: MessageOption[] = [
      { id: 'helpful_yes', label: 'Yes', value: 'helpful_yes' },
      { id: 'helpful_no', label: 'No', value: 'helpful_no' },
    ];
    return { message, options };
  }

  // ── Feedback received ──
  formatFeedbackThanks(positive: boolean): { message: string; options: MessageOption[] } {
    const message = positive
      ? 'Glad I could help! 😊 What else would you like to check?'
      : 'Sorry about that. Let me know how I can help better. What would you like to do?';
    const options: MessageOption[] = [
      { id: 'check_commissions', label: 'Check my commissions', value: 'commissions' },
      { id: 'check_leads', label: 'Check customer or Leads', value: 'leads' },
      { id: 'calculate', label: 'Calculate Commissions', value: 'calculate' },
    ];
    return { message, options };
  }

  // ── Lead flow: ask for identifier ──
  formatLeadIdPrompt(): { message: string; options: MessageOption[] } {
    const message = 'Please enter the customer/lead identifier (name, phone, email, or ID):';
    return { message, options: [] };
  }

  // ── Lead status result ──
  formatLeadStatus(lead: LeadStatus): { message: string; options: MessageOption[] } {
    const message =
      `👤 Lead: ${lead.leadName}\n` +
      `📌 Status: ${lead.status}\n` +
      `📅 Last Contact: ${lead.lastContact}` +
      (lead.conversionValue ? `\n💰 Conversion Value: ${formatCurrency(lead.conversionValue)}` : '') +
      (lead.notes ? `\n📝 Notes: ${lead.notes}` : '');

    const options: MessageOption[] = [];
    return { message, options };
  }

  // ── Greeting ──
  formatGreeting(): { message: string; options: MessageOption[] } {
    const message =
      "Hi there! I'm Tunda Assist, your AI commission assistant. What would you like to check?";
    const options: MessageOption[] = [
      { id: 'check_commissions', label: 'Check my commissions', value: 'commissions' },
      { id: 'check_leads', label: 'Check customer or Leads', value: 'leads' },
      { id: 'calculate', label: 'Calculate Commissions', value: 'calculate' },
    ];
    return { message, options };
  }

  // ── Unknown ──
  formatUnknown(): { message: string; options: MessageOption[] } {
    const message = "I didn't quite understand that. What would you like to do?";
    const options: MessageOption[] = [
      { id: 'check_commissions', label: 'Check my commissions', value: 'commissions' },
      { id: 'check_leads', label: 'Check customer or Leads', value: 'leads' },
      { id: 'calculate', label: 'Calculate Commissions', value: 'calculate' },
    ];
    return { message, options };
  }
}

export const responseFormatter = new ResponseFormatter();
