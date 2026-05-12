import { Link, useRouteError } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound({ title }: { title?: string } = {}) {
  // useRouteError only has a value when this is rendered as an errorElement
  const error = useRouteError() as unknown
  const heading = title ?? 'Page not found'
  const detail =
    title && error
      ? error instanceof Error
        ? error.message
        : 'An unexpected error occurred.'
      : 'The page you’re looking for doesn’t exist or has moved.'

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground">
        <Compass className="size-7" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold">{heading}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{detail}</p>
      <Button asChild className="mt-6">
        <Link to="/">Back to start</Link>
      </Button>
    </div>
  )
}
