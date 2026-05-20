import { queryOptions } from '@tanstack/react-query';
import { getHouseProfiles, type FetchHouseProfilesOptions } from './service';

export const houseProfilesKeys = {
  all: ['brokeros', 'house-profiles'] as const
};

export const houseProfilesQueryOptions = (options?: FetchHouseProfilesOptions) =>
  queryOptions({
    queryKey: houseProfilesKeys.all,
    queryFn: () => getHouseProfiles(options),
    retry: false
  });

