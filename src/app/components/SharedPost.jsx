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
  Checkbox,
} from "@mui/joy";
import {
  Grid,
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
import { useDropzone } from "react-dropzone";
import Image from "next/image";

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
  const [name, setName] = useState("");
  const [color, setColor] = useState([]);
  const [size, setSize] = useState({ value: "", unit: "cm" });
  const [sizeNotDetermined, setSizeNotDetermined] = useState(false);
  const [category, setCategory] = useState();
  const [material, setMaterial] = useState();
  const [condition, setCondition] = useState();
  const [distinctiveMarks, setDistinctiveMarks] = useState();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [lostDateStart, setLostDateStart] = useState("");
  const [lostDateEnd, setLostDateEnd] = useState("");
  const [images, setImages] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [itemWhereabouts, setItemWhereabouts] = useState(false);
  const [shareTarget, setShareTarget] = useState("");
  const [shareMode, setShareMode] = useState("specificUsers"); // default to specific
  const inputRef = useRef();

  const handleCheck = (e) => {
    const check = e.target.checked;
    setItemWhereabouts(check);

    if (check) {
      setLocation("");
      setLostDateStart("");
      setLostDateEnd("");
    } else {
      setLocation("Unidentified");
      setLostDateStart("Unidentified");
      setLostDateEnd("Unidentified");
    }
  };

  const handleCheckSize = (e) => {
    const check = e.target.checked;
    setSizeNotDetermined(check);

    if (check) {
      setSize({ value: "", unit: "cm" });
    }
  };

  const handleChange = (event, newValue) => {
    setLocation(newValue);
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setLostDateStart(newStartDate);

    // Automatically set end date to the same day as the start date
    if (newStartDate) {
      const sameDayEndDate = new Date(newStartDate);

      // Add 1 hour to the start date
      sameDayEndDate.setHours(sameDayEndDate.getHours() + 1);

      // Convert to Philippine time (UTC+8)
      const offset = 8 * 60 * 60 * 1000; // UTC+8 offset in milliseconds
      const phTime = new Date(sameDayEndDate.getTime() + offset);

      // Format the date for input type="datetime-local"
      const formattedDate = phTime.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format

      setLostDateEnd(formattedDate);
    }
  };

  // Ensure that end date stays on the same day as the start date if it's manually changed
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setLostDateEnd(newEndDate);
  };

  const onDrop = (acceptedFiles) => {
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"]; // Valid image types

    const newImages = acceptedFiles
      .filter((file) => validImageTypes.includes(file.type)) // Filter valid image files
      .map((file) => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result); // Resolve the base64 URL
          };
          reader.readAsDataURL(file); // Convert file to base64 URL
        });
      });

    Promise.all(newImages).then((base64Images) => {
      setImages((prev) => [...prev, ...base64Images]); // Add new images to the state
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/gif": [],
    },
    multiple: true,
    required: true,
  });

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index)); // Remove image by index
  };

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
  
  🧾 Item Name: ${originalPost?.item_name || "No caption provided."}
  🔗 Link: https://tlc-tracify.vercel.app/?callbackUrl=/post/${post?._id}
  
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
      let targetUsers = [];

      if (shareMode === "specificUsers") {
        if (selectedUsers.length === 0) {
          setOpenSnackbar("danger");
          setMessage("Please select at least one user to share with.");
          setLoading(false);
          return;
        }
        targetUsers = selectedUsers;
      } else if (shareMode === "group") {
        if (!shareTarget) {
          setOpenSnackbar("danger");
          setMessage("Please select a group to share with.");
          setLoading(false);
          return;
        }

        const sessionValue = session?.user?.studentProfile?.[shareTarget];

        if (!sessionValue) {
          setOpenSnackbar("danger");
          setMessage("Your profile does not have a value for this group.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/users/group?type=${shareTarget}&value=${sessionValue}`
        );

        const allUsers = await res.json();

        targetUsers = allUsers.filter(
          (u) =>
            u._id !== session?.user?.id &&
            u.studentProfile?.[shareTarget] === sessionValue
        );

        if (targetUsers.length === 0) {
          setOpenSnackbar("danger");
          setMessage("No users found in that group.");
          setLoading(false);
          return;
        }
      }

      // Share Post
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
          sharedTo: targetUsers.map((u) => u._id),
        }),
      });

      const data = await response.json();
      const notificationData = [];

      await Promise.all(
        targetUsers.map(async (user) => {
          notificationData.push({
            receiver: user._id,
            message: `${session?.user?.firstname} ${session?.user?.lastname} shared a post with you.`,
            type: "Shared Post",
            markAsRead: false,
            dateNotified: new Date(),
            post: data._id,
          });
        })
      );

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SharedItem",
          users: targetUsers.map((user) => ({
            to: user.emailAddress,
            name: user.firstname,
          })),
          sharedBy: session?.user?.firstname,
          itemName: originalPost?.item?.name,
          link: `https://tlc-tracify.vercel.app/?callbackUrl=/post/${data._id}`,
          subject: "An Item Has Been Shared With You via Tracify!",
        }),
      });

      // Notify original author
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

      // Send all notifications in bulk
      await fetch("/api/notification/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationData),
      });

      setSharedCaption("");
      setSharePostModal(null);
      setOpenSnackbar("success");
      setMessage("Post shared successfully!");
    } catch (error) {
      console.error(error);
      setOpenSnackbar("danger");
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      name.trim() &&
      color.length > 0 &&
      (sizeNotDetermined || (size.value.trim() && size.unit)) &&
      category &&
      material &&
      condition &&
      distinctiveMarks &&
      description.trim() &&
      (!itemWhereabouts || (location && lostDateStart && lostDateEnd)) &&
      images.length > 0 &&
      (Array.isArray(filteredOriginalPost?.item?.questions)
        ? filteredOriginalPost.item.questions.every((_, index) =>
            answers[index]?.trim()
          )
        : true)
    );
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
              src={sharedBy?.profile_picture}
              alt={sharedBy ? sharedBy?.firstname : "User"}
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
                      maxWidth: isXs ? "150px" : "auto",
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
              <DummyPhoto
                category={filteredOriginalPost?.item?.category}
                isXs={isXs}
              />
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
                <Avatar
                  sx={{ mr: 2 }}
                  alt="User"
                  style={{ cursor: "pointer" }}
                />
                <Box>
                  <Typography
                    level={isXs ? "body-sm" : "body-md"}
                    fontWeight={700}
                    sx={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      maxWidth: isXs ? "150px" : "auto",
                    }}
                  >
                    Anonymous{" "}
                    {originalPost?.isFinder
                      ? "Finder"
                      : !originalPost?.isFinder
                      ? "Owner"
                      : "Unknown User"}
                  </Typography>

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
                {originalPost?.isFinder
                  ? "An item has been found!"
                  : "If you ever find this item, please surrender to SASO."}
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
            <Typography level="h4" gutterBottom>
              Send Claim Request
            </Typography>
            <FormControl required>
              <FormLabel>Item Name</FormLabel>
              <Input
                placeholder="e.g. Wallet"
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <Grid container spacing={1}>
              <Grid item xs={12}>
                <FormControl required>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <FormLabel>Color</FormLabel>
                    {color.length > 0 && (
                      <Button
                        color="danger"
                        size="small"
                        onClick={() => setColor([])}
                      >
                        Discard All
                      </Button>
                    )}
                  </Box>
                  <Select
                    placeholder="Select Color..."
                    multiple
                    fullWidth
                    required
                    value={color}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", gap: "0.25rem" }}>
                        {selected.map((selectedOption, index) => (
                          <Chip key={index} variant="soft" color="primary">
                            {selectedOption.label}
                          </Chip>
                        ))}
                      </Box>
                    )}
                    onChange={(e, value) => setColor(value)}
                  >
                    <Option value="" disabled>
                      Select Color
                    </Option>
                    {[
                      "Black",
                      "White",
                      "Blue",
                      "Red",
                      "Brown",
                      "Yellow",
                      "Green",
                      "Orange",
                      "Violet",
                      "Pink",
                      "Gray",
                      "Cyan",
                      "Beige",
                      "Gold",
                      "Silver",
                    ].map((name) => (
                      <Option key={name} value={name}>
                        {name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={4}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    mb: 0.7,
                  }}
                >
                  <FormLabel>Size</FormLabel>
                  <Checkbox
                    size="sm"
                    label="N/A"
                    checked={sizeNotDetermined}
                    onChange={handleCheckSize}
                  />
                </Box>
                <Input
                  disabled={sizeNotDetermined}
                  type="number"
                  required
                  value={size.value}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setSize({ ...size, value });
                  }}
                  onKeyDown={(e) => {
                    if (
                      ["e", "E", "-", "+"].includes(e.key) ||
                      (!/^\d$/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight")
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter size"
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={4}>
                <FormControl required>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    disabled={sizeNotDetermined}
                    value={size.unit}
                    onChange={(e, newValue) =>
                      setSize({ ...size, unit: newValue })
                    }
                    placeholder="Select Unit..."
                  >
                    {["cm", "inch", "m", "ft", "kg", "g"].map((unit) => (
                      <Option key={unit} value={unit}>
                        {unit}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl required>
                  <FormLabel>Category</FormLabel>
                  <Select
                    placeholder="Select Category..."
                    required
                    value={category}
                    onChange={(e, value) => setCategory(value)}
                  >
                    <Option value="" disabled>
                      Select Category
                    </Option>
                    {[
                      "Electronics & Gadgets",
                      "Clothing & Accessories",
                      "Personal Items",
                      "School & Office Supplies",
                      "Books & Documents",
                      "Sports & Recreational Equipment",
                      "Jewelry & Valuables",
                      "Miscellaneous",
                    ].map((name) => (
                      <Option key={name} value={name}>
                        {name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl required>
                  <FormLabel>Material</FormLabel>
                  <Select
                    placeholder="Select Material..."
                    required
                    value={material}
                    onChange={(e, value) => setMaterial(value)}
                  >
                    <Option value="" disabled>
                      Select Material
                    </Option>
                    {[
                      "Leather",
                      "Metal",
                      "Plastic",
                      "Fabric",
                      "Wood",
                      "Glass",
                      "Ceramic",
                      "Stone",
                      "Rubber",
                      "Silicone",
                      "Paper",
                      "Wool",
                      "Cotton",
                      "Nylon",
                    ].map((name) => (
                      <Option key={name} value={name}>
                        {name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl required>
                  <FormLabel>Condition</FormLabel>
                  <Select
                    placeholder="Select Condition..."
                    required
                    value={condition}
                    onChange={(e, value) => setCondition(value)}
                  >
                    <Option value="" disabled>
                      Select Condition
                    </Option>
                    {["New", "Damaged", "Old", "Used", "Broken", "Worn"].map(
                      (name) => (
                        <Option key={name} value={name}>
                          {name}
                        </Option>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl required>
                  <FormLabel>Distinctive Marks</FormLabel>
                  <Select
                    placeholder="Select Marks..."
                    required
                    value={distinctiveMarks}
                    onChange={(e, value) => setDistinctiveMarks(value)}
                  >
                    <Option value="" disabled>
                      Select Distinctive Marks
                    </Option>
                    {[
                      "None",
                      "Scratches",
                      "Stickers",
                      "Initials",
                      "Keychain",
                      "Dents",
                      "Stains",
                      "Fading",
                      "Pen Marks",
                    ].map((name) => (
                      <Option key={name} value={name}>
                        {name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <FormControl required>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="More details about the item..."
                required
                type="text"
                name="description"
                minRows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Checkbox
                label="The owner knows the item's whereabouts"
                checked={itemWhereabouts}
                onChange={handleCheck}
              />
            </FormControl>
            {itemWhereabouts && (
              <>
                <FormControl required>
                  <FormLabel>Lost Location</FormLabel>
                  <Autocomplete
                    placeholder="Select Location..."
                    options={locationOptions}
                    value={location}
                    onChange={handleChange}
                    renderInput={(params) => (
                      <Input {...params} placeholder="Select location..." />
                    )}
                  />
                </FormControl>
                <Grid container spacing={1}>
                  {/* Start Date and Time */}
                  <Grid item xs={12} md={6}>
                    <FormControl required>
                      <FormLabel>Start Date and Time</FormLabel>
                      <Input
                        fullWidth
                        required
                        type="datetime-local" // Ensures the input is a date-time picker
                        name="lostDateStart"
                        value={lostDateStart} // State holding the start date-time value
                        onChange={handleStartDateChange} // Update state with the selected date-time
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {/* End Date and Time */}
                    <FormControl required>
                      <FormLabel>End Date and Time</FormLabel>
                      <Input
                        fullWidth
                        required
                        type="datetime-local" // Ensures the input is a date-time picker
                        name="lostDateEnd"
                        value={lostDateEnd} // State holding the end date-time value
                        onChange={handleEndDateChange} // Update state with the selected date-time
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </>
            )}
            <FormControl required>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <FormLabel>Upload Images</FormLabel>
                {images?.length > 0 && (
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => setImages([])} // Clear all images
                  >
                    Discard All
                  </Button>
                )}
              </Box>
              <Box
                {...getRootProps({ className: "dropzone" })}
                sx={{
                  border: "2px dashed #888",
                  borderRadius: "4px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#f9f9f9",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {images.map((image, index) => (
                    <Box key={index} sx={{ position: "relative" }}>
                      <Image
                        priority
                        src={image}
                        width={0}
                        height={0}
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                        alt={`Preview ${index + 1}`}
                      />
                      <Button
                        size="sm"
                        color="danger"
                        sx={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          minWidth: "unset",
                          padding: "2px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                      >
                        ✕
                      </Button>
                    </Box>
                  ))}
                </Box>
                <input
                  {...getInputProps()}
                  multiple
                  style={{ display: "none" }}
                />
                <p>
                  {images.length === 0 &&
                    "Drag 'n' drop some files here, or click to select files"}
                </p>
              </Box>
            </FormControl>
            {Array.isArray(filteredOriginalPost?.item?.questions) &&
              filteredOriginalPost.item.questions.length > 0 && (
                <Box sx={{ my: 2 }}>
                  <Stack spacing={2}>
                    {filteredOriginalPost.item.questions.map(
                      (question, index) => (
                        <FormControl key={index} required>
                          <FormLabel>{question}</FormLabel>
                          <Input
                            placeholder="Enter your answer"
                            value={answers[index] || ""}
                            onChange={(e) => {
                              const updated = [...answers];
                              updated[index] = e.target.value;
                              setAnswers(updated);
                            }}
                          />
                        </FormControl>
                      )
                    )}
                  </Stack>
                </Box>
              )}

            <Button
              type="submit"
              onClick={() => setConfirmationRetrievalRequest(originalPost._id)}
              disabled={!isFormValid()}
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
        lostDateStart={lostDateStart}
        lostDateEnd={lostDateEnd}
        sizeNotDetermined={sizeNotDetermined}
        itemWhereabouts={itemWhereabouts}
        location={location}
        claimData={{
          name,
          color,
          size,
          category,
          material,
          condition,
          distinctiveMarks,
          description,
          answers,
          images,
        }}
      />
      <Modal
        open={sharePostModal === originalPost._id}
        onClose={() => setSharePostModal(null)}
      >
        <ModalDialog>
          <ModalClose />
          <Typography level={isXs ? "h5" : "h4"} fontWeight={700} mb={1}>
            Share this Post
          </Typography>
          <Divider />

          <form onSubmit={handleSubmit}>
            <Stack spacing={2} mt={1}>
              {/* SECTION: Mode Selection */}
              <Box>
                <Typography level="body-md" fontWeight={600} mb={0.5}>
                  Sharing Options
                </Typography>
                <FormControl fullWidth>
                  <FormLabel>Select Share Mode</FormLabel>
                  <Select
                    value={shareMode}
                    onChange={(e, val) => {
                      setShareMode(val);
                      setSelectedUsers([]);
                      setShareTarget("");
                    }}
                    placeholder="Choose how to share"
                  >
                    <Option value="specificUsers">
                      Share to Specific Users
                    </Option>
                    <Option value="group">Share to a Group</Option>
                  </Select>
                </FormControl>
              </Box>

              {/* SECTION: Share Group */}
              {shareMode === "group" && (
                <Box>
                  <FormControl fullWidth>
                    <FormLabel>Select Group</FormLabel>
                    <Select
                      value={shareTarget}
                      onChange={(e, val) => setShareTarget(val)}
                      placeholder="Choose target group"
                    >
                      {session?.user?.studentProfile?.category && (
                        <Option value="category">
                          Category ({session.user.studentProfile.category})
                        </Option>
                      )}
                      {session?.user?.studentProfile?.gradeLevel && (
                        <Option value="gradeLevel">
                          Grade Level ({session.user.studentProfile.gradeLevel})
                        </Option>
                      )}
                      {session?.user?.studentProfile?.strand && (
                        <Option value="strand">
                          Strand ({session.user.studentProfile.strand})
                        </Option>
                      )}
                      {session?.user?.studentProfile?.yearLevel && (
                        <Option value="yearLevel">
                          Year Level ({session.user.studentProfile.yearLevel})
                        </Option>
                      )}
                      {session?.user?.studentProfile?.department && (
                        <Option value="department">
                          Department ({session.user.studentProfile.department})
                        </Option>
                      )}
                      {session?.user?.studentProfile?.course && (
                        <Option value="course">
                          Course ({session.user.studentProfile.course})
                        </Option>
                      )}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* SECTION: User Selection */}
              {shareMode === "specificUsers" && (
                <Box>
                  <FormControl fullWidth>
                    <FormLabel>Select Users</FormLabel>
                    <Autocomplete
                      multiple
                      placeholder="Search and select users"
                      options={users.filter(
                        (user) => ![session?.user?.id].includes(user._id)
                      )}
                      value={selectedUsers}
                      onChange={(event, value) => setSelectedUsers(value)}
                      getOptionLabel={(user) =>
                        user?.firstname && user?.lastname
                          ? `${user.firstname} ${user.lastname}`
                          : ""
                      }
                      isOptionEqualToValue={(option, value) =>
                        option._id === value?._id
                      }
                    />
                  </FormControl>
                </Box>
              )}

              {/* SECTION: Caption */}
              <Box>
                <FormControl fullWidth>
                  <FormLabel>Custom Message</FormLabel>
                  <Textarea
                    minRows={2}
                    disabled={loading}
                    placeholder="Say something about this post..."
                    value={sharedCaption}
                    onChange={(e) => setSharedCaption(e.target.value)}
                  />
                </FormControl>
              </Box>

              {/* Submit Button */}
              <Button
                disabled={loading}
                loading={loading}
                type="submit"
                fullWidth
                color="primary"
              >
                Share Now
              </Button>

              <Divider />

              {/* SECTION: Copy Link */}
              <Box>
                <Typography level="body-md" fontWeight={500} mb={0.5}>
                  Copy Link
                </Typography>
                <Input
                  value={`https://tlc-tracify.vercel.app/post/${post?._id}`}
                  readOnly
                  variant="soft"
                  slotProps={{
                    input: {
                      ref: inputRef,
                    },
                  }}
                  endDecorator={
                    <Tooltip title="Copy to clipboard">
                      <IconButton
                        onClick={handleCopyLink}
                        variant="plain"
                        size="sm"
                      >
                        <ContentCopy fontSize="16px" />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <FormHelperText sx={{ mt: 0.5 }}>
                  Paste this anywhere (Messenger, Gmail, Facebook, etc.) to
                  spread the info publicly.
                </FormHelperText>
              </Box>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default SharedPost;
