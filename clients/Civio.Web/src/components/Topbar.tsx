import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export const TopbarSlotContext = createContext<HTMLElement | null>(null)

export function TopbarLeft({ children }: { children: ReactNode }) {
  const el = useContext(TopbarSlotContext)
  if (!el) return null
  return createPortal(children, el)
}
