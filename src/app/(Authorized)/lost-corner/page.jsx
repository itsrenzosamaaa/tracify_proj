"use client";

import Loading from "@/app/components/Loading";
import NewsFeed from "@/app/components/NewsFeed";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const LostCornerPage = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      const filterUsers = data.filter((user) =>
        user?.role?.permissions.includes("User Dashboard")
      );
      setUsers(filterUsers);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (status === "loading") {
    return <Loading />;
  }
  return (
    <>
      <NewsFeed
        users={users}
        session={session}
        status={status}
        corner="lost-item"
      />
    </>
  );
};

export default LostCornerPage;
