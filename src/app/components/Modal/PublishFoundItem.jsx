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
  const [studentCheck, setStudentCheck] = useState(false);
  const [questions, setQuestions] = useState([""]);
  const [allowedToPost, setAllowedToPost] = useState(true);
  const [sizeMode, setSizeMode] = useState("manual"); // 'manual' or 'predefined'
  const [predefinedSize, setPredefinedSize] = useState("");
  const { data: session, status } = useSession();

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

  const handleStudentCheck = (e) => {
    const check = e.target.checked;
    setStudentCheck(check);

    if (check) {
      setFinder(null);
    }
  };

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

    if (
      session?.user?.permissions.includes("Admin Dashboard") &&
      questions.filter((q) => q.trim()).length === 0
    ) {
      setOpenSnackbar("danger");
      setMessage("Please add at least one security question.");
      setLoading(false);
      return;
    }

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
        size:
          sizeMode === "manual"
            ? sizeNotDetermined
              ? "N/A"
              : `${size.value} ${size.unit}`
            : predefinedSize,
        category,
        material,
        condition,
        distinctiveMarks,
        description,
        location,
        date_time: format(selectedDate, "MMMM dd,yyyy hh:mm a"),
        images,
        status: session.user.permissions.includes("User Dashboard")
          ? "Request"
          : "Published",
      };

      if (foundItemData.status === "Request") {
        foundItemData.dateRequest = new Date();
      } else {
        foundItemData.datePublished = new Date();
        foundItemData.questions = questions
          .map((q) => q.trim())
          .filter((q) => q !== "");
        foundItemData.allowedToPost = allowedToPost;
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
          session.user.permissions.includes("User Dashboard") || !studentCheck
            ? session?.user?.id
            : finder?._id,
        item: foundItemResponse._id,
      };

      const finderResponse = await fetch("/api/finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finderFormData),
      });

      const finderData = await finderResponse.json();

      if (session.user.permissions.includes("Admin Dashboard")) {
        await fetch("/api/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            allowedToPost,
            author: studentCheck ? finder?._id : session.user?.id,
            isFinder: true,
            item_name: name,
            caption: description,
            finder: finderData?._id,
            createdAt: new Date(),
          }),
        });

        if (studentCheck) {
          await Promise.all([
            fetch("/api/notification", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                receiver: finder._id,
                message: `The found item (${name}) you reported to SASO has been published!`,
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
                link: "https://tlc-tracify.vercel.app/?callbackUrl=/my-items#found-item",
                success: true,
                title: "Found Item Published Successfully!",
              }),
            }),
          ]);
        }
      }
      resetForm();
      setOpenSnackbar("success");
      if (fetchItems) {
        fetchItems();
      }
      setMessage(
        session.user.permissions.includes("User Dashboard")
          ? "Item requested successfully!"
          : "Item published successfully!"
      );
    } catch (error) {
      console.error(error);
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
    setQuestions([""]);
    setAllowedToPost(true);
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
            {session.user.permissions.includes("User Dashboard")
              ? "Report"
              : "Publish"}{" "}
            Found Item
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
                  <>
                    <FormControl>
                      <Checkbox
                        label="Assign a registered user as the finder"
                        checked={studentCheck}
                        onChange={handleStudentCheck}
                      />
                    </FormControl>
                    {studentCheck && (
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
                  </>
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
                  {/* Size Mode Switch */}
                  <Grid item xs={12} sm={sizeMode === "manual" ? 4 : 6}>
                    <FormControl>
                      <FormLabel>Size Mode</FormLabel>
                      <Select
                        value={sizeMode}
                        onChange={(e, val) => {
                          setSizeMode(val);
                          if (val === "manual") {
                            setPredefinedSize("");
                          } else {
                            setSize({ value: "", unit: "cm" });
                            setSizeNotDetermined(false);
                          }
                        }}
                      >
                        <Option value="manual">Manual</Option>
                        <Option value="predefined">Predefined</Option>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Manual Input Grid */}
                  {sizeMode === "manual" ? (
                    <>
                      <Grid item xs={6} sm={4}>
                        <FormControl>
                          <FormLabel>Size Value</FormLabel>
                          <Input
                            disabled={sizeNotDetermined}
                            type="number"
                            required={!sizeNotDetermined}
                            value={size.value}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              setSize({ ...size, value });
                            }}
                            placeholder="Enter size"
                          />
                        </FormControl>
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
                          >
                            {["cm", "inch", "m", "ft", "kg", "g"].map(
                              (unit) => (
                                <Option key={unit} value={unit}>
                                  {unit}
                                </Option>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Checkbox
                          label={
                            session?.user?.permissions.includes(
                              "Admin Dashboard"
                            )
                              ? "Size not determined (Set to N/A)"
                              : "I don't know the size (Set to N/A)"
                          }
                          checked={sizeNotDetermined}
                          onChange={handleCheck}
                        />
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12} sm={6}>
                      <FormControl required>
                        <FormLabel>Predefined Size</FormLabel>
                        <Select
                          placeholder="Select a predefined size"
                          value={predefinedSize}
                          onChange={(e, value) => setPredefinedSize(value)}
                        >
                          {["XS", "S", "M", "L", "XL", "2XL"].map((sz) => (
                            <Option key={sz} value={sz}>
                              {sz}
                            </Option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
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
                  <Grid item xs={12} sm={6}>
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
                  <Grid item xs={12} sm={6}>
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
                  <Grid item xs={12} sm={6}>
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
                </Grid>
                <FormControl required>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="More details about the item..."
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
                    placeholder="Select Location..."
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
                {session?.user?.permissions.includes("Admin Dashboard") &&
                  allowedToPost && (
                    <FormControl>
                      <FormLabel>Security Question(s)</FormLabel>
                      <Stack spacing={1}>
                        {questions.map((question, index) => (
                          <Box key={index} display="flex" gap={1}>
                            <Input
                              required
                              fullWidth
                              placeholder={`Enter question #${index + 1}`}
                              value={question}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[index] = e.target.value;
                                setQuestions(updated);
                              }}
                            />
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() =>
                                setQuestions((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              disabled={questions.length === 1}
                            >
                              ✕
                            </Button>
                          </Box>
                        ))}
                        <Button
                          size="sm"
                          variant="outlined"
                          onClick={() => setQuestions([...questions, ""])}
                        >
                          + Add Another Question
                        </Button>
                      </Stack>
                    </FormControl>
                  )}

                {session.user?.permissions.includes("Admin Dashboard") && (
                  <FormControl>
                    <Checkbox
                      label="Allowed to post in found corner"
                      checked={allowedToPost}
                      onChange={(e) => {
                        setAllowedToPost(e.target.checked);
                        setQuestions([""]);
                      }}
                    />
                  </FormControl>
                )}

                <Button loading={loading} disabled={loading} type="submit">
                  {session.user.permissions.includes("User Dashboard")
                    ? "Report"
                    : "Post"}{" "}
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
