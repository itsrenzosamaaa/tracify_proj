"use client";

import {
  Grid,
  Chip,
  List,
  ListItem,
  ListItemDecorator,
  ListDivider,
  DialogContent,
  Modal,
  ModalDialog,
  Stack,
  Typography,
  ModalClose,
  FormControl,
  FormLabel,
  Input,
  Autocomplete,
  Button,
  Box,
  Checkbox,
  Textarea,
  Select,
  Option,
} from "@mui/joy";
import { Check } from "@mui/icons-material";
import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  format,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";

const PublishLostItem = ({
  open,
  onClose,
  setOpenSnackbar,
  setMessage,
  fetchItems = null,
  locationOptions,
  refreshData = null,
  user,
}) => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [lostDateStart, setLostDateStart] = useState("");
  const [lostDateEnd, setLostDateEnd] = useState("");
  const [images, setImages] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemWhereabouts, setItemWhereabouts] = useState(false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const { data: session, status } = useSession();

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

  const handleChange = (event, newValue) => {
    setLocation(newValue);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      const filterUsers = data.filter((user) =>
        user?.role?.permissions.includes("User Dashboard")
      );
      setUsers(filterUsers);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session.user.permissions.includes("Admin Dashboard")
    ) {
      fetchUsers();
    }
  }, [status, session?.user?.permissions, fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (images.length === 0) {
        setOpenSnackbar("danger");
        setMessage("Please upload at least one image.");
        setLoading(false);
        return;
      }

      const now = new Date();
      const startDate = itemWhereabouts ? new Date(lostDateStart) : null;
      const endDate = itemWhereabouts ? new Date(lostDateEnd) : null;

      if (itemWhereabouts) {
        if (isNaN(startDate) || isNaN(endDate)) {
          setOpenSnackbar("danger");
          setMessage("Please provide valid start and end dates.");
          setLoading(false);
          return;
        }

        if (startDate >= endDate) {
          setOpenSnackbar("danger");
          setMessage("The start date must be earlier than the end date.");
          setLoading(false);
          return;
        }

        if (startDate > now) {
          setOpenSnackbar("danger");
          setMessage("The start date cannot be in the future.");
          setLoading(false);
          return;
        }
      }

      const isUser = session.user.permissions.includes("User Dashboard");

      let lostItemData = {
        isFoundItem: false,
        name,
        description,
        location: itemWhereabouts ? location : "Unidentified",
        date_time: itemWhereabouts
          ? `${format(startDate, "MMMM dd, yyyy hh:mm a")} to ${format(
              endDate,
              "MMMM dd, yyyy hh:mm a"
            )}`
          : "Unidentified",
        images,
        status: isUser ? "Request" : "Missing",
        ...(isUser
          ? { dateRequest: new Date() }
          : {
              dateMissing: new Date(),
              dateLostItemPublished: new Date(),
              trackRecords: [
                {
                  status: "Published",
                  date: new Date(),
                },
              ],
            }),
      };

      // Create lost item
      const response = await fetch("/api/lost-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lostItemData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Unexpected response format",
        }));
        throw new Error(errorData.error || "Failed to create lost item");
      }

      const lostItemResponse = await response.json();

      // Create owner reference
      const ownerId = isUser ? session.user.id : owner?._id;
      const ownerResponse = await fetch("/api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: ownerId, item: lostItemResponse._id }),
      });

      const ownerData = await ownerResponse.json();

      // Admin only: create post, notify and email
      if (!isUser) {
        await Promise.all([
          fetch("/api/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              author: ownerId,
              caption: description,
              item_name: name,
              isFinder: false,
              owner: ownerData._id,
              createdAt: new Date(),
            }),
          }),
          fetch("/api/notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              receiver: ownerId,
              message: `The lost item (${name}) you reported to SASO has been published!`,
              type: "Lost Items",
              markAsRead: false,
              dateNotified: new Date(),
            }),
          }),
          fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: owner.emailAddress,
              name: owner.firstname,
              link: "https://tlc-tracify.vercel.app/?callbackUrl=/my-items#lost-item",
              success: false,
              title: "Lost Item Published Successfully!",
            }),
          }),
        ]);
      }

      // Apply cooldown (e.g., 24 hours later)
      const cooldownDate = new Date();
      cooldownDate.setHours(cooldownDate.getHours() + 24); // 24-hour cooldown

      await fetch(`/api/users/${ownerId}/cooldown`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canUserReportLostItem: cooldownDate }),
      });

      resetForm();
      if (fetchItems) fetchItems();
      if (refreshData) refreshData();
      setOpenSnackbar("success");
      setMessage(
        isUser ? "Item requested successfully!" : "Item published successfully!"
      );
    } catch (error) {
      console.error("Submit error:", error);
      setOpenSnackbar("danger");
      setMessage(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async () => {
    await onClose();
    setName("");
    setDescription("");
    setItemWhereabouts(false);
    setLocation("");
    setLostDateStart("");
    setLostDateEnd("");
    setImages([]);
    setOwner(null);
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

  const getCooldownMessage = () => {
    const now = new Date();
    const cooldownDate = new Date(user?.canUserReportLostItem);

    if (cooldownDate > now) {
      const totalMinutes = differenceInMinutes(cooldownDate, now);
      const totalSeconds = differenceInSeconds(cooldownDate, now);
      const hoursLeft = Math.floor(totalMinutes / 60);
      const minutesLeft = totalMinutes % 60;

      // Less than a minute left
      if (totalSeconds < 60) {
        return "Thank you! You can report again in less than a minute.";
      }

      // Only minutes left
      if (hoursLeft === 0) {
        return `Thank you! You can report again in ${minutesLeft} minute${
          minutesLeft !== 1 ? "s" : ""
        }.`;
      }

      // Hours and minutes
      return `Thank you! You can report again in ${hoursLeft} hour${
        hoursLeft !== 1 ? "s" : ""
      } and ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`;
    }

    return null;
  };

  const cooldownMessage = getCooldownMessage();

  if (
    session?.user?.permissions.includes("User Dashboard") &&
    cooldownMessage
  ) {
    return (
      <Modal open={open} onClose={onClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4">Lost Item Reporting Cooldown</Typography>
          <DialogContent sx={{ mt: 2 }}>
            <Typography>{cooldownMessage}</Typography>
          </DialogContent>
        </ModalDialog>
      </Modal>
    );
  }

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          sx={{
            maxWidth: "600px", // Adjust to your desired width
            width: "90%", // Ensures responsiveness on smaller screens
          }}
        >
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            {session.user.permissions.includes("User Dashboard")
              ? "Report"
              : "Publish"}{" "}
            Lost Item
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
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {session.user.permissions.includes("Admin Dashboard") && (
                  <FormControl>
                    <FormLabel>Owner</FormLabel>
                    <Autocomplete
                      required
                      placeholder="Select owner"
                      options={
                        users?.filter((user) => {
                          const now = new Date();
                          const cooldown = user?.canUserReportLostItem
                            ? new Date(user.canUserReportLostItem)
                            : null;

                          return !cooldown || cooldown <= now;
                        }) || []
                      }
                      value={owner} // Ensure value corresponds to an option in users
                      onChange={(event, value) => {
                        setOwner(value); // Update state with selected user
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
                  </FormControl>
                )}
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

                {/* <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <FormControl>
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
                    <FormControl>
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
                    <FormControl>
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
                    <FormControl>
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
                        {[
                          "New",
                          "Damaged",
                          "Old",
                          "Used",
                          "Broken",
                          "Worn",
                        ].map((name) => (
                          <Option key={name} value={name}>
                            {name}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl>
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
                </Grid> */}
                <FormControl required>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="More details about the item..."
                    type="text"
                    name="description"
                    minRows={2}
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
                          <FormLabel>Start of Possible Loss Timeframe</FormLabel>
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
                          <FormLabel>End of Possible Loss Timeframe</FormLabel>
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
                <FormControl>
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
                {session?.user?.permissions.includes("User Dashboard") && (
                  <FormControl required>
                    <Checkbox
                      checked={confirmAccuracy}
                      onChange={(e) => setConfirmAccuracy(e.target.checked)}
                      label="I confirm that the information I provided above is accurate and based on my best knowledge."
                    />
                  </FormControl>
                )}
                <Button
                  disabled={
                    loading ||
                    (!confirmAccuracy &&
                      session.user.permissions.includes("User Dashboard"))
                  }
                  loading={loading}
                  type="submit"
                >
                  {session.user.permissions.includes("User Dashboard")
                    ? "Report"
                    : "Post"}
                </Button>
              </Stack>
            </form>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default PublishLostItem;
