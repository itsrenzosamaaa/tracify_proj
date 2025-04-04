import { CircularProgress, Grid, Typography } from '@mui/joy'
import { Paper } from '@mui/material'
import React from 'react'

const Authenticated = ({ session }) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sx={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Paper elevation={3} sx={{ padding: '2rem', textAlign: 'center' }}>
                    <Typography level="body-lg" fontWeight="700">Welcome back, {session.user.firstname}</Typography>
                    <Typography>Redirecting you to the dashboard...</Typography>
                    <CircularProgress sx={{ mt: 2 }} />
                </Paper>
            </Grid>
        </Grid>
    )
}

export default Authenticated