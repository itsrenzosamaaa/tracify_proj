"use client";

import FoundItemsList from "@/app/components/FoundItemsList";
import { Snackbar } from "@mui/joy";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useCallback } from "react";

const FoundItemsPage = () => {
  const [finders, setFinders] = useState([]);
  const { data: session, status } = useSession();
  const [locationOptions, setLocationOptions] = useState([]);
  const [isFetchingItems, setIsFetchingItems] = useState(false);
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(null);

  const fetchAllData = useCallback(async () => {
    setIsFetchingItems(true);
    try {
      const [matchesRes, findersRes] = await Promise.all([
        fetch("/api/match-items"),
        fetch("/api/finder"),
      ]);

      const matchesData = await matchesRes.json();
      const filteredMatches = matchesData.filter((match) =>
        ["Pending", "Approved"].includes(match?.request_status)
      );

      const matchedLostItemIds = filteredMatches
        .map((match) => match?.finder?.item?._id)
        .filter(Boolean);

      const findersData = await findersRes.json();
      const filteredItems = findersData.filter(
        (lostItem) =>
          !matchedLostItemIds.includes(lostItem?.item?._id)
      );

      setFinders(filteredItems);
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
      <FoundItemsList
        locationOptions={locationOptions}
        finders={finders}
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
