export interface Customer {
  id: string;
  name: string;
  phone: string;
  company: string;
  position: string;
  email: string;
  level: 'vip' | 'normal' | 'potential';
  source: string;
  status: 'active' | 'inactive' | 'pending';
  address: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
  lastFollowupAt: string;
  nextFollowupAt: string;
}

export interface Followup {
  id: string;
  customerId: string;
  customerName: string;
  type: 'call' | 'visit' | 'meeting' | 'wechat' | 'email' | 'other';
  content: string;
  result: string;
  followupAt: string;
  nextFollowupAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalFollowups: number;
  followupsToday: number;
  pendingFollowups: number;
  vipCustomers: number;
  levelDistribution: { level: string; count: number; color: string }[];
  sourceDistribution: { source: string; count: number; color: string }[];
  followupTrend: { date: string; count: number }[];
}

export const CUSTOMER_LEVELS = [
  { value: 'vip', label: 'VIP客户', color: '#ff7d00' },
  { value: 'normal', label: '普通客户', color: '#165dff' },
  { value: 'potential', label: '潜在客户', color: '#86909c' },
];

export const FOLLOWUP_TYPES = [
  { value: 'call', label: '电话' },
  { value: 'visit', label: '拜访' },
  { value: 'meeting', label: '会议' },
  { value: 'wechat', label: '微信' },
  { value: 'email', label: '邮件' },
  { value: 'other', label: '其他' },
];

export const CUSTOMER_SOURCES = [
  { value: 'recommendation', label: '转介绍' },
  { value: 'internet', label: '网络推广' },
  { value: 'exhibition', label: '展会' },
  { value: 'cold_call', label: '陌拜' },
  { value: 'social', label: '社交平台' },
  { value: 'other', label: '其他' },
];
