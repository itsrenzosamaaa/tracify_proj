"use client";

import {
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Box,
  Snackbar,
  DialogContent,
} from "@mui/joy";
import React, { useState } from "react";
import ItemDetails from "./ItemDetails";

const ItemValidatingModal = ({
  row,
  open,
  onClose,
  refreshData,
  session,
  setMessage,
  setOpenSnackbar,
}) => {
  const [itemValidate, setItemValidate] = useState(null);
  const [itemInvalidate, setItemInvalidate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, id) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setLoading(true);

    try {
      const response = await fetch(`/api/found-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Published" }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: row?.user?._id,
          isFinder: true,
          item_name: row?.item?.name,
          caption: row?.item?.description,
          finder: row._id,
          createdAt: new Date(),
        }),
      });

      const notificationResponse = await fetch("/api/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver: row.user._id,
          message: `The item (${row.item.name}) you surrendered has been published!`,
          type: "Found Items",
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
            type: "ItemSurrenderSuccess",
            to: row.user.emailAddress,
            subject: "Item Surrender Success",
            name: row.user.firstname,
            link: "tlc-tracify.vercel.app/my-items#found-item",
            itemName: row.item.name,
            location: "SASO",
          }),
        });

        if (!mailResponse.ok)
          throw new Error(data.message || "Failed to send email");
      }

      setOpenSnackbar("success");
      setMessage("Item has been published!");
      onClose();
      await refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvalid = async (e, id) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setLoading(true);

    try {
      const response = await fetch(`/api/found-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Declined",
          reason: "The finder failed to surrender the item.",
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const notificationResponse = await fetch("/api/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver: row.user._id,
          message: `You failed to surrender the item (${row.item.name})`,
          type: "Declined Items",
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
            type: "ItemSurrenderInvalid",
            to: row.user.emailAddress,
            subject: "You failed to surrender the item",
            name: row.user.firstname,
            link: "tlc-tracify.vercel.app/my-items#declined-item",
            itemName: row.item.name,
            location: "SASO",
          }),
        });

        if (!mailResponse.ok)
          throw new Error(data.message || "Failed to send email");
      }

      setOpenSnackbar("success");
      setMessage("Item has been invalidated.");
      onClose();
      await refreshData();
    } catch (error) {
      setOpenSnackbar("success");
      setMessage(error);
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
            Surrender Pending
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
              color="danger"
              onClick={() => setItemInvalidate(row.item._id)}
              fullWidth
            >
              Invalid
            </Button>
            <Button onClick={() => setItemValidate(row.item._id)} fullWidth>
              Publish
            </Button>
            <Modal open={itemValidate} onClose={() => setItemValidate(null)}>
              <ModalDialog>
                <ModalClose />
                <Typography level="h4" gutterbottom>
                  Confirmation
                </Typography>
                <Typography>
                  Are you sure you want to publish the item?
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    loading={loading}
                    disabled={loading}
                    color="danger"
                    onClick={() => setItemValidate(null)}
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
              open={itemInvalidate}
              onClose={() => setItemInvalidate(null)}
            >
              <ModalDialog>
                <ModalClose />
                <Typography level="h4" gutterbottom>
                  Invalidation
                </Typography>
                <Typography>
                  Did the finder failed to surrender the item?
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    loading={loading}
                    disabled={loading}
                    variant="outlined"
                    onClick={() => setItemInvalidate(null)}
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={loading}
                    disabled={loading}
                    color="danger"
                    onClick={(e) => handleInvalid(e, row.item._id)}
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

export default ItemValidatingModal;
