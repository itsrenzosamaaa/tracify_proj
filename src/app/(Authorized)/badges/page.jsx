'use client'

import React, { useCallback, useState, useEffect } from 'react'
import ViewBadges from '@/app/components/ViewBadges'
import { useSession } from 'next-auth/react'

const BadgesPage = () => {
  const {data: session, status} = useSession();
  const [badges, setBadges] = useState([]);
  
  const fetchBadges = useCallback(async () => {
    try {
      const response = await fetch('/api/badge');
      const data = await response.json();
      if (response.ok) {
        setBadges(data)
      } else {
        console.error(data.error)
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges])

  if (status === 'loading') {
    return null;
  
  }
  return (
    <>
      <ViewBadges session={session} badges={badges} fetchBadges={fetchBadges} />
    </>
  )
}

export default BadgesPage