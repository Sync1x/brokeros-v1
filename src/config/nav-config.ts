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
        title: 'Lead Memory',
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
        title: 'Agent Inbox',
        url: '/inbox',
        icon: 'inbox',
        shortcut: ['i', 'i'],
        items: []
      },
      {
        title: 'Documents',
        url: '/documents',
        icon: 'folderOpen',
        shortcut: ['d', 'o'],
        items: []
      },
      {
        title: 'Templates',
        url: '/templates',
        icon: 'post',
        shortcut: ['t', 't'],
        items: []
      },
      {
        title: 'Activity',
        url: '/activity',
        icon: 'activity',
        shortcut: ['a', 'a'],
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
