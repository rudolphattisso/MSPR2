// Bloc de chargement animé (shimmer) — utilisé par les écrans loading.tsx.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-stone-200 dark:bg-slate-800 ${className}`}
    />
  )
}
