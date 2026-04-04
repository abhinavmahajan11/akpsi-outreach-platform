export type OutreachStatus =
  | 'active_partner'
  | 'in_progress'
  | 'pending_response'
  | 'no_contact'
  | 'declined'
  | 'completed';

export type CommitteeType =
  | 'Professional Development'
  | 'Community Service'
  | 'Brotherhood'
  | 'Fundraising'
  | 'Marketing'
  | 'Alumni Relations';

export type OrganizationType =
  | 'Corporate'
  | 'Nonprofit'
  | 'Sponsor'
  | 'Service Partner'
  | 'Event Host'
  | 'Fundraiser Collaborator';

export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  linkedIn?: string;
  isPrimary: boolean;
}

export interface Note {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  assignedTo: string;
}

export interface ActivityItem {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'status_change' | 'follow_up';
  title: string;
  description: string;
  date: string;
  authorName: string;
}

export interface Organization {
  id: string;
  name: string;
  logoInitials: string;
  logoColor: string;
  type: OrganizationType;
  industry: string;
  location: string;
  status: OutreachStatus;
  tags: string[];
  committeeOwner: CommitteeType;
  assignedMember: string;
  contacts: Contact[];
  notes: Note[];
  reminders: Reminder[];
  recentActivity: ActivityItem[];
  nextStep: string;
  website?: string;
  description: string;
  lastContactedAt?: string;
}

export type StatIconType = 'organizations' | 'pending' | 'followups' | 'partners';

export interface DashboardStat {
  id: string;
  label: string;
  value: number | string;
  change?: string;
  changeDirection?: 'up' | 'down' | 'neutral';
  description?: string;
  iconType: StatIconType;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
}

export type NavIconType =
  | 'dashboard'
  | 'organizations'
  | 'contacts'
  | 'templates'
  | 'analytics'
  | 'handoff';

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconType;
}
