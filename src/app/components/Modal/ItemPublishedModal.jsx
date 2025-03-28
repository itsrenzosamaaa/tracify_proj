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
  locationOptions,
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
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </ModalDialog>
    </Modal>
  );
};

export default ItemPublishedModal;
