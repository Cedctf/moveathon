"use client"

import React, { createContext, useContext, useEffect, useRef } from "react"
import { FadeIn } from "./fade-in"

interface StaggerContextValue {
  getStaggerDelay: (index: number) => number
  registerItem: () => void
  itemCount: number
}

const StaggerContext = createContext<StaggerContextValue | null>(null)

export function useStagger() {
  const context = useContext(StaggerContext)
  if (!context) {
    throw new Error("useStagger must be used within a StaggerContainer")
  }
  return context
}

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  as?: React.ElementType
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 100,
  as: Component = "div",
}: StaggerContainerProps) {
  const [itemCount, setItemCount] = React.useState(0)

  // Use a ref to track the number of items registered
  // This avoids state updates during render
  const itemCountRef = useRef(0)

  const registerItem = React.useCallback(() => {
    itemCountRef.current += 1
    // Schedule a state update for after rendering
    setTimeout(() => {
      setItemCount(itemCountRef.current)
    }, 0)
  }, [])

  const getStaggerDelay = React.useCallback((index: number) => index * staggerDelay, [staggerDelay])

  const contextValue = React.useMemo(
    () => ({
      getStaggerDelay,
      registerItem,
      itemCount,
    }),
    [getStaggerDelay, registerItem, itemCount],
  )

  return (
    <StaggerContext.Provider value={contextValue}>
      <Component className={className}>{children}</Component>
    </StaggerContext.Provider>
  )
}

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
  threshold?: number
  once?: boolean
  index?: number
}

export function StaggerItem({
  children,
  className,
  direction = "up",
  duration = 500,
  threshold = 0.1,
  once = true,
  index: providedIndex,
}: StaggerItemProps) {
  const { getStaggerDelay, registerItem } = useStagger()
  const indexRef = useRef<number | null>(null)

  // Use an effect to register the item after mounting
  useEffect(() => {
    registerItem()
  }, [registerItem])

  // If an index is provided, use it; otherwise use the item's position
  // This allows for manual control of the stagger order
  const delay = providedIndex !== undefined ? getStaggerDelay(providedIndex) : getStaggerDelay(indexRef.current || 0)

  return (
    <FadeIn
      className={className}
      delay={delay}
      duration={duration}
      direction={direction}
      threshold={threshold}
      once={once}
    >
      {children}
    </FadeIn>
  )
}
