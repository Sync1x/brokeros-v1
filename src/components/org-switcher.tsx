'use client';

import Image from 'next/image';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

export function OrgSwitcher() {
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' className='justify-start px-2'>
          <div
            className={`relative h-9 transition-all duration-200 ease-in-out ${
              state === 'collapsed'
                ? 'w-9 overflow-hidden'
                : 'w-28 overflow-hidden group-data-[collapsible=icon]:w-9'
            }`}
          >
            <Image
              src='/brand/broker-logo-black.svg'
              alt='Broker'
              width={112}
              height={24}
              className='broker-logo broker-logo-black absolute top-1/2 left-0 h-6 w-28 -translate-y-1/2 object-contain object-left'
            />
            <Image
              src='/brand/broker-logo-white.svg'
              alt='Broker'
              width={112}
              height={24}
              className='broker-logo broker-logo-white absolute top-1/2 left-0 h-6 w-28 -translate-y-1/2 object-contain object-left'
            />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
