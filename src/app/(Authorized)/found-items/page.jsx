"use client";

import FoundItemsList from "@/app/components/FoundItemsList";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useCallback } from "react";

const FoundItemsPage = () => {
  const [finders, setFinders] = useState([]);
  const { data: session, status } = useSession();

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/finder");
      const data = await response.json();
      setFinders(data);
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
      <FoundItemsList
        finders={finders}
        fetchItems={fetchItems}
        session={session}
      />
    </>
  );
};

export default FoundItemsPage;
