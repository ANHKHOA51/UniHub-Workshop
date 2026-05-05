import { useQuery } from '@tanstack/react-query';
import * as workshopService from '../services/workshopService';

export const useWorkshops = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workshops'],
    queryFn: workshopService.getWorkshops,
  });

  return {
    workshops: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};

export const useWorkshopDetail = (id) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workshop', id],
    queryFn: () => workshopService.getWorkshopById(id),
    enabled: !!id,
  });

  return {
    workshop: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};

export const useRegisteredWorkshops = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['registeredWorkshops'],
    queryFn: workshopService.getRegisteredWorkshops,
  });

  return {
    workshops: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};
