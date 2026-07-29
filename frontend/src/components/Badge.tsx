interface BadgeProps {
  variant: 'red' | 'yellow' | 'green' | 'delivered' | 'undelivered';
  children: string;
}

const styles: Record<string, string> = {
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  green: 'bg-green-50 text-green-600',
  delivered: 'bg-green-50 text-green-600',
  undelivered: 'bg-orange-50 text-orange-600',
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${styles[variant]}`}>
      {children}
    </span>
  );
}
