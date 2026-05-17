'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

interface RefreshMatchesResponse {
  buyersConsidered: number;
  housesConsidered: number;
  pairsScored: number;
  matchesWritten: number;
  rejectedPairs: number;
  upsertRows: number;
}

export function RefreshMatchesButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshMatches() {
    setIsRefreshing(true);

    try {
      const response = await fetch('/api/brokeros/matches/refresh', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const result = (await response.json()) as RefreshMatchesResponse;
      toast.success(
        `Refreshed ${result.matchesWritten} matches. Rejected ${result.rejectedPairs} weak pairings.`
      );
      router.refresh();
    } catch {
      toast.error('Unable to refresh matches');
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <Button type='button' variant='outline' isLoading={isRefreshing} onClick={refreshMatches}>
      <Icons.refresh data-icon='inline-start' />
      Refresh Matches
    </Button>
  );
}
