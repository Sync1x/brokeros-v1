import { ListingsWorkspace } from '@/features/listings/components/listings-workspace';
import { houseProfilesQueryOptions } from '@/features/listings/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { headers } from 'next/headers';

export default async function ListingsPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http';
  const origin = host ? `${protocol}://${host}` : undefined;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    houseProfilesQueryOptions({
      origin,
      headers: {
        cookie: requestHeaders.get('cookie') ?? ''
      }
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListingsWorkspace />
    </HydrationBoundary>
  );
}
