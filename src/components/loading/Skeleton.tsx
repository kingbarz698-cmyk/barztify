import { cn } from '@/utils/utils'

interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-surface-container-high rounded-lg', className)} />
}

export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
      <Skeleton className="h-3 w-8 rounded" />
    </div>
  )
}

export function AlbumCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="h-3.5 w-4/5 rounded" />
      <Skeleton className="h-3 w-3/5 rounded" />
    </div>
  )
}

export function HorizontalCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-36 space-y-2">
      <Skeleton className="w-36 h-36 rounded-xl" />
      <Skeleton className="h-3.5 w-4/5 rounded" />
      <Skeleton className="h-3 w-3/5 rounded" />
    </div>
  )
}

export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-2.5 w-1/3 rounded" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3 rounded" />
          <Skeleton className="h-3.5 w-1/2 rounded" />
        </div>
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function SearchSkeleton() {
  return (
    <div className="space-y-1 px-2">
      {[...Array(6)].map((_, i) => <TrackRowSkeleton key={i} />)}
    </div>
  )
}
