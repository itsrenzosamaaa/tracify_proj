'use client'

import React from 'react'
import { useSession } from 'next-auth/react';
import AddItems from '../../components/Forms/AddItems';
import { Box } from '@mui/joy';
import Loading from '@/app/components/Loading';

const AddLostItemPage = () => {
    const { data: session, status } = useSession();
    console.log(session)

    if (status === 'loading') {
        return (
            <Box
                sx={{
                    marginTop: "60px",
                    marginLeft: { xs: "0px", lg: "250px" },
                    padding: "20px",
                    transition: "margin-left 0.3s ease",
                }}
            >
                <Loading />
            </Box>
        );
    }

    return (
        <>
            <AddItems session={session} isFoundItem={false} />
        </>
    )
}

export default AddLostItemPage