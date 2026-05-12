import { ScrollRestoration, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from '@/components/ui/toast'

/** Transition key — collapses all `/admin/*` routes into one group so the
 *  nested booking-detail sheet doesn't remount the dashboard. */
function transitionKey(pathname: string): string {
  return /^\/admin(\/|$)/.test(pathname) ? '/admin' : pathname
}

export function App() {
  const outlet = useOutlet()
  const location = useLocation()
  return (
    <>
      <ScrollRestoration />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={transitionKey(location.pathname)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
      <Toaster />
    </>
  )
}
