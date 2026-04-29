'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/leads': [{ title: 'Leads', link: '/leads' }],
  '/listings': [{ title: 'Listings', link: '/listings' }],
  '/matches': [{ title: 'Matches', link: '/matches' }],
  '/inbox': [{ title: 'Inbox', link: '/inbox' }],
  '/documents': [{ title: 'Documents', link: '/documents' }],
  '/templates': [{ title: 'Templates', link: '/templates' }],
  '/activity': [{ title: 'Activity', link: '/activity' }],
  '/settings': [{ title: 'Settings', link: '/settings' }]
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
