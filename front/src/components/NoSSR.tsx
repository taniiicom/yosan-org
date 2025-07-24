'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

interface NoSSRProps {
  children: ReactNode
  fallback?: ReactNode
}

const NoSSRWrapper = ({ children, fallback }: NoSSRProps) => {
  return <>{children}</>
}

const NoSSR = dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
  loading: () => <>{null}</>
})

export default function NoSSRComponent({ children, fallback }: NoSSRProps) {
  return <NoSSR fallback={fallback}>{children}</NoSSR>
}