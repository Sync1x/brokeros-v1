'use client';

import { Icons } from '@/components/icons';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAssistantStore } from '../utils/store';

export function AssistantSidebarPin() {
  const isMinimized = useAssistantStore((state) => state.isMinimized);
  const openPanel = useAssistantStore((state) => state.openPanel);

  if (!isMinimized) {
    return null;
  }

  return (
    <SidebarMenu className='mt-auto gap-1.5 border-t border-sidebar-border/70 pt-3'>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip='Assistant chat'
          onClick={openPanel}
          className='text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
        >
          <Icons.sparkles />
          <span>Assistant chat</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
