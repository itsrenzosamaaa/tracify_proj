'use client'

import AddUserPage from "../../components/Forms/AddUser";
import { useSession } from "next-auth/react";

const Page = () => {
    const { data: session, status } = useSession();
    return status === 'loading' ? "" : <AddUserPage setRole="user" sessionRole="office" category={session.user.roleData.schoolCategory} />
};

export default Page;