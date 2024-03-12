import { useEffect, useState } from 'react'
const useDebounce = (initialValue = '', delay: number) => {
  const [actualValue, setActualValue] = useState(initialValue)
  const [debounceValue, setDebounceValue] = useState(initialValue)
  useEffect(() => {
    const debounceId = setTimeout(() => setDebounceValue(actualValue), delay)
    return () => clearTimeout(debounceId)
  }, [actualValue, delay])
  return [debounceValue, setActualValue] as const
}

export default useDebounce
