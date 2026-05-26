interface Props { count: number; max?: number }
export function Badge({ count, max = 99 }: Props) {
  if (count <= 0) return null
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center px-1 leading-none">
      {count > max ? `${max}+` : count}
    </span>
  )
}
