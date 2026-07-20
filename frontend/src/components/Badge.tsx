interface BadgeProps {
  variant: 'red' | 'yellow' | 'green' | 'orange' | 'gray' | 'blue'
  children: React.ReactNode
}

const variants = {
  red: 'badge-light-red',
  yellow: 'badge-light-yellow',
  green: 'badge-light-green',
  orange: 'badge-light-orange',
  gray: 'badge-light-gray',
  blue: 'badge-light-blue',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-[0.8em] py-[0.45em] rounded-md text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
