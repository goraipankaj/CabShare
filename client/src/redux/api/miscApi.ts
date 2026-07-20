import { baseApi } from './baseApi';
import type { ApiResponse, Notification, PaginationMeta, Transaction, Wallet } from '@/types';

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyWallet: builder.query<ApiResponse<{ wallet: Wallet }>, void>({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),
    getMyTransactions: builder.query<ApiResponse<{ transactions: Transaction[]; pagination: PaginationMeta }>, Record<string, any> | void>({
      query: (params) => ({ url: '/wallet/transactions', params: params || {} }),
      providesTags: ['Wallet'],
    }),
    createTopupOrder: builder.mutation<ApiResponse<{ order: any; keyId: string }>, { amount: number }>({
      query: (body) => ({ url: '/payments/wallet/topup/create-order', method: 'POST', body }),
    }),
    verifyTopup: builder.mutation<ApiResponse<{ wallet: Wallet }>, any>({
      query: (body) => ({ url: '/payments/wallet/topup/verify', method: 'POST', body }),
      invalidatesTags: ['Wallet'],
    }),
  }),
});

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<ApiResponse<{ notifications: Notification[]; pagination: PaginationMeta; unreadCount: number }>, Record<string, any> | void>({
      query: (params) => ({ url: '/notifications', params: params || {} }),
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<Record<string, number>>, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),
    getRevenueAnalytics: builder.query<ApiResponse<{ revenue: any[] }>, { range?: number } | void>({
      query: (params) => ({ url: '/admin/analytics/revenue', params: params || {} }),
    }),
    getRideAnalytics: builder.query<ApiResponse<{ ridesByDay: any[]; statusBreakdown: any[] }>, { range?: number } | void>({
      query: (params) => ({ url: '/admin/analytics/rides', params: params || {} }),
    }),
    getBookingAnalytics: builder.query<ApiResponse<{ bookingsByDay: any[] }>, { range?: number } | void>({
      query: (params) => ({ url: '/admin/analytics/bookings', params: params || {} }),
    }),
    getAllUsers: builder.query<ApiResponse<{ users: any[]; pagination: PaginationMeta }>, Record<string, any> | void>({
      query: (params) => ({ url: '/users', params: params || {} }),
      providesTags: ['User'],
    }),
    updateUserStatus: builder.mutation<ApiResponse<any>, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/users/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetMyWalletQuery,
  useGetMyTransactionsQuery,
  useCreateTopupOrderMutation,
  useVerifyTopupMutation,
} = walletApi;

export const {
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;

export const {
  useGetDashboardStatsQuery,
  useGetRevenueAnalyticsQuery,
  useGetRideAnalyticsQuery,
  useGetBookingAnalyticsQuery,
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
} = adminApi;
