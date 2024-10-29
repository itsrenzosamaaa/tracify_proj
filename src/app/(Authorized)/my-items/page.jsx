'use client'

import MyItemsComponent from '@/app/components/MyItems'
import { useSession } from 'next-auth/react'
import React from 'react'

const MyItemsPage = () => {
  const {data: session, status} = useSession();
  return (
    <>
      <MyItemsComponent session={session} status={status} />
    </>
  )
}

export default MyItemsPage