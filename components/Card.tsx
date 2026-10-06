import { HTMLAttributes } from 'react'

export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-card text-card-foreground border border-border rounded-xl shadow-card transition-colors ${className}`}
      {...props}
    />
  )
}
