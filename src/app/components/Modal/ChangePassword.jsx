"use client";

import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import React, { useState } from "react";

const ChangePassword = ({
  session,
  setOpenSnackbar,
  setMessage,
  openChangePassword,
  setOpenChangePassword,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * ✅ Validates form fields
   */
  const validateForm = () => {
    let newErrors = {};

    if (!currentPassword)
      newErrors.currentPassword = "Current password is required.";
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long.";
    }
    if (!retypePassword) {
      newErrors.retypePassword = "Please retype your new password.";
    } else if (newPassword !== retypePassword) {
      newErrors.retypePassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * ✅ Handles form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Prevent submission if validation fails

    setLoading(true);
    try {
      const response = await fetch(
        `/api/users/change-password/${session.user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            retypePassword,
          }),
        }
      );

      if (response.ok) {
        setOpenChangePassword(false);
        setOpenSnackbar("success");
        setMessage("Password updated successfully!");
      } else {
        const data = await response.json();
        setOpenSnackbar("danger");
        setMessage(`Failed to update password: ${data.error}`);
      }
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage(`Error updating password: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={openChangePassword}
      onClose={() => setOpenChangePassword(false)}
    >
      <ModalDialog>
        <ModalClose />
        <Typography level="h4">Change Password</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl error={!!errors.currentPassword}>
                <FormLabel>Current Password</FormLabel>
                <Input
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type="password"
                />
                {errors.currentPassword && (
                  <Typography color="danger" fontSize="sm">
                    {errors.currentPassword}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl error={!!errors.newPassword}>
                <FormLabel>New Password</FormLabel>
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                />
                {errors.newPassword && (
                  <Typography color="danger" fontSize="sm">
                    {errors.newPassword}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl error={!!errors.retypePassword}>
                <FormLabel>Re-Type Password</FormLabel>
                <Input
                  value={retypePassword}
                  onChange={(e) => setRetypePassword(e.target.value)}
                  type="password"
                />
                {errors.retypePassword && (
                  <Typography color="danger" fontSize="sm">
                    {errors.retypePassword}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Button
              fullWidth
              type="submit"
              disabled={loading}
              loading={loading}
              sx={{ mt: 2 }}
            >
              Update
            </Button>
          </Grid>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default ChangePassword;
