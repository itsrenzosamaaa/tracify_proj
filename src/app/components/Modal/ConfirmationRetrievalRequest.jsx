"use client";

import {
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Box,
  Button,
  Snackbar,
} from "@mui/joy";
import React, { useState } from "react";

const ConfirmationRetrievalRequest = ({
  open,
  onClose,
  closeModal,
  foundItem,
  lostItem,
  finder,
  isAdmin,
  sharedBy,
  owner,
}) => {
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSubmit = async (e, foundItemId, finderId, ownerId) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const newMatch = {
      finder: finderId,
      owner: ownerId,
      request_status: "Pending",
      datePending: new Date(),
    };

    if (![null, foundItem?.user, owner].includes(sharedBy)) {
      newMatch.sharedBy = sharedBy;
    }

    try {
      setLoading(true);
      const makeRequest = async (url, method, body) => {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : null,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Failed to perform request to ${url}`
          );
        }

        return response.json();
      };

      await makeRequest("/api/match-items", "POST", newMatch);
      await makeRequest(`/api/found-items/${foundItemId}`, "PUT", {
        status: "Matched",
      });
      if (!isAdmin) {
        await makeRequest("/api/notification", "POST", {
          receiver: foundItem.user,
          message: `Someone matched their lost item to your found item (${foundItem.item.name}). Click here for review.`,
          type: "Found Items",
          markAsRead: false,
          dateNotified: new Date(),
        });
      }

      onClose();
      closeModal();
      setOpenSnackbar(true);
      return;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" gutterBottom>
            Confirmation
          </Typography>
          <Typography>Send a retrieval request to SASO?</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              disabled={loading}
              loading={loading}
              onClick={onClose}
              fullWidth
              variant="outlined"
              color="danger"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              loading={loading}
              onClick={(e) =>
                handleSubmit(e, foundItem.item._id, finder, lostItem)
              }
              fullWidth
            >
              Send
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      <Snackbar
        autoHideDuration={5000}
        open={openSnackbar}
        variant="solid"
        color="success"
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setOpenSnackbar(false);
        }}
      >
        Item retrieval request sent!
      </Snackbar>
    </>
  );
};

export default ConfirmationRetrievalRequest;
