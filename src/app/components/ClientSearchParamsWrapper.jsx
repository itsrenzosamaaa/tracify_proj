"use client";
import { useSearchParams } from "next/navigation";

const ClientSearchParamsWrapper = ({ children }) => {
  const searchParams = useSearchParams();
  return children(searchParams);
};

export default ClientSearchParamsWrapper;
