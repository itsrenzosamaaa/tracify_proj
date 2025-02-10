'use client'

import ViewRoles from "@/app/components/ViewRoles";
import { useSession } from "next-auth/react";
import React, { useState, useCallback, useEffect } from "react";

const RolePage = () => {
  const [roles, setRoles] = useState([]);
  const { data: session, status, update } = useSession();

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch("api/role");
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);
  return (
    <>
      <ViewRoles roles={roles} refreshData={fetchRoles} session={session} update={update} />
    </>
  );
};

export default RolePage;
