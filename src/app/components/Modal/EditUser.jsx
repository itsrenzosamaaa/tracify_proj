import { DialogContent, FormLabel, Input, Modal, ModalClose, ModalDialog, Typography, Grid, Select, Option, Button } from '@mui/joy'
import React, { useState } from 'react'

const EditUser = ({ user, open, onClose, setOpenSnackbar, setMessage, refreshData }) => {
    const [firstname, setFirstname] = useState(user.firstname);
    const [lastname, setLastname] = useState(user.lastname);
    const [emailAddress, setEmailAddress] = useState(user.emailAddress);
    const [contactNumber, setContactNumber] = useState(user.contactNumber);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatedFormData = {
            firstname,
            lastname,
            emailAddress,
            contactNumber,
        }

        try {
            const response = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFormData),
            })

            if (response.ok) {
                onClose();
                await refreshData();
                setOpenSnackbar('success');
                setMessage('User updated successfully!');
            } else {
                const data = await response.json();
                setOpenSnackbar('danger');
                setMessage(`Failed to update user: ${data.error}`);
            }
        } catch (error) {
            setOpenSnackbar('danger');
            setMessage(`Error updating user: ${error}`);
        } finally {
            setLoading(false)
        }
    }


    return (
        <>
            <Modal open={open === user._id} onClose={onClose}>
                <ModalDialog>
                    <ModalClose />
                    <Typography level="h4">
                        Edit Student Details
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <DialogContent
                            sx={{
                                overflowX: 'hidden',
                                overflowY: 'auto', // Allows vertical scrolling
                                '&::-webkit-scrollbar': { display: 'none' }, // Hides scrollbar in WebKit-based browsers (Chrome, Edge, Safari)
                                '-ms-overflow-style': 'none', // Hides scrollbar in IE and Edge
                                'scrollbar-width': 'none', // Hides scrollbar in Firefox
                            }}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <FormLabel>First Name</FormLabel>
                                    <Input value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormLabel>Last Name</FormLabel>
                                    <Input value={lastname} onChange={(e) => setLastname(e.target.value)} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormLabel>Email Address</FormLabel>
                                    <Input value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormLabel>Contact Number</FormLabel>
                                    <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <Button disabled={loading} loading={loading} type="submit" sx={{ mt: 2 }} fullWidth>Update Student</Button>
                    </form>
                </ModalDialog>
            </Modal>
        </>
    )
}

export default EditUser