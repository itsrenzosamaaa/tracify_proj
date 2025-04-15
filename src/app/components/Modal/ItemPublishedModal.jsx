"use client";

import {
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Box,
  DialogContent,
  FormControl,
  FormLabel,
  Autocomplete,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import ItemDetails from "./ItemDetails";

const ItemPublishedModal = ({
  row,
  open,
  onClose,
  refreshData,
  session,
  setMessage,
  setOpenSnackbar,
  locationOptions,
  users = [],
}) => {
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [openSelectOwnerModal, setOpenSelectOwnerModal] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, foundItemId) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    try {
      setLoading(true);

      // Helper function for fetch requests
      const makeRequest = async (url, method, body) => {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : null,
        });

        if (!response.ok) {
          const errorData = await response.json();

          // Skip specific 404s for user or match auto-decline logic
          if (
            response.status === 404 &&
            (errorData.error === "User not found" ||
              errorData.message ===
                "No matched items with Pending or Approved status found.")
          ) {
            console.warn(`Skipping: ${errorData.error || errorData.message}`);
            return null;
          }

          throw new Error(
            errorData.message || `Failed to perform request to ${url}`
          );
        }

        return response.json();
      };

      // Update found item status
      await makeRequest(`/api/found-items/${foundItemId}`, "PUT", {
        status: "Resolved",
        receivedBy: selectedOwner?._id,
      });

      // Prepare notification(s)
      const notificationData = [];

      // If the finder is a regular user with dashboard access
      if (row?.user?.role?.permissions?.includes("User Dashboard")) {
        notificationData.push({
          receiver: row.user._id,
          message: `Your found item ${row.item.name} has been returned to its owner!`,
          type: "Completed Items",
          markAsRead: false,
          dateNotified: new Date(),
        });

        if (row.user._id) {
          await makeRequest(`/api/users/${row.user._id}/increment`, "PUT", {
            increment: "found-item",
          });
        }
      }

      // Send notifications
      await makeRequest("/api/notification/bulk", "POST", notificationData);

      // Close modals, refresh data, and show success notification
      setConfirmationItemClaimed(false);
      onClose();
      await refreshData();
      setOpenSnackbar("success");
      setMessage("The item has been returned to the owner!");
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage(`Error updating items: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open === row._id} onClose={onClose}>
        <ModalDialog>
          <ModalClose />
          <Typography
            level="h4"
            sx={{ marginBottom: 2, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            {row?.item?.status} Item Details
          </Typography>
          <DialogContent
            sx={{
              paddingRight: "calc(0 + 8px)", // Add extra padding to account for scrollbar width
              maxHeight: "85.5vh",
              height: "100%",
              overflowX: "hidden",
              overflowY: "scroll", // Always reserve space for scrollbar
              // Default scrollbar styles (invisible)
              "&::-webkit-scrollbar": {
                width: "8px", // Always reserve 8px width
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "transparent", // Invisible by default
                borderRadius: "4px",
              },
              // Show scrollbar on hover
              "&:hover": {
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0, 0, 0, 0.4)", // Only change the thumb color on hover
                },
              },
              // Firefox
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent", // Both track and thumb transparent
              "&:hover": {
                scrollbarColor: "rgba(0, 0, 0, 0.4) transparent", // Show thumb on hover
              },
              // IE and Edge
              msOverflowStyle: "-ms-autohiding-scrollbar",
            }}
          >
            <ItemDetails
              locationOptions={locationOptions}
              row={row}
              refreshData={refreshData}
              setOpenSnackbar={setOpenSnackbar}
              setMessage={setMessage}
              session={session}
            />
          </DialogContent>
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button fullWidth variant="outlined" onClick={onClose}>
              Close
            </Button>
            {row?.item?.status === "Published" && (
              <Button
                fullWidth
                color="success"
                onClick={() => setOpenSelectOwnerModal(true)}
              >
                Mark as Resolved
              </Button>
            )}
          </Box>
        </ModalDialog>
      </Modal>
      <Modal
        open={openSelectOwnerModal}
        onClose={() => setOpenSelectOwnerModal(false)}
      >
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" sx={{ marginBottom: 2 }}>
            Identify Owner
          </Typography>
          <FormControl required>
            <FormLabel>Select an Owner</FormLabel>
            <Autocomplete
              placeholder="Select an owner"
              options={
                users.filter(
                  (user) =>
                    user?.role?.permissions.includes("User Dashboard") &&
                    row?.user?._id !== user?._id
                ) || []
              }
              value={selectedOwner}
              onChange={(event, value) => {
                setSelectedOwner(value);
              }}
              getOptionLabel={(user) => {
                return user
                  ? `${user.firstname} ${user.lastname}`
                  : "No Options";
              }}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
            />
          </FormControl>
          <Button
            fullWidth
            disabled={setSelectedOwner === null}
            onClick={() => setConfirmation(true)}
          >
            Next
          </Button>
        </ModalDialog>
      </Modal>
      <Modal open={confirmation} onClose={() => setConfirmation(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" sx={{ marginBottom: 2 }}>
            Confirmation
          </Typography>
          <Typography>
            Are you sure you want to mark this item as resolved?
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="danger"
              onClick={() => setConfirmation(false)}
              disabled={loading}
              loading={loading}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              loading={loading}
              fullWidth
              onClick={(e) => handleSubmit(e, row?.item?._id)}
            >
              Confirm
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default ItemPublishedModal;
