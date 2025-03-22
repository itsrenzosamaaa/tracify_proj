"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import ViewLocations from "@/app/components/ViewLocations";

const LocationsPage = () => {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState();

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch("/api/location");
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  if (status === "loading") {
    return null;
  }

  return (
    <>
      <ViewLocations locations={locations} refreshData={fetchLocations} session={session} />
    </>
  );
};

export default LocationsPage;
