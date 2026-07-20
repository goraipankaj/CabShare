import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types';

export interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  messages: { sender: string; message: string; createdAt: string }[];
  createdAt: string;
}

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTicket: builder.mutation<ApiResponse<{ ticket: SupportTicket }>, { subject: string; category?: string; description: string }>({
      query: (body) => ({ url: '/support', method: 'POST', body }),
      invalidatesTags: ['Support'],
    }),
    getMyTickets: builder.query<ApiResponse<{ tickets: SupportTicket[] }>, void>({
      query: () => '/support/me',
      providesTags: ['Support'],
    }),
    addTicketMessage: builder.mutation<ApiResponse<{ ticket: SupportTicket }>, { id: string; message: string }>({
      query: ({ id, message }) => ({ url: `/support/${id}/messages`, method: 'POST', body: { message } }),
      invalidatesTags: ['Support'],
    }),

    // Admin
    getAllTickets: builder.query<ApiResponse<{ tickets: SupportTicket[] }>, Record<string, any> | void>({
      query: (params) => ({ url: '/support', params: params || {} }),
      providesTags: ['Support'],
    }),
    updateTicketStatus: builder.mutation<ApiResponse<{ ticket: SupportTicket }>, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/support/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Support'],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetMyTicketsQuery,
  useAddTicketMessageMutation,
  useGetAllTicketsQuery,
  useUpdateTicketStatusMutation,
} = supportApi;
