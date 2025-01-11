"use client";

import {
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Box,
  DialogContent,
} from "@mui/joy";
import React from "react";
import ItemDetails from "./ItemDetails";

const ItemPublishedModal = ({
  row,
  open,
  onClose,
  refreshData,
  session,
  setMessage,
  setOpenSnackbar,
}) => {
  return (
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
            overflowX: "hidden",
            overflowY: "auto", // Allows vertical scrolling
            "&::-webkit-scrollbar": {
              width: "8px", // Width of the scrollbar
              opacity: 0, // Hidden by default
              transition: "opacity 0.3s ease", // Smooth transition
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.4)", // Visible thumb
              borderRadius: "4px", // Rounded edges
            },
            "&:hover": {
              "&::-webkit-scrollbar": {
                opacity: 1, // Make scrollbar visible on hover
              },
            },
            "-ms-overflow-style": "none", // Hides scrollbar in IE and Edge
            "scrollbar-width": "none", // Hides scrollbar in Firefox by default
            "&:hover": {
              "scrollbar-width": "thin", // Visible scrollbar on hover in Firefox
            },
          }}
        >
          <ItemDetails
            row={row}
            refreshData={refreshData}
            setOpenSnackbar={setOpenSnackbar}
            setMessage={setMessage}
          />
        </DialogContent>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </ModalDialog>
    </Modal>
  );
};

export default ItemPublishedModal;
