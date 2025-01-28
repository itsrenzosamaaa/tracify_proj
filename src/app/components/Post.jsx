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
  Select,
  Option,
  FormControl,
  FormLabel,
} from "@mui/joy";
import { ImageList, ImageListItem } from "@mui/material";
import { Share, Send } from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { CldImage } from "next-cloudinary";
import { format, isToday } from "date-fns";
import ConfirmationRetrievalRequest from "./Modal/ConfirmationRetrievalRequest";
import PreviewBadge from "./PreviewBadge";

const Post = ({
  refreshData,
  matches,
  setOpenSnackbar,
  setMessage,
  post,
  session,
  author,
  item,
  createdAt,
  caption,
  isXs,
  lostItems = null,
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
      await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isShared: true,
          caption: sharedCaption,
          sharedBy: session?.user?.id,
          sharedAt: new Date(),
          originalPost: post?._id,
        }),
      });
      setSharePostModal(false);
      setOpenSnackbar("success");
      setMessage("Post shared successfully!");
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

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
              src={author?.profile_picture}
              alt={author?.firstname}
              style={{ cursor: "pointer" }}
            />
            <Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography
                  level={isXs ? "body-sm" : "body-md"}
                  fontWeight={700}
                >
                  {author?.firstname} {author?.lastname}
                </Typography>
                <PreviewBadge
                  resolvedItemCount={author?.resolvedItemCount}
                  shareCount={author?.shareCount}
                  role={author?.role}
                  birthday={author?.birthday}
                />
              </Box>
              <Typography level={isXs ? "body-xs" : "body-sm"} fontWeight={300}>
                {isToday(new Date(createdAt))
                  ? `Today, ${format(new Date(createdAt), "hh:mm a")}`
                  : format(new Date(createdAt), "MMMM dd, yyyy - hh:mm a")}
              </Typography>
            </Box>
          </Box>

          <Chip
            variant="solid"
            size={isXs ? "sm" : "md"}
            color={post?.isFinder ? "success" : "danger"}
          >
            {post?.isFinder ? "Found Item" : "Lost Item"}
          </Chip>

          {/* Post Caption */}
          <Typography
            level={isXs ? "body-sm" : "body-md"}
            sx={{ color: "text.secondary", mb: 2 }}
          >
            {caption}
          </Typography>

          {(() => {
            let matchedItem;

            if (post?.isFinder) {
              // Check for matches where the finder matches the item ID
              matchedItem = matches.find(
                (match) =>
                  match?.finder?._id === item?._id &&
                  ["Resolved", "Matched"].includes(match?.finder?.item?.status)
              );

              return matchedItem ? (
                <Typography
                  level={isXs ? "body-sm" : "body-md"}
                  color={
                    matchedItem?.finder?.item?.status === "Resolved"
                      ? "success"
                      : "warning"
                  }
                >
                  {matchedItem?.finder?.item?.status === "Resolved"
                    ? "The owner has successfully claimed the item!"
                    : "Someone sent a claim request for this item!"}
                </Typography>
              ) : null; // Return null if no match is found
            } else {
              // Check for matches where the owner matches the item ID
              matchedItem = matches.find(
                (match) =>
                  match?.owner?._id === item?._id &&
                  ["Claimed", "Unclaimed"].includes(match?.owner?.item?.status)
              );

              return matchedItem ? (
                <Typography
                  level={isXs ? "body-sm" : "body-md"}
                  color={
                    matchedItem?.owner?.item?.status === "Claimed"
                      ? "success"
                      : "warning"
                  }
                >
                  {matchedItem?.owner?.item?.status === "Claimed"
                    ? "The owner has successfully claimed the item!"
                    : "The item has been found by the finder."}
                </Typography>
              ) : null; // Return null if no match is found
            }
          })()}

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
          <Carousel showThumbs={false} useKeyboardArrows>
            {item?.item?.images?.map((image, index) => (
              <Box
                key={index}
                sx={{
                  overflow: "hidden",
                  display: "inline-block",
                  cursor: "pointer",
                  margin: 1, // Adds some spacing between images
                }}
                onClick={() => window.open(image || "#", "_blank")}
              >
                <CldImage
                  src={image}
                  width={isXs ? 200 : 300}
                  height={isXs ? 200 : 300}
                  alt={item?.item?.name || "Item Image"}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                />
              </Box>
            ))}
          </Carousel>

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
            {session?.user?.id !== author?._id &&
              !matches.some((match) => match?.finder?._id === item?._id) &&
              post?.isFinder && ( // Ensure item is not already matched
                <>
                  <Box
                    onClick={() => setClaimModal(post._id)} // Replace with your actual handler function
                    sx={{
                      cursor: "pointer",
                      justifyContent: "center",
                      width: "200px",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        color: "primary.main",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                        transform: "scale(1.05)",
                      },
                      "&:focus": {
                        outline: "2px solid rgba(0, 0, 0, 0.2)",
                        outlineOffset: "2px",
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
              onClick={() => setSharePostModal(post._id)}
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
      <Modal open={claimModal === post._id} onClose={() => setClaimModal(null)}>
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

                          if (selectedItem?.date_time === "Unidentified") {
                            return "Unidentified"; // Explicit unidentified case
                          }

                          const dateTimeParts =
                            selectedItem?.date_time?.split(" to ");
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

                          if (selectedItem?.date_time === "Unidentified") {
                            return "Unidentified"; // Explicit unidentified case
                          }

                          const dateTimeParts =
                            selectedItem?.date_time?.split(" to ");
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
                  onClick={() => setConfirmationRetrievalRequest(post._id)}
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
        open={confirmationRetrievalRequest === post._id}
        onClose={() => setConfirmationRetrievalRequest(null)}
        closeModal={() => setClaimModal(null)}
        foundItem={item}
        lostItem={selectedLostItem}
        finder={item?._id}
        refreshData={refreshData}
      />
      <Modal
        open={sharePostModal === post._id}
        onClose={() => setSharePostModal(null)}
      >
        <form onSubmit={handleSubmit}>
          <ModalDialog>
            <ModalClose />
            <Typography level={isXs ? "h5" : "h4"} fontWeight={700}>
              Share
            </Typography>
            <Divider />
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{ mr: 2 }}
                src={session?.user?.profile_picture}
                alt={session?.user?.firstname}
              />
              <Box>
                <Typography
                  level={isXs ? "body-sm" : "body-md"}
                  fontWeight={700}
                >
                  {session?.user?.firstname} {session?.user?.lastname}
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

export default Post;
