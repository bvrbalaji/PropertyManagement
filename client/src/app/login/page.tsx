'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [requiresMFA, setRequiresMFA] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Helper function to map roles to their correct dashboard routes
  const getRoleDashboardRoute = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'FLAT_OWNER':
        return '/dashboard/flat-owner';
      case 'TENANT':
        return '/dashboard/tenant';
      case 'MAINTENANCE_STAFF':
        return '/dashboard/maintenance';
      default:
        return '/dashboard';
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await authService.login(data);

      if (result.requiresMFA) {
        setRequiresMFA(true);
        toast.loading('MFA code required');
        return;
      }

      if (result.user) {
        console.log('[Login] ===== LOGIN SUCCESSFUL =====');
        console.log('[Login] User:', result.user.email, 'Role:', result.user.role);

        // Store user data in Cookies for the Header component
        // Use explicit options to ensure cookies are readable
        const cookieOptions = { path: '/', sameSite: 'lax' as const, expires: 1 };

        Cookies.set('userData', JSON.stringify(result.user), cookieOptions);
        Cookies.set('accessToken', result.accessToken, cookieOptions);
        Cookies.set('refreshToken', result.refreshToken, { ...cookieOptions, expires: 7 });
        Cookies.set('userRole', result.user.role, cookieOptions);

        console.log('[Login] ✓ Cookies set with options:', cookieOptions);
        console.log('[Login]   - accessToken:', !!Cookies.get('accessToken'));
        console.log('[Login]   - refreshToken:', !!Cookies.get('refreshToken'));
        console.log('[Login]   - userData:', !!Cookies.get('userData'));
        console.log('[Login]   - userRole:', Cookies.get('userRole'));

        // Dispatch custom event to notify Header of login
        console.log('[Login] \u2605 Dispatching userLoggedIn event...');
        window.dispatchEvent(new Event('userLoggedIn'));
        console.log('[Login] \u2713 Event dispatched');

        toast.success('Login successful!');

        // Add delay to ensure cookies are set and events are processed
        await new Promise(resolve => setTimeout(resolve, 200));

        // Redirect based on role using explicit mapping
        const role = result.user.role;
        const dashboardRoute = getRoleDashboardRoute(role);
        console.log('[Login] Redirecting:', role, '->', dashboardRoute);
        console.log('[Login] ===== END LOGIN =====');
        router.push(dashboardRoute);
      }
    } catch (error: any) {
      console.error('[Login] Error:', error);
      toast.error(error.response?.data?.error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
              Email or Phone
            </label>
            <input
              {...register('emailOrPhone')}
              type="text"
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your email or phone"
            />
            {errors.emailOrPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.emailOrPhone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {requiresMFA && (
            <div>
              <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700">
                MFA Code
              </label>
              <input
                {...register('mfaCode')}
                type="text"
                maxLength={6}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter 6-digit code"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot Password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Register
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">Session timeout: 30 minutes</p>
          </div>
        </form>
      </div>
    </div>
  );
}
