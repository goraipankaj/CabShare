import { baseApi } from './baseApi';
import type { ApiResponse, Booking, PaginationMeta } from '@/types';

export interface CreateBookingPayload {
  ride: string;
  seatsBooked: number;
  pickupPoint?: { address: string; lat: number; lng: number };
  dropPoint?: { address: string; lat: number; lng: number };
  paymentMethod?: string;
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<ApiResponse<{ booking: Booking }>, CreateBookingPayload>({
      query: (body) => ({ url: '/bookings', method: 'POST', body }),
      invalidatesTags: ['Booking', 'Ride'],
    }),
    createMockBooking: builder.mutation<
      ApiResponse<{ booking: Booking }>,
      {
        type: string;
        driverName: string;
        fare: number;
        rating: number;
        sourceCity: string;
        destCity: string;
        date: string;
      }
    >({
      query: (body) => ({ url: '/bookings/mock', method: 'POST', body }),
      invalidatesTags: ['Booking', 'Wallet'],
    }),
    getMyBookings: builder.query<ApiResponse<{ bookings: Booking[]; pagination: PaginationMeta }>, Record<string, any> | void>({
      query: (params) => ({ url: '/bookings/me', params: params || {} }),
      providesTags: ['Booking'],
    }),
    getDriverBookings: builder.query<ApiResponse<{ bookings: Booking[]; pagination: PaginationMeta }>, Record<string, any> | void>({
      query: (params) => ({ url: '/bookings/driver/me', params: params || {} }),
      providesTags: ['Booking'],
    }),
    getBookingById: builder.query<ApiResponse<{ booking: Booking }>, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Booking', id }],
    }),
    acceptBooking: builder.mutation<ApiResponse<{ booking: Booking }>, string>({
      query: (id) => ({ url: `/bookings/${id}/accept`, method: 'PATCH' }),
      invalidatesTags: ['Booking', 'Ride'],
    }),
    rejectBooking: builder.mutation<ApiResponse<{ booking: Booking }>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/bookings/${id}/reject`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ['Booking'],
    }),
    cancelBooking: builder.mutation<ApiResponse<{ booking: Booking }>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/bookings/${id}/cancel`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ['Booking', 'Ride'],
    }),
    shareTrip: builder.mutation<ApiResponse<any>, { id: string; name: string; phone: string }>({
      query: ({ id, ...body }) => ({ url: `/bookings/${id}/share-trip`, method: 'POST', body }),
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useCreateMockBookingMutation,
  useGetMyBookingsQuery,
  useGetDriverBookingsQuery,
  useGetBookingByIdQuery,
  useAcceptBookingMutation,
  useRejectBookingMutation,
  useCancelBookingMutation,
  useShareTripMutation,
} = bookingApi;
