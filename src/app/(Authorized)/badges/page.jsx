'use client'

import React, { useState } from 'react'
import ViewBadges from '@/app/components/ViewBadges'
import { useSession } from 'next-auth/react'

const BadgesPage = () => {
  const {data: session, status} = useSession();
  const [badges, setBadges] = useState([]);

  console.log(status)
  console.log(session)
  return (
    <>
      <ViewBadges session={session} badges={badges} />
    </>
  )
}

export default BadgesPage