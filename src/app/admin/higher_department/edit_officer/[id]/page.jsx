import EditOfficePage from "@/app/admin/components/EditOffice";
import React from "react";

const Page = ({ params }) => {
    const { id } = params;

    return <EditOfficePage accountId={id} category="higher_department" sessionRole="admin" />; // Pass the fetched office data to EditOfficePage
};

export default Page;
