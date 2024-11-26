import React from 'react'
import { ModeToggle } from './ModeToggle'
import Link from 'next/link'

const Navbar = () => {
  return (
    <div className='flex mb-8 mx-auto border-b border-gray-200
     dark:border-gray-700 py-4 px-8 justify-between items-center'>
        <Link href='#'>
            Logo
        </Link>
        <ModeToggle />
    </div>
  )
}

export default Navbar