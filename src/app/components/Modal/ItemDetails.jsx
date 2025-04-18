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
  Card,
  StepIndicator,
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
  HelpOutline,
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
  const [sizeMode, setSizeMode] = useState(() => {
    return ["XS", "S", "M", "L", "XL", "2XL"].includes(row.item.size)
      ? "predefined"
      : "manual";
  });

  const [sizeNotDetermined, setSizeNotDetermined] = useState(() => {
    return row.item.size === "N/A";
  });

  const [size, setSize] = useState(() => {
    if (
      !row?.item?.isFoundItem ||
      sizeMode === "predefined" ||
      sizeNotDetermined
    )
      return { value: "", unit: "cm" };

    const [val, unit] = row.item.size.split(" ");
    return {
      value: val,
      unit: unit,
    };
  });

  const [predefinedSize, setPredefinedSize] = useState(() => {
    return ["XS", "S", "M", "L", "XL", "2XL"].includes(row.item.size)
      ? row.item.size
      : "";
  });

  const [category, setCategory] = useState(
    row?.item?.isFoundItem ? row.item.category : null
  );
  const [material, setMaterial] = useState(
    row?.item?.isFoundItem ? row.item.material : null
  );
  const [condition, setCondition] = useState(
    row?.item?.isFoundItem ? row.item.condition : null
  );
  const [distinctiveMarks, setDistinctiveMarks] = useState(
    row?.item?.isFoundItem ? row.item.distinctiveMarks : null
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
  const [allowPosting, setAllowPosting] = useState(
    row?.item?.allowedToPost || false
  );
  const [questions, setQuestions] = useState(row?.item?.questions || [""]);

  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));

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
        size:
          sizeMode === "predefined"
            ? predefinedSize
            : sizeNotDetermined
            ? "N/A"
            : `${size.value} ${size.unit}`,
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

      const postFormData = {
        isFinder: row?.item?.isFoundItem ? true : false,
        item_name: name,
        caption: description,
      };

      if (
        row.item.isFoundItem &&
        session?.user?.permissions.includes("Admin Dashboard")
      ) {
        postFormData.allowedToPost = allowPosting;
        formData.allowedToPost = allowPosting;
        formData.questions = allowPosting
          ? questions.filter((q) => q.trim())
          : [];
      }

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
          body: JSON.stringify(postFormData),
        });
      }

      // Refresh and update UI
      setOpenSnackbar("success");
      setMessage("Item details updated successfully!");
      setIsEditMode(false);
      refreshData();
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage(error.message);
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
                  : ["Declined", "Canceled"].includes(row.item.status)
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

        {row?.item.status === "Surrender Pending" &&
          session?.user?.id === row?.user?._id && (
            <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{
                  p: 3,
                  boxShadow: 2,
                  maxWidth: "100%",
                  mx: "auto",
                  borderRadius: "lg",
                  bgcolor: "background.level1",
                }}
              >
                <Grid container spacing={3} alignItems="flex-start">
                  {/* Left Side: Instructions */}
                  <Grid item xs={12} md={5}>
                    <Box>
                      <Typography
                        level="body-md"
                        sx={{ mb: 1.5, lineHeight: 1.8 }}
                      >
                        <strong>Found something?</strong> Please surrender the
                        item as soon as you can to help reunite it with its
                        owner. Here&apos;s where to go:
                      </Typography>

                      <Typography
                        level="body-lg"
                        fontWeight="lg"
                        sx={{ mb: 1 }}
                      >
                        🎯 Surrender Point:
                      </Typography>
                      <Typography level="body-md" sx={{ mb: 0.5 }}>
                        📍 <strong>SASO Office</strong>
                      </Typography>
                      <Typography level="body-md" sx={{ mb: 0.5 }}>
                        🏢 <strong>1st Floor, FJN Building</strong>
                      </Typography>

                      <Typography
                        level="body-lg"
                        fontWeight="lg"
                        sx={{ mt: 2, mb: 1 }}
                      >
                        📞 Contact Info:
                      </Typography>
                      <Typography level="body-md">
                        📧 <strong>Email:</strong> saso@thelewiscollege.edu.ph
                      </Typography>
                      <Typography level="body-md">
                        📱 <strong>Phone:</strong> 0912 345 6789
                      </Typography>

                      <Typography
                        level="body-sm"
                        sx={{
                          mt: 2,
                          fontStyle: "italic",
                          color: "text.secondary",
                        }}
                      >
                        Let&apos;s work together to return the item to its
                        rightful owner 💙
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Divider (only for large screens) */}
                  <Grid
                    item
                    md={1}
                    sx={{ display: { xs: "none", md: "block" } }}
                  >
                    <Divider orientation="vertical" />
                  </Grid>

                  {/* Right Side: Stepper */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      level="title-md"
                      fontWeight="bold"
                      sx={{ mb: 2 }}
                    >
                      🧭 Step-by-Step Guide
                    </Typography>

                    <Stepper
                      orientation="vertical"
                      sx={{
                        gap: 3,
                        "--StepIndicator-size": "32px",
                      }}
                    >
                      <Step
                        orientation="vertical"
                        indicator={
                          <StepIndicator variant="soft" color="primary">
                            1
                          </StepIndicator>
                        }
                      >
                        <Box sx={{ pl: 1 }}>
                          <Typography
                            level="title-sm"
                            fontWeight="lg"
                            sx={{ mb: 0.5 }}
                          >
                            Visit the Office
                          </Typography>
                          <Typography level="body-sm" color="text.secondary">
                            Head over to the SASO Office located at the 1st
                            Floor of the FJN Building.
                          </Typography>
                        </Box>
                      </Step>

                      <Step
                        orientation="vertical"
                        indicator={
                          <StepIndicator variant="soft" color="primary">
                            2
                          </StepIndicator>
                        }
                      >
                        <Box sx={{ pl: 1 }}>
                          <Typography
                            level="title-sm"
                            fontWeight="lg"
                            sx={{ mb: 0.5 }}
                          >
                            Talk to SASO Staff
                          </Typography>
                          <Typography level="body-sm" color="text.secondary">
                            Inform the officer-in-charge that you&apos;re
                            surrendering a found item.
                          </Typography>
                        </Box>
                      </Step>

                      <Step
                        orientation="vertical"
                        indicator={
                          <StepIndicator variant="soft" color="primary">
                            3
                          </StepIndicator>
                        }
                      >
                        <Box sx={{ pl: 1 }}>
                          <Typography
                            level="title-sm"
                            fontWeight="lg"
                            sx={{ mb: 0.5 }}
                          >
                            Confirm Submission
                          </Typography>
                          <Typography level="body-sm" color="text.secondary">
                            Once the item has been officially turned in, your
                            part is complete!
                          </Typography>
                        </Box>
                      </Step>
                    </Stepper>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          )}

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
              {((["Missing", "Published"].includes(row?.item?.status) &&
                session?.user?.permissions.includes("Admin Dashboard")) ||
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
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box component="form" onSubmit={handleEdit}>
            <Grid container spacing={2}>
              {row?.item?.isFoundItem ? (
                <>
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
                                  <Chip
                                    key={index}
                                    variant="soft"
                                    color="primary"
                                  >
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
                        {/* Size Mode Switch */}
                        <FormControl sx={{ mb: 1 }}>
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

                        {sizeMode === "manual" ? (
                          <>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                mb: 0.7,
                              }}
                            >
                              <FormLabel>Manual Size</FormLabel>
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
                              required={!sizeNotDetermined}
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
                                  sx={{
                                    width: "50px",
                                    ml: 0.5,
                                  }}
                                >
                                  {["cm", "inch", "m", "ft", "kg", "g"].map(
                                    (unit) => (
                                      <Option key={unit} value={unit}>
                                        {unit}
                                      </Option>
                                    )
                                  )}
                                </Select>
                              }
                            />
                          </>
                        ) : (
                          <FormControl required sx={{ mt: 1 }}>
                            <FormLabel>Predefined Size</FormLabel>
                            <Select
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
                        )}
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
                          <strong>Category: </strong>{" "}
                          {row.item.category || "N/A"}
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
                            <Input
                              {...params}
                              placeholder="Select location..."
                            />
                          )}
                        />
                      </FormControl>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography level={isXs ? "body-sm" : "body-md"}>
                          <strong>Location: </strong>{" "}
                          {row.item.location || "N/A"}
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
                          <strong>Material: </strong>{" "}
                          {row.item.material || "N/A"}
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
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AssignmentTurnedIn fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography level={isXs ? "body-sm" : "body-md"}>
                          <strong>Condition: </strong>{" "}
                          {row.item.condition || "N/A"}
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
                </>
              ) : (
                <>
                  <Grid item xs={12}>
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
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Description fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography level={isXs ? "body-sm" : "body-md"}>
                            <strong>Description: </strong>{" "}
                            {row.item.description || "N/A"}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                {!row?.item?.isFoundItem && (
                  <>
                    {isEditMode ? (
                      <FormControl required>
                        <FormLabel>Location</FormLabel>
                        <Autocomplete
                          disabled={!itemWhereabouts}
                          options={locationOptions}
                          value={location}
                          onChange={(e, newValue) => setLocation(newValue)}
                          renderInput={(params) => (
                            <Input
                              {...params}
                              placeholder="Select location..."
                            />
                          )}
                        />
                      </FormControl>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1,
                          marginBottom: "1px",
                        }}
                      >
                        <Tooltip title="Location">
                          <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                        </Tooltip>
                        <Typography
                          fontWeight={600}
                          level={isXs ? "body-sm" : "body-md"}
                        >
                          {row.item.location || "N/A"}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
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
                            <Tooltip title="Start of Possible Loss Timeframe">
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
                            <Tooltip title="End of Possible Loss Timeframe">
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

              {session?.user?.permissions.includes("Admin Dashboard") ? (
                isEditMode ? (
                  <>
                    <Grid item xs={12}>
                      <Checkbox
                        checked={allowPosting}
                        onChange={(e) => {
                          setAllowPosting(e.target.checked);
                          setQuestions(row?.item?.questions || [""]);
                        }}
                        label="Allow this item to be posted"
                      />
                    </Grid>

                    {allowPosting ? (
                      <Grid item xs={12}>
                        <FormControl>
                          <FormLabel>Verification Questions</FormLabel>
                          {questions.map((q, index) => (
                            <Box
                              key={index}
                              sx={{ mb: 1, display: "flex", gap: 1 }}
                            >
                              <Input
                                placeholder={`Question ${index + 1}`}
                                value={q}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[index] = e.target.value;
                                  setQuestions(updated);
                                }}
                                fullWidth
                              />
                              <Button
                                variant="soft"
                                color="danger"
                                onClick={() => {
                                  const updated = questions.filter(
                                    (_, i) => i !== index
                                  );
                                  setQuestions(updated);
                                }}
                              >
                                Remove
                              </Button>
                            </Box>
                          ))}

                          <Button
                            variant="soft"
                            size="sm"
                            onClick={() => setQuestions([...questions, ""])}
                          >
                            + Add Question
                          </Button>
                        </FormControl>
                      </Grid>
                    ) : null}
                  </>
                ) : allowPosting && questions.length > 0 ? (
                  <Grid item xs={12}>
                    <Typography
                      level="h5"
                      sx={{
                        fontWeight: "bold",
                        color: "primary.plainColor",
                      }}
                    >
                      Verification Questions
                    </Typography>
                    <List>
                      {questions.map((q, index) => (
                        <ListItem key={index}>
                          <ListItemDecorator>
                            <HelpOutline fontSize="small" />
                          </ListItemDecorator>
                          {q}
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                ) : null
              ) : null}

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

        <Grid item xs={12}>
          {row?.item?.status === "Resolved" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                marginBottom: "1px",
              }}
            >
              <Typography>Received by:</Typography>
              <Typography fontWeight={600} level={isXs ? "body-sm" : "body-md"}>
                {`${row?.item?.receivedBy?.firstname} ${row?.item?.receivedBy?.lastname}` ||
                  "Unknown Owner"}
              </Typography>
            </Box>
          )}
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
