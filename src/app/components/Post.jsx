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
  Checkbox,
} from "@mui/joy";
import {
  Grid,
  ImageList,
  ImageListItem,
  keyframes,
  styled,
} from "@mui/material";
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
import { useDropzone } from "react-dropzone";
import Image from "next/image";

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
  locationOptions,
}) => {
  const [sharePostModal, setSharePostModal] = useState(null);
  const [claimModal, setClaimModal] = useState(null);
  const [selectedLostItem, setSelectedLostItem] = useState(null);
  const [confirmationRetrievalRequest, setConfirmationRetrievalRequest] =
    useState(null);
  const [sharedCaption, setSharedCaption] = useState("");
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
  const [loading, setLoading] = useState(false);
  const [itemWhereabouts, setItemWhereabouts] = useState(false);
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
      if (selectedUsers.length === 0) {
        setOpenSnackbar("danger");
        setMessage("Please select at least one user to share with.");
        return;
      }

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
          sharedTo: selectedUsers.map((u) => u._id),
        }),
      });

      const data = await response.json();
      const notificationData = [];

      await Promise.all(
        selectedUsers.map(async (user) => {
          notificationData.push({
            receiver: user._id,
            message: `${session?.user?.firstname} ${session?.user?.lastname} shared a post with you.`,
            type: "Shared Post",
            markAsRead: false,
            dateNotified: new Date(),
            post: data._id,
          });

          await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "SharedItem",
              to: user.emailAddress,
              name: user.firstname,
              sharedBy: session?.user?.firstname,
              itemName: item?.item?.name,
              link: `https://tlc-tracify.vercel.app/post/${data._id}`,
              subject: "An Item Has Been Shared With You via Tracify!",
            }),
          });
        })
      );

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
      (Array.isArray(item?.item?.questions)
        ? item.item.questions.every((_, index) => answers[index]?.trim())
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
            <Avatar sx={{ mr: 2 }} alt="User" style={{ cursor: "pointer" }} />
            <Box>
              <Box sx={{ display: "flex", gap: 2, maxWidth: "100%" }}>
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
                  {post?.isFinder
                    ? "Finder"
                    : !post?.isFinder
                    ? "Owner"
                    : "Unknown User"}
                </Typography>
                {/* <PreviewBadge
                  resolvedItemCount={author?.resolvedItemCount || 0}
                  shareCount={author?.shareCount || 0}
                  birthday={author?.birthday || null}
                  inherit={false}
                /> */}
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
            {post?.isFinder
              ? "An item has been found!"
              : "If you ever find this item, please surrender to SASO."}
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
            {Array.isArray(item?.item?.questions) &&
              item.item.questions.length > 0 && (
                <Box sx={{ my: 2 }}>
                  <Stack spacing={2}>
                    {item.item.questions.map((question, index) => (
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
                    ))}
                  </Stack>
                </Box>
              )}

            <Button
              type="submit"
              onClick={() => setConfirmationRetrievalRequest(post._id)}
              disabled={!isFormValid()}
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
                multiple
                placeholder="Select user"
                options={users.filter(
                  (user) => ![session?.user?.id].includes(user._id)
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

export default Post;
