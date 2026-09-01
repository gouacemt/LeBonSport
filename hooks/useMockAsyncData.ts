import { useEffect, useState } from 'react'

export function useMockAsyncData<T>(mockData: T[]) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  return { data, loading }
}
