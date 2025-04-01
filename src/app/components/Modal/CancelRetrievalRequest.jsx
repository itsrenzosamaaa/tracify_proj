"use client";

import {
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Box,
  Button,
  RadioGroup,
  Stack,
  Radio,
  Input,
} from "@mui/joy";
import { FormControlLabel } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const CancelRetrievalRequest = ({ open, onClose, matchItem }) => {
  const [loading, setLoading] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [confirmationCancelModal, setConfirmationCancelModal] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const router = useRouter();

  const handleReasonChange = (event) => {
    setCancelRemarks(event.target.value);

    if (event.target.value !== "Other") {
      setOtherReason("");
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    try {
      setLoading(true);
      const foundResponse = await fetch(
        `/api/found-items/${matchItem.finder.item._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Decline Retrieval",
          }),
        }
      );

      if (!foundResponse.ok) throw new Error("Failed to update status");

      const matchResponse = await fetch(`/api/match-items/${matchItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_status: "Canceled",
          remarks: cancelRemarks === "Other" ? otherReason : cancelRemarks,
        }),
      });

      if (!matchResponse.ok) throw new Error("Failed to update status");

      router.push("/my-items");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" gutterbottom>
            Cancel Retrieval
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
            You can cancel your retrieval request by selecting a reason below.
          </Typography>

          <RadioGroup
            value={cancelRemarks}
            onChange={handleReasonChange}
            sx={{ my: 2 }}
          >
            <Stack spacing={2}>
              <FormControlLabel
                value="Item Belongs to Someone Else"
                control={<Radio />}
                label="Item Belongs to Someone Else"
              />
              <FormControlLabel
                value="Claim Process Taking Too Long"
                control={<Radio />}
                label="Claim Process Taking Too Long"
              />
              <FormControlLabel
                value="Change in circumstances"
                control={<Radio />}
                label="Change in circumstances"
              />
              <FormControlLabel
                value="Concern about item condition"
                control={<Radio />}
                label="Concern about item condition"
              />
              <FormControlLabel
                value="Other"
                control={<Radio />}
                label="Other"
              />
            </Stack>
          </RadioGroup>

          {cancelRemarks === "Other" && (
            <Input
              required
              placeholder="Please specify your reason..."
              fullWidth
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
            />
          )}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button color="danger" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button
              onClick={() => setConfirmationCancelModal(true)}
              fullWidth
              disabled={
                !cancelRemarks ||
                (cancelRemarks === "Other" && otherReason === "")
              }
            >
              Submit
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      <Modal
        open={confirmationCancelModal}
        onClose={() => setConfirmationCancelModal(null)}
      >
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" gutterBottom>
            Cancel Request
          </Typography>
          <Typography>
            Are you sure you want to cancel your retrieval request?
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              disabled={loading}
              loading={loading}
              onClick={onClose}
              variant="outlined"
              fullWidth
            >
              Close
            </Button>
            <Button
              disabled={loading}
              loading={loading}
              onClick={(e) => handleSubmit(e)}
              fullWidth
              color="danger"
            >
              Cancel
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default CancelRetrievalRequest;
