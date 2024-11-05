'use client'

import ItemRetrievalList from '@/app/components/ItemRetrieval';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useCallback } from 'react'

const ItemRetrievalPage = () => {
  const [items, setItems] = useState([]);
  const {data: session, status} = useSession();

  console.log(items)

  const fetchItems = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch('/api/found-items/matched');
      const data = await response.json();
      if (response.ok) {
        const foundItems = data.filter(item => item.monitoredBy._id === session?.user?.id)
        setItems(foundItems);
      } else {
        console.error(data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [session?.user?.id]);

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
      <ItemRetrievalList items={items} fetchItems={fetchItems} />
    </>
  )
}

export default ItemRetrievalPage