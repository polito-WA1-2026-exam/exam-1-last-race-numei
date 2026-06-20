import { useEffect, useState } from 'react'

const getRemainingSeconds = (deadline) => {
  if (!deadline) return 0
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000))
}

export function useCountdown(deadline) {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!deadline) return undefined

    const interval = setInterval(() => {
      setTick((current) => current + 1)
    }, 500)

    return () => clearInterval(interval)
  }, [deadline])

  return getRemainingSeconds(deadline)
}
