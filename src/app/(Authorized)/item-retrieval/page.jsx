"use client";

import ItemRetrievalList from "@/app/components/ItemRetrieval";
import { Snackbar } from "@mui/joy";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useCallback } from "react";

const ItemRetrievalPage = () => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const { data: session, status } = useSession();
  const [isFetchingItems, setIsFetchingItems] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");

  const fetchItems = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsFetchingItems(true);
    try {
      const response = await fetch("/api/match-items");
      const data = await response.json();
      if (response.ok) {
        setItems(data);
      } else {
        console.error(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingItems(false);
    }
  }, [session?.user?.id]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchItems();
      fetchUsers();
    }
  }, [status, fetchItems, fetchUsers]);

  if (status === "loading") {
    return null;
  }

  return (
    <>
      <ItemRetrievalList
        items={items}
        fetchItems={fetchItems}
        users={users}
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

export default ItemRetrievalPage;
