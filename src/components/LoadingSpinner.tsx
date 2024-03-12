import React from 'react'
import { Loader2 } from 'lucide-react'

export const Icons = {
  spinner: Loader2,
}

interface LoadingSpinnerProps {
  className?: string
  size?: number
}

const LoadingSpinner = ({ className, size }: LoadingSpinnerProps) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Icons.spinner className="animate-spin" size={size ?? 24} />
  </div>
)

export default LoadingSpinner
