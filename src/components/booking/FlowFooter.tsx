import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

interface FlowFooterProps {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  backLabel?: string
  hideBack?: boolean
  /** secondary action shown between back and next (e.g. "Skip") */
  secondary?: React.ReactNode
  className?: string
}

/** Sticky action bar — pinned to the bottom on mobile, inline on larger screens. */
export function FlowFooter({
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled,
  backLabel = 'Back',
  hideBack,
  secondary,
  className,
}: FlowFooterProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 -mx-4 mt-6 flex items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:rounded-xl md:border md:bg-surface md:px-4',
        className,
      )}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {!hideBack && (
        <Button variant="ghost" onClick={onBack} disabled={!onBack}>
          <ArrowLeft className="size-4" />
          {backLabel}
        </Button>
      )}
      <div className="flex flex-1 items-center justify-end gap-2">
        {secondary}
        {onNext && (
          <Button onClick={onNext} disabled={nextDisabled} className="min-w-32">
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
