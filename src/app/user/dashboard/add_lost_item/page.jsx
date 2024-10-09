'use client'

import Loading from '@/app/components/Loading';
import { useSession } from 'next-auth/react'
import React from 'react'
import ReportItemComponent from '../../components/ReportItems';

const AddLostPage = () => {
    const { data: session, status } = useSession();
    if (status === 'loading') {
        return <Loading />
    }

    return (
        <>
            <ReportItemComponent isFoundItem={false} session={session} />
        </>
    )
}

export default AddLostPage