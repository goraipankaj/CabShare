import { baseApi } from './baseApi';
import type { ApiResponse, Driver, PaginationMeta, Vehicle } from '@/types';

export const driverApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerDriver: builder.mutation<ApiResponse<{ driver: Driver }>, { licenseNumber: string; licenseExpiry: string; aadhaarNumber?: string }>({
      query: (body) => ({ url: '/drivers/register', method: 'POST', body }),
      invalidatesTags: ['Driver', 'User'],
    }),
    getMyDriverProfile: builder.query<ApiResponse<{ driver: Driver }>, void>({
      query: () => '/drivers/me',
      providesTags: ['Driver'],
    }),
    toggleAvailability: builder.mutation<ApiResponse<{ isAvailable: boolean }>, { isAvailable?: boolean; lat?: number; lng?: number }>({
      query: (body) => ({ url: '/drivers/availability', method: 'PATCH', body }),
      invalidatesTags: ['Driver'],
    }),
    getEarnings: builder.query<ApiResponse<{ totalEarnings: number; totalTrips: number; totalDistanceKm: number; completedRides: number; ratingAverage: number }>, void>({
      query: () => '/drivers/earnings',
    }),
    addVehicle: builder.mutation<
      ApiResponse<{ vehicle: Vehicle }>,
      { type: string; brand: string; model: string; color: string; registrationNumber: string; seatingCapacity: number; year?: number }
    >({
      query: (body) => ({ url: '/drivers/vehicles', method: 'POST', body }),
      invalidatesTags: ['Vehicle'],
    }),
    getMyVehicles: builder.query<ApiResponse<{ vehicles: Vehicle[] }>, void>({
      query: () => '/drivers/vehicles/me',
      providesTags: ['Vehicle'],
    }),

    // Admin
    getAllDrivers: builder.query<ApiResponse<{ drivers: Driver[]; pagination: PaginationMeta }>, Record<string, any> | void>({
      query: (params) => ({ url: '/drivers', params: params || {} }),
      providesTags: ['Driver'],
    }),
    verifyDriver: builder.mutation<ApiResponse<{ driver: Driver }>, { id: string; status: 'approved' | 'rejected'; note?: string }>({
      query: ({ id, ...body }) => ({ url: `/drivers/${id}/verify`, method: 'PATCH', body }),
      invalidatesTags: ['Driver'],
    }),
    verifyVehicle: builder.mutation<ApiResponse<{ vehicle: Vehicle }>, { id: string; status: 'approved' | 'rejected'; note?: string }>({
      query: ({ id, ...body }) => ({ url: `/drivers/vehicles/${id}/verify`, method: 'PATCH', body }),
      invalidatesTags: ['Vehicle'],
    }),
  }),
});

export const {
  useRegisterDriverMutation,
  useGetMyDriverProfileQuery,
  useToggleAvailabilityMutation,
  useGetEarningsQuery,
  useAddVehicleMutation,
  useGetMyVehiclesQuery,
  useGetAllDriversQuery,
  useVerifyDriverMutation,
  useVerifyVehicleMutation,
} = driverApi;
