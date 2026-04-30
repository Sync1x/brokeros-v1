'use client';
import { navGroups } from '@/config/nav-config';
import { brokerLeads, brokerListings, brokerMatches } from '@/constants/brokeros-mock-data';
import { KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch } from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useFilteredNavGroups } from '@/hooks/use-nav';

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const filteredGroups = useFilteredNavGroups(navGroups);

  // These action are for the navigation
  const actions = useMemo(() => {
    // Define navigateTo inside the useMemo callback to avoid dependency array issues
    const navigateTo = (url: string) => {
      router.push(url);
    };

    const allItems = filteredGroups.flatMap((group) => group.items);

    const navigationActions = allItems.flatMap((navItem) => {
      // Only include base action if the navItem has a real URL and is not just a container
      const baseAction =
        navItem.url !== '#'
          ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name: navItem.title,
              shortcut: navItem.shortcut,
              keywords: navItem.title.toLowerCase(),
              section: 'Navigation',
              subtitle: `Go to ${navItem.title}`,
              perform: () => navigateTo(navItem.url)
            }
          : null;

      // Map child items into actions
      const childActions =
        navItem.items?.map((childItem) => ({
          id: `${childItem.title.toLowerCase()}Action`,
          name: childItem.title,
          shortcut: childItem.shortcut,
          keywords: childItem.title.toLowerCase(),
          section: navItem.title,
          subtitle: `Go to ${childItem.title}`,
          perform: () => navigateTo(childItem.url)
        })) ?? [];

      // Return only valid actions (ignoring null base actions for containers)
      return baseAction ? [baseAction, ...childActions] : childActions;
    });

    const leadActions = brokerLeads.map((lead) => ({
      id: `lead-${lead.id}`,
      name: lead.name,
      keywords: `${lead.name} ${lead.desiredArea} ${lead.intent} ${lead.budget}`,
      section: 'Leads',
      subtitle: `${lead.stage} / ${lead.desiredArea}`,
      perform: () => navigateTo(`/leads/${lead.id}`)
    }));

    const listingActions = brokerListings.map((listing) => ({
      id: `listing-${listing.id}`,
      name: listing.address,
      keywords: `${listing.address} ${listing.neighborhood} ${listing.price} ${listing.status}`,
      section: 'Listings',
      subtitle: `${listing.price} / ${listing.status}`,
      perform: () => navigateTo(`/listings/${listing.id}`)
    }));

    const matchActions = brokerMatches.map((match) => {
      const lead = brokerLeads.find((item) => item.id === match.leadId)!;
      const listing = brokerListings.find((item) => item.id === match.listingId)!;
      return {
        id: `match-${match.id}`,
        name: `${lead.name} → ${listing.address}`,
        keywords: `${lead.name} ${listing.address} ${match.rationale} ${match.nextStep}`,
        section: 'Matches',
        subtitle: `${match.score}% / ${match.nextStep}`,
        perform: () => navigateTo(`/matches/${match.id}`)
      };
    });

    return [...navigationActions, ...leadActions, ...listingActions, ...matchActions];
  }, [router, filteredGroups]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/90 fixed inset-0 z-99999 p-0!'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-40! w-full max-w-[680px] -translate-y-12! overflow-hidden border shadow-none'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch
                placeholder='Search leads, listings, or matches'
                className='bg-card w-full border-none px-4 py-3 font-mono text-sm outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden'
              />
            </div>
            <div className='max-h-[420px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
