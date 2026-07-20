import type { ReactNode } from 'react'

interface MainCardProps {
  title?: string | ReactNode
  children: ReactNode
  className?: string
  bodyClass?: string
  headerClass?: string
}

export default function MainCard({ title, children, className = '', bodyClass = '', headerClass = '' }: MainCardProps) {
  return (
    <div className={`pc-card ${className}`}>
      {title && (
        <div className={`pc-card-header pb-[25px] ${headerClass}`}>
          {typeof title === 'string' ? <h5>{title}</h5> : title}
        </div>
      )}
      <div className={`pc-card-body ${bodyClass}`}>
        {children}
      </div>
    </div>
  )
}
