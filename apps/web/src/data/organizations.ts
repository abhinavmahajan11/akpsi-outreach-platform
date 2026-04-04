import type { Organization } from '@/types';

export const organizations: Organization[] = [
  {
    id: 'google',
    name: 'Google',
    logoInitials: 'G',
    logoColor: 'bg-blue-500',
    type: 'Corporate',
    industry: 'Technology',
    location: 'Sunnyvale, CA',
    status: 'active_partner',
    tags: ['tech', 'recruiting', 'info-session'],
    committeeOwner: 'Professional Development',
    assignedMember: 'Priya Nair',
    description:
      'Technology partnership focused on campus recruiting and info sessions. Long-standing relationship with the university relations team.',
    website: 'google.com',
    lastContactedAt: '2024-03-20T14:00:00Z',
    nextStep:
      'Confirm Spring Info Session date and send logistics form to Taylor.',
    contacts: [
      {
        id: 'g-contact-1',
        name: 'Taylor Kim',
        title: 'University Relations Manager',
        email: 'tkim@google.com',
        linkedIn: 'linkedin.com/in/taylorkim',
        isPrimary: true,
      },
      {
        id: 'g-contact-2',
        name: 'Jordan Lee',
        title: 'Campus Recruiting Coordinator',
        email: 'jlee@google.com',
        isPrimary: false,
      },
    ],
    notes: [
      {
        id: 'g-note-1',
        content:
          'Taylor confirmed interest in hosting a Spring info session and a networking mixer. Prefers mid-April dates. Budget approved on their end.',
        authorName: 'Priya Nair',
        createdAt: '2024-03-20T14:30:00Z',
      },
      {
        id: 'g-note-2',
        content:
          'Google requires 60-day advance notice for room booking. Need to finalize headcount estimate before sending logistics form.',
        authorName: 'Priya Nair',
        createdAt: '2024-02-15T10:00:00Z',
      },
    ],
    reminders: [
      {
        id: 'g-rem-1',
        title: 'Send logistics form to Taylor Kim',
        dueDate: '2024-03-28T09:00:00Z',
        isCompleted: false,
        assignedTo: 'Priya Nair',
      },
    ],
    recentActivity: [
      {
        id: 'g-act-1',
        type: 'meeting',
        title: 'Intro call with Taylor Kim',
        description:
          'Discussed Spring recruiting calendar and info session format. Strong interest confirmed. Taylor will loop in Jordan for logistics.',
        date: '2024-03-20T14:00:00Z',
        authorName: 'Priya Nair',
      },
      {
        id: 'g-act-2',
        type: 'email',
        title: 'Sent follow-up with event proposal',
        description:
          'Emailed event proposal doc with three potential April dates and expected attendance of 40–60 members.',
        date: '2024-03-15T11:00:00Z',
        authorName: 'Priya Nair',
      },
      {
        id: 'g-act-3',
        type: 'status_change',
        title: 'Status updated to Active Partner',
        description:
          'Moved from In Progress after verbal confirmation of partnership intent from Taylor.',
        date: '2024-03-10T16:00:00Z',
        authorName: 'Priya Nair',
      },
    ],
  },
  {
    id: 'deloitte',
    name: 'Deloitte',
    logoInitials: 'D',
    logoColor: 'bg-emerald-600',
    type: 'Corporate',
    industry: 'Consulting',
    location: 'New York, NY',
    status: 'in_progress',
    tags: ['consulting', 'case-comp', 'recruiting'],
    committeeOwner: 'Professional Development',
    assignedMember: 'Marcus Webb',
    description:
      'Big Four consulting firm partnership targeting case competition sponsorship and campus recruiting events this Spring.',
    website: 'deloitte.com',
    lastContactedAt: '2024-03-18T11:00:00Z',
    nextStep:
      'Send updated case competition proposal with revised two-round format and prize structure by March 30.',
    contacts: [
      {
        id: 'd-contact-1',
        name: 'Morgan Chen',
        title: 'Campus Recruiting Lead',
        email: 'mchen@deloitte.com',
        linkedIn: 'linkedin.com/in/morganchen',
        isPrimary: true,
      },
    ],
    notes: [
      {
        id: 'd-note-1',
        content:
          'Morgan requested we revise the case competition format — they want a two-round structure with a Deloitte-hosted presentation in Round 2. Prize pool should be $1,500 minimum.',
        authorName: 'Marcus Webb',
        createdAt: '2024-03-18T12:00:00Z',
      },
    ],
    reminders: [
      {
        id: 'd-rem-1',
        title: 'Submit revised case comp proposal to Morgan',
        dueDate: '2024-03-30T09:00:00Z',
        isCompleted: false,
        assignedTo: 'Marcus Webb',
      },
      {
        id: 'd-rem-2',
        title: 'Follow up if no response by April 5',
        dueDate: '2024-04-05T09:00:00Z',
        isCompleted: false,
        assignedTo: 'Marcus Webb',
      },
    ],
    recentActivity: [
      {
        id: 'd-act-1',
        type: 'call',
        title: 'Call with Morgan Chen',
        description:
          'Reviewed preliminary case comp proposal. Morgan requested format revisions — two rounds with a sponsor presentation in the final.',
        date: '2024-03-18T11:00:00Z',
        authorName: 'Marcus Webb',
      },
      {
        id: 'd-act-2',
        type: 'email',
        title: 'Initial outreach sent',
        description:
          'Sent cold outreach to Deloitte campus recruiting team with AKPsi overview and Spring event calendar.',
        date: '2024-03-01T09:00:00Z',
        authorName: 'Marcus Webb',
      },
    ],
  },
  {
    id: 'goldman-sachs',
    name: 'Goldman Sachs',
    logoInitials: 'GS',
    logoColor: 'bg-slate-700',
    type: 'Sponsor',
    industry: 'Finance',
    location: 'New York, NY',
    status: 'pending_response',
    tags: ['finance', 'sponsor', 'high-priority'],
    committeeOwner: 'Fundraising',
    assignedMember: 'Aisha Thompson',
    description:
      'Pursuing a chapter sponsorship for Spring Formal and a finance workshop series. High-value target for Fundraising committee.',
    website: 'goldmansachs.com',
    lastContactedAt: '2024-03-12T10:00:00Z',
    nextStep:
      'Follow up on $2,500 sponsorship proposal — sent 10 days ago with no response. Lead with finance workshop angle.',
    contacts: [
      {
        id: 'gs-contact-1',
        name: 'Avery Brooks',
        title: 'Community Affairs Manager',
        email: 'abrooks@gs.com',
        linkedIn: 'linkedin.com/in/averybrooks',
        isPrimary: true,
      },
    ],
    notes: [
      {
        id: 'gs-note-1',
        content:
          'Avery responded positively when we mentioned the finance workshop component in our intro meeting. Recommend leading with that angle in the follow-up rather than the Formal sponsorship ask.',
        authorName: 'Aisha Thompson',
        createdAt: '2024-03-12T10:30:00Z',
      },
    ],
    reminders: [
      {
        id: 'gs-rem-1',
        title: 'Follow up on sponsorship proposal — overdue',
        dueDate: '2024-03-25T09:00:00Z',
        isCompleted: false,
        assignedTo: 'Aisha Thompson',
      },
    ],
    recentActivity: [
      {
        id: 'gs-act-1',
        type: 'email',
        title: 'Sent full sponsorship deck',
        description:
          'Delivered sponsorship proposal with three tiers — Gold ($5K), Silver ($2.5K), Bronze ($1K) — and event highlights.',
        date: '2024-03-12T10:00:00Z',
        authorName: 'Aisha Thompson',
      },
      {
        id: 'gs-act-2',
        type: 'meeting',
        title: 'Intro meeting at Goldman NYC office',
        description:
          'Met Avery and her team to introduce AKPsi and share our Spring event calendar. Strong interest in the finance workshop.',
        date: '2024-03-05T15:00:00Z',
        authorName: 'Aisha Thompson',
      },
    ],
  },
  {
    id: 'make-a-wish',
    name: 'Make-A-Wish Foundation',
    logoInitials: 'MW',
    logoColor: 'bg-violet-500',
    type: 'Nonprofit',
    industry: 'Nonprofit',
    location: 'Phoenix, AZ (National)',
    status: 'active_partner',
    tags: ['nonprofit', 'service', 'fundraising', 'community'],
    committeeOwner: 'Community Service',
    assignedMember: 'Sofia Reyes',
    description:
      'Annual community service partner. Chapter runs a fundraising drive each Spring semester. Last year raised $3,200 — goal this year is $4,500.',
    website: 'wish.org',
    lastContactedAt: '2024-03-22T09:00:00Z',
    nextStep:
      'Finalize Spring fundraiser logistics — confirm venue, set date, and open member signup.',
    contacts: [
      {
        id: 'mw-contact-1',
        name: 'Casey Rivera',
        title: 'Corporate Partnerships Coordinator',
        email: 'crivera@wish.org',
        phone: '(602) 555-0183',
        isPrimary: true,
      },
    ],
    notes: [
      {
        id: 'mw-note-1',
        content:
          'Casey confirmed they can provide Make-A-Wish branded materials for our event. Need to submit order by April 1 to receive in time.',
        authorName: 'Sofia Reyes',
        createdAt: '2024-03-22T09:30:00Z',
      },
      {
        id: 'mw-note-2',
        content:
          'Consider adding a silent auction element this year to increase fundraising ceiling. Student union venue is preferred — check availability.',
        authorName: 'Sofia Reyes',
        createdAt: '2024-02-28T11:00:00Z',
      },
    ],
    reminders: [
      {
        id: 'mw-rem-1',
        title: 'Order Make-A-Wish branded materials by April 1',
        dueDate: '2024-04-01T09:00:00Z',
        isCompleted: false,
        assignedTo: 'Sofia Reyes',
      },
      {
        id: 'mw-rem-2',
        title: 'Open member signup for Spring fundraiser',
        dueDate: '2024-03-29T09:00:00Z',
        isCompleted: false,
        assignedTo: 'Sofia Reyes',
      },
    ],
    recentActivity: [
      {
        id: 'mw-act-1',
        type: 'call',
        title: 'Spring planning call with Casey Rivera',
        description:
          'Aligned on Spring fundraiser format. Venue options discussed — student union preferred, ballroom as backup. Casey very supportive.',
        date: '2024-03-22T09:00:00Z',
        authorName: 'Sofia Reyes',
      },
      {
        id: 'mw-act-2',
        type: 'email',
        title: 'Sent event overview for review',
        description:
          'Shared draft event plan with Casey for approval. Waiting on feedback regarding silent auction logistics.',
        date: '2024-03-10T14:00:00Z',
        authorName: 'Sofia Reyes',
      },
      {
        id: 'mw-act-3',
        type: 'status_change',
        title: 'Partnership renewed for Spring semester',
        description:
          'Carried over from Fall. Casey confirmed continuation and expressed interest in increasing chapter engagement.',
        date: '2024-01-15T10:00:00Z',
        authorName: 'Sofia Reyes',
      },
    ],
  },
  {
    id: 'accenture',
    name: 'Accenture',
    logoInitials: 'AC',
    logoColor: 'bg-purple-600',
    type: 'Corporate',
    industry: 'Consulting / Technology',
    location: 'Chicago, IL',
    status: 'no_contact',
    tags: ['consulting', 'tech', 'target'],
    committeeOwner: 'Professional Development',
    assignedMember: 'Unassigned',
    description:
      'Priority outreach target for Professional Development. Strong AKPsi alumni presence at Accenture Chicago — ideal channel for a warm intro.',
    website: 'accenture.com',
    lastContactedAt: undefined,
    nextStep:
      'Reach out to AKPsi alumni at Accenture for a warm intro to campus recruiting team.',
    contacts: [],
    notes: [
      {
        id: 'ac-note-1',
        content:
          'Three AKPsi alumni currently work at Accenture Chicago — two in Strategy & Consulting, one in Technology. Worth asking them for a direct intro rather than cold outreach.',
        authorName: 'Marcus Webb',
        createdAt: '2024-03-05T09:00:00Z',
      },
    ],
    reminders: [
      {
        id: 'ac-rem-1',
        title: 'Contact AKPsi alumni at Accenture for warm intro',
        dueDate: '2024-04-01T09:00:00Z',
        isCompleted: false,
        assignedTo: 'Marcus Webb',
      },
    ],
    recentActivity: [
      {
        id: 'ac-act-1',
        type: 'note',
        title: 'Added to Professional Development target list',
        description:
          'Identified as a priority outreach target based on alumni network density and strong alignment with PD recruiting calendar.',
        date: '2024-03-05T09:00:00Z',
        authorName: 'Marcus Webb',
      },
    ],
  },
];

export function getOrganizationById(id: string): Organization | undefined {
  return organizations.find((org) => org.id === id);
}
