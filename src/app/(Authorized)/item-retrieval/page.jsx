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
      const response = await fetch('/api/match-items');
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        const matchedItems = data.filter(matchedItem => matchedItem?.finder?.item?.monitoredBy?._id === session?.user?.id)
        setItems(matchedItems);
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