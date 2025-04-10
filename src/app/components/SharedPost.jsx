"use client";

import React, { useRef, useState } from "react";
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
  Autocomplete,
  Stack,
  Input,
  FormHelperText,
} from "@mui/joy";
import {
  ImageList,
  ImageListItem,
  keyframes,
  Paper,
  styled,
} from "@mui/material";
import { Share, Send, ContentCopy } from "@mui/icons-material";
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
import DummyPhoto from "./DummyPhoto";

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 10px #FFD700;
  }
  50% {
    box-shadow: 0 0 30px #FFD700;
  }
  100% {
    box-shadow: 0 0 10px #FFD700;
  }
`;

const HighlightAvatar = styled(Avatar)(({ theme }) => ({
  borderRadius: "50%",
  boxShadow: `0 0 10px 4px #FFD700`,
  animation: `${pulseGlow} 2s infinite ease-in-out`,
}));

const SharedPost = ({
  setOpenSnackbar,
  setMessage,
  post,
  session,
  sharedBy,
  originalPost,
  caption,
  sharedAt,
  isXs,
  users,
}) => {
  const [sharePostModal, setSharePostModal] = useState(null);
  const [claimModal, setClaimModal] = useState(null);
  const [selectedLostItem, setSelectedLostItem] = useState(null);
  const [confirmationRetrievalRequest, setConfirmationRetrievalRequest] =
    useState(null);
  const [sharedCaption, setSharedCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const inputRef = useRef();

  const handleCopyLink = () => {
    const isLost = !originalPost?.isFinder; // true if it's a lost item
    const itemType = isLost ? "Lost Item Alert 🚨" : "Found Item Notice 🟢";
    const introMessage = isLost
      ? "Have you seen this item?"
      : "Has someone lost this item?";
    const callToAction = isLost
      ? "Let's help the owner recover it!"
      : "Help us locate the rightful owner!";

    const customMessage = `📣 ${itemType}
  
  ${introMessage}
  
  🧾 Caption: ${caption || "No caption provided."}
  🔗 Link: https://tlc-tracify.vercel.app/post/${post?._id}
  
  ${callToAction}
  (Shared via Tracify)`;

    navigator.clipboard
      .writeText(customMessage)
      .then(() => {
        setOpenSnackbar("success");
        setMessage("Custom message copied to clipboard!");
      })
      .catch(() => {
        setOpenSnackbar("danger");
        setMessage("Failed to copy message.");
      });
  };

  const isMilestone =
    ((sharedBy?.resolvedItemCount || 0) >= 20 &&
      (sharedBy?.shareCount || 0) >= 20) ||
    ((originalPost?.author?.resolvedItemCount || 0) >= 20 &&
      (originalPost?.author?.shareCount || 0) >= 20);
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
          item_name: originalPost?.item_name,
          sharedBy: session?.user?.id,
          sharedAt: new Date(),
          originalPost: originalPost._id,
          sharedTo: selectedUsers.map((u) => u._id),
        }),
      });

      const data = await response.json();
      const notificationData = [];

      await Promise.all(
        selectedUsers.map(async (user) => {
          notificationData.push({
            receiver: user?._id,
            message: `${session?.user?.firstname} ${session?.user?.lastname} shared a post with you.`,
            type: "Shared Post",
            markAsRead: false,
            dateNotified: new Date(),
            post:
              session?.user?.id !== originalPost?.author?._id ? data._id : null,
          });

          await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "SharedItem",
              to: user?.emailAddress,
              name: user?.firstname,
              sharedBy: session?.user?.firstname,
              caption: originalPost?.caption,
              itemName: filteredOriginalPost?.item?.name,
              link: `https://tlc-tracify.vercel.app/post/${data._id}`,
              subject: "An Item Has Been Shared With You via Tracify!",
            }),
          });
        })
      );
      if (
        (session?.user?.id !== originalPost?.author?._id &&
          originalPost?.author?.role?.permissions.includes("User Dashboard")) ||
        originalPost?.author !== null
      ) {
        notificationData.push({
          receiver: originalPost?.author?._id,
          message: `${session?.user?.firstname} ${session?.user?.lastname} shared your post.`,
          type: "Shared Post",
          markAsRead: false,
          dateNotified: new Date(),
          post:
            session?.user?.id !== originalPost?.author?._id ? data._id : null,
        });
      }
      await Promise.all(
        notificationData.map((notif) =>
          fetch("/api/notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notif),
          })
        )
      );

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

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, borderRadius: "10px", boxShadow: 3 }}
      >
        <CardContent>
          {/* Author Info */}
          <Box display="flex" alignItems="center" mb={2}>
            {isMilestone ? (
              <HighlightAvatar
                sx={{ mr: 2, backgroundColor: "#FFF9C4" }}
                src={sharedBy?.profile_picture}
                alt={sharedBy ? sharedBy?.firstname : "User"}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <Avatar
                sx={{ mr: 2 }}
                src={sharedBy?.profile_picture}
                alt={sharedBy ? sharedBy?.firstname : "User"}
                style={{ cursor: "pointer" }}
              />
            )}
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
                      backgroundColor: isMilestone ? "#FFF9C4" : "transparent", // soft yellow
                      color: sharedBy?.role?.color || "inherit",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      maxWidth: isXs ? "150px" : "auto",
                      px: isMilestone ? 1 : 0, // horizontal padding
                      py: isMilestone ? 0.5 : 0, // vertical padding
                      borderRadius: isMilestone ? "6px" : 0,
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    {sharedBy?.firstname && sharedBy?.lastname
                      ? `${sharedBy?.firstname} ${sharedBy?.lastname}`
                      : "Deleted User"}
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
            {originalPost?.isFinder ? (
              <DummyPhoto category={item?.item?.category} isXs={isXs} />
            ) : (
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
                      priority
                      src={image}
                      width={isXs ? 200 : 300}
                      height={isXs ? 200 : 300}
                      alt={filteredOriginalPost?.item?.name || "Item Image"}
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                    />
                  </Box>
                ))}
              </Carousel>
            )}

            <Box sx={{ padding: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                {isMilestone ? (
                  <HighlightAvatar
                    sx={{ mr: 2, backgroundColor: "#FFF9C4" }}
                    src={originalPost?.author?.profile_picture}
                    alt={
                      originalPost?.author
                        ? originalPost?.author?.firstname
                        : "User"
                    }
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <Avatar
                    sx={{ mr: 2 }}
                    src={originalPost?.author?.profile_picture}
                    alt={
                      originalPost?.author
                        ? originalPost?.author.firstname
                        : "User"
                    }
                    style={{ cursor: "pointer" }}
                  />
                )}
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
                          backgroundColor: isMilestone
                            ? "#FFF9C4"
                            : "transparent", // soft yellow
                          color: originalPost?.author?.role?.color || "inherit",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          maxWidth: isXs ? "150px" : "auto",
                          px: isMilestone ? 1 : 0, // horizontal padding
                          py: isMilestone ? 0.5 : 0, // vertical padding
                          borderRadius: isMilestone ? "6px" : 0,
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        {originalPost?.author?.firstname &&
                        originalPost?.author?.lastname
                          ? `${originalPost?.author?.firstname} ${originalPost?.author?.lastname}`
                          : "Deleted User"}
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
                    {isToday(new Date(originalPost?.createdAt))
                      ? `Today, ${format(
                          new Date(originalPost?.createdAt),
                          "hh:mm a"
                        )}`
                      : format(
                          new Date(originalPost?.createdAt),
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
      <Modal
        open={claimModal === originalPost._id}
        onClose={() => setClaimModal(null)}
      >
        <ModalDialog>
          <ModalClose />
          <DialogContent>
            <Typography level="h4" gutterBottom>
              Send Claim Request
            </Typography>
            <FormControl>
              <FormLabel>Your Lost Item</FormLabel>
              <Select
                required
                placeholder="Select your missing lost item"
                value={selectedLostItem}
                onChange={(e, value) => setSelectedLostItem(value)}
              >
                <Option value="">Unnamed Item</Option>
              </Select>
            </FormControl>
            <Button
              type="submit"
              disabled={!selectedLostItem}
              onClick={() => setConfirmationRetrievalRequest(originalPost._id)}
            >
              Next
            </Button>
          </DialogContent>
        </ModalDialog>
      </Modal>
      <ConfirmationRetrievalRequest
        open={confirmationRetrievalRequest === originalPost._id}
        onClose={() => setConfirmationRetrievalRequest(null)}
        closeModal={() => setClaimModal(null)}
        foundItem={filteredOriginalPost}
        lostItem={selectedLostItem}
        finder={filteredOriginalPost?._id}
        isAdmin={
          originalPost?.author?.role?.permissions.includes("Admin Dashboard")
            ? true
            : false
        }
        sharedBy={post?.isShared ? post?.sharedBy?._id : null}
        owner={session?.user?.id}
      />
      <Modal
        open={sharePostModal === originalPost._id}
        onClose={() => setSharePostModal(null)}
      >
        <ModalDialog>
          <ModalClose />
          <Typography level={isXs ? "h5" : "h4"} fontWeight={700}>
            Share this Post
          </Typography>
          <Divider />
          <form onSubmit={handleSubmit}>
            <Stack spacing={1}>
              <Typography level="body-md" fontWeight={500}>
                Share to a User
              </Typography>
              <Autocomplete
                multiple
                placeholder="Select user"
                options={users.filter(
                  (user) =>
                    ![session?.user?.id, originalPost?.author?._id].includes(
                      user._id
                    )
                )}
                value={selectedUsers}
                onChange={(event, value, reason, details) => {
                  setSelectedUsers(value);
                }}
                getOptionLabel={(user) =>
                  user?.firstname && user?.lastname
                    ? `${user.firstname} ${user.lastname}`
                    : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option._id === value?._id
                }
              />
              <Textarea
                minRows={2}
                disabled={loading}
                placeholder="Say something about this..."
                value={sharedCaption}
                onChange={(e) => setSharedCaption(e.target.value)}
              />
              <Button disabled={loading} loading={loading} type="submit">
                Share to User
              </Button>
            </Stack>
          </form>

          <Typography level="body-md" fontWeight={500}>
            Copy Link
          </Typography>
          <Input
            value={`https://tlc-tracify.vercel.app/post/${post?._id}`}
            readOnly
            slotProps={{
              input: {
                ref: inputRef,
              },
            }}
            endDecorator={
              <IconButton onClick={handleCopyLink} variant="plain" size="sm">
                <ContentCopy fontSize="16px" />
              </IconButton>
            }
          />

          <FormHelperText>
            You can paste this link anywhere (Messenger, Gmail, <br /> Facebook,
            etc.) to spread the info publicly.
          </FormHelperText>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default SharedPost;
