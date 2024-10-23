'use client'

import ItemRetrievalList from '@/app/components/ItemRetrieval';
import React, { useState, useEffect } from 'react'

const ItemRetrievalPage = () => {
  const [items, setItems] = useState([]);

  // useEffect(() => {
  //   const fetchItems = async () => {
  //     try {
  //       const response = await fetch('/api/items');
  //       const data = await response.json();
  //       if (response.ok) {
  //         const foundItems = data.filter(item => item.isFoundItem)
  //         setItems(foundItems);
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
      <ItemRetrievalList items={items} />
    </>
  )
}

export default ItemRetrievalPage