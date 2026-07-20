import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types';

export interface PromoCode {
  _id: string;
  code: string;
  description?: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  maxDiscount?: number;
  minFare: number;
  usageLimitPerUser: number;
  totalUsageLimit?: number;
  usedCount: number;
  validUntil: string;
  isActive: boolean;
}

export const promoCodeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPromoCodes: builder.query<ApiResponse<{ promos: PromoCode[] }>, void>({
      query: () => '/promo-codes',
      providesTags: ['PromoCode'],
    }),
    createPromoCode: builder.mutation<ApiResponse<{ promo: PromoCode }>, Partial<PromoCode>>({
      query: (body) => ({ url: '/promo-codes', method: 'POST', body }),
      invalidatesTags: ['PromoCode'],
    }),
    updatePromoCode: builder.mutation<ApiResponse<{ promo: PromoCode }>, { id: string; body: Partial<PromoCode> }>({
      query: ({ id, body }) => ({ url: `/promo-codes/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['PromoCode'],
    }),
    deletePromoCode: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/promo-codes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['PromoCode'],
    }),
  }),
});

export const {
  useGetAllPromoCodesQuery,
  useCreatePromoCodeMutation,
  useUpdatePromoCodeMutation,
  useDeletePromoCodeMutation,
} = promoCodeApi;
