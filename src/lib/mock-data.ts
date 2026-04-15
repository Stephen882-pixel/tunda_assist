import { CommissionData, LeadStatus } from './types';

export const mockCommissionData: Record<string, CommissionData> = {
  '14_days': {
    period: '14_days',
    totalCommission: 3500,
    transportCommission: 1500,
    salesCommission: 2000,
    currency: 'KES',
    salesBreakdown: [
      { customer: 'Jack Odhiambo', amount: 800 },
      { customer: 'Maina Kamau', amount: 650 },
      { customer: 'Sarah Wanjiku', amount: 550 },
    ],
    transportBreakdown: [
      { week: 'Week 1 (Jan 6 – Jan 12)', amount: 700 },
      { week: 'Week 2 (Jan 13 – Jan 19)', amount: 800 },
    ],
  },
  '30_days': {
    period: '30_days',
    totalCommission: 7200,
    transportCommission: 3200,
    salesCommission: 4000,
    currency: 'KES',
    salesBreakdown: [
      { customer: 'Jack Odhiambo', amount: 1200 },
      { customer: 'Maina Kamau', amount: 1000 },
      { customer: 'Sarah Wanjiku', amount: 900 },
      { customer: 'Peter Njoroge', amount: 900 },
    ],
    transportBreakdown: [
      { week: 'Week 1 (Dec 25 – Dec 31)', amount: 750 },
      { week: 'Week 2 (Jan 1 – Jan 7)', amount: 800 },
      { week: 'Week 3 (Jan 8 – Jan 14)', amount: 850 },
      { week: 'Week 4 (Jan 15 – Jan 21)', amount: 800 },
    ],
  },
  '60_days': {
    period: '60_days',
    totalCommission: 15600,
    transportCommission: 6600,
    salesCommission: 9000,
    currency: 'KES',
    salesBreakdown: [
      { customer: 'Jack Odhiambo', amount: 2800 },
      { customer: 'Maina Kamau', amount: 2200 },
      { customer: 'Sarah Wanjiku', amount: 1800 },
      { customer: 'Peter Njoroge', amount: 1200 },
      { customer: 'Grace Akinyi', amount: 1000 },
    ],
    transportBreakdown: [
      { week: 'Week 1–2', amount: 1600 },
      { week: 'Week 3–4', amount: 1700 },
      { week: 'Week 5–6', amount: 1650 },
      { week: 'Week 7–8', amount: 1650 },
    ],
  },
  '90_days': {
    period: '90_days',
    totalCommission: 25800,
    transportCommission: 10800,
    salesCommission: 15000,
    currency: 'KES',
    salesBreakdown: [
      { customer: 'Jack Odhiambo', amount: 4500 },
      { customer: 'Maina Kamau', amount: 3800 },
      { customer: 'Sarah Wanjiku', amount: 3000 },
      { customer: 'Peter Njoroge', amount: 2200 },
      { customer: 'Grace Akinyi', amount: 1500 },
    ],
    transportBreakdown: [
      { week: 'Month 1', amount: 3500 },
      { week: 'Month 2', amount: 3600 },
      { week: 'Month 3', amount: 3700 },
    ],
  },
};

export const mockLeads: Record<string, LeadStatus> = {
  john: {
    leadId: 'lead-john-001',
    leadName: 'John Doe',
    status: 'active',
    lastContact: '2024-01-18 02:30 PM',
    conversionValue: 15000,
    notes: 'High-value prospect, interested in premium plan',
  },
  smith: {
    leadId: 'lead-smith-002',
    leadName: 'Sarah Smith',
    status: 'qualified',
    lastContact: '2024-01-17 10:15 AM',
    conversionValue: 8500,
    notes: 'Ready for proposal',
  },
  johnson: {
    leadId: 'lead-johnson-003',
    leadName: 'Mike Johnson',
    status: 'pending',
    lastContact: '2024-01-10 03:45 PM',
    conversionValue: 5000,
    notes: 'Waiting for budget approval',
  },
  williams: {
    leadId: 'lead-williams-004',
    leadName: 'Emma Williams',
    status: 'closed',
    lastContact: '2024-01-08 11:20 AM',
    conversionValue: 25000,
    notes: 'Successfully closed deal',
  },
  default: {
    leadId: 'lead-unknown-001',
    leadName: 'Unknown Lead',
    status: 'pending',
    lastContact: 'Not contacted',
    notes: 'Lead not found in system',
  },
};

export const commissionPeriodOptions = [
  { id: '1', label: '14 days', value: '14_days' },
  { id: '2', label: '30 days', value: '30_days' },
  { id: '3', label: '60 days', value: '60_days' },
  { id: '4', label: '90 days', value: '90_days' },
  { id: '5', label: 'Custom', value: 'custom' },
];

export const mainMenuOptions = [
  {
    id: 'check_commissions',
    label: 'Check my commissions',
    value: 'commissions',
  },
  {
    id: 'check_leads',
    label: 'Check customer or Leads',
    value: 'leads',
  },
  {
    id: 'calculate',
    label: 'Calculate Commissions',
    value: 'calculate',
  },
];
