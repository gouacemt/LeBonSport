import { useRef } from 'react'

export function useInstanceId() {
  return useRef(Math.random().toString(36).slice(2)).current
}
