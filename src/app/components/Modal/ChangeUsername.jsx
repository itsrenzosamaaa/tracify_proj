import { Modal, ModalClose, ModalDialog, Box, FormLabel, FormControl, Input, Typography, Button } from '@mui/joy'
import React, { useState } from 'react'

const ChangeUsername = ({ profile, openUsernameModal, setOpenUsernameModal, refreshData, setOpenSnackbar, session, setMessage }) => {
  const [username, setUsername] = useState(profile.username);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if the new username is the same as the current one
      if (username === profile.username) {
        setLoading(false);
        setOpenSnackbar('danger'); // Assuming 'danger' sets the snackbar type
        setMessage('Your new username should not be your current username.');
        return;
      }

      // Make API request to change the username
      const response = await fetch(`/api/users/${session.user.id}/change-username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        // Close modal and refresh data
        setOpenUsernameModal(false);
        await refreshData(session.user.id);
        setOpenSnackbar('success'); // Assuming 'success' sets the snackbar type
        setMessage('Username updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error);
        setOpenSnackbar('danger');
        setMessage('Failed to update username. Please try again.');
      }
    } catch (error) {
      console.error('Error during save:', error);
      setOpenSnackbar('danger');
      setMessage('An error occurred while updating the username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={openUsernameModal} onClose={() => setOpenUsernameModal(false)}>
      <ModalDialog>
        <ModalClose />
        <Typography level="h4" gutterBottom>
          Change Username
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <Button
            fullWidth
            loading={loading}
            disabled={loading}
            type="submit"
            sx={{ mt: 2 }}
          >
            Save
          </Button>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default ChangeUsername;