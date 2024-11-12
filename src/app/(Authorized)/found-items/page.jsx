'use client'

import FoundItemsList from '@/app/components/FoundItemsList'
import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useCallback } from 'react'

const FoundItemsPage = () => {
  const [finders, setFinders] = useState([]);
  const {data: session, status} = useSession();

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch('/api/finder');
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        const filteredFinders = data.filter(item => item?.user?.school_category === session?.user?.schoolCategory)
        setFinders(filteredFinders);
      } else {
        console.error(data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [session?.user?.schoolCategory])

  useEffect(() => {
    if(status === 'authenticated'){
      fetchItems();
    }
  }, [status, fetchItems])

  if (status === 'loading') {
    return null;
  }

  return (
    <>
      <FoundItemsList finders={finders} fetchItems={fetchItems} session={session} />
    </>
  )
}

export default FoundItemsPage