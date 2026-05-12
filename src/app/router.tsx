import { createBrowserRouter, Navigate } from 'react-router-dom'
import { App } from './App'
import { CustomerLayout } from './CustomerLayout'
import { RequireAuth } from './RequireAuth'
import NotFound from '@/routes/admin/NotFound'

// Lazily code-split every route so the initial bundle stays small.
const lazyDefault = (p: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await p()).default })

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <NotFound title="Something went wrong" />,
    children: [
      {
        element: <CustomerLayout />,
        children: [
          { index: true, element: <Navigate to="/reserve" replace /> },
          { path: 'reserve', lazy: lazyDefault(() => import('@/routes/customer/ReservationFlow')) },
          { path: 'walk-in', lazy: lazyDefault(() => import('@/routes/customer/WalkInFlow')) },
          { path: 'waitlist', lazy: lazyDefault(() => import('@/routes/customer/WaitlistFlow')) },
          { path: 'confirmation/:bookingId', lazy: lazyDefault(() => import('@/routes/customer/Confirmation')) },
        ],
      },
      { path: 'admin/login', lazy: lazyDefault(() => import('@/routes/admin/Login')) },
      {
        path: 'admin',
        element: <RequireAuth />,
        children: [
          {
            lazy: async () => ({ Component: (await import('@/components/layout/AdminShell')).AdminShell }),
            children: [
              { index: true, element: <Navigate to="/admin/bookings" replace /> },
              {
                path: 'bookings',
                lazy: lazyDefault(() => import('@/routes/admin/Bookings')),
                children: [{ path: ':id', lazy: lazyDefault(() => import('@/routes/admin/BookingDetailRoute')) }],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
