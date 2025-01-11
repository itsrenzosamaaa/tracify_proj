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
} from "@mui/joy";
import { ImageList, ImageListItem, Paper } from "@mui/material";
import { Share, ThumbUp, Comment } from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { CldImage } from "next-cloudinary";
import { format, isToday } from "date-fns";

const SharedPost = ({
  setOpenSnackbar,
  setMessage,
  post,
  session,
  sharedBy,
  originalPost,
  caption,
  sharedAt,
}) => {
  const [sharePostModal, setSharePostModal] = useState(null);
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
          sharedBy: session.user.id,
          sharedAt: new Date(),
          originalPost: originalPost._id,
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
              src={sharedBy.profile_picture}
              alt={sharedBy.firstname}
              style={{ cursor: "pointer" }}
            />
            <Box>
              <Typography level="body-md" fontWeight={700}>
                {sharedBy.firstname} {sharedBy.lastname}
              </Typography>
              <Typography level="body-sm" fontWeight={300}>
                {isToday(new Date(sharedAt))
                  ? `Today, ${format(new Date(sharedAt), "hh:mm a")}`
                  : format(new Date(sharedAt), "MMMM dd, yyyy - hh:mm a")}
              </Typography>
            </Box>
          </Box>

          {/* Post Caption */}
          {caption !== "" && (
            <Typography level="body2" sx={{ color: "text.secondary", mb: 2 }}>
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
              {originalPost.item.images?.map((image, index) => (
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
                    width={300}
                    height={300}
                    alt={originalPost.item?.name || "Item Image"}
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
                  <Typography level="body-md" fontWeight={700}>
                    {originalPost.author.firstname}{" "}
                    {originalPost.author.lastname}
                  </Typography>
                  <Typography level="body-sm" fontWeight={300}>
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
              <Typography level="body2" sx={{ color: "text.secondary", mb: 2 }}>
                {originalPost.caption}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <Box
            onClick={() => setSharePostModal(originalPost._id)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              cursor: "pointer",
              padding: "8px", // Padding for a clickable area
              borderRadius: "8px", // Rounded corners
              backgroundColor: "transparent", // Default background
              color: "text.secondary", // Default text color
              transition: "all 0.3s ease", // Smooth transition for all properties
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)", // Subtle contrast background on hover
                color: "primary.main", // Text/icon color on hover
              },
              "& svg": {
                transition: "color 0.3s ease", // Smooth transition for the icon color
              },
            }}
          >
            <Share />
            <Typography
              level="body2"
              sx={{
                color: "inherit", // Inherit color from the parent Box
                transition: "color 0.3s ease",
              }}
            >
              Share
            </Typography>
          </Box>
        </CardContent>
      </Card>
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
