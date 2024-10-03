import EditUserPage from "@/app/admin/components/EditUser";
import React from "react";

const Page = ({ params }) => {
    const { id } = params;

    return <EditUserPage accountId={id} category="higher_department" sessionRole="admin" />; // Pass the fetched office data to EditOfficePage
};

export default Page;
