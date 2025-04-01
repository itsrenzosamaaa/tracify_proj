"use client";

import FoundItemsList from "@/app/components/FoundItemsList";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useCallback } from "react";

const FoundItemsPage = () => {
  const [finders, setFinders] = useState([]);
  const { data: session, status } = useSession();
  const [locationOptions, setLocationOptions] = useState([]);
  const [isFetchingItems, setIsFetchingItems] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsFetchingItems(true);
    try {
      const response = await fetch("/api/finder");
      const data = await response.json();
      setFinders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingItems(false);
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch("/api/location");
      const data = await response.json();

      const allRooms = data.reduce((acc, location) => {
        return [...acc, ...location.areas];
      }, []);

      setLocationOptions(allRooms);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchItems();
      fetchLocations();
    }
  }, [status, fetchItems, fetchLocations]);

  if (status === "loading") {
    return null;
  }

  return (
    <>
      <FoundItemsList
        locationOptions={locationOptions}
        finders={finders}
        fetchItems={fetchItems}
        session={session}
        isFetchingItems={isFetchingItems}
      />
    </>
  );
};

export default FoundItemsPage;
