"use client";

import React, { useState, useMemo } from "react";
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
} from "@mui/joy";
import { CldImage } from "next-cloudinary";
import { format, subDays, isBefore, isAfter, isToday } from "date-fns";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useTheme, useMediaQuery } from "@mui/material";
import { useSession } from "next-auth/react";
import { Check } from "@mui/icons-material";

const ItemDetails = ({ row, refreshData, setOpenSnackbar, setMessage }) => {
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
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  console.log(color);

  const locationOptions = [
    "RLO101",
    "RLO102",
    "RLO201",
    "RLO202",
    "RLO Restroom",
    "FJN101",
    "FJN102",
    "FJN201",
    "FJN202",
    "FJN301",
    "FJN302",
    "FJN Restroom (1st Floor)",
    "FJN Restroom (2nd Floor)",
    "FJN Restroom (3rd Floor)",
    "MMN101",
    "MMN102",
    "MMN103",
    "MMN201",
    "MMN202",
    "MMN203",
    "MMN301",
    "MMN302",
    "MMN303",
    "MMN Restroom (2nd Floor)",
    "MMN Restroom (3rd Floor)",
    "Canteen",
    "TLC Court",
    "Function Hall",
    "Library",
    "COMLAB A",
    "COMLAB B",
    "COMLAB C",
  ];

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

  return (
    <>
      {/* Header */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          {/* User Information */}
          <Grid container spacing={2} sx={{ marginBottom: 4 }}>
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
            </Grid>
            {/* Avatar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                padding: 2,
                maxWidth: { xs: "235px", sm: "600px" }, // 100% on small screens, 600px on larger
                width: "100%",
              }}
            >
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  md={3}
                  sx={{
                    display: "flex",
                    justifyContent: "center", // Center the avatar
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    alt={`${
                      row.sender ? row.sender.firstname : row.user.firstname
                    } ${
                      row.sender ? row.sender.lastname : row.user.lastname
                    }'s Profile Picture`}
                    src={
                      row.sender
                        ? row.sender.profile_picture
                        : row.user.profile_picture
                    }
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      boxShadow: 2,
                    }}
                  />
                </Grid>

                {/* User Details */}
                <Grid
                  item
                  xs={12}
                  md={9}
                  sx={{
                    maxWidth: "100%",
                    flexBasis: { xs: "100%", md: "75%" },
                  }}
                >
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Typography
                      fontWeight="700"
                      level={isXs ? "body-sm" : "body-md"}
                      sx={{
                        whiteSpace: isXs ? "nowrap" : "",
                        overflow: isXs ? "hidden" : "",
                        textOverflow: isXs ? "ellipsis" : "",
                      }}
                    >
                      {row.sender ? row.sender.firstname : row.user?.firstname}{" "}
                      {row.sender ? row.sender.lastname : row.user?.lastname}
                    </Typography>
                    <Typography
                      level={isXs ? "body-sm" : "body-md"}
                      sx={{
                        whiteSpace: isXs ? "nowrap" : "",
                        overflow: isXs ? "hidden" : "",
                        textOverflow: isXs ? "ellipsis" : "",
                      }}
                    >
                      {row.sender
                        ? row.sender.emailAddress
                        : row.user?.emailAddress}
                    </Typography>
                    <Typography
                      level={isXs ? "body-sm" : "body-md"}
                      sx={{
                        whiteSpace: isXs ? "nowrap" : "",
                        overflow: isXs ? "hidden" : "",
                        textOverflow: isXs ? "ellipsis" : "",
                      }}
                    >
                      {row.sender
                        ? row.sender.contactNumber
                        : row.user?.contactNumber}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Item Details */}
          <Box sx={{ marginBottom: 4 }}>
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
                  marginBottom: 2,
                  fontWeight: "bold",
                  color: "primary.plainColor",
                }}
              >
                Item Information
              </Typography>
              {(row.item.status === "Missing" ||
                row.item.status === "Published" ||
                (session?.user?.userType === "user" &&
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
            <Box sx={{ padding: 1 }}>
              <Chip
                variant="solid"
                sx={{ mb: 2 }}
                size={isXs ? "sm" : "md"}
                color={
                  row.item.status === "Missing" ||
                  row.item.status === "Surrender Pending" ||
                  row.item.status === "Request"
                    ? "warning"
                    : row.item.status === "Declined" ||
                      row.item.status === "Canceled" ||
                      row.item.status === "Unclaimed"
                    ? "danger"
                    : row.item.status === "Published" ||
                      row.item.status === "Matched"
                    ? "primary"
                    : "success"
                }
              >
                {row.item.status}
              </Chip>
              <form onSubmit={handleEdit}>
                <Grid container spacing={2}>
                  {/* Left Column */}
                  <Grid item xs={12} lg={6}>
                    {isEditMode ? (
                      <FormControl>
                        <FormLabel>Item Name</FormLabel>
                        <Input
                          required
                          placeholder="Item Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          fullWidth
                        />
                      </FormControl>
                    ) : (
                      <Typography level={isXs ? "body-sm" : "body-md"}>
                        <strong>Name:</strong> {row.item.name || "N/A"}
                      </Typography>
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
                      <Typography level={isXs ? "body-sm" : "body-md"}>
                        <strong>Color:</strong>{" "}
                        {row.item.color.length > 0
                          ? row.item.color.join(", ")
                          : "N/A"}
                      </Typography>
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
                              {["cm", "inch", "m", "ft"].map((unit) => (
                                <Option key={unit} value={unit}>
                                  {unit}
                                </Option>
                              ))}
                            </Select>
                          }
                        />
                      </>
                    ) : (
                      <Typography level={isXs ? "body-sm" : "body-md"}>
                        <strong>Size:</strong> {row.item.size || "N/A"}
                      </Typography>
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
                    ) : (
                      <Typography level={isXs ? "body-sm" : "body-md"}>
                        <strong>Category:</strong> {row.item.category || "N/A"}
                      </Typography>
                    )}
                  </Grid>

                  {/* Right Column */}
                  <Grid item xs={12} lg={6}>
                    {isEditMode ? (
                      <FormControl>
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
                      <Typography level={isXs ? "body-sm" : "body-md"}>
                        <strong>Location:</strong> {row.item.location || "N/A"}
                      </Typography>
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
                      <Typography level={isXs ? "body-sm" : "body-md"}>
                        <strong>Material:</strong> {row.item.material || "N/A"}
                      </Typography>
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
                      <Typography level={isXs ? "body-sm" : "body-md"}>
                        <strong>Condition:</strong>{" "}
                        {row.item.condition || "N/A"}
                      </Typography>
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
                      <Typography level={isXs ? "body-sm" : "body-md"}>
                        <strong>Distinctive Marks:</strong>{" "}
                        {row.item.distinctiveMarks || "N/A"}
                      </Typography>
                    )}
                  </Grid>

                  {/* Description and Date/Time */}
                  <Grid item xs={12}>
                    <Divider sx={{ marginY: 2 }} />
                    {isEditMode ? (
                      <FormControl>
                        <FormLabel>Caption</FormLabel>
                        <Textarea
                          type="text"
                          name="description"
                          minRows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          fullWidth
                        />
                      </FormControl>
                    ) : (
                      <Typography level={isXs ? "body-sm" : "body-md"}>
                        <strong>Caption:</strong>{" "}
                        {row.item.description || "N/A"}
                      </Typography>
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
                          <Typography level={isXs ? "body-sm" : "body-md"}>
                            <strong>Date:</strong>{" "}
                            {new Date(row.item.date_time).toLocaleDateString()}
                          </Typography>
                          <Typography level={isXs ? "body-sm" : "body-md"}>
                            <strong>Time:</strong>{" "}
                            {new Date(row.item.date_time).toLocaleTimeString()}
                          </Typography>
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
                              label="The owner knows the item's location"
                              checked={itemWhereabouts}
                              onChange={handleCheckbox}
                            />
                            {itemWhereabouts && (
                              <>
                                <Input
                                  type="datetime-local"
                                  value={lostStartDate} // Use state or initial value
                                  onChange={(e) =>
                                    setLostStartDate(e.target.value)
                                  } // Handle start date change
                                  required
                                />
                                <Input
                                  type="datetime-local"
                                  value={lostEndDate} // Use state or initial value
                                  onChange={(e) =>
                                    setLostEndDate(e.target.value)
                                  } // Handle end date change
                                  required
                                />
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <Typography level={isXs ? "body-sm" : "body-md"}>
                              <strong>Start Lost Date:</strong>{" "}
                              {start
                                ? `${new Date(
                                    start
                                  ).toLocaleDateString()} ${new Date(
                                    start
                                  ).toLocaleTimeString()}`
                                : "Unidentified"}
                            </Typography>
                            <Typography level={isXs ? "body-sm" : "body-md"}>
                              <strong>End Lost Date:</strong>{" "}
                              {end
                                ? `${new Date(
                                    end
                                  ).toLocaleDateString()} ${new Date(
                                    end
                                  ).toLocaleTimeString()}`
                                : "Unidentified"}
                            </Typography>
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
                      >
                        Save Changes
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </form>
            </Box>
          </Box>

          {/* Publishing Details */}
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

          {/* Item Image */}
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
              {row.item.images?.map((image, index) => (
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
                    src={image}
                    width={200}
                    height={200}
                    alt={row.item?.name || "Item Image"}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                  />
                </Box>
              ))}
            </Carousel>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default ItemDetails;
