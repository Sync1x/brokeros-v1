'use client';

import { useClerk } from '@clerk/nextjs';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export function SettingsOrganizationsButton() {
  const clerk = useClerk();

  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      onClick={() => clerk.openOrganizationProfile()}
    >
      <Icons.teams className='size-4' />
      Organizations
    </Button>
  );
}
