"use client";

import LostItemsList from "@/app/components/LostItemsList";
import { Snackbar } from "@mui/joy";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useCallback } from "react";

const FoundItemsPage = () => {
  const [owners, setOwners] = useState([]);
  const { data: session, status } = useSession();
  const [locationOptions, setLocationOptions] = useState([]);
  const [isFetchingItems, setIsFetchingItems] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");

  const fetchAllData = useCallback(async () => {
    setIsFetchingItems(true);
    try {
      const [matchesRes, ownersRes] = await Promise.all([
        fetch("/api/match-items"),
        fetch("/api/owner"),
      ]);

      const matchesData = await matchesRes.json();
      const filteredMatches = matchesData.filter(
        (match) => match?.request_status === "Approved"
      );

      const matchedLostItemIds = filteredMatches
        .map((match) => match?.owner?.linkedItem?._id)
        .filter(Boolean);

      const ownersData = await ownersRes.json();
      const filteredItems = ownersData.filter(
        (lostItem) =>
          !matchedLostItemIds.includes(lostItem?.item?._id)
      );

      setOwners(filteredItems);
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
      fetchAllData();
      fetchLocations();
    }
  }, [status, fetchAllData, fetchLocations]);

  if (status === "loading") {
    return null;
  }

  return (
    <>
      <LostItemsList
        locationOptions={locationOptions}
        owners={owners}
        fetchItems={fetchAllData}
        session={session}
        isFetchingItems={isFetchingItems}
        setMessage={setMessage}
        setOpenSnackbar={setOpenSnackbar}
      />
      <Snackbar
        autoHideDuration={5000}
        open={openSnackbar}
        variant="solid"
        color={openSnackbar}
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setOpenSnackbar(null);
        }}
      >
        {message}
      </Snackbar>
    </>
  );
};

export default FoundItemsPage;
