'use client'

import React, { useState } from 'react'
import { Grid, Box, FormControl, FormLabel, Chip, RadioGroup, Radio, Button } from '@mui/joy'
import { Paper, Badge } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import PublishItemIdentified from './Modal/PublishItemIdentified';
import ItemRetrievalTable from './Table/ItemRetrievalTable';

const ItemRetrievalList = ({ items, fetchItems }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TitleBreadcrumbs title="List of Item Retrievals" text="Item Retrieval" />

            <Grid container spacing={2}>
                <Grid item xs={12} lg={12}>
                    <Paper elevation={2} sx={{ padding: '1rem' }}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Button startDecorator={<AddIcon />} onClick={() => setOpen(true)}>Item Identified</Button>
                            <PublishItemIdentified open={open} onClose={() => setOpen(false)} refreshData={fetchItems} />
                        </Box>
                        <ItemRetrievalTable items={items} fetchItems={fetchItems} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

export default ItemRetrievalList;
