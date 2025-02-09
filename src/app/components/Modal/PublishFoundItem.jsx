"use client";

import {
  Grid,
  List,
  ListItem,
  ListItemDecorator,
  Textarea,
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
  Select,
  Option,
  Chip,
  ListDivider,
} from "@mui/joy";
import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { format, subDays, isBefore, isAfter } from "date-fns";
import { Check, Description } from "@mui/icons-material";
import Link from "next/link";

const PublishFoundItem = ({
  open,
  onClose,
  setOpenSnackbar,
  setMessage,
  fetchItems = null,
  locationOptions,
}) => {
  const [users, setUsers] = useState([]);
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
  const [foundDate, setFoundDate] = useState("");
  const [images, setImages] = useState([]);
  const [finder, setFinder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.userType !== "user") {
      fetchUsers();
    }
  }, [status, session?.user?.userType, fetchUsers]);

  const handleCheck = (e) => {
    const check = e.target.checked;
    setSizeNotDetermined(check);

    if (check) {
      setSize({ value: "", unit: "cm" });
    }
  };

  const handleChange = (event, newValue) => {
    setLocation(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (images.length === 0) {
        setOpenSnackbar("danger");
        setMessage("Please upload at least one image.");
        return;
      }

      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);
      const selectedDate = new Date(foundDate);

      if (isBefore(selectedDate, thirtyDaysAgo)) {
        setOpenSnackbar("danger");
        setMessage("The found date should be within the last 30 days.");
        setLoading(false);
        return;
      }

      if (isAfter(selectedDate, now)) {
        setOpenSnackbar("danger");
        setMessage("The found date cannot be in the future.");
        setLoading(false);
        return;
      }

      // Create found item data with lost item ID as the owner
      let foundItemData = {
        isFoundItem: true,
        name,
        color,
        size: sizeNotDetermined ? "N/A" : `${size.value} ${size.unit}`,
        category,
        material,
        condition,
        distinctiveMarks,
        description,
        location,
        date_time: format(selectedDate, "MMMM dd,yyyy hh:mm a"),
        images,
        status: session.user.userType === "user" ? "Request" : "Published",
      };

      if (foundItemData.status === "Request") {
        foundItemData.dateRequest = new Date();
        foundItemData.monitoredBy = null;
      } else {
        foundItemData.datePublished = new Date();
        foundItemData.monitoredBy = session?.user?.id;
      }

      const response = await fetch("/api/found-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(foundItemData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unexpected response format" }));
        setOpenSnackbar("danger");
        setMessage(`Failed to add found item: ${errorData.error}`);
      }

      const foundItemResponse = await response.json();

      const finderFormData = {
        user:
          session.user.userType === "user" ? session?.user?.id : finder?._id,
        item: foundItemResponse._id,
      };

      const finderResponse = await fetch("/api/finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finderFormData),
      });

      const finderData = await finderResponse.json();

      if (session?.user?.userType !== "user") {
        await Promise.all([
          fetch("/api/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              author: finder?._id,
              isFinder: true,
              item_name: name,
              caption: description,
              finder: finderData?._id,
              createdAt: new Date(),
            }),
          }),
          fetch("/api/notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              receiver: finder._id,
              message: `The found item (${name}) you reported to ${session.user.roleName} has been published!`,
              type: "Found Items",
              markAsRead: false,
              dateNotified: new Date(),
            }),
          }),
          fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: finder.emailAddress,
              name: finder.firstname,
              link: "tracify-project.vercel.app",
              success: true,
              title: "Found Item Published Successfully!",
            }),
          }),
        ]);
      }
      resetForm();
      setOpenSnackbar("success");
      if (fetchItems) {
        fetchItems();
      }
      setMessage(
        session?.user?.userType === "user"
          ? "Item requested successfully!"
          : "Item published successfully!"
      );
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to reset form fields and close the modal
  const resetForm = async () => {
    await onClose();
    setName("");
    setColor([]);
    setSize({ value: "", unit: "cm" });
    setSizeNotDetermined(false);
    setCategory();
    setMaterial();
    setCondition();
    setDistinctiveMarks();
    setDescription("");
    setLocation(null);
    setFoundDate("");
    setImages([]);
    setFinder(null);
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

  if (status === "loading") return null;

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
            {session?.user?.userType === "user" ? "Request" : "Post"} Found Item
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
                {session?.user?.userType !== "user" && (
                  <FormControl required>
                    <FormLabel>Finder</FormLabel>
                    <Autocomplete
                      placeholder="Select a finder"
                      options={users || []}
                      value={finder}
                      onChange={(event, value) => {
                        setFinder(value);
                      }}
                      getOptionLabel={(user) => {
                        return user
                          ? `${user.firstname} ${user.lastname}`
                          : "No Options";
                      }}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value?.id
                      }
                    />
                  </FormControl>
                )}
                <FormControl required>
                  <FormLabel>Item Name</FormLabel>
                  <Input
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
                        onChange={handleCheck}
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
                    <FormControl>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        disabled={sizeNotDetermined}
                        value={size.unit}
                        onChange={(e, newValue) =>
                          setSize({ ...size, unit: newValue })
                        }
                        placeholder="Unit"
                      >
                        {["cm", "inch", "m", "ft"].map((unit) => (
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
                        required
                        value={category}
                        onChange={(e, value) => setCategory(value)}
                      >
                        <Option value="" disabled>
                          Select Category
                        </Option>
                        {[
                          "Electronics",
                          "Clothing",
                          "Accessories",
                          "School Supplies",
                          "Books",
                          "Tools",
                          "Sports Equipment",
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
                  <FormLabel>Caption</FormLabel>
                  <Textarea
                    type="text"
                    name="description"
                    minRows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </FormControl>
                <FormControl required>
                  <FormLabel>Found Location</FormLabel>
                  <Autocomplete
                    options={locationOptions}
                    value={location}
                    onChange={handleChange}
                    renderInput={(params) => (
                      <Input {...params} placeholder="Select location..." />
                    )}
                  />
                </FormControl>
                <FormControl required>
                  <FormLabel>Found Date and Time</FormLabel>
                  <Input
                    type="datetime-local"
                    name="foundDate"
                    value={foundDate}
                    onChange={(e) => setFoundDate(e.target.value)}
                  />
                </FormControl>
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
                <Button loading={loading} disabled={loading} type="submit">
                  Publish
                </Button>
              </Stack>
            </form>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default PublishFoundItem;
