'use client'

import FoundItemsList from '@/app/components/FoundItemsList'
import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useCallback } from 'react'

const FoundItemsPage = () => {
  const [items, setItems] = useState([]);
  const {data: session, status} = useSession();

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch('/api/found-items');
      const data = await response.json();
      if (response.ok) {
        const filteredFoundItems = data.filter(item => item?.finder?.school_category === session?.user?.schoolCategory)
        setItems(filteredFoundItems);
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

  return (
    <>
      <FoundItemsList items={items} fetchItems={fetchItems} />
    </>
  )
}

export default FoundItemsPage