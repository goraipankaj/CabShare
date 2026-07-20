import { baseApi } from './baseApi';
import type { ApiResponse, User } from '@/types';

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      ApiResponse<AuthResponse>,
      { name: string; email: string; phone: string; password: string; role?: 'passenger' | 'driver' }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation<ApiResponse<AuthResponse>, { email: string; password: string; rememberMe?: boolean }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    adminLogin: builder.mutation<ApiResponse<AuthResponse>, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/admin/login', method: 'POST', body }),
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    getMe: builder.query<ApiResponse<{ user: User }>, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    sendOtp: builder.mutation<ApiResponse<null>, { phone: string }>({
      query: (body) => ({ url: '/auth/send-otp', method: 'POST', body }),
    }),
    verifyOtp: builder.mutation<ApiResponse<null>, { phone: string; otp: string }>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<ApiResponse<null>, { token: string; email: string; password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    googleLogin: builder.mutation<ApiResponse<AuthResponse>, { googleId: string; email: string; name: string; avatar?: string }>({
      query: (body) => ({ url: '/auth/google', method: 'POST', body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useAdminLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGoogleLoginMutation,
} = authApi;
