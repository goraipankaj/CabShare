import { baseApi } from './baseApi';
import type { ApiResponse, PaginationMeta, Ride } from '@/types';

export interface RideSearchParams {
  sourceLat?: number;
  sourceLng?: number;
  destLat?: number;
  destLng?: number;
  date?: string;
  vehicleType?: string;
  minSeats?: number;
  minRating?: number;
  maxPrice?: number;
  gender?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateRidePayload {
  vehicle: string;
  source: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  departureDate: string;
  departureTime: string;
  totalSeats: number;
  pricePerSeat: number;
  genderPreference?: string;
  instantBooking?: boolean;
}

export const rideApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchRides: builder.query<ApiResponse<{ rides: Ride[]; count: number }>, RideSearchParams>({
      query: (params) => ({ url: '/rides/search', params }),
      providesTags: ['Ride'],
    }),
    getRideById: builder.query<ApiResponse<{ ride: Ride }>, string>({
      query: (id) => `/rides/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Ride', id }],
    }),
    getMyRides: builder.query<ApiResponse<{ rides: Ride[]; pagination: PaginationMeta }>, Record<string, any> | void>({
      query: (params) => ({ url: '/rides/driver/me', params: params || {} }),
      providesTags: ['Ride'],
    }),
    getAllRidesAdmin: builder.query<ApiResponse<{ rides: Ride[]; pagination: PaginationMeta }>, Record<string, any> | void>({
      query: (params) => ({ url: '/rides/admin/all', params: params || {} }),
      providesTags: ['Ride'],
    }),
    createRide: builder.mutation<ApiResponse<{ ride: Ride }>, CreateRidePayload>({
      query: (body) => ({ url: '/rides', method: 'POST', body }),
      invalidatesTags: ['Ride'],
    }),
    updateRide: builder.mutation<ApiResponse<{ ride: Ride }>, { id: string; body: Partial<CreateRidePayload> }>({
      query: ({ id, body }) => ({ url: `/rides/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Ride'],
    }),
    deleteRide: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/rides/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Ride'],
    }),
    cancelRide: builder.mutation<ApiResponse<{ ride: Ride }>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/rides/${id}/cancel`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ['Ride'],
    }),
    startRide: builder.mutation<ApiResponse<{ ride: Ride }>, string>({
      query: (id) => ({ url: `/rides/${id}/start`, method: 'PATCH' }),
      invalidatesTags: ['Ride'],
    }),
    completeRide: builder.mutation<ApiResponse<{ ride: Ride }>, string>({
      query: (id) => ({ url: `/rides/${id}/complete`, method: 'PATCH' }),
      invalidatesTags: ['Ride'],
    }),
    updateRideLocation: builder.mutation<ApiResponse<any>, { id: string; lat: number; lng: number }>({
      query: ({ id, ...body }) => ({ url: `/rides/${id}/location`, method: 'PATCH', body }),
    }),
  }),
});

export const {
  useSearchRidesQuery,
  useGetRideByIdQuery,
  useGetMyRidesQuery,
  useGetAllRidesAdminQuery,
  useCreateRideMutation,
  useUpdateRideMutation,
  useDeleteRideMutation,
  useCancelRideMutation,
  useStartRideMutation,
  useCompleteRideMutation,
  useUpdateRideLocationMutation,
} = rideApi;
