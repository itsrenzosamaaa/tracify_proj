"use client";

import {
  Snackbar,
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Box,
  DialogContent,
  Input,
  RadioGroup,
  Stack,
  Radio,
  FormControl,
  FormLabel,
  Select,
  Option,
  Chip,
  Autocomplete,
} from "@mui/joy";
import React, { useState } from "react";
import { FormControlLabel } from "@mui/material";
import MatchedItemsDetails from "./MatchedItemsDetails";

const ItemReservedModal = ({
  row,
  open,
  onClose,
  refreshData,
  setMessage,
  setOpenSnackbar,
}) => {
  const [declineModal, setDeclineModal] = useState(false);
  const [declineRemarks, setDeclineRemarks] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [confirmationItemClaimed, setConfirmationItemClaimed] = useState(false);
  const [confirmationItemDecline, setConfirmationItemDecline] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReasonChange = (event) => {
    setDeclineRemarks(event.target.value);

    if (event.target.value !== "Other") {
      setOtherReason("");
    }
  };

  const handleSubmit = async (e, foundItemId, matchedId) => {
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

      if (row?.owner?.linkedItem) {
        await makeRequest(`/api/lost-items/${row?.owner?.linkedItem}`, "PUT", {
          status: "Claimed",
        });
      }

      // Update found item status
      await makeRequest(`/api/found-items/${foundItemId}`, "PUT", {
        status: "Resolved",
      });

      // Update match status
      await makeRequest(`/api/match-items/${matchedId}`, "PUT", {
        request_status: "Completed",
      });

      await makeRequest(
        `/api/match-items/auto-decline/${row?.finder?._id}`,
        "PUT",
        {
          request_status: "Declined",
          remarks: "The item has been claimed by the original owner.",
        }
      );

      // Prepare notification(s)
      const notificationData = [
        {
          receiver: row.owner.user._id,
          message: `Congratulations! The item (${row.owner.item.name}) has been successfully claimed.`,
          type: "Retrieval Items",
          markAsRead: false,
          dateNotified: new Date(),
        },
      ];

      // If the finder is a regular user with dashboard access
      if (row?.finder?.user?.role?.permissions?.includes("User Dashboard")) {
        notificationData.push({
          receiver: row.finder.user._id,
          message: `Your found item ${row.finder.item.name} has been returned to its owner!`,
          type: "Completed Items",
          markAsRead: false,
          dateNotified: new Date(),
        });

        if (row.finder.user._id) {
          await makeRequest(
            `/api/users/${row.finder.user._id}/increment`,
            "PUT",
            {
              increment: "found-item",
            }
          );
        }
      }

      // Send notifications
      await makeRequest("/api/notification/bulk", "POST", notificationData);

      // Increment share count if sharedBy exists
      if (row?.sharedBy) {
        await makeRequest(`/api/users/${row.sharedBy}/increment`, "PUT", {
          increment: "share",
        });
      }

      // Send email to owner if email is available
      if (row?.owner?.user?.emailAddress) {
        await makeRequest("/api/send-email", "POST", {
          type: "ClaimProcessSuccess",
          to: row.owner.user.emailAddress,
          subject: "Claim Process Success",
          name: row.owner.user.firstname,
          link: "https://tlc-tracify.vercel.app/?callbackUrl=/my-items#completed-item",
          itemName: row.finder.item.name,
        });
      }

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

  const handleDecline = async (e, foundItemId, matchedItemId) => {
    if (e && e.preventDefault) {
      e.preventDefault();
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

      await makeRequest(`/api/found-items/${foundItemId}`, "PUT", {
        status: "Decline Retrieval",
      });
      await makeRequest(`/api/match-items/${matchedItemId}`, "PUT", {
        request_status: "Declined",
        remarks: declineRemarks === "Other" ? otherReason : declineRemarks,
      });
      const notificationData = [
        {
          receiver: row.owner.user._id,
          message: `You have failed to claim an item (${row.owner.item.name}). Click here for more details.`,
          type: "Lost Items",
          markAsRead: false,
          dateNotified: new Date(),
        },
      ];

      if (row?.finder?.user?.role?.permissions.includes("User Dashboard")) {
        notificationData.push({
          receiver: row.finder.user._id,
          message: `The owner failed to claim the item. Your found item (${row.finder.item.name}) will be reverted back as Unresolved.`,
          type: "Found Items",
          markAsRead: false,
          dateNotified: new Date(),
        });
      }

      await Promise.all(
        notificationData.map((notif) =>
          makeRequest("/api/notification", "POST", notif)
        )
      );

      if (row?.owner?.user?.emailAddress) {
        await makeRequest("/api/send-email", "POST", {
          type: "ClaimProcessDeclined",
          to: row.owner.user.emailAddress,
          subject: "Claim Process Declined",
          name: row.owner.user.firstname,
          link: "https://tlc-tracify.vercel.app/?callbackUrl=/my-items#lost-item",
          itemName: row.finder.item.name,
          remarks: declineRemarks,
        });
      }

      // Close modals and refresh data
      setConfirmationItemDecline(false);
      setDeclineModal(false);
      onClose();
      await refreshData(); // Renamed from fetch to be more descriptive
      setOpenSnackbar("success");
      setMessage("The item has not successfully returned to the owner.");
    } catch (error) {
      setOpenSnackbar("danger"); // Display error message
      setMessage("Error updating items:", error.message);
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
            Reserved Item Details
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
            <MatchedItemsDetails row={row} />
          </DialogContent>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              color="danger"
              onClick={() => setDeclineModal(true)}
              fullWidth
            >
              Decline
            </Button>
            <Modal open={declineModal} onClose={() => setDeclineModal(false)}>
              <ModalDialog>
                <ModalClose />
                <Typography level="h4" gutterbottom>
                  Remarks
                </Typography>
                <Typography>Select Remarks for Claim Decline</Typography>
                <RadioGroup
                  value={declineRemarks}
                  onChange={handleReasonChange}
                  sx={{ my: 2 }}
                >
                  <Stack spacing={2}>
                    <FormControlLabel
                      value="Ownership Verification Failed"
                      control={<Radio />}
                      label="Ownership Verification Failed"
                    />
                    <FormControlLabel
                      value="No Show at Office"
                      control={<Radio />}
                      label="No Show at Office"
                    />
                    <FormControlLabel
                      value="Unauthorized Claim Attempt"
                      control={<Radio />}
                      label="Unauthorized Claim Attempt"
                    />
                    <FormControlLabel
                      value="Other"
                      control={<Radio />}
                      label="Other"
                    />
                  </Stack>
                </RadioGroup>

                {declineRemarks === "Other" && (
                  <Input
                    placeholder="Please specify your reason..."
                    fullWidth
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                  />
                )}

                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    color="danger"
                    onClick={() => setDeclineModal(false)}
                    fullWidth
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setConfirmationItemDecline(true)}
                    fullWidth
                    disabled={
                      !declineRemarks ||
                      (declineRemarks === "Other" && otherReason.trim() === "")
                    } // Disable confirm button if no reason is selected
                  >
                    Submit
                  </Button>
                </Box>
              </ModalDialog>
            </Modal>
            <Modal
              open={confirmationItemDecline}
              onClose={() => setConfirmationItemDecline(false)}
            >
              <ModalDialog>
                <ModalClose />
                <Typography level="h4" gutterBottom>
                  Decline
                </Typography>
                <Typography>
                  Are you sure you want to decline the retrieval?
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    disabled={loading}
                    color="danger"
                    onClick={() => setConfirmationItemDecline(false)}
                    fullWidth
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={loading}
                    loading={loading}
                    onClick={(e) =>
                      handleDecline(e, row.finder.item._id, row._id)
                    }
                    fullWidth
                  >
                    Confirm
                  </Button>
                </Box>
              </ModalDialog>
            </Modal>
            <Button
              color="success"
              onClick={() => setConfirmationItemClaimed(true)}
              fullWidth
            >
              Item Resolved
            </Button>

            <Modal
              open={confirmationItemClaimed}
              onClose={() => setConfirmationItemClaimed(false)}
            >
              <ModalDialog>
                <ModalClose />
                <Typography level="h4" gutterBottom>
                  Confirmation
                </Typography>
                <Typography>Did the owner retrieve the item?</Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    disabled={loading}
                    color="danger"
                    onClick={() => setConfirmationItemClaimed(false)}
                    fullWidth
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={loading}
                    loading={loading}
                    onClick={(e) =>
                      handleSubmit(e, row.finder.item._id, row._id)
                    }
                    fullWidth
                  >
                    Confirm
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

export default ItemReservedModal;
