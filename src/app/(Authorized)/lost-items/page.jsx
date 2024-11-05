'use client'

import LostItemsList from '@/app/components/LostItemsList';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useCallback } from 'react'

const FoundItemsPage = () => {
  const [items, setItems] = useState([]);
  const {data: session, status} = useSession();

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch('/api/lost-items');
      const data = await response.json();
      if (response.ok) {
        const filteredLostItems = data.filter(item => item?.owner?.school_category === session?.user?.schoolCategory)
        setItems(filteredLostItems);
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
      <LostItemsList items={items} fetchItems={fetchItems} />
    </>
  )
}

export default FoundItemsPage