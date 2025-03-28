"use client";

import LostItemsList from "@/app/components/LostItemsList";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useCallback } from "react";

const FoundItemsPage = () => {
  const [owners, setOwners] = useState([]);
  const { data: session, status } = useSession();
  const [locationOptions, setLocationOptions] = useState([]);
  const [matches, setMatches] = useState([]);

  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch("/api/match-items");
      const data = await response.json();
      const filteredMatches = data.filter(
        (match) => match?.request_status === "Pending"
      );
      setMatches(filteredMatches);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/owner");
      const data = await response.json();

      const matchedLostItemIds = matches
        .map((match) => match?.owner?.item?._id)
        .filter(Boolean); // remove undefined/null

      const filteredItems = data.filter(
        (lostItem) =>
          !["Unclaimed", "Claimed"].includes(lostItem?.item?.status) &&
          !matchedLostItemIds.includes(lostItem?.item?._id)
      );
      setOwners(filteredItems);
    } catch (error) {
      console.error(error);
    }
  }, [matches]);

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
    const loadData = async () => {
      if (status === "authenticated") {
        await fetchMatches(); // Fetch matches first
        await fetchItems(); // Then fetch items with matches available
        await fetchLocations();
      }
    };

    loadData();
  }, [status, fetchMatches, fetchItems, fetchLocations]);

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
