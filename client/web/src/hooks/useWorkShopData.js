import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useRegisterWorkshop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workshopId) => workshopService.registerWorkshop(workshopId),
    onSuccess: (_, workshopId) => {
      queryClient.invalidateQueries({ queryKey: ['registeredWorkshops'] });
      queryClient.invalidateQueries({ queryKey: ['workshop', workshopId] });
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
    },
  });
};

export const useRegisterPaidWorkshop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workshopId, idempotencyKey }) => workshopService.registerPaidWorkshop(workshopId, idempotencyKey),
    onSuccess: (_, { workshopId }) => {
      queryClient.invalidateQueries({ queryKey: ['registeredWorkshops'] });
      queryClient.invalidateQueries({ queryKey: ['workshop', workshopId] });
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
    },
  });
};

export const useUpdateWorkshop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => workshopService.updateWorkshop(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
      queryClient.invalidateQueries({ queryKey: ['workshop', id] });
    },
  });
};

export const useDeleteWorkshop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => workshopService.deleteWorkshop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
    },
  });
};

export const useCreateWorkshop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => workshopService.createWorkshop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
    },
  });
};

export const useWorkshopRegistrations = (id) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workshopRegistrations', id],
    queryFn: () => workshopService.getWorkshopRegistrations(id),
    enabled: !!id,
  });

  return {
    registrations: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};
