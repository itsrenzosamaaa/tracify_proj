'use client';

import { Button, Modal, ModalClose, ModalDialog, Typography, Box, Tab, Tabs, TabPanel, TabList, Table } from '@mui/joy';
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CldImage } from 'next-cloudinary';

const ItemRequestApproveModal = ({ row, open, onClose }) => {
    const [value, setValue] = useState('1');
    const [confirmationApproveModal, setConfirmationApproveModal] = useState(null);
    const [confirmationDeclineModal, setConfirmationDeclineModal] = useState(null);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleSubmit = async (e, id) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }   

        try {
            const response = await fetch(`/api/found-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Validating' }),
            });
    
            if (!response.ok) throw new Error('Failed to update status');
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog>
                <ModalClose />
                <Typography level="h4" sx={{ marginBottom: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Approve Item Request
                </Typography>
                <Box sx={{ marginTop: 2 }}>
                    <Tabs 
                        value={value} 
                        onChange={handleChange} 
                        aria-label="item request tabs"
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <TabList 
                            sx={{ gap: { xs: 1, lg: 2 } }}
                        >
                            <Tab value="1" sx={{ fontSize: { xs: '0.875rem', lg: '1rem' } }}>Details</Tab>
                            <Tab value="2" sx={{ fontSize: { xs: '0.875rem', lg: '1rem' } }}>Records</Tab>
                            <Tab value="3" sx={{ fontSize: { xs: '0.875rem', lg: '1rem' } }}>Image</Tab> 
                        </TabList>
                        <TabPanel value="1" sx={{ padding: { xs: 1, lg: 2 } }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Name</td>
                                        <td style={{ borderBottom: '1px solid black', padding: '8px' }}>{row.name}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Description</td>
                                        <td style={{ borderBottom: '1px solid black', padding: '8px' }}>{row.description}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Location</td>
                                        <td style={{ borderBottom: '1px solid black', padding: '8px' }}>{row.location}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Date</td>
                                        <td style={{ borderBottom: '1px solid black', padding: '8px' }}>
                                            {format(parseISO(row.date), 'MMMM dd, yyyy')}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ borderRight: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Time</td>
                                        <td style={{ padding: '8px' }}>
                                            {format(new Date().setHours(...row.time.split(':')), 'hh:mm a')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </TabPanel>
                        <TabPanel value="2" sx={{ padding: { xs: 1, lg: 2 } }}>
                            {
                                row.dateRequest &&
                                <>
                                    <Typography fontWeight="700">Date Request:</Typography>
                                    <Typography>{format(parseISO(row.dateRequest), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                </>
                            }
                            {
                                row.dateValidating &&
                                <>
                                    <Typography fontWeight="700">Date Validating:</Typography>
                                    <Typography>{format(parseISO(row.dateValidating), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                </>
                            }
                            {
                                row.datePublished &&
                                <>
                                    <Typography fontWeight="700">Date Published:</Typography>
                                    <Typography>{format(parseISO(row.datePublished), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                </>
                            }
                            {
                                row.dateInvalid &&
                                <>
                                    <Typography fontWeight="700">Date Invalid:</Typography>
                                    <Typography>{format(parseISO(row.dateInvalid), 'MMMM dd, yyyy hh:mm a')}</Typography>
                                </>
                            }
                        </TabPanel>
                        <TabPanel value="3" sx={{ padding: { xs: 1, lg: 2 } }}>
                            <CldImage
                                src={row.image}
                                width={400} // Adjusted width to match smaller card size
                                height={400} // Adjusted height to match smaller card size
                                alt={row.name || "Item Image"}
                                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                style={{ objectFit: 'cover' }}
                            />
                        </TabPanel>
                    </Tabs>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={() => setConfirmationDeclineModal(row._id)} fullWidth color="danger">Decline</Button>
                        <Button onClick={() => setConfirmationApproveModal(row._id)} fullWidth>Approve</Button>
                        <Modal open={confirmationApproveModal} onClose={() => setConfirmationApproveModal(null)}>
                            <ModalDialog>
                                <ModalClose />
                                <Typography level="h4" gutterbottom>Confirmation</Typography>
                                <Typography>Move to Validating?</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button color="danger" onClick={() => setConfirmationApproveModal(null)} fullWidth>Cancel</Button>
                                    <Button onClick={(e) => handleSubmit(e, row._id)} fullWidth>Confirm</Button>
                                </Box>
                            </ModalDialog>
                        </Modal>
                    </Box>
                </Box>
            </ModalDialog>
        </Modal>
    );
};

export default ItemRequestApproveModal;
