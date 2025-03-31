"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Grid,
  Stepper,
  Step,
  Divider,
  Button,
  Input,
  Select,
  Option,
  Textarea,
  List,
  ListItem,
  ListItemDecorator,
  ListDivider,
  Checkbox,
  Chip,
  FormControl,
  FormLabel,
  Autocomplete,
  Tooltip,
  ModalDialog,
  ModalClose,
  DialogContent,
  Modal,
  Badge,
} from "@mui/joy";
import { CldImage } from "next-cloudinary";
import { format, subDays, isBefore, isAfter, isToday } from "date-fns";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useTheme, useMediaQuery } from "@mui/material";
import { useSession } from "next-auth/react";
import {
  Check,
  LocationOn,
  Inventory2,
  Palette,
  Straighten,
  Category,
  Build,
  AssignmentTurnedIn,
  Fingerprint,
  Description,
  CalendarToday,
  AccessTime,
  Flag,
  HourglassBottom,
  ArrowDownward,
  ArrowForward,
} from "@mui/icons-material";
import Image from "next/image";

const ItemDetails = ({
  row,
  refreshData,
  setOpenSnackbar,
  setMessage,
  locationOptions = [],
}) => {
  const { data: session, status } = useSession();
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState(row.item.name);
  const [color, setColor] = useState(row.item.color);
  const [size, setSize] = useState({
    value: row.item.size.split(" ")[0],
    unit: row.item.size.split(" ")[1],
  });
  const [sizeNotDetermined, setSizeNotDetermined] = useState(
    row.item.size === "N/A" ? true : false
  );
  const [category, setCategory] = useState(row.item.category);
  const [material, setMaterial] = useState(row.item.material);
  const [condition, setCondition] = useState(row.item.condition);
  const [distinctiveMarks, setDistinctiveMarks] = useState(
    row.item.distinctiveMarks
  );
  const [itemWhereabouts, setItemWhereabouts] = useState(
    row.item.date_time === "Unidentified" &&
      row.item.location === "Unidentified"
      ? false
      : true
  );
  const [description, setDescription] = useState(row.item.description);
  const [location, setLocation] = useState(
    !itemWhereabouts ? "Unidentified" : row.item.location
  );
  const [foundDate, setFoundDate] = useState(() => {
    if (row.item.isFoundItem) {
      const date = new Date(row.item.date_time);
      date.setHours(date.getHours() + 8); // Adjust to +8 hours if needed
      return date.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
    }
    return "";
  });

  const [lostStartDate, setLostStartDate] = useState(() => {
    if (!row.item.isFoundItem) {
      if (row.item.date_time === "Unidentified") {
        return row.item.date_time;
      } else {
        const [start] = row.item.date_time.split(" to ");
        const startDate = new Date(start);
        startDate.setHours(startDate.getHours() + 8); // Adjust to +8 hours
        return startDate.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
      }
    }
    return ""; // Default value if item is found
  });

  const [lostEndDate, setLostEndDate] = useState(() => {
    if (!row.item.isFoundItem) {
      if (row.item.date_time === "Unidentified") {
        return row.item.date_time;
      } else {
        const [, end] = row.item.date_time.split(" to ");
        const endDate = new Date(end);
        endDate.setHours(endDate.getHours() + 8); // Adjust to +8 hours
        return endDate.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
      }
    }
    return ""; // Default value if item is found
  });
  const [openSuggestionModal, setOpenSuggestionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectSuggestion, setRejectSuggestion] = useState(false);
  const [approveSuggestion, setApproveSuggestion] = useState(false);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  const handleCheck = (e) => {
    const check = e.target.checked;
    setSizeNotDetermined(check);

    if (check) {
      setSize({ value: "", unit: "cm" });
    }
  };

  const handleCheckbox = (e) => {
    const check = e.target.checked;
    setItemWhereabouts(check);

    if (itemWhereabouts) {
      setLocation("Unidentified");
      setLostStartDate("Unidentified");
      setLostEndDate("Unidentified");
    } else {
      if (row.item.location === "Unidentified") {
        setLocation(null);
        setLostStartDate(null);
        setLostEndDate(null);
      } else {
        setLocation(row.item.location);
        setLostStartDate(() => {
          if (!row.item.isFoundItem) {
            if (row.item.date_time === "Unidentified") {
              return row.item.date_time;
            } else {
              const [start] = row.item.date_time.split(" to ");
              const startDate = new Date(start);
              startDate.setHours(startDate.getHours() + 8); // Adjust to +8 hours
              return startDate.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
            }
          }
          return ""; // Default value if item is found
        });
        setLostEndDate(() => {
          if (!row.item.isFoundItem) {
            if (row.item.date_time === "Unidentified") {
              return row.item.date_time;
            } else {
              const [, end] = row.item.date_time.split(" to ");
              const endDate = new Date(end);
              endDate.setHours(endDate.getHours() + 8); // Adjust to +8 hours
              return endDate.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
            }
          }
          return ""; // Default value if item is found
        });
      }
    }
  };

  console.log(row);

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const now = new Date();
      if (row.item.isFoundItem && foundDate) {
        const thirtyDaysAgo = subDays(now, 30);
        const selectedDate = new Date(foundDate);

        if (isBefore(selectedDate, thirtyDaysAgo)) {
          setOpenSnackbar("danger");
          setMessage("The found date must be within the last 30 days.");
          return;
        }

        if (isAfter(selectedDate, now)) {
          setOpenSnackbar("danger");
          setMessage("The found date cannot be in the future.");
          return;
        }
      }

      // Validate lost item dates
      if (!row.item.isFoundItem && lostStartDate && lostEndDate) {
        const start = new Date(lostStartDate);
        const end = new Date(lostEndDate);

        if (isAfter(start, now)) {
          setOpenSnackbar("danger");
          setMessage("The start date cannot be in the future.");
          return;
        }

        if (start >= end) {
          setOpenSnackbar("danger");
          setMessage("The start date must be earlier than the end date.");
          return;
        }
      }

      // Prepare form data
      const formData = {
        name,
        color,
        size: sizeNotDetermined ? "N/A" : `${size.value} ${size.unit}`,
        category,
        material,
        condition,
        distinctiveMarks,
        description,
        location,
        date_time: row.item.isFoundItem
          ? format(new Date(foundDate), "MMMM dd, yyyy hh:mm a")
          : itemWhereabouts
          ? `${format(
              new Date(lostStartDate),
              "MMMM dd, yyyy hh:mm a"
            )} to ${format(new Date(lostEndDate), "MMMM dd, yyyy hh:mm a")}`
          : "Unidentified",
      };

      // API request
      const response = await fetch(
        `/api/${row.item.isFoundItem ? "found-items" : "lost-items"}/${
          row.item._id
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update item details.");
      }

      if (row?.item?.status !== "Request") {
        await fetch(`api/post/${row._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isFinder: row?.item?.isFoundItem ? true : false,
            item_name: name,
            caption: description,
          }),
        });
      }

      // Refresh and update UI
      await refreshData();
      setIsEditMode(false);
      setOpenSnackbar("success");
      setMessage("Item details updated successfully!");
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionEdit = async (isApprove) => {
    setLoading(true);

    const edit = row?.item?.edit;
    const isFoundItem = row?.item?.isFoundItem;
    const itemId = row?.item?._id;
    const postId = row?._id;
    const userId = row?.user?._id;

    // Ensure edit exists before proceeding
    if (!edit) {
      setOpenSnackbar("danger");
      setMessage("No edit suggestion found.");
      setLoading(false);
      return;
    }

    const formData = {
      edit: null, // clear the edit field upon approval or rejection
    };

    if (isApprove) {
      formData.name = edit?.name;
      formData.color = edit?.color;
      formData.size = edit?.size;
      formData.category = edit?.category;
      formData.material = edit?.material;
      formData.condition = edit?.condition;
      formData.distinctiveMarks = edit?.distinctiveMarks;
      formData.description = edit?.description;
      formData.location = edit?.location;
      formData.date_time = edit?.date_time;
    }

    try {
      // 🔄 Update item with suggestion values
      const response = await fetch(
        `/api/${isFoundItem ? "found-items" : "lost-items"}/${itemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update item details.");
      }

      // 📝 Update related post if item is not in Request status
      if (isApprove && row?.item?.status === "Missing") {
        await fetch(`/api/post/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isFinder: row?.item?.isFoundItem,
            item_name: edit?.name,
            caption: edit?.description,
          }),
        });
      }

      // 🔔 Notify the user
      const notificationPayload = {
        receiver: userId,
        message: `The edit suggestion for your ${
          row?.item?.isFoundItem ? "found item" : "lost item"
        } (${row?.item?.name}) has been ${
          isApprove ? "approved" : "declined"
        }.`,
        type: row?.item?.isFoundItem ? "Found Items" : "Lost Items",
        markAsRead: false,
        dateNotified: new Date(),
      };

      await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationPayload),
      });

      // ✅ Cleanup & UI feedback
      setOpenSuggestionModal(false);
      setRejectSuggestion(false);
      setApproveSuggestion(false);
      setOpenSnackbar("success");
      refreshData();

      setMessage(
        isApprove
          ? "Item details updated successfully."
          : "The edit suggestion has been declined."
      );
    } catch (error) {
      console.error("Error during suggestion edit:", error);
      setOpenSnackbar("danger");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
            }}
          >
            {/* Status Chip */}
            <Chip
              variant="solid"
              size={isXs ? "sm" : "md"}
              color={
                ["Missing", "Surrender Pending", "Request"].includes(
                  row.item.status
                )
                  ? "warning"
                  : ["Declined", "Canceled", "Unclaimed"].includes(
                      row.item.status
                    )
                  ? "danger"
                  : ["Published", "Matched"].includes(row.item.status)
                  ? "primary"
                  : "success"
              }
            >
              {row?.item?.status || "Unknown"}
            </Chip>

            {/* Name + Location */}
            <Box>
              <Typography level="h5" fontWeight="bold">
                {row?.item?.name || "Unnamed Item"}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography level="body-md">
                  {row?.item?.isFoundItem ? "Found" : "Lost"} in{" "}
                  {row?.item?.location === "Unidentified"
                    ? "Unknown Area"
                    : row?.item?.location || "Unknown Area"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {session?.user?.id !== row?.user?._id && (
          <>
            <Grid item xs={12}>
              <Typography
                level="h5"
                sx={{
                  marginBottom: 2,
                  fontWeight: "bold",
                  color: "primary.plainColor",
                }}
              >
                {row.item.isFoundItem ? "Finder" : "Owner"} Information
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 1, md: 5 },
                }}
              >
                <Avatar
                  alt={
                    row?.user?.firstname && row?.user?.lastname
                      ? `${row?.user?.firstname} ${row?.user?.lastname}'s Profile Picture`
                      : "?"
                  }
                  src={row?.user?.profile_picture}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    boxShadow: 2,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    fontWeight="700"
                    level={isXs ? "body-sm" : "body-md"}
                    sx={{
                      whiteSpace: isXs ? "nowrap" : "",
                      overflow: isXs ? "hidden" : "",
                      textOverflow: isXs ? "ellipsis" : "",
                    }}
                  >
                    {row?.user?.firstname && row?.user?.lastname
                      ? `${row?.user?.firstname} ${row?.user?.lastname}`
                      : "Deleted User"}
                  </Typography>
                  <Typography
                    level={isXs ? "body-sm" : "body-md"}
                    sx={{
                      whiteSpace: isXs ? "nowrap" : "",
                      overflow: isXs ? "hidden" : "",
                      textOverflow: isXs ? "ellipsis" : "",
                    }}
                  >
                    {row?.user?.emailAddress
                      ? row?.user?.emailAddress
                      : "No Email Address"}
                  </Typography>
                  <Typography
                    level={isXs ? "body-sm" : "body-md"}
                    sx={{
                      whiteSpace: isXs ? "nowrap" : "",
                      overflow: isXs ? "hidden" : "",
                      textOverflow: isXs ? "ellipsis" : "",
                    }}
                  >
                    {row?.user?.contactNumber
                      ? row?.user?.contactNumber
                      : "No Contact Number"}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              level="h5"
              sx={{
                fontWeight: "bold",
                color: "primary.plainColor",
              }}
            >
              Item Information
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {(row.item.status === "Missing" ||
                row.item.status === "Published" ||
                (session.user.permissions.includes("User Dashboard") &&
                  row.item.status === "Request")) &&
                (!isEditMode ? (
                  <Button
                    size={isXs ? "small" : "medium"}
                    onClick={() => setIsEditMode(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    size={isXs ? "small" : "medium"}
                    color="danger"
                    onClick={() => setIsEditMode(false)}
                  >
                    Cancel
                  </Button>
                ))}

              {row.item.status === "Missing" && (
                <>
                  <Badge invisible={!row?.item?.edit} sx={{ marginRight: 1 }}>
                    <Button
                      size={isXs ? "small" : "medium"}
                      onClick={() => setOpenSuggestionModal(true)}
                      color="neutral"
                    >
                      Suggestion
                    </Button>
                  </Badge>
                </>
              )}
            </Box>
          </Box>
        </Grid>
        <Modal
          open={openSuggestionModal}
          onClose={() => setOpenSuggestionModal(false)}
        >
          <ModalDialog>
            <Typography level="h4">Edit Suggestions</Typography>
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
              {!row?.item?.edit ? (
                <Typography>No suggestions created yet...</Typography>
              ) : (
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Name",
                      value: row?.item?.name,
                      suggestion: row?.item?.edit?.name,
                    },
                    {
                      label: "Color",
                      value: (row?.item?.color || []).join(", "),
                      suggestion: (row?.item?.edit?.color).join(", "),
                    },
                    {
                      label: "Size",
                      value: row?.item?.size,
                      suggestion: row?.item?.edit?.size,
                    },
                    {
                      label: "Category",
                      value: row?.item?.category,
                      suggestion: row?.item?.edit?.category,
                    },
                    {
                      label: "Location",
                      value: row?.item?.location,
                      suggestion: row?.item?.edit?.location,
                    },
                    {
                      label: "Material",
                      value: row?.item?.material,
                      suggestion: row?.item?.edit?.material,
                    },
                    {
                      label: "Condition",
                      value: row?.item?.condition,
                      suggestion: row?.item?.edit?.condition,
                    },
                    {
                      label: "Distinctive Marks",
                      value: row?.item?.distinctiveMarks,
                      suggestion: row?.item?.edit?.distinctiveMarks,
                    },
                    {
                      label: "Description",
                      value: row?.item?.description,
                      suggestion: row?.item?.edit?.description,
                    },
                    {
                      label: "Date",
                      value: row?.item?.date_time?.split(" to ")[0],
                      suggestion: row?.item?.edit?.date_time?.split(" to ")[0],
                    },
                    {
                      label: "Time",
                      value: row?.item?.date_time?.split(" to ")[1],
                      suggestion: row?.item?.edit?.date_time?.split(" to ")[1],
                    },
                  ].map(({ label, value, suggestion }, index) => {
                    const hasChanged = value !== suggestion;

                    return (
                      <Grid
                        item
                        xs={12}
                        sm={label === "Description" ? 12 : 6}
                        key={index}
                      >
                        <Box
                          sx={{
                            border: "1px solid",
                            borderColor: hasChanged ? "error.main" : "divider",
                            borderRadius: 2,
                            p: 2,
                            backgroundColor: hasChanged ? "#ffeaea" : "#f9f9f9",
                          }}
                        >
                          <Typography level="subtitle" gutterBottom>
                            {label}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: {
                                xs: "column", // mobile: stack vertically
                                sm: "row", // tablet and up: row
                              },
                              alignItems: {
                                xs: "flex-start",
                                sm: "center",
                              },
                              gap: 1,
                            }}
                          >
                            <Typography
                              level={isXs ? "body-sm" : "body-md"}
                              sx={{ flex: 1 }}
                            >
                              {value || "-"}
                            </Typography>
                            {isXs ? <ArrowDownward /> : <ArrowForward />}
                            <Typography
                              level={isXs ? "body-sm" : "body-md"}
                              sx={{
                                flex: 1,
                                fontWeight: hasChanged ? "bold" : "normal",
                                color: hasChanged
                                  ? "error.main"
                                  : "text.primary",
                              }}
                            >
                              {suggestion || "-"}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      color="danger"
                      onClick={() => setRejectSuggestion(true)}
                    >
                      Decline
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      onClick={() => setApproveSuggestion(true)}
                    >
                      Approve
                    </Button>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
          </ModalDialog>
        </Modal>
        <Modal
          open={approveSuggestion}
          onClose={() => setApproveSuggestion(false)}
        >
          <ModalDialog>
            <ModalClose />
            <Typography level="h4">Approve Edit Changes</Typography>
            <DialogContent>
              <Typography level="body-md">
                Are you sure you want to overwrite these changes?
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Button
                  fullWidth
                  onClick={() => setApproveSuggestion(false)}
                  disabled={loading}
                  loading={loading}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={() => handleSuggestionEdit(true)}
                  loading={loading}
                  disabled={loading}
                >
                  Confirm
                </Button>
              </Box>
            </DialogContent>
          </ModalDialog>
        </Modal>
        <Modal
          open={rejectSuggestion}
          onClose={() => setRejectSuggestion(false)}
        >
          <ModalDialog>
            <ModalClose />
            <Typography level="h4">Decline Edit Changes</Typography>
            <DialogContent>
              <Typography level="body-md">
                Are you sure you want to decline this edit item suggestion?
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Button
                  fullWidth
                  onClick={() => setRejectSuggestion(false)}
                  variant="outlined"
                  disabled={loading}
                  loading={loading}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  color="danger"
                  onClick={() => handleSuggestionEdit(false)}
                  disabled={loading}
                  loading={loading}
                >
                  Confirm
                </Button>
              </Box>
            </DialogContent>
          </ModalDialog>
        </Modal>
        <Grid item xs={12}>
          <Box component="form" onSubmit={handleEdit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {isEditMode ? (
                  <FormControl>
                    <FormLabel>Item Name</FormLabel>
                    <Input
                      required
                      placeholder="e.g. Wallet"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                    />
                  </FormControl>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Inventory2 fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography level={isXs ? "body-sm" : "body-md"}>
                      <strong>Item Name: </strong> {row.item.name || "N/A"}
                    </Typography>
                  </Box>
                )}

                {isEditMode ? (
                  <>
                    <FormControl>
                      <FormLabel>Color</FormLabel>
                      <Select
                        multiple
                        fullWidth
                        required
                        value={color} // Controlled component
                        renderValue={(selected) => (
                          <Box
                            sx={{
                              display: "flex",
                              gap: "0.25rem",
                            }}
                          >
                            {selected.map((selectedOption, index) => (
                              <Chip key={index} variant="soft" color="primary">
                                {selectedOption.label}
                              </Chip>
                            ))}
                          </Box>
                        )}
                        onChange={(e, value) => {
                          setColor((prevValue) => {
                            const selectedValues = value;
                            return selectedValues;
                          });
                        }}
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
                        ].map((option) => (
                          <Option key={option} value={option}>
                            {option}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Palette fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography level={isXs ? "body-sm" : "body-md"}>
                      <strong>Color: </strong>
                      {row.item.color.length > 0
                        ? row.item.color.join(", ")
                        : "N/A"}
                    </Typography>
                  </Box>
                )}

                {isEditMode ? (
                  <>
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
                        label="If N/A, check this"
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
                      endDecorator={
                        <Select
                          disabled={sizeNotDetermined}
                          variant="soft"
                          size="small"
                          value={size.unit}
                          onChange={(e, newValue) =>
                            setSize({ ...size, unit: newValue })
                          }
                          placeholder="Unit"
                          sx={{
                            width: "40px",
                            ml: 0.5,
                            "& .MuiSelect-indicator": {
                              display: "none",
                            },
                            "& .MuiSelect-button": {
                              minHeight: "28px",
                              textAlign: "center",
                            },
                            "& .MuiInputBase-input": {
                              textAlign: "center",
                            },
                            "& .MuiOption-root": {
                              textAlign: "center",
                            },
                          }}
                        >
                          {["cm", "inch", "m", "ft", "kg", "g"].map((unit) => (
                            <Option key={unit} value={unit}>
                              {unit}
                            </Option>
                          ))}
                        </Select>
                      }
                    />
                  </>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Straighten fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography level={isXs ? "body-sm" : "body-md"}>
                      <strong>Size: </strong>
                      {row.item.size || "N/A"}
                    </Typography>
                  </Box>
                )}

                {isEditMode ? (
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Select
                      fullWidth
                      required
                      value={category}
                      onChange={(e, value) => setCategory(value)}
                      displayEmpty
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
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Category fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography level={isXs ? "body-sm" : "body-md"}>
                      <strong>Category: </strong> {row.item.category || "N/A"}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {isEditMode ? (
                  <FormControl required>
                    <FormLabel>Location</FormLabel>
                    <Autocomplete
                      disabled={!itemWhereabouts}
                      options={locationOptions}
                      value={location}
                      onChange={(e, newValue) => setLocation(newValue)}
                      renderInput={(params) => (
                        <Input {...params} placeholder="Select location..." />
                      )}
                    />
                  </FormControl>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography level={isXs ? "body-sm" : "body-md"}>
                      <strong>Location: </strong> {row.item.location || "N/A"}
                    </Typography>
                  </Box>
                )}
                {isEditMode ? (
                  <FormControl>
                    <FormLabel>Material</FormLabel>
                    <Select
                      fullWidth
                      required
                      value={material}
                      onChange={(e, value) => setMaterial(value)}
                      displayEmpty
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
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Build fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography level={isXs ? "body-sm" : "body-md"}>
                      <strong>Material: </strong> {row.item.material || "N/A"}
                    </Typography>
                  </Box>
                )}
                {isEditMode ? (
                  <FormControl>
                    <FormLabel>Condition</FormLabel>
                    <Select
                      fullWidth
                      required
                      value={condition}
                      onChange={(e, value) => setCondition(value)}
                      displayEmpty
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
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AssignmentTurnedIn fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography level={isXs ? "body-sm" : "body-md"}>
                      <strong>Condition: </strong> {row.item.condition || "N/A"}
                    </Typography>
                  </Box>
                )}

                {isEditMode ? (
                  <FormControl>
                    <FormLabel>Distinctive Marks</FormLabel>
                    <Select
                      fullWidth
                      required
                      value={distinctiveMarks}
                      onChange={(e, value) => setDistinctiveMarks(value)}
                      displayEmpty
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
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Fingerprint fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography level={isXs ? "body-sm" : "body-md"}>
                      <strong>Distinctive Marks: </strong>
                      {row.item.distinctiveMarks || "N/A"}
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                {isEditMode ? (
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      minRows={2}
                      value={description}
                      placeholder="More details about the item..."
                      onChange={(e) => setDescription(e.target.value)}
                      fullWidth
                    />
                  </FormControl>
                ) : (
                  <>
                    <Typography
                      level="h5"
                      sx={{
                        fontWeight: "bold",
                        color: "primary.plainColor",
                        mb: 1,
                      }}
                    >
                      Description
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Description fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography level={isXs ? "body-sm" : "body-md"}>
                        {row.item.description || "N/A"}
                      </Typography>
                    </Box>
                  </>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                {row.item.isFoundItem ? (
                  isEditMode ? (
                    <>
                      <FormControl>
                        <FormLabel>Found Date and Time</FormLabel>
                        <Input
                          type="datetime-local"
                          value={foundDate} // Use the existing state or initial date
                          onChange={(e) => setFoundDate(e.target.value)} // Handle date change for found item
                          required
                        />
                      </FormControl>
                    </>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip
                          title={
                            row?.item?.isFoundItem ? "Date Found" : "Date Lost"
                          }
                        >
                          <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                        </Tooltip>
                        <Typography
                          fontWeight={600}
                          level={isXs ? "body-sm" : "body-md"}
                        >
                          {format(
                            new Date(row.item.date_time),
                            "MMMM dd, yyyy"
                          )}
                        </Typography>
                        <Typography
                          level={isXs ? "body-sm" : "body-md"}
                          sx={{ mx: 0.5 }}
                        >
                          –
                        </Typography>
                        <Typography
                          fontWeight={600}
                          level={isXs ? "body-sm" : "body-md"}
                        >
                          {format(new Date(row.item.date_time), "hh:mm a")}
                        </Typography>
                      </Box>
                    </>
                  )
                ) : (
                  (() => {
                    const [start, end] =
                      row.item.date_time &&
                      row.item.date_time !== "Unidentified"
                        ? row.item.date_time.split(" to ")
                        : [null, null];

                    return isEditMode ? (
                      <>
                        <Checkbox
                          sx={{ my: 2 }}
                          label="The owner knows the item's whereabouts"
                          checked={itemWhereabouts}
                          onChange={handleCheckbox}
                        />
                        {itemWhereabouts && (
                          <>
                            <Input
                              type="datetime-local"
                              value={lostStartDate} // Use state or initial value
                              onChange={(e) => setLostStartDate(e.target.value)} // Handle start date change
                              required
                            />
                            <Input
                              type="datetime-local"
                              value={lostEndDate} // Use state or initial value
                              onChange={(e) => setLostEndDate(e.target.value)} // Handle end date change
                              required
                            />
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Tooltip title="Lost Start Date">
                              <CalendarToday
                                fontSize="small"
                                sx={{ mr: 0.5 }}
                              />
                            </Tooltip>
                            <Typography
                              fontWeight={600}
                              level={isXs ? "body-sm" : "body-md"}
                            >
                              {start ? start : "Unidentified"}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Tooltip title="Lost End Date">
                              <HourglassBottom
                                fontSize="small"
                                sx={{ mr: 0.5 }}
                              />
                            </Tooltip>
                            <Typography
                              fontWeight={600}
                              level={isXs ? "body-sm" : "body-md"}
                            >
                              {end ? end : "Unidentified"}
                            </Typography>
                          </Box>
                        </Box>
                      </>
                    );
                  })()
                )}
              </Grid>

              {/* Submit Button */}
              {isEditMode && (
                <Grid item xs={12}>
                  <Button
                    disabled={loading}
                    loading={loading}
                    type="submit"
                    fullWidth
                  >
                    Save Changes
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>

        {/* Publishing Details */}
        <Grid item xs={12}>
          <Box sx={{ marginBottom: 4 }}>
            <Typography
              level="h5"
              sx={{
                marginBottom: 2,
                fontWeight: "bold",
                color: "primary.plainColor",
              }}
            >
              Item Tracking History
            </Typography>
            <Box
              sx={{
                bgcolor: "background.level1",
                borderRadius: "md",
                boxShadow: "sm",
                padding: 3,
              }}
            >
              <Stepper orientation="vertical">
                {(row.item.dateResolved || row.item.dateClaimed) && (
                  <Step>
                    <Typography
                      level={isXs ? "body-sm" : isSm ? "body-md" : "body-lg"}
                    >
                      <strong>
                        The item has successfully returned to owner!
                      </strong>
                    </Typography>
                    <Typography
                      level={isXs ? "body-xs" : isSm ? "body-sm" : "body-md"}
                    >
                      {isToday(
                        new Date(
                          row.item.isFoundItem
                            ? row.item.dateResolved
                            : row.item.dateClaimed
                        )
                      )
                        ? `Today, ${format(
                            new Date(
                              row.item.isFoundItem
                                ? row.item.dateResolved
                                : row.item.dateClaimed
                            ),
                            "hh:mm a"
                          )}`
                        : format(
                            new Date(
                              row.item.isFoundItem
                                ? row.item.dateResolved
                                : row.item.dateClaimed
                            ),
                            "MMMM dd, yyyy, hh:mm a"
                          )}
                    </Typography>
                  </Step>
                )}
                {row.item.dateDeclined && (
                  <Step>
                    <Typography
                      level={isXs ? "body-sm" : isSm ? "body-md" : "body-lg"}
                    >
                      <strong>The item has been declined.</strong>
                    </Typography>
                    <Typography
                      level={isXs ? "body-sm" : isSm ? "body-md" : "body-lg"}
                    >
                      <strong>Reason: </strong> {row.item.reason}
                    </Typography>
                    <Typography
                      level={isXs ? "body-xs" : isSm ? "body-sm" : "body-md"}
                    >
                      {isToday(new Date(row.item.dateDeclined))
                        ? `Today, ${format(
                            new Date(row.item.dateDeclined),
                            "hh:mm a"
                          )}`
                        : format(
                            new Date(row.item.dateDeclined),
                            "MMMM dd, yyyy, hh:mm a"
                          )}
                    </Typography>
                  </Step>
                )}
                {row.item.dateCanceled && (
                  <Step>
                    <Typography
                      level={isXs ? "body-sm" : isSm ? "body-md" : "body-lg"}
                    >
                      <strong>The item has been canceled.</strong>
                    </Typography>
                    <Typography
                      level={isXs ? "body-xs" : isSm ? "body-sm" : "body-md"}
                    >
                      {isToday(new Date(row.item.dateCanceled))
                        ? `Today, ${format(
                            new Date(row.item.dateCanceled),
                            "hh:mm a"
                          )}`
                        : format(
                            new Date(row.item.dateCanceled),
                            "MMMM dd, yyyy, hh:mm a"
                          )}
                    </Typography>
                  </Step>
                )}
                {row.item.dateMatched && (
                  <Step>
                    <Typography
                      level={isXs ? "body-sm" : isSm ? "body-md" : "body-lg"}
                    >
                      <strong>The item has been successfully matched!</strong>
                    </Typography>
                    <Typography
                      level={isXs ? "body-xs" : isSm ? "body-sm" : "body-md"}
                    >
                      {isToday(new Date(row.item.dateMatched))
                        ? `Today, ${format(
                            new Date(row.item.dateMatched),
                            "hh:mm a"
                          )}`
                        : format(
                            new Date(row.item.dateMatched),
                            "MMMM dd, yyyy, hh:mm a"
                          )}
                    </Typography>
                  </Step>
                )}
                {row.item.dateUnclaimed && (
                  <Step>
                    <Typography
                      level={isXs ? "body-sm" : isSm ? "body-md" : "body-lg"}
                    >
                      <strong>The item has been tracked!</strong>
                    </Typography>
                    <Typography
                      level={isXs ? "body-xs" : isSm ? "body-sm" : "body-md"}
                    >
                      {isToday(new Date(row.item.dateUnclaimed))
                        ? `Today, ${format(
                            new Date(row.item.dateUnclaimed),
                            "hh:mm a"
                          )}`
                        : format(
                            new Date(row.item.dateUnclaimed),
                            "MMMM dd, yyyy, hh:mm a"
                          )}
                    </Typography>
                  </Step>
                )}
                {row.item.dateMissing && (
                  <Step>
                    <Typography
                      level={isXs ? "body-sm" : isSm ? "body-md" : "body-lg"}
                    >
                      <strong>The item has been published!</strong>
                    </Typography>
                    <Typography
                      level={isXs ? "body-xs" : isSm ? "body-sm" : "body-md"}
                    >
                      {isToday(new Date(row.item.dateMissing))
                        ? `Today, ${format(
                            new Date(row.item.dateMissing),
                            "hh:mm a"
                          )}`
                        : format(
                            new Date(row.item.dateMissing),
                            "MMMM dd, yyyy, hh:mm a"
                          )}
                    </Typography>
                  </Step>
                )}
                {row.item.datePublished && (
                  <Step>
                    <Typography
                      level={isXs ? "body-sm" : isSm ? "body-md" : "body-lg"}
                    >
                      <strong>
                        {row.item.dateRequest
                          ? "The item was approved!"
                          : "The item has been published!"}
                      </strong>
                    </Typography>
                    <Typography
                      level={isXs ? "body-xs" : isSm ? "body-sm" : "body-md"}
                    >
                      {isToday(new Date(row.item.datePublished))
                        ? `Today, ${format(
                            new Date(row.item.datePublished),
                            "hh:mm a"
                          )}`
                        : format(
                            new Date(row.item.datePublished),
                            "MMMM dd, yyyy, hh:mm a"
                          )}
                    </Typography>
                  </Step>
                )}
                {row.item.dateValidating && (
                  <Step>
                    <Typography
                      level={isXs ? "body-sm" : isSm ? "body-md" : "body-lg"}
                    >
                      <strong>The item request has approved!</strong>
                    </Typography>
                    <Typography
                      level={isXs ? "body-xs" : isSm ? "body-sm" : "body-md"}
                    >
                      {isToday(new Date(row.item.dateValidating))
                        ? `Today, ${format(
                            new Date(row.item.dateValidating),
                            "hh:mm a"
                          )}`
                        : format(
                            new Date(row.item.dateValidating),
                            "MMMM dd, yyyy, hh:mm a"
                          )}
                    </Typography>
                  </Step>
                )}
                {row.item.dateRequest && (
                  <Step>
                    <Typography
                      level={isXs ? "body-sm" : isSm ? "body-md" : "body-lg"}
                    >
                      <strong>Request has been sent!</strong>
                    </Typography>
                    <Typography
                      level={isXs ? "body-xs" : isSm ? "body-sm" : "body-md"}
                    >
                      {isToday(new Date(row.item.dateRequest))
                        ? `Today, ${format(
                            new Date(row.item.dateRequest),
                            "hh:mm a"
                          )}`
                        : format(
                            new Date(row.item.dateRequest),
                            "MMMM dd, yyyy, hh:mm a"
                          )}
                    </Typography>
                  </Step>
                )}
              </Stepper>
            </Box>
          </Box>
        </Grid>

        {/* Item Image */}
        <Grid item xs={12}>
          <Box>
            <Typography
              level="h5"
              sx={{
                marginBottom: 2,
                fontWeight: "bold",
                color: "primary.plainColor",
              }}
            >
              Item Image
            </Typography>
            <Carousel showThumbs={false} useKeyboardArrows>
              {row.item.images?.map((image, index) => {
                if (!image || image === "null") return null;

                return (
                  <Box
                    key={index}
                    sx={{
                      overflow: "hidden",
                      display: "inline-block",
                      cursor: "pointer",
                      margin: 1,
                    }}
                    onClick={() => window.open(image, "_blank")}
                  >
                    <CldImage
                      priority
                      src={image}
                      width={200}
                      height={200}
                      alt={row.item?.name || "Item Image"}
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                    />
                  </Box>
                );
              })}
            </Carousel>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default ItemDetails;
