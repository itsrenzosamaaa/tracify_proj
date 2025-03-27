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
} from "@mui/joy";
import React from "react";
import MatchedItemsDetails from "./MatchedItemsDetails";

const CompletedModal = ({ row, open, onClose }) => {
  return (
    <>
      <Modal open={open === row._id} onClose={onClose}>
        <ModalDialog>
          <ModalClose />
          <Typography
            level="h4"
            sx={{ marginBottom: 2, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            Matched Item Details
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
            <Button variant="outlined" onClick={onClose} fullWidth>
              Back
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default CompletedModal;
