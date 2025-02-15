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
  users,
}) => {
  const [declineModal, setDeclineModal] = useState(false);
  const [declineRemarks, setDeclineRemarks] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [seePost, setSeePost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmationItemClaimed, setConfirmationItemClaimed] = useState(false);
  const [itemClaimed, setItemClaimed] = useState(false);
  const [confirmationItemDecline, setConfirmationItemDecline] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      (user._id !== row.finder.user._id && user._id !== row.owner.user._id) &&
      user.role.permissions.includes("User Dashboard")
  );

  const handleReasonChange = (event) => {
    setDeclineRemarks(event.target.value);

    if (event.target.value !== "Other") {
      setOtherReason("");
    }
  };

  const handleSubmit = async (e, foundItemId, lostItemId, matchedId) => {
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
          throw new Error(
            errorData.message || `Failed to perform request to ${url}`
          );
        }

        return response.json();
      };

      // Update found item status
      await makeRequest(`/api/found-items/${foundItemId}`, "PUT", {
        status: "Resolved",
      });

      // // Update lost item status
      await makeRequest(`/api/lost-items/${lostItemId}`, "PUT", {
        status: "Claimed",
      });

      await makeRequest(`/api/users/${row.finder.user._id}/increment`, "PUT", {
        increment: "found-item",
      });

      // Update match status
      await makeRequest(`/api/match-items/${matchedId}`, "PUT", {
        request_status: "Completed",
      });

      const notificationData = [
        {
          receiver: row.finder.user._id,
          message: `Your found item ${row.finder.item.name} has been returned to its owner! Please rate your owner by clicking this!`,
          type: "Completed Items",
          markAsRead: false,
          dateNotified: new Date(),
        },
        {
          receiver: row.owner.user._id,
          message: `Congratulations! The item (${row.owner.item.name}) has been successfully claimed. Please rate your finder by clicking this!`,
          type: "Completed Items",
          markAsRead: false,
          dateNotified: new Date(),
        },
      ];

      await Promise.all(
        notificationData.map((notif) =>
          makeRequest("/api/notification", "POST", notif)
        )
      );

      if (seePost === "It was shared by another user") {
        await makeRequest(`/api/users/${selectedUser}/increment`, "PUT", {
          increment: "share",
        });
      }

      // Close modals, refresh data, and show success notification
      setConfirmationItemClaimed(false);
      setItemClaimed(false);
      onClose();
      await refreshData();
      setOpenSnackbar("success");
      setMessage("The item has been returned to the owner!");
    } catch (error) {
      setOpenSnackbar("danger"); // Display error message
      setMessage("Error updating items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (e, foundItemId, lostItemId, matchedItemId) => {
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
      await makeRequest(`/api/lost-items/${lostItemId}`, "PUT", {
        status: "Decline Retrieval",
      });
      await makeRequest(`/api/match-items/${matchedItemId}`, "PUT", {
        request_status: "Declined",
        remarks: declineRemarks === "Other" ? otherReason : declineRemarks,
      });
      const notificationData = [
        {
          receiver: row.finder.user._id,
          message: `The owner failed to claim the item. Your found item (${row.finder.item.name}) will be reverted back as Published`,
          type: "Found Items",
          markAsRead: false,
          dateNotified: new Date(),
        },
        {
          receiver: row.owner.user._id,
          message: `You have failed to claim an item (${row.owner.item.name}). Click here for more details.`,
          type: "Lost Items",
          markAsRead: false,
          dateNotified: new Date(),
        },
      ];

      await Promise.all(
        notificationData.map((notif) =>
          makeRequest("/api/notification", "POST", notif)
        )
      );

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
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setConfirmationItemDecline(true)}
                    fullWidth
                    disabled={
                      !declineRemarks ||
                      (declineRemarks === "Other" && otherReason === "")
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
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={loading}
                    loading={loading}
                    onClick={(e) =>
                      handleDecline(
                        e,
                        row.finder.item._id,
                        row.owner.item._id,
                        row._id
                      )
                    }
                    fullWidth
                  >
                    Confirm
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
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={loading}
                    loading={loading}
                    onClick={(e) =>
                      handleDecline(
                        e,
                        row.finder.item._id,
                        row.owner.item._id,
                        row._id
                      )
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
              onClick={() => setItemClaimed(true)}
              fullWidth
            >
              Item Resolved
            </Button>
            <Modal open={itemClaimed} onClose={() => setItemClaimed(false)}>
              <ModalDialog>
                <ModalClose />
                <Typography level="h4" gutterBottom>
                  Resolved Item
                </Typography>
                <FormControl>
                  <FormLabel>How was the item found?</FormLabel>
                  <RadioGroup
                    value={seePost}
                    onChange={(e) => setSeePost(e.target.value)}
                    sx={{ my: 2 }}
                  >
                    <Stack spacing={2}>
                      <FormControlLabel
                        value="The finder posted it"
                        control={<Radio />}
                        label="The finder posted it"
                      />
                      <FormControlLabel
                        value="It was shared by another user"
                        control={<Radio />}
                        label="It was shared by another user"
                      />
                    </Stack>
                  </RadioGroup>
                </FormControl>
                {seePost === "It was shared by another user" && (
                  <FormControl>
                    <FormLabel>Who shared the post?</FormLabel>
                    <Autocomplete
                      fullWidth
                      required
                      options={filteredUsers}
                      getOptionLabel={(user) =>
                        `${user.firstname} ${user.lastname}`
                      } // Display full name
                      value={
                        filteredUsers.find(
                          (user) => user._id === selectedUser
                        ) || null
                      } // Set selected value
                      onChange={(event, newValue) =>
                        setSelectedUser(newValue ? newValue._id : "")
                      } // Update state
                      renderInput={(params) => (
                        <Input {...params} placeholder="Search user..." />
                      )}
                    />
                  </FormControl>
                )}
                <Button
                  sx={{ mt: 2 }}
                  onClick={() => setConfirmationItemClaimed(true)}
                  disabled={
                    seePost === "It was shared by another user" && !selectedUser
                  }
                >
                  Submit
                </Button>
              </ModalDialog>
            </Modal>

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
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={loading}
                    loading={loading}
                    onClick={(e) =>
                      handleSubmit(
                        e,
                        row.finder.item._id,
                        row.owner.item._id,
                        row._id
                      )
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
