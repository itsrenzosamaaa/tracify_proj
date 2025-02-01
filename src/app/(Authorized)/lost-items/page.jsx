"use client";

import LostItemsList from "@/app/components/LostItemsList";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useCallback } from "react";

const FoundItemsPage = () => {
  const [owners, setOwners] = useState([]);
  const { data: session, status } = useSession();
  const [locationOptions, setLocationOptions] = useState([]);

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/owner");
      const data = await response.json();
      setOwners(data);
    } catch (error) {
      console.error(error);
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
      <LostItemsList
        locationOptions={locationOptions}
        owners={owners}
        fetchItems={fetchItems}
        session={session}
      />
    </>
  );
};

export default FoundItemsPage;
