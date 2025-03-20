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
  Tooltip,
} from "@mui/joy";
import { ImageList, ImageListItem, Paper } from "@mui/material";
import { Share, Send } from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { CldImage } from "next-cloudinary";
import { format, isToday } from "date-fns";
import PreviewBadge from "./PreviewBadge";
import ConfirmationRetrievalRequest from "./Modal/ConfirmationRetrievalRequest";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const SharedPost = ({
  refreshData,
  matches,
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

  const capitalizeWords = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const filteredOriginalPost = originalPost?.isFinder
    ? originalPost?.finder
    : originalPost?.owner;

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
          item_name: originalPost?.item_name,
          sharedAt: new Date(),
          originalPost: originalPost._id,
        }),
      });

      const data = await response.json();
      if (
        session?.user?.id !== originalPost?.author?._id &&
        originalPost?.author?.role?.permissions.includes("User Dashboard")
      ) {
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

  const matchedOwnerIds = new Set(
    matches.map((match) => match?.owner?._id?.toString())
  );

  const filteredLostItems = lostItems.filter(
    (lostItem) => !matchedOwnerIds.has(lostItem?._id?.toString())
  );

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
              src={sharedBy?.profile_picture || null}
              alt={sharedBy?.firstname || "User"}
              style={{ cursor: "pointer" }}
            />
            <Box>
              <Box sx={{ display: "flex", gap: 2, maxWidth: "100%" }}>
                <Tooltip
                  title={sharedBy?.role?.name || "Guest"}
                  placement="top"
                >
                  <Typography
                    level={isXs ? "body-sm" : "body-md"}
                    fontWeight={700}
                    sx={{
                      color: sharedBy?.role?.color || "inherit",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      maxWidth: isXs ? "135px" : "auto", // Adjust based on your layout
                    }}
                  >
                    {`${sharedBy?.firstname} ${sharedBy?.lastname}` ||
                      "Unknown User"}
                  </Typography>
                </Tooltip>

                <PreviewBadge
                  resolvedItemCount={sharedBy?.resolvedItemCount || 0}
                  shareCount={sharedBy?.shareCount || 0}
                  birthday={sharedBy?.birthday || null}
                  inherit={false}
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
          <Box
            sx={{
              border: "1px solid #B0BEC5",
              borderRadius: "5px",
            }}
          >
            <Carousel showThumbs={false} useKeyboardArrows>
              {filteredOriginalPost?.item?.images?.map((image, index) => (
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
                    alt={filteredOriginalPost?.item?.name || "Item Image"}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                  />
                </Box>
              ))}
            </Carousel>
            <Box sx={{ padding: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{ mr: 2 }}
                  src={originalPost.author.profile_picture || null}
                  alt={originalPost.author.firstname || "User"}
                  style={{ cursor: "pointer" }}
                />
                <Box>
                  <Box sx={{ display: "flex", gap: 2, maxWidth: "100%" }}>
                    <Tooltip
                      title={originalPost?.author?.role?.name || "Guest"}
                      placement="top"
                    >
                      <Typography
                        level={isXs ? "body-sm" : "body-md"}
                        fontWeight={700}
                        sx={{
                          color: originalPost?.author?.role?.color || "inherit",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          maxWidth: isXs ? "105px" : "auto", // Adjust based on your layout
                        }}
                      >
                        {`${originalPost?.author?.firstname} ${originalPost?.author?.lastname}` ||
                          "Unknown User"}
                      </Typography>
                    </Tooltip>
                    <PreviewBadge
                      resolvedItemCount={
                        originalPost?.author?.resolvedItemCount || 0
                      }
                      shareCount={originalPost?.author?.shareCount || 0}
                      birthday={originalPost?.author?.birthday || null}
                      inherit={false}
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
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap", // allow chips to wrap to next line
                  gap: 1,
                  width: "100%", // full width container
                  overflow: "hidden",
                }}
              >
                <Chip
                  variant="solid"
                  size={isXs ? "sm" : "md"}
                  color={originalPost?.isFinder ? "success" : "danger"}
                >
                  {originalPost?.isFinder ? (
                    <CheckCircleIcon fontSize={isXs ? "12px" : "20px"} />
                  ) : (
                    <ReportProblemIcon fontSize={isXs ? "12px" : "20px"} />
                  )}{" "}
                  {originalPost?.isFinder ? "Found Item" : "Lost Item"}
                </Chip>
                <Chip variant="solid" size={isXs ? "sm" : "md"} color="primary">
                  <ShoppingBagIcon fontSize={isXs ? "12px" : "20px"} />{" "}
                  {capitalizeWords(originalPost?.item_name)}
                </Chip>
                <Chip variant="solid" size={isXs ? "sm" : "md"} color="neutral">
                  <LocationOnIcon fontSize={isXs ? "12px" : "20px"} />
                  {filteredOriginalPost?.item?.location}
                </Chip>
              </Box>
              <Typography
                level={isXs ? "body-sm" : "body-md"}
                sx={{ color: "text.secondary", mb: 2 }}
              >
                {originalPost.caption}
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
                (match) => match?.finder?._id === filteredOriginalPost?._id
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
                {filteredLostItems.length > 0 ? (
                  <>
                    <FormControl>
                      <FormLabel>Your Lost Item</FormLabel>
                      <Select
                        required
                        placeholder="Select your missing lost item"
                        value={selectedLostItem}
                        onChange={(e, value) => setSelectedLostItem(value)}
                      >
                        {filteredLostItems.map((lostItem) => (
                          <Option key={lostItem?._id} value={lostItem?._id}>
                            {lostItem?.item?.name || "Unnamed Item"}
                          </Option>
                        ))}
                      </Select>

                      {selectedLostItem &&
                        (() => {
                          const selectedItem = filteredLostItems.find(
                            (lostItem) => lostItem?._id === selectedLostItem
                          )?.item;

                          return selectedItem ? (
                            <Box sx={{ marginTop: 2 }}>
                              <Typography level="body-md">
                                <strong>Color:</strong>{" "}
                                {selectedItem?.color?.join(", ") || "N/A"}
                              </Typography>
                              <Typography level="body-md">
                                <strong>Size:</strong>{" "}
                                {selectedItem?.size || "N/A"}
                              </Typography>
                              <Typography level="body-md">
                                <strong>Category:</strong>{" "}
                                {selectedItem?.category || "N/A"}
                              </Typography>
                              <Typography level="body-md">
                                <strong>Material:</strong>{" "}
                                {selectedItem?.material || "N/A"}
                              </Typography>
                              <Typography level="body-md">
                                <strong>Condition:</strong>{" "}
                                {selectedItem?.condition || "N/A"}
                              </Typography>
                              <Typography level="body-md">
                                <strong>Distinctive Marks:</strong>{" "}
                                {selectedItem?.distinctiveMarks || "N/A"}
                              </Typography>
                              <Typography level="body-md">
                                <strong>Location:</strong>{" "}
                                {selectedItem?.location || "N/A"}
                              </Typography>
                              <Typography level="body-md">
                                <strong>Lost Start Date:</strong>{" "}
                                {selectedItem?.date_time === "Unidentified"
                                  ? "Unidentified"
                                  : selectedItem?.date_time?.split(" to ")[0] ||
                                    "N/A"}
                              </Typography>
                              <Typography level="body-md">
                                <strong>Lost End Date:</strong>{" "}
                                {selectedItem?.date_time === "Unidentified"
                                  ? "Unidentified"
                                  : selectedItem?.date_time?.split(" to ")[1] ||
                                    "N/A"}
                              </Typography>
                            </Box>
                          ) : null;
                        })()}
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
                ) : lostItems.length === 0 ? (
                  <Typography>
                    It requires a recorded lost item in order to be reviewed by
                    SASO.
                  </Typography>
                ) : (
                  <Typography>
                    You have no lost items to select for manual checking.
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
            isAdmin={
              originalPost?.author?.role?.permissions.includes(
                "Admin Dashboard"
              )
                ? true
                : false
            }
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
