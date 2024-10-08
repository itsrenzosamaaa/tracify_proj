'use client'

import Loading from '@/app/components/Loading';
import { useSession } from 'next-auth/react'
import React from 'react'
import ReportItemComponent from '../../components/ReportItems';

const AddFoundPage = () => {
    const { data: session, status } = useSession();
    if (status === 'loading') {
        return <Loading />
    }

    return (
        <>
            <ReportItemComponent isFoundItem={true} session={session} />
        </>
    )
}

export default AddFoundPage