"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  Button,
  Divider,
  Modal,
  ModalDialog,
  ModalClose,
  Textarea,
  Chip,
  DialogContent,
  FormControl,
  FormLabel,
  Select,
  Option,
} from "@mui/joy";
import { ImageList, ImageListItem, Paper } from "@mui/material";
import { Share, Send } from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { CldImage } from "next-cloudinary";
import { format, isToday } from "date-fns";
import PreviewBadge from "./PreviewBadge";
import ConfirmationRetrievalRequest from "./Modal/ConfirmationRetrievalRequest";

const SharedPost = ({
  refreshData = null,
  matches = null,
  setOpenSnackbar,
  setMessage,
  post,
  session,
  sharedBy,
  originalPost,
  caption,
  sharedAt,
  isXs,
  lostItems = null,
  roleColors,
}) => {
  const [sharePostModal, setSharePostModal] = useState(null);
  const [claimModal, setClaimModal] = useState(null);
  const [selectedLostItem, setSelectedLostItem] = useState(null);
  const [confirmationRetrievalRequest, setConfirmationRetrievalRequest] =
    useState(null);
  const [sharedCaption, setSharedCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isShared: true,
          caption: sharedCaption,
          sharedBy: session.user.id,
          sharedAt: new Date(),
          originalPost: originalPost._id,
        }),
      });

      const data = await response.json();
      if (session?.user?.id !== originalPost?.author?._id) {
        await fetch("/api/notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiver: originalPost?.author?._id,
            message: `${session?.user?.firstname} ${session?.user?.lastname} shared your post.`,
            type: "Shared Post",
            markAsRead: false,
            dateNotified: new Date(),
            post:
              session?.user?.id !== originalPost?.author?._id ? data._id : null,
          }),
        });
      }
      setSharePostModal(null);
      setSharedCaption("");
      setOpenSnackbar("success");
      setMessage("Post shared successfully!");
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOriginalPost = originalPost?.isFinder
    ? originalPost?.finder
    : originalPost?.owner;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, borderRadius: "10px", boxShadow: 3 }}
      >
        <CardContent>
          {/* Author Info */}
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{ mr: 2 }}
              src={sharedBy?.profile_picture}
              alt={sharedBy?.firstname}
              style={{ cursor: "pointer" }}
            />
            <Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography
                  level={isXs ? "body-sm" : "body-md"}
                  fontWeight={700}
                  sx={{ color: roleColors[sharedBy?.role] || "inherit" }}
                >
                  {sharedBy?.firstname} {sharedBy?.lastname}
                </Typography>
                <PreviewBadge
                  resolvedItemCount={sharedBy?.resolvedItemCount}
                  shareCount={sharedBy?.shareCount}
                  birthday={sharedBy?.birthday}
                />
              </Box>
              <Typography level={isXs ? "body-xs" : "body-sm"} fontWeight={300}>
                {isToday(new Date(sharedAt))
                  ? `Today, ${format(new Date(sharedAt), "hh:mm a")}`
                  : format(new Date(sharedAt), "MMMM dd, yyyy - hh:mm a")}
              </Typography>
            </Box>
          </Box>

          {/* Post Caption */}
          {caption !== "" && (
            <Typography
              level={isXs ? "body-sm" : "body-md"}
              sx={{
                color: "text.secondary",
                mb: 2,
                wordBreak: "break-word", // Ensures long words wrap to the next line
                overflowWrap: "break-word", // Additional support for wrapping long text
                whiteSpace: "pre-wrap", // Preserves line breaks in the original text
              }}
            >
              {caption}
            </Typography>
          )}

          {/* Item Details */}
          {/* <Typography level="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {item.name} - {item.category}
        </Typography>
        <Typography level="body2" sx={{ color: "text.secondary" }} paragraph>
          Condition: {item.condition} | Distinctive Marks:{" "}
          {item.distinctiveMarks}
        </Typography>
        <Typography level="body2" sx={{ color: "text.secondary" }} paragraph>
          Located at: {item.location}
        </Typography>
        <Typography level="body2" sx={{ color: "text.secondary" }} paragraph>
          Description: {item.description}
        </Typography> */}

          {/* Item Images */}
          <Box sx={{ border: "1px solid #B0BEC5", borderRadius: "5px" }}>
            <Carousel showThumbs={false} useKeyboardArrows>
              {filteredOriginalPost.item.images?.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    overflow: "hidden",
                    display: "inline-block",
                    cursor: "pointer",
                  }}
                  onClick={() => window.open(image || "#", "_blank")}
                >
                  <CldImage
                    src={image}
                    width={isXs ? 200 : 300}
                    height={isXs ? 200 : 300}
                    alt={filteredOriginalPost.item?.name || "Item Image"}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                  />
                </Box>
              ))}
            </Carousel>
            <Box sx={{ padding: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{ mr: 2 }}
                  src={originalPost.author.profile_picture}
                  alt={originalPost.author.firstname}
                  style={{ cursor: "pointer" }}
                />
                <Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Typography
                      level={isXs ? "body-sm" : "body-md"}
                      fontWeight={700}
                      sx={{
                        color:
                          roleColors[originalPost?.author?.role] || "inherit",
                      }}
                    >
                      {originalPost.author.firstname}{" "}
                      {originalPost.author.lastname}
                    </Typography>
                    <PreviewBadge
                      resolvedItemCount={originalPost.author.resolvedItemCount}
                      shareCount={originalPost.author.shareCount}
                      birthday={originalPost.author.birthday}
                    />
                  </Box>
                  <Typography
                    level={isXs ? "body-xs" : "body-sm"}
                    fontWeight={300}
                  >
                    {isToday(new Date(originalPost.createdAt))
                      ? `Today, ${format(
                          new Date(originalPost.createdAt),
                          "hh:mm a"
                        )}`
                      : format(
                          new Date(originalPost.createdAt),
                          "MMMM dd, yyyy - hh:mm a"
                        )}
                  </Typography>
                </Box>
              </Box>
              <Chip
                variant="solid"
                color={originalPost?.isFinder ? "success" : "danger"}
              >
                {originalPost?.isFinder ? "Found Item" : "Lost Item"}
              </Chip>
              <Typography
                level={isXs ? "body-sm" : "body-md"}
                sx={{ color: "text.secondary", mb: 2 }}
              >
                {originalPost.caption}
              </Typography>
              <Typography
                level={isXs ? "body-sm" : "body-md"}
                sx={{ color: "text.secondary", mb: 2 }}
              >
                <strong>Location:</strong> {filteredOriginalPost?.item?.location}
              </Typography>
              {matches !== null &&
                (() => {
                  let matchedItem;
                  const isFinder = originalPost?.isFinder;

                  // Function to determine the color and message based on item status
                  const getItemMessage = (itemStatus, role) => {
                    if (itemStatus === "Resolved" || itemStatus === "Claimed") {
                      return {
                        message:
                          role === "finder"
                            ? "The owner has successfully claimed the item!"
                            : "The item has been found by the finder.",
                        color: "success",
                      };
                    } else if (
                      itemStatus === "Matched" ||
                      itemStatus === "Unclaimed"
                    ) {
                      return {
                        message:
                          role === "finder"
                            ? "Someone sent a claim request for this item!"
                            : "The item is still unclaimed.",
                        color: "warning",
                      };
                    }
                    return null;
                  };

                  if (isFinder) {
                    // Finder logic: match based on finder ID and item status
                    matchedItem = matches.find(
                      (match) =>
                        match?.finder?._id === originalPost?.finder?._id &&
                        ["Resolved", "Matched"].includes(
                          match?.finder?.item?.status
                        )
                    );
                    const { message, color } = matchedItem
                      ? getItemMessage(
                          matchedItem?.finder?.item?.status,
                          "finder"
                        )
                      : {};

                    return matchedItem ? (
                      <Typography
                        level={isXs ? "body-sm" : "body-md"}
                        color={color}
                      >
                        {message}
                      </Typography>
                    ) : null;
                  } else {
                    // Owner logic: match based on owner ID and item status
                    matchedItem = matches.find(
                      (match) =>
                        match?.owner?._id === originalPost?.owner?._id &&
                        ["Claimed", "Unclaimed"].includes(
                          match?.owner?.item?.status
                        )
                    );
                    const { message, color } = matchedItem
                      ? getItemMessage(
                          matchedItem?.owner?.item?.status,
                          "owner"
                        )
                      : {};

                    return matchedItem ? (
                      <Typography
                        level={isXs ? "body-sm" : "body-md"}
                        color={color}
                      >
                        {message}
                      </Typography>
                    ) : null;
                  }
                })()}
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: "text.secondary",
            }}
          >
            {/* Claim Section */}
            {session?.user?.id !== originalPost?.author?._id &&
              !matches.some(
                (match) =>
                  match?.finder?._id === originalPost?.finder?.item?._id
              ) &&
              originalPost?.isFinder && (
                <>
                  <Box
                    onClick={() => setClaimModal(originalPost._id)} // Replace with your actual handler function
                    sx={{
                      cursor: "pointer",
                      justifyContent: "center",
                      width: "200px",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      padding: "8px", // Add padding for better interaction area
                      borderRadius: "8px",
                      transition: "all 0.3s ease", // Smooth transition for all properties
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)", // Subtle background change
                        color: "primary.main", // Change text/icon color
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", // Add hover shadow
                        transform: "scale(1.05)", // Slightly enlarge on hover
                      },
                    }}
                  >
                    <Send fontSize={isXs ? "small" : "medium"} />
                    <Typography
                      level={isXs ? "body-sm" : "body-md"}
                      sx={{
                        color: "inherit",
                        transition: "color 0.3s ease",
                      }}
                    >
                      Claim
                    </Typography>
                  </Box>

                  <Divider orientation="vertical" flexItem />
                </>
              )}

            {/* Share Section */}
            <Box
              onClick={() => setSharePostModal(originalPost._id)}
              sx={{
                cursor: "pointer",
                justifyContent: "center",
                width: "200px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                padding: "8px", // Add padding for better interaction area
                borderRadius: "8px",
                transition: "all 0.3s ease", // Smooth transition for all properties
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.05)", // Subtle background change
                  color: "primary.main", // Change text/icon color
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", // Add hover shadow
                  transform: "scale(1.05)", // Slightly enlarge on hover
                },
              }}
            >
              <Share fontSize={isXs ? "small" : "medium"} />
              <Typography
                level={isXs ? "body-sm" : "body-md"}
                sx={{
                  color: "inherit",
                  transition: "color 0.3s ease",
                }}
              >
                Share
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      {originalPost.author._id !== session?.user?.id && (
        <>
          <Modal
            open={claimModal === originalPost._id}
            onClose={() => setClaimModal(null)}
          >
            <ModalDialog>
              <ModalClose />
              <DialogContent>
                <Typography level="h4" gutterBottom>
                  {lostItems.length === 0
                    ? "Claim Request Canceled"
                    : "Send Claim Request"}
                </Typography>
                {lostItems.length !== 0 ? (
                  <>
                    <FormControl>
                      <FormLabel>Your Lost Item</FormLabel>
                      <Select
                        required
                        placeholder="Select your missing lost item"
                        value={selectedLostItem}
                        onChange={(e, value) => setSelectedLostItem(value)}
                      >
                        {lostItems.map((lostItem) => (
                          <Option key={lostItem?._id} value={lostItem?._id}>
                            {lostItem?.item?.name || "Unnamed Item"}
                          </Option>
                        ))}
                      </Select>
                      {selectedLostItem && (
                        <Box sx={{ marginTop: 2 }}>
                          <Typography level="body-md">
                            <strong>Color:</strong>{" "}
                            {lostItems
                              .find(
                                (lostItem) => lostItem?._id === selectedLostItem
                              )
                              ?.item?.color?.join(", ") || "N/A"}
                          </Typography>
                          <Typography level="body-md">
                            <strong>Size:</strong>{" "}
                            {lostItems.find(
                              (lostItem) => lostItem?._id === selectedLostItem
                            )?.item?.size || "N/A"}
                          </Typography>
                          <Typography level="body-md">
                            <strong>Category:</strong>{" "}
                            {lostItems.find(
                              (lostItem) => lostItem?._id === selectedLostItem
                            )?.item?.category || "N/A"}
                          </Typography>
                          <Typography level="body-md">
                            <strong>Material:</strong>{" "}
                            {lostItems.find(
                              (lostItem) => lostItem?._id === selectedLostItem
                            )?.item?.material || "N/A"}
                          </Typography>
                          <Typography level="body-md">
                            <strong>Condition:</strong>{" "}
                            {lostItems.find(
                              (lostItem) => lostItem?._id === selectedLostItem
                            )?.item?.condition || "N/A"}
                          </Typography>
                          <Typography level="body-md">
                            <strong>Distinctive Marks:</strong>{" "}
                            {lostItems.find(
                              (lostItem) => lostItem?._id === selectedLostItem
                            )?.item?.distinctiveMarks || "N/A"}
                          </Typography>
                          <Typography level="body-md">
                            <strong>Location:</strong>{" "}
                            {lostItems.find(
                              (lostItem) => lostItem?._id === selectedLostItem
                            )?.item?.location || "N/A"}
                          </Typography>
                          <Typography level="body-md">
                            <strong>Lost Start Date:</strong>{" "}
                            {(() => {
                              const selectedItem = lostItems.find(
                                (lostItem) => lostItem?._id === selectedLostItem
                              )?.item;

                              if (!selectedItem) {
                                return "N/A"; // No item selected
                              }

                              if (selectedItem.date_time === "Unidentified") {
                                return "Unidentified"; // Explicit unidentified case
                              }

                              const dateTimeParts =
                                selectedItem.date_time?.split(" to ");
                              return dateTimeParts && dateTimeParts[0]
                                ? dateTimeParts[0]
                                : "N/A"; // Extract or fallback
                            })()}
                          </Typography>
                          <Typography level="body-md">
                            <strong>Lost End Date:</strong>{" "}
                            {(() => {
                              const selectedItem = lostItems.find(
                                (lostItem) => lostItem?._id === selectedLostItem
                              )?.item;

                              if (!selectedItem) {
                                return "N/A"; // No item selected
                              }

                              if (selectedItem.date_time === "Unidentified") {
                                return "Unidentified"; // Explicit unidentified case
                              }

                              const dateTimeParts =
                                selectedItem.date_time?.split(" to ");
                              return dateTimeParts && dateTimeParts[1]
                                ? dateTimeParts[1]
                                : "N/A"; // Extract or fallback
                            })()}
                          </Typography>
                        </Box>
                      )}
                    </FormControl>
                    <Button
                      type="submit"
                      disabled={!selectedLostItem}
                      onClick={() =>
                        setConfirmationRetrievalRequest(originalPost._id)
                      }
                    >
                      Next
                    </Button>
                  </>
                ) : (
                  <Typography>
                    It requires a recorded lost item in order to be reviewed by
                    SASO.
                  </Typography>
                )}
              </DialogContent>
            </ModalDialog>
          </Modal>
          <ConfirmationRetrievalRequest
            open={confirmationRetrievalRequest === originalPost._id}
            onClose={() => setConfirmationRetrievalRequest(null)}
            closeModal={() => setClaimModal(null)}
            foundItem={originalPost?.finder}
            lostItem={selectedLostItem}
            finder={originalPost?.finder?._id}
            refreshData={refreshData}
          />
        </>
      )}
      <Modal
        open={sharePostModal === originalPost._id}
        onClose={() => setSharePostModal(null)}
      >
        <form onSubmit={handleSubmit}>
          <ModalDialog>
            <ModalClose />
            <Typography level="h4" fontWeight={700}>
              Share
            </Typography>
            <Divider />
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{ mr: 2 }}
                src={session.user.profile_picture}
                alt={session.user.firstname}
              />
              <Box>
                <Typography level="body-session.user" fontWeight={700}>
                  {session.user.firstname} {session.user.lastname}
                </Typography>
                <Chip size="sm" variant="solid">
                  Feed
                </Chip>
              </Box>
            </Box>
            <Textarea
              minRows={4}
              disabled={loading}
              placeholder="Say something about this..."
              value={sharedCaption}
              onChange={(e) => setSharedCaption(e.target.value)}
            />
            <Button disabled={loading} loading={loading} type="submit">
              Share now
            </Button>
          </ModalDialog>
        </form>
      </Modal>
    </>
  );
};

export default SharedPost;
