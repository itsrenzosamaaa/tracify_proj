import { Grid, Typography } from '@mui/joy'
import { Paper } from '@mui/material'
import React from 'react'

const Loading = ({ name }) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sx={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Paper elevation={3} sx={{ padding: '2rem', textAlign: 'center' }}>
                    <Typography level="body-lg" fontWeight="700">Welcome back, {name}</Typography>
                    <Typography>Redirecting you to the dashboard...</Typography>
                </Paper>
            </Grid>
        </Grid>
    )
}

export default Loading