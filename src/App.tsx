import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ErrorBoundary } from '@/components/modals/ErrorBoundary'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthUnauthorizedListener } from '@/components/auth/AuthUnauthorizedListener'
import { ROUTES } from '@/constants/routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 2 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
})

const HomePage           = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const SearchPage         = lazy(() => import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })))
const LibraryPage        = lazy(() => import('@/pages/LibraryPage').then((m) => ({ default: m.LibraryPage })))
const ProfilePage        = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const PlaylistDetailPage = lazy(() => import('@/pages/PlaylistDetailPage').then((m) => ({ default: m.PlaylistDetailPage })))
const NotificationsPage  = lazy(() => import('@/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const LoginPage          = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage       = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage  = lazy(() => import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
const NotFoundPage       = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {/* future flags: hilangkan React Router v7 warnings */}
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthUnauthorizedListener />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path={ROUTES.LOGIN}           element={<LoginPage />} />
                <Route path={ROUTES.REGISTER}        element={<RegisterPage />} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                <Route path={ROUTES.RESET_PASSWORD}  element={<ResetPasswordPage />} />
              </Route>

              {/* Protected app routes */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path={ROUTES.HOME}          element={<HomePage />} />
                <Route path={ROUTES.SEARCH}        element={<SearchPage />} />
                <Route path={ROUTES.LIBRARY}       element={<LibraryPage />} />
                <Route path={ROUTES.PROFILE}       element={<ProfilePage />} />
                <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
                <Route path={ROUTES.PLAYLIST}      element={<PlaylistDetailPage />} />
                <Route path={ROUTES.SETTINGS}      element={<Navigate to={ROUTES.PROFILE} replace />} />
                <Route path={ROUTES.FAVORITES}     element={<Navigate to={ROUTES.LIBRARY} replace />} />
              </Route>

              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*"    element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
