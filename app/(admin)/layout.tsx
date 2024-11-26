import Header from '@/components/Header'
import React, { ReactNode } from 'react'

const Layout = ({children}: {children: ReactNode}) => {
  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header/>
        {children}
    </div>
  )
}

export default Layout