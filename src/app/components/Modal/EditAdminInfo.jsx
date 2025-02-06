"use client";

import {
  FormControl,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Button,
} from "@mui/joy";
import React, { useState } from "react";

const EditAdminInfo = ({
  user,
  openInfo,
  setOpenInfo,
  setMessage,
  setOpenSnackbar,
  refreshData,
}) => {
  const [username, setUsername] = useState(user?.username || "");
  const [firstname, setFirstname] = useState(user?.firstname || "");
  const [lastname, setLastname] = useState(user?.lastname || "");
  const [emailAddress, setEmailAddress] = useState(user?.emailAddress || "");
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      username,
      firstname,
      lastname,
      emailAddress,
      contactNumber,
    };

    try {
      const response = await fetch(`/api/admin/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setOpenInfo(null);
        await refreshData();
        setOpenSnackbar("success");
        setMessage("Admin information updated successfully!");
      } else {
        const data = await response.json();
        setOpenSnackbar("danger");
        setMessage(`Failed to update admin: ${data.error}`);
      }
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage(`Error updating user: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={openInfo === user._id} onClose={() => setOpenInfo(null)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4">Edit Information</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl>
                  <FormLabel>Firstname</FormLabel>
                  <Input
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl>
                  <FormLabel>Lastname</FormLabel>
                  <Input
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl>
                  <FormLabel>Contact Number</FormLabel>
                  <Input
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Button
              fullWidth
              type="submit"
              loading={loading}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Update Information
            </Button>
          </form>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default EditAdminInfo;
