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
  Select,
  Option,
  FormControl,
  FormLabel,
  Tooltip,
  Autocomplete,
  Input,
  FormHelperText,
  Stack,
} from "@mui/joy";
import { ImageList, ImageListItem, keyframes, styled } from "@mui/material";
import { Share, Send, ContentCopy } from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { CldImage } from "next-cloudinary";
import { format, isToday } from "date-fns";
import ConfirmationRetrievalRequest from "./Modal/ConfirmationRetrievalRequest";
import PreviewBadge from "./PreviewBadge";
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

const Post = ({
  setOpenSnackbar,
  setMessage,
  post,
  session,
  author,
  item,
  createdAt,
  caption,
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
  const [user, setUser] = useState(null);
  const inputRef = useRef();

  const handleCopyLink = () => {
    const isLost = !post?.isFinder; // true if it's a lost item
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
    (author?.resolvedItemCount || 0) >= 20 && (author?.shareCount || 0) >= 20;

  const capitalizeWords = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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
          item_name: post?.item_name,
          sharedBy: session?.user?.id,
          sharedAt: new Date(),
          originalPost: post?._id,
        }),
      });

      const data = await response.json();
      const notificationData = [
        {
          receiver: user?._id,
          message: `${session?.user?.firstname} ${session?.user?.lastname} shared a post with you.`,
          type: "Shared Post",
          markAsRead: false,
          dateNotified: new Date(),
          post: session?.user?.id !== post?.author?._id ? data._id : null,
        },
      ];
      if (
        (session?.user?.id !== post?.author?._id &&
          author?.role?.permissions.includes("User Dashboard")) ||
        author !== null
      ) {
        notificationData.push({
          receiver: post?.author?._id,
          message: `${session?.user?.firstname} ${session?.user?.lastname} shared your post.`,
          type: "Shared Post",
          markAsRead: false,
          dateNotified: new Date(),
          post: session?.user?.id !== post?.author?._id ? data._id : null,
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
          caption: post?.caption,
          itemName: item?.item?.name,
          link: `https://tlc-tracify.vercel.app/post/${data._id}`,
          subject: "An Item Has Been Shared With You via Tracify!",
        }),
      });

      setSharedCaption("");
      setSharePostModal(null);
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
                src={author?.profile_picture}
                alt={author ? author?.firstname : "User"}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <Avatar
                sx={{ mr: 2 }}
                src={author?.profile_picture}
                alt={author ? author?.firstname : "User"}
                style={{ cursor: "pointer" }}
              />
            )}
            <Box>
              <Box sx={{ display: "flex", gap: 2, maxWidth: "100%" }}>
                <Tooltip title={author?.role?.name || "Guest"} placement="top">
                  <Typography
                    level={isXs ? "body-sm" : "body-md"}
                    fontWeight={700}
                    sx={{
                      backgroundColor: isMilestone ? "#FFF9C4" : "transparent", // soft yellow
                      color: author?.role?.color || "inherit",
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
                    {author?.firstname && author?.lastname
                      ? `${author?.firstname} ${author?.lastname}`
                      : "Deleted User"}
                  </Typography>
                </Tooltip>
                <PreviewBadge
                  resolvedItemCount={author?.resolvedItemCount || 0}
                  shareCount={author?.shareCount || 0}
                  birthday={author?.birthday || null}
                  inherit={false}
                />
              </Box>
              <Typography level={isXs ? "body-xs" : "body-sm"} fontWeight={300}>
                {isToday(new Date(createdAt))
                  ? `Today, ${format(new Date(createdAt), "hh:mm a")}`
                  : format(new Date(createdAt), "MMMM dd, yyyy - hh:mm a")}
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
              color={post?.isFinder ? "success" : "danger"}
            >
              {post?.isFinder ? (
                <CheckCircleIcon fontSize={isXs ? "12px" : "20px"} />
              ) : (
                <ReportProblemIcon fontSize={isXs ? "12px" : "20px"} />
              )}{" "}
              {post?.isFinder ? "Found Item" : "Lost Item"}
            </Chip>
            <Chip variant="solid" size={isXs ? "sm" : "md"} color="primary">
              <ShoppingBagIcon fontSize={isXs ? "12px" : "20px"} />{" "}
              {capitalizeWords(post?.item_name)}
            </Chip>
            <Chip variant="solid" size={isXs ? "sm" : "md"} color="neutral">
              <LocationOnIcon fontSize={isXs ? "12px" : "20px"} />
              {item?.item?.location}
            </Chip>
          </Box>

          {/* Post Caption */}
          <Typography
            level={isXs ? "body-sm" : "body-md"}
            sx={{ color: "text.secondary", mb: 2 }}
          >
            {caption}
          </Typography>

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
          {post?.isFinder ? (
            <DummyPhoto category={item?.item?.category} isXs={isXs} />
          ) : (
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
                    priority
                    src={image}
                    width={isXs ? 200 : 300}
                    height={isXs ? 200 : 300}
                    alt={item?.item?.name || "Item Image"}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                  />
                </Box>
              ))}
            </Carousel>
          )}

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
              onClick={() => setConfirmationRetrievalRequest(post._id)}
            >
              Next
            </Button>
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
        isAdmin={
          author?.role?.permissions.includes("Admin Dashboard") ? true : false
        }
        sharedBy={post?.isShared ? post?.sharedBy?._id : null}
        owner={session?.user?.id}
      />
      <Modal
        open={sharePostModal === post._id}
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
                required
                placeholder="Select user"
                options={
                  users.filter(
                    (user) =>
                      ![session?.user?.id, author?._id].includes(user._id)
                  ) || []
                } // Ensure users is an array
                value={user} // Ensure value corresponds to an option in users
                onChange={(event, value) => {
                  setUser(value); // Update state with selected user
                }}
                getOptionLabel={(user) => {
                  if (!user || !user.firstname || !user.lastname) {
                    return "No Options"; // Safeguard in case user data is undefined
                  }
                  return `${user.firstname} ${user.lastname}`; // Correctly format user names
                }}
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                } // Ensure comparison by unique identifier
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

export default Post;
