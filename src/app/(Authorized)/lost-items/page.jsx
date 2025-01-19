"use client";

import LostItemsList from "@/app/components/LostItemsList";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useCallback } from "react";

const FoundItemsPage = () => {
  const [owners, setOwners] = useState([]);
  const { data: session, status } = useSession();

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/owner");
      const data = await response.json();
      setOwners(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchItems();
    }
  }, [status, fetchItems]);

  if (status === "loading") {
    return null;
  }

  return (
    <>
      <LostItemsList
        owners={owners}
        fetchItems={fetchItems}
        session={session}
      />
    </>
  );
};

export default FoundItemsPage;
