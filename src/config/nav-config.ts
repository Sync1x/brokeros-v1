import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'BrokerOS',
    items: [
      {
        title: 'Command Center',
        url: '/dashboard',
        icon: 'dashboard',
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Leads',
        url: '/leads',
        icon: 'user',
        shortcut: ['l', 'd'],
        items: []
      },
      {
        title: 'Listings',
        url: '/listings',
        icon: 'home',
        shortcut: ['l', 's'],
        items: []
      },
      {
        title: 'Matches',
        url: '/matches',
        icon: 'match',
        shortcut: ['m', 'm'],
        items: []
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: 'settings',
        shortcut: ['s', 's'],
        items: []
      }
    ]
  }
];
