"use client"

import Header from '@/components/Header'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from '../../firebase'
import React, { ReactNode } from 'react'

const Layout = ({children}: {children: ReactNode}) => {
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      {children}
    </div>
  )
}

export default Layout