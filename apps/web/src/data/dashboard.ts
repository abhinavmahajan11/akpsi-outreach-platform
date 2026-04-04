import type { DashboardStat } from '@/types';

export const dashboardStats: DashboardStat[] = [
  {
    id: 'total-orgs',
    label: 'Organizations Tracked',
    value: 54,
    change: '+6 this month',
    changeDirection: 'up',
    iconType: 'organizations',
    href: '/organizations',
  },
  {
    id: 'pending-responses',
    label: 'Pending Responses',
    value: 15,
    change: 'Awaiting reply',
    changeDirection: 'neutral',
    iconType: 'pending',
    href: '/pending',
  },
  {
    id: 'followups-due',
    label: 'Follow-Ups Due',
    value: 7,
    change: 'Needs attention',
    changeDirection: 'neutral',
    iconType: 'followups',
    href: '/follow-ups',
  },
  {
    id: 'active-partners',
    label: 'Active Partners',
    value: 10,
    change: 'Confirmed partnerships',
    changeDirection: 'up',
    iconType: 'partners',
    href: '/active-partners',
  },
];
