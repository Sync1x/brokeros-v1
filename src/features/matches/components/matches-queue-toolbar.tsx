'use client';

import { RefreshMatchesButton } from './refresh-matches-button';

export function MatchesQueueToolbar() {
  return (
    <div className='flex flex-wrap items-center justify-end gap-2'>
      <RefreshMatchesButton />
    </div>
  );
}
