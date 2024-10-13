import React from 'react'
import { Box } from '@mui/material'
import AddRole from '@/app/components/AddRole'

const AddRolePage = () => {
    return (
        <>
            <Box
                sx={{
                    marginTop: '60px', // Ensure space for header
                    marginLeft: { xs: '0px', lg: '250px' }, // Shift content when sidebar is visible on large screens
                    padding: '20px',
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <AddRole />
            </Box>
        </>
    )
}

export default AddRolePage