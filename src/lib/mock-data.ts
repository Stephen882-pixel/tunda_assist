import { CommissionData, LeadStatus } from './types';

export const mockCommissionData: Record<string, CommissionData> = {
  '14_days': {
    period: '14_days',
    amount: 3500,
    currency: 'KES',
    details: [
      { date: '2024-01-10', description: 'Sales commission', amount: 1800 },
      { date: '2024-01-15', description: 'Referral bonus', amount: 1000 },
      { date: '2024-01-18', description: 'Performance bonus', amount: 700 },
    ],
  },
  '30_days': {
    period: '30_days',
    amount: 7200,
    currency: 'KES',
    details: [
      { date: '2024-01-05', description: 'Sales commission', amount: 4000 },
      { date: '2024-01-12', description: 'Referral bonus', amount: 2000 },
      { date: '2024-01-25', description: 'Performance bonus', amount: 1200 },
    ],
  },
  '60_days': {
    period: '60_days',
    amount: 15600,
    currency: 'KES',
    details: [
      { date: '2023-12-01', description: 'Sales commission', amount: 8500 },
      { date: '2023-12-15', description: 'Referral bonus', amount: 4200 },
      { date: '2024-01-10', description: 'Performance bonus', amount: 2900 },
    ],
  },
  '90_days': {
    period: '90_days',
    amount: 25800,
    currency: 'KES',
    details: [
      { date: '2023-11-05', description: 'Sales commission', amount: 14000 },
      { date: '2023-12-01', description: 'Referral bonus', amount: 7500 },
      { date: '2024-01-05', description: 'Performance bonus', amount: 4300 },
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
