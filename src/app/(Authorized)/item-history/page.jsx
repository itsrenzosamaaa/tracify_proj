'use client';

import ItemHistory from '@/app/components/ItemHistory';
import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const ItemHistoryPage = () => {
  const [items, setItems] = useState([]);
  const { data: session, status } = useSession();

  const fetchItems = useCallback(async () => {
    try {
      const foundResponse = await fetch('/api/found-items');
      const foundData = await foundResponse.json();
      const filteredFoundItems = foundData
        .filter(item => item?.finder?.school_category === session?.user?.schoolCategory && (item?.status === 'Resolved' || item?.status === 'Invalid' || item?.status === 'Canceled'))
        .map(item => ({ ...item, itemType: 'Found Items' }));

      const lostResponse = await fetch('/api/lost-items');
      const lostData = await lostResponse.json();
      const filteredLostItems = lostData
        .filter(item => item?.owner?.school_category === session?.user?.schoolCategory && (item?.status === 'Claimed' || item?.status === 'Invalid' || item?.status === 'Canceled'))
        .map(item => ({ ...item, itemType: 'Lost Items' }));

      const combinedItems = [...filteredFoundItems, ...filteredLostItems];
      setItems(combinedItems);
    } catch (error) {
      console.error(error);
    }
  }, [session?.user?.schoolCategory]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchItems();
    }
  }, [status, fetchItems]);

  if (status === 'loading') {
    return null;
  }

  return (
    <>
      <ItemHistory items={items} />
    </>
  );
};

export default ItemHistoryPage;
