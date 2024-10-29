'use client'

import ReportItemComponent from '@/app/components/ReportItemComponent'
import React from 'react'
import { useSession } from 'next-auth/react';

const ReportFoundItemPage = () => {
    const {data: session, status} = useSession();
  return (
    <>
        <ReportItemComponent session={session} isFoundItem={true} />
    </>
  )
}

export default ReportFoundItemPage