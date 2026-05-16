'use client';
import { navGroups } from '@/config/nav-config';
import type { BrokerReadModel } from '@/features/brokeros/api/read-model-types';
import { KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch } from 'kbar';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useFilteredNavGroups } from '@/hooks/use-nav';

type LocalSearchLead = {
  id: string;
  type: 'buyer' | 'seller';
  name: string;
  area: string;
  status: string;
  email: string;
  phone: string;
};

const LOCAL_LEADS_EVENT = 'brokeros:local-leads-updated';
const EMPTY_READ_MODEL: BrokerReadModel = {
  leads: [],
  listings: [],
  matches: []
};

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const filteredGroups = useFilteredNavGroups(navGroups);
  const [localLeads, setLocalLeads] = useState<LocalSearchLead[]>([]);
  const [readModel, setReadModel] = useState<BrokerReadModel>(EMPTY_READ_MODEL);
  const [hasLoadedReadModel, setHasLoadedReadModel] = useState(false);

  useEffect(() => {
    function handleLocalLeads(event: Event) {
      const customEvent = event as CustomEvent<LocalSearchLead[]>;
      setLocalLeads((current) => {
        const next = new Map(current.map((lead) => [lead.id, lead]));
        for (const lead of customEvent.detail ?? []) {
          next.set(lead.id, lead);
        }
        return [...next.values()];
      });
    }

    window.addEventListener(LOCAL_LEADS_EVENT, handleLocalLeads);
    return () => window.removeEventListener(LOCAL_LEADS_EVENT, handleLocalLeads);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBrokerData() {
      try {
        const response = await fetch('/api/brokeros/read-model');
        if (!response.ok) throw new Error('Unable to load BrokerOS search data');
        const data = (await response.json()) as BrokerReadModel;
        if (isMounted) {
          setReadModel(data);
        }
      } catch {
        if (isMounted) {
          setReadModel(EMPTY_READ_MODEL);
        }
      } finally {
        if (isMounted) {
          setHasLoadedReadModel(true);
        }
      }
    }

    void loadBrokerData();
    return () => {
      isMounted = false;
    };
  }, []);

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

    const leadActions = readModel.leads.map((lead) => ({
      id: `lead-${lead.id}`,
      name: lead.name,
      keywords: `${lead.name} ${lead.desiredArea} ${lead.intent} ${lead.budget}`,
      section: 'Leads',
      subtitle: `${lead.stage} / ${lead.desiredArea}`,
      perform: () => navigateTo(`/leads/${lead.id}`)
    }));

    const localLeadActions = localLeads.map((lead) => ({
      id: `local-lead-${lead.id}`,
      name: lead.name,
      keywords: `${lead.name} ${lead.type} ${lead.area} ${lead.status} ${lead.email} ${lead.phone}`,
      section: 'Leads',
      subtitle: `${lead.type} / ${lead.area}`,
      perform: () => navigateTo('/leads')
    }));

    const listingActions = readModel.listings.map((listing) => ({
      id: `listing-${listing.id}`,
      name: listing.address,
      keywords: `${listing.address} ${listing.neighborhood} ${listing.price} ${listing.status}`,
      section: 'Listings',
      subtitle: `${listing.price} / ${listing.status}`,
      perform: () => navigateTo(`/listings/${listing.id}`)
    }));

    const matchActions = readModel.matches.flatMap((match) => {
      const lead = match.buyerLead ?? readModel.leads.find((item) => item.id === match.leadId);
      const listing =
        match.houseProfile ?? readModel.listings.find((item) => item.id === match.listingId);
      if (!lead || !listing) return [];
      return {
        id: `match-${match.id}`,
        name: `${lead.name} -> ${listing.address}`,
        keywords: `${lead.name} ${listing.address} ${match.rationale} ${match.nextStep}`,
        section: 'Matches',
        subtitle: `${match.score}% / ${match.nextStep}`,
        perform: () => navigateTo(`/matches/${match.id}`)
      };
    });

    const hasBrokerData =
      readModel.leads.length > 0 || readModel.listings.length > 0 || readModel.matches.length > 0;
    const emptyDataAction =
      hasLoadedReadModel && !hasBrokerData
        ? [
            {
              id: 'brokeros-empty-data',
              name: 'No BrokerOS records found',
              keywords: 'empty brokeros supabase records',
              section: 'BrokerOS',
              subtitle: 'Supabase returned no leads, listings, or matches',
              perform: () => navigateTo('/dashboard')
            }
          ]
        : [];

    return [
      ...navigationActions,
      ...leadActions,
      ...localLeadActions,
      ...listingActions,
      ...matchActions,
      ...emptyDataAction
    ];
  }, [router, filteredGroups, localLeads, readModel, hasLoadedReadModel]);

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
                placeholder='Search anything in BrokerOS'
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
