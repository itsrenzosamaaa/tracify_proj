import React from 'react'
import { Box, Typography, Grid, Breadcrumbs, Link } from '@mui/joy'

const TitleBreadcrumbs = ({ title, text }) => {
    return (
        <>
            <Box sx={{ marginBottom: '1rem', display: { xs: 'none', lg: 'block' } }}>
                <Typography level="h5" letterSpacing={2} sx={{ fontSize: '24px', fontWeight: 'bold', mt: 5 }}>
                    {title}
                </Typography>
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: { xs: '14px', sm: '15px', md: '15px' } }}>
                        <Link letterSpacing={2} underline="hover" color="inherit" href="/dashboard">
                            Home
                        </Link>
                        <Typography letterSpacing={2} color="text.primary" sx={{ fontSize: { xs: '14px', sm: '15px', md: '15px' } }}>{text}</Typography>
                    </Breadcrumbs>
                </Grid>
            </Box>
        </>
    )
}

export default TitleBreadcrumbs