'use client'

import LostItemsList from '@/app/components/LostItemsList';
import React, { useState, useEffect } from 'react'

const FoundItemsPage = () => {
  const [items, setItems] = useState([]);
  console.log(items)

  // useEffect(() => {
  //   const fetchItems = async () => {
  //     try {
  //       const response = await fetch('/api/items');
  //       const data = await response.json();
  //       if (response.ok) {
  //           const lostItems = data.filter(item => !item.isFoundItem)
  //           setItems(lostItems);
  //       } else {
  //         console.error(data);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  //   fetchItems();
  // }, [])

  return (
    <>
      <LostItemsList items={items} />
    </>
  )
}

export default FoundItemsPage