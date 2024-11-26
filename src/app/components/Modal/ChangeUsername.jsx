import { Modal, ModalClose, ModalDialog, Box, FormLabel, FormControl, Input, Typography, Button } from '@mui/joy'
import React, { useState } from 'react'

const ChangeUsername = ({ profile, openUsernameModal, setOpenUsernameModal, refreshData, setOpenSnackbar, session }) => {
  const [username, setUsername] = useState(profile.username)
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const response = await fetch(`/api/users/${session.user.id}/change-username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      if (response.ok) {
        setOpenUsernameModal(false);
        await refreshData(session.user.id);
        setOpenSnackbar('Username updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error);
        alert('Failed to upload username. Please try again.');
      }
    } catch (error) {
      console.error('Error during save:', error);
      alert('Failed to upload username. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal open={openUsernameModal} onClose={() => setOpenUsernameModal(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" gutterBottom>Change Username</Typography>
          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>
            <Button fullWidth loading={loading} disabled={loading} type='submit' sx={{ mt: 2 }}>Save</Button>
          </form>
        </ModalDialog>
      </Modal>
    </>
  )
}

export default ChangeUsername