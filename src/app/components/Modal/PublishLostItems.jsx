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
import { format } from "date-fns";

const PublishLostItem = ({
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
  const [location, setLocation] = useState("");
  const [lostDateStart, setLostDateStart] = useState("");
  const [lostDateEnd, setLostDateEnd] = useState("");
  const [images, setImages] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemWhereabouts, setItemWhereabouts] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (images.length === 0) {
        setOpenSnackbar("danger");
        setMessage("Please upload at least one image.");
        return;
      }

      const selectedLostStartDate = new Date(lostDateStart);
      const selectedLostEndDate = new Date(lostDateEnd);

      if (selectedLostStartDate >= selectedLostEndDate) {
        setOpenSnackbar("danger");
        setMessage("The start date must be earlier than the end date.");
        return;
      }

      let lostItemData = {
        isFoundItem: false,
        name,
        color,
        size: sizeNotDetermined ? "N/A" : `${size.value} ${size.unit}`,
        category,
        material,
        condition,
        distinctiveMarks,
        description,
        location: itemWhereabouts ? location : "Unidentified",
        date_time: itemWhereabouts
          ? `${format(
              selectedLostStartDate,
              "MMMM dd, yyyy hh:mm a"
            )} to ${format(selectedLostEndDate, "MMMM dd, yyyy hh:mm a")}`
          : "Unidentified",
        images,
        status: session.user.userType === "user" ? "Request" : "Missing",
      };

      if (lostItemData.status === "Request") {
        lostItemData.dateRequest = new Date();
      } else {
        lostItemData.dateMissing = new Date();
      }

      const response = await fetch("/api/lost-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lostItemData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unexpected response format" }));
        setOpenSnackbar("danger");
        setMessage(`Failed to add found item: ${errorData.error}`);
      }

      const lostItemResponse = await response.json();

      const ownerFormData = {
        user:
          session?.user?.userType === "user" ? session?.user?.id : owner?._id,
        item: lostItemResponse._id,
      };

      const ownerResponse = await fetch("/api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ownerFormData),
      });

      const ownerData = await ownerResponse.json();

      if (session?.user?.userType !== "user") {
        await Promise.all([
          fetch("/api/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              author: owner?._id,
              caption: description,
              item_name: name,
              isFinder: false,
              owner: ownerData?._id,
              createdAt: new Date(),
            }),
          }),
          fetch("/api/notification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              receiver: owner._id,
              message: `The lost item (${name}) you reported to ${session.user.roleName} has been published!`,
              type: "Lost Items",
              markAsRead: false,
              dateNotified: new Date(),
            }),
          }),
          fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: owner.emailAddress,
              name: owner.firstname,
              link: "tracify-project.vercel.app",
              success: false,
              title: "Lost Item Published Successfully!",
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
            {session?.user?.userType === "user" ? "Request" : "Post"} Lost Item
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
                  <FormControl>
                    <FormLabel>Owner</FormLabel>
                    <Autocomplete
                      required
                      placeholder="Select owner"
                      options={users || []} // Ensure users is an array
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
                <FormControl>
                  <FormLabel>Item Name</FormLabel>
                  <Input
                    required
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>

                <Grid container spacing={1}>
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
                <FormControl>
                  <FormLabel>Caption</FormLabel>
                  <Textarea
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
                <Button disabled={loading} loading={loading} type="submit">
                  {session?.user?.userType === "user" ? "Request" : "Post"}
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
