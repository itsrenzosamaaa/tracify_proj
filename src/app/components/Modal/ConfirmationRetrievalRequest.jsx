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
import { format } from "date-fns";
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
  claimData,
  lostDateStart,
  lostDateEnd,
  sizeNotDetermined,
  itemWhereabouts,
  location,
}) => {
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSubmit = async (e, finderId) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    try {
      const now = new Date();
      const startDate = itemWhereabouts ? new Date(lostDateStart) : null;
      const endDate = itemWhereabouts ? new Date(lostDateEnd) : null;

      if (itemWhereabouts) {
        if (isNaN(startDate) || isNaN(endDate)) {
          setOpenSnackbar("danger");
          setMessage("Please provide valid start and end dates.");
          return;
        }

        if (startDate >= endDate) {
          setOpenSnackbar("danger");
          setMessage("The start date must be earlier than the end date.");
          return;
        }

        if (startDate > now) {
          setOpenSnackbar("danger");
          setMessage("The start date cannot be in the future.");
          return;
        }
      }
      setLoading(true);
      const newMatch = {
        finder: finderId,
        owner: {
          user: owner,
          item: {
            ...claimData,
            size: sizeNotDetermined ? "N/A" : `${size.value} ${size.unit}`,
            location: itemWhereabouts ? location : "Unidentified",
            date_time: itemWhereabouts
              ? `${format(startDate, "MMMM dd, yyyy hh:mm a")} to ${format(
                  endDate,
                  "MMMM dd, yyyy hh:mm a"
                )}`
              : "Unidentified",
          },
        },
        request_status: "Pending",
        datePending: new Date(),
      };

      if (![null, foundItem?.user, owner].includes(sharedBy)) {
        newMatch.sharedBy = sharedBy;
      }

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
              onClick={(e) => handleSubmit(e, finder)}
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
