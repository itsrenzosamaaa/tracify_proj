"use client";

import {
  Snackbar,
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Box,
  Radio,
  RadioGroup,
  Stack,
  DialogContent,
  Input,
} from "@mui/joy";
import { FormControlLabel } from "@mui/material";
import React, { useState } from "react";
import ItemDetails from "./ItemDetails";

const ItemRequestApproveModal = ({
  row,
  open,
  onClose,
  refreshData,
  session,
  setMessage,
  setOpenSnackbar,
  locationOptions,
}) => {
  const [confirmationApproveModal, setConfirmationApproveModal] =
    useState(null);
  const [confirmationDeclineModal, setConfirmationDeclineModal] =
    useState(null);
  const [reasonModal, setReasonModal] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [otherReason, setOtherReason] = useState("");

  const handleReasonChange = (event) => {
    setDeclineReason(event.target.value);
  };

  const handleSubmit = async (e, id) => {
    e?.preventDefault();
    setLoading(true);
    const apiEndpoint = row?.item?.isFoundItem
      ? `/api/found-items/${id}`
      : `/api/lost-items/${id}`;
    try {
      const response = await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: row?.item?.isFoundItem ? "Surrender Pending" : "Missing",
        }),
      });

      if (!response.ok)
        throw new Error(data.message || "Failed to update status");

      const notificationResponse = await fetch("/api/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver: row.user._id,
          message: `The ${row.item.isFoundItem ? "found" : "lost"} item (${
            row.item.name
          }) you requested has been approved by SASO!`,
          type: row.item.isFoundItem ? "Found Items" : "Lost Items",
          markAsRead: false,
          dateNotified: new Date(),
        }),
      });

      if (!notificationResponse.ok)
        throw new Error(data.message || "Failed to send notification");

      if (row?.user?.emailAddress) {
        const mailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "ItemRequestApproval",
            to: row.user.emailAddress,
            subject: "Your Item Request Has Been Approved",
            name: row.user.firstname,
            link: `https://tlc-tracify.vercel.app/?callbackUrl=/my-items#${
              row.item.isFoundItem ? "found-item" : "lost-item"
            }`,
            success: row.item.isFoundItem,
            itemName: row.item.name,
            location: "SASO",
          }),
        });

        if (!mailResponse.ok)
          throw new Error(data.message || "Failed to send email");
      }

      if (!row?.item?.isFoundItem) {
        const postResponse = await fetch("/api/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: row?.user?._id,
            item_name: row?.item?.name,
            isFinder: false,
            caption: row?.item?.description,
            owner: row._id,
            createdAt: new Date(),
          }),
        });

        if (!postResponse.ok)
          throw new Error(data.message || "Failed to create post");
      }

      setOpenSnackbar("success");
      setMessage("Item request has been approved!");
      onClose();
      setConfirmationApproveModal(null);
      refreshData();
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (e, id) => {
    e?.preventDefault();
    setLoading(true);
    const apiEndpoint = row?.item?.isFoundItem
      ? `/api/found-items/${id}`
      : `/api/lost-items/${id}`;

    try {
      // First request
      const response = await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Declined",
          reason: declineReason === "Others" ? otherReason : declineReason,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update status");
      }

      // Notification request
      if (row?.user?._id) {
        const notificationResponse = await fetch("/api/notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiver: row?.user?._id,
            message: `The ${row?.item?.isFoundItem ? "found" : "lost"} item (${
              row?.item?.name || ""
            }) you requested has been declined.`,
            type: "Declined Items",
            markAsRead: false,
            dateNotified: new Date(),
          }),
        });

        const notificationData = await notificationResponse.json();

        if (!notificationResponse.ok) {
          throw new Error(
            notificationData.message || "Failed to send notification"
          );
        }
      }

      if (row?.user?.emailAddress) {
        const mailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "ItemRequestDecline",
            to: row.user.emailAddress,
            subject: "Your Item Request Has Been Declined",
            name: row.user.firstname,
            link: "https://tlc-tracify.vercel.app/?callbackUrl=/my-items#declined-item",
            itemName: row.item.name,
            remarks: declineReason,
          }),
        });

        if (!mailResponse.ok)
          throw new Error(data.message || "Failed to send email");
      }

      // Success path
      onClose();
      setConfirmationDeclineModal(null);
      setReasonModal(null);
      setDeclineReason("");
      await refreshData();
      setOpenSnackbar("success");
      setMessage("Item request declined successfully!");
    } catch (error) {
      console.error("Error in handleDecline:", error);
      setOpenSnackbar("danger");
      setMessage(
        error.message || "An error occurred while declining the request"
      );
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
            Approve Item Report
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
            <ItemDetails row={row} session={session} />
          </DialogContent>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={() => setReasonModal(row._id)}
              fullWidth
              color="danger"
            >
              Decline
            </Button>
            <Button
              onClick={() => setConfirmationApproveModal(row._id)}
              fullWidth
            >
              Approve
            </Button>
            <Modal open={reasonModal} onClose={() => setReasonModal(null)}>
              <ModalDialog>
                <ModalClose />
                <Typography level="h4" gutterBottom>
                  Decline
                </Typography>
                <Typography>Remarks</Typography>
                <RadioGroup
                  value={declineReason}
                  onChange={handleReasonChange}
                  sx={{ my: 2 }}
                >
                  <Stack spacing={2}>
                    <FormControlLabel
                      value="Invalid Information"
                      control={<Radio />}
                      label="Invalid Information"
                    />
                    <FormControlLabel
                      value="Item is not tangible"
                      control={<Radio />}
                      label="Item is not tangible"
                    />
                    <FormControlLabel
                      value="Item not eligible for posting"
                      control={<Radio />}
                      label="Item not eligible for posting"
                    />
                    <FormControlLabel
                      value="Others"
                      control={<Radio />}
                      label="Others"
                    />
                  </Stack>
                </RadioGroup>

                {declineReason === "Others" && (
                  <Input
                    placeholder="Please specify your remarks..."
                    fullWidth
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                  />
                )}
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    color="danger"
                    onClick={() => setReasonModal(null)}
                    fullWidth
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setConfirmationDeclineModal(row._id)}
                    fullWidth
                    disabled={
                      !declineReason ||
                      (declineReason === "Others" && otherReason.trim() === "")
                    }
                  >
                    Submit
                  </Button>
                </Box>
              </ModalDialog>
            </Modal>
            <Modal
              open={confirmationApproveModal}
              onClose={() => setConfirmationApproveModal(null)}
            >
              <ModalDialog>
                <ModalClose />
                <Typography level="h4" gutterBottom>
                  Confirmation
                </Typography>
                <Typography>
                  {row.item?.isFoundItem
                    ? "Proceed with surrendering the item?"
                    : "Would you like to mark this item as missing?"}
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    loading={loading}
                    disabled={loading}
                    color="danger"
                    onClick={() => setConfirmationApproveModal(null)}
                    fullWidth
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={loading}
                    disabled={loading}
                    onClick={(e) => handleSubmit(e, row.item._id)}
                    fullWidth
                  >
                    Confirm
                  </Button>
                </Box>
              </ModalDialog>
            </Modal>
            <Modal
              open={Boolean(confirmationDeclineModal)}
              onClose={() => setConfirmationDeclineModal(null)}
            >
              <ModalDialog>
                <ModalClose />
                <Typography level="h4" gutterBottom>
                  Confirmation
                </Typography>
                <Typography>
                  Are you sure you want to decline item request?
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    loading={loading}
                    disabled={loading}
                    color="danger"
                    onClick={() => setConfirmationDeclineModal(null)}
                    fullWidth
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={loading}
                    disabled={loading}
                    onClick={(e) => handleDecline(e, row.item._id)}
                    fullWidth
                  >
                    Decline
                  </Button>
                </Box>
              </ModalDialog>
            </Modal>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default ItemRequestApproveModal;
