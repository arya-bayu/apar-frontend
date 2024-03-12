import { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string
  status?: string | null
}

const AuthSessionStatus = ({ status, className, ...props }: Props) => (
  <>
    {status && (
      <div
        className={`${className} text-sm font-medium text-green-600 dark:text-green-400`}
        {...props}
      >
        {status}
      </div>
    )}
  </>
)

export default AuthSessionStatus
