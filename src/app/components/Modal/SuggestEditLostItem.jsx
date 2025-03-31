import { ArrowRightAlt } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  DialogContent,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Textarea,
  Typography,
} from "@mui/joy";
import { Grid } from "@mui/material";
import { format, isAfter } from "date-fns";
import React, { useState } from "react";

const SuggestEditLostItem = ({
  suggestEditModal,
  setSuggestEditModal,
  lostItem,
  locationOptions,
  setOpenSnackbar,
  setMessage,
  session,
  refreshData,
}) => {
  const [name, setName] = useState(lostItem?.name || "");
  const [color, setColor] = useState(lostItem?.color || []);
  const [size, setSize] = useState({
    value: lostItem?.size.split(" ")[0],
    unit: lostItem?.size.split(" ")[1],
  });
  const [sizeNotDetermined, setSizeNotDetermined] = useState(
    lostItem?.size === "N/A" ? true : false
  );
  const [category, setCategory] = useState(lostItem?.category || "");
  const [material, setMaterial] = useState(lostItem?.material || "");
  const [condition, setCondition] = useState(lostItem?.condition || "");
  const [distinctiveMarks, setDistinctiveMarks] = useState(
    lostItem?.distinctiveMarks || ""
  );
  const [itemWhereabouts, setItemWhereabouts] = useState(
    lostItem?.date_time === "Unidentified" &&
      lostItem?.location === "Unidentified"
      ? false
      : true
  );
  const [description, setDescription] = useState(lostItem?.description || "");
  const [location, setLocation] = useState(
    !itemWhereabouts ? "Unidentified" : lostItem?.location
  );
  const [lostStartDate, setLostStartDate] = useState(() => {
    if (lostItem?.date_time === "Unidentified") {
      return lostItem?.date_time;
    } else {
      const [start] = lostItem?.date_time.split(" to ");
      const startDate = new Date(start);
      startDate.setHours(startDate.getHours() + 8); // Adjust to +8 hours
      return startDate.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
    }
    return "";
  });

  const [lostEndDate, setLostEndDate] = useState(() => {
    if (lostItem?.date_time === "Unidentified") {
      return lostItem?.date_time;
    } else {
      const [, end] = lostItem?.date_time.split(" to ");
      const endDate = new Date(end);
      endDate.setHours(endDate.getHours() + 8); // Adjust to +8 hours
      return endDate.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
    }
    return "";
  });

  const [loading, setLoading] = useState(false);
  const [cancelConfirmation, setCancelConfirmation] = useState(false);

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
      if (lostItem?.location === "Unidentified") {
        setLocation(null);
        setLostStartDate(null);
        setLostEndDate(null);
      } else {
        setLocation(lostItem?.location);
        setLostStartDate(() => {
          if (!lostItem?.isFoundItem) {
            if (lostItem?.date_time === "Unidentified") {
              return lostItem?.date_time;
            } else {
              const [start] = lostItem?.date_time.split(" to ");
              const startDate = new Date(start);
              startDate.setHours(startDate.getHours() + 8); // Adjust to +8 hours
              return startDate.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:mm"
            }
          }
          return ""; // Default value if item is found
        });
        setLostEndDate(() => {
          if (!lostItem?.isFoundItem) {
            if (lostItem?.date_time === "Unidentified") {
              return lostItem?.date_time;
            } else {
              const [, end] = lostItem?.date_time.split(" to ");
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

  console.log(lostItem);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (lostStartDate && lostEndDate) {
      const now = new Date();
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

    const formData = {
      edit: {
        user: session?.user?.id,
        item: lostItem?._id,
        name,
        color,
        size: sizeNotDetermined ? "N/A" : `${size.value} ${size.unit}`,
        category,
        material,
        condition,
        distinctiveMarks,
        description,
        location,
        date_time: itemWhereabouts
          ? `${format(
              new Date(lostStartDate),
              "MMMM dd, yyyy hh:mm a"
            )} to ${format(new Date(lostEndDate), "MMMM dd, yyyy hh:mm a")}`
          : "Unidentified",
      },
    };

    try {
      await fetch(`/api/lost-items/${lostItem?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setSuggestEditModal(false);
      setOpenSnackbar("success");
      setMessage("Edit suggestion sent!");
      refreshData();
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setLostStartDate(newStartDate);

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

      setLostEndDate(formattedDate);
    }
  };

  const handleCancel = async () => {
    setLoading(true);

    try {
      await fetch(`/api/lost-items/${lostItem?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edit: null }),
      });

      setOpenSnackbar("success");
      setMessage("Edit suggestion canceled.");
      setCancelConfirmation(false);
    } catch (error) {
      console.error(error);
      setOpenSnackbar("danger");
      setMessage("Error occured.");
    } finally {
      refreshData();
      setLoading(false);
    }
  };

  // Ensure that end date stays on the same day as the start date if it's manually changed
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setLostEndDate(newEndDate);
  };

  return (
    <>
      <Modal open={suggestEditModal} onClose={() => setSuggestEditModal(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Suggest Edits
          </Typography>
          <DialogContent
            component="form"
            onSubmit={handleSubmit}
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
            {!lostItem?.edit ||
            !lostItem?.edit?.color ||
            lostItem?.color.length === 0 ? (
              <>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <FormControl required>
                      <FormLabel>Item Name</FormLabel>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl required>
                      <FormLabel>Color</FormLabel>
                      <Select
                        multiple
                        fullWidth
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
                  </Grid>
                  <Grid item xs={12} md={4}>
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
                    <FormControl required>
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
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
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
                        {["cm", "inch", "m", "ft", "kg", "g"].map((unit) => (
                          <Option key={unit} value={unit}>
                            {unit}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl required>
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
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl required>
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
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl required>
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
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl required>
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
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        placeholder="More details about the item..."
                        required
                        minRows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Checkbox
                      sx={{ my: 2 }}
                      label="The owner knows the item's whereabouts"
                      checked={itemWhereabouts}
                      onChange={handleCheckbox}
                    />
                  </Grid>
                  {itemWhereabouts && (
                    <>
                      <Grid item xs={12}>
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
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl required>
                          <FormLabel>Lost Start Date</FormLabel>
                          <Input
                            type="datetime-local"
                            value={lostStartDate} // Use state or initial value
                            onChange={handleStartDateChange} // Handle start date change
                            required
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl required>
                          <FormLabel>Lost End Date</FormLabel>
                          <Input
                            type="datetime-local"
                            value={lostEndDate} // Use state or initial value
                            onChange={handleEndDateChange} // Handle end date change
                            required
                          />
                        </FormControl>
                      </Grid>
                    </>
                  )}
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={loading}
                  loading={loading}
                >
                  Request
                </Button>
              </>
            ) : (
              <>
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Name",
                      value: lostItem?.name,
                      suggestion: lostItem?.edit?.name,
                    },
                    {
                      label: "Color",
                      value: (lostItem?.color || []).join(", "),
                      suggestion: (lostItem?.edit?.color || []).join(", "),
                    },
                    {
                      label: "Size",
                      value: lostItem?.size,
                      suggestion: lostItem?.edit?.size,
                    },
                    {
                      label: "Category",
                      value: lostItem?.category,
                      suggestion: lostItem?.edit?.category,
                    },
                    {
                      label: "Location",
                      value: lostItem?.location,
                      suggestion: lostItem?.edit?.location,
                    },
                    {
                      label: "Material",
                      value: lostItem?.material,
                      suggestion: lostItem?.edit?.material,
                    },
                    {
                      label: "Condition",
                      value: lostItem?.condition,
                      suggestion: lostItem?.edit?.condition,
                    },
                    {
                      label: "Distinctive Marks",
                      value: lostItem?.distinctiveMarks,
                      suggestion: lostItem?.edit?.distinctiveMarks,
                    },
                    {
                      label: "Description",
                      value: lostItem?.description,
                      suggestion: lostItem?.edit?.description,
                    },
                    {
                      label: "Date",
                      value: lostItem?.date_time?.split(" to ")[0],
                      suggestion: lostItem?.edit?.date_time?.split(" to ")[0],
                    },
                    {
                      label: "Time",
                      value: lostItem?.date_time?.split(" to ")[1],
                      suggestion: lostItem?.edit?.date_time?.split(" to ")[1],
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
                          <Typography variant="subtitle2" gutterBottom>
                            {label}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {value || "-"}
                            </Typography>
                            <ArrowRightAlt />
                            <Typography
                              variant="body2"
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
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      color="danger"
                      onClick={() => setCancelConfirmation(true)}
                    >
                      Cancel Suggestion
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>
      <Modal
        open={cancelConfirmation}
        onClose={() => setCancelConfirmation(false)}
      >
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Cancel Confirmation
          </Typography>
          <Typography level="body-md">
            Do you want to cancel your edit suggestion?
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setCancelConfirmation(false)}
              disabled={loading}
              loading={loading}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              color="danger"
              onClick={() => handleCancel()}
              disabled={loading}
              loading={loading}
            >
              Confirm
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default SuggestEditLostItem;
