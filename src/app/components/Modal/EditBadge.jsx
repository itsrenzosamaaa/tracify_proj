import React, { useState, useEffect } from "react";
import {
  Snackbar,
  Checkbox,
  Modal,
  ModalDialog,
  ModalClose,
  DialogContent,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Box,
  Select,
  Option,
  Grid,
} from "@mui/joy";
import PreviewBadge from "../PreviewBadge";

const EditBadgeModal = ({ open, onClose, refreshData, badge, setOpenSnackbar, setMessage }) => {
  const [title, setTitle] = useState(badge.title);
  const [titleShimmer, setTitleShimmer] = useState(badge.titleShimmer);
  const [shape, setShape] = useState(badge.shape);
  const [shapeColor, setShapeColor] = useState(badge.shapeColor);
  const [bgShape, setBgShape] = useState(badge.bgShape);
  const [bgColor, setBgColor] = useState(badge.bgColor);
  const [bgOutline, setBgOutline] = useState(badge.bgOutline);
  const [condition, setCondition] = useState(badge.condition);
  const [meetConditions, setMeetConditions] = useState(badge.meetConditions);
  const [loading, setLoading] = useState(false);

  console.log(badge)

  useEffect(() => {
    if (badge) {
      setTitle(badge.title);
      setTitleShimmer(badge.titleShimmer);
      setShape(badge.shape);
      setShapeColor(badge.shapeColor);
      setBgShape(badge.bgShape);
      setBgColor(badge.bgColor);
      setBgOutline(badge.bgOutline);
      setCondition(badge.condition);
      setMeetConditions(badge.meetConditions);
    }
  }, [badge, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (meetConditions <= 0) {
      setOpenSnackbar("danger");
      setMessage("The meet conditions should not lower than 0.");
      setLoading(false);
      return;
    }

    const badgeFormData = {
      title,
      titleShimmer,
      shape,
      shapeColor,
      bgShape,
      bgColor,
      bgOutline,
      condition,
      meetConditions,
    };

    try {
      const response = await fetch(`/api/badge/${badge._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(badgeFormData),
      });

      if (response.ok) {
        await refreshData();
        onClose();
        setOpenSnackbar("success");
        setMessage("Badge updated successfully!");
      } else {
        const data = await response.json();
        setOpenSnackbar("danger");
        setMessage(data.error);
      }
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" gutterBottom sx={{ mb: 3 }}>
            Edit Badge
          </Typography>
          <DialogContent
            sx={{
              overflowX: "hidden",
              overflowY: "auto", // Allows vertical scrolling
              "&::-webkit-scrollbar": { display: "none" }, // Hides scrollbar in WebKit-based browsers (Chrome, Edge, Safari)
              "-ms-overflow-style": "none", // Hides scrollbar in IE and Edge
              "scrollbar-width": "none", // Hides scrollbar in Firefox
            }}
          >
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* Badge Title */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <FormLabel>Badge Title</FormLabel>
                    <Input
                      name="name"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </FormControl>
                </Grid>

                {/* Shape and Shape Color */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <FormLabel>Shape</FormLabel>
                    <Select
                      value={shape}
                      onChange={(e, value) => setShape(value)}
                    >
                      <Option value="circle">Circle</Option>
                      <Option value="square">Square</Option>
                      <Option value="star">Star</Option>
                      <Option value="triangle">Triangle</Option>
                      <Option value="hexagon">Hexagon</Option>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <FormLabel>Shape Color</FormLabel>
                    <Input
                      type="color"
                      value={shapeColor}
                      onChange={(e) => setShapeColor(e.target.value)}
                    />
                  </FormControl>
                </Grid>

                {/* Background Shape, Color, and Outline */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <FormLabel>BG Shape</FormLabel>
                    <Select
                      value={bgShape}
                      onChange={(e, value) => setBgShape(value)}
                    >
                      <Option value="circle">Circle</Option>
                      <Option value="square">Square</Option>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControl fullWidth>
                    <FormLabel>BG Color</FormLabel>
                    <Input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControl fullWidth>
                    <FormLabel>BG Outline Color</FormLabel>
                    <Input
                      type="color"
                      value={bgOutline}
                      onChange={(e) => setBgOutline(e.target.value)}
                    />
                  </FormControl>
                </Grid>

                {/* Condition and Meet Conditions */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <FormLabel>Condition</FormLabel>
                    <Select
                      value={condition}
                      onChange={(e, value) => setCondition(value)}
                      required
                    >
                      <Option value="Found Item/s">No. of Found Items</Option>
                      <Option value="Rating/s">No. of Ratings</Option>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <FormLabel>Meet Conditions</FormLabel>
                    <Input
                      type="number"
                      value={meetConditions}
                      onChange={(e) => {
                        // Allow only numeric values
                        const value = e.target.value.replace(/\D/g, ""); // Remove all non-numeric characters
                        setMeetConditions(value);
                      }}
                      onKeyDown={(e) => {
                        // Prevent invalid key presses
                        if (
                          ["e", "E", ".", "-", "+"].includes(e.key) || // Disallow specific characters
                          (!/^\d$/.test(e.key) &&
                            e.key !== "Backspace" &&
                            e.key !== "Delete" &&
                            e.key !== "ArrowLeft" &&
                            e.key !== "ArrowRight") // Allow only digits, Backspace, Delete, and arrow keys
                        ) {
                          e.preventDefault();
                        }
                      }}
                      required
                    />
                  </FormControl>
                </Grid>

                {/* Shimmer Effect */}
                <Grid item xs={12}>
                  <FormControl>
                    <Checkbox
                      label="Add a shimmering effect?"
                      checked={titleShimmer}
                      onChange={(e) => setTitleShimmer(e.target.checked)}
                    />
                  </FormControl>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    loading={loading}
                    disabled={loading}
                    type="submit"
                    fullWidth
                  >
                    Update Badge
                  </Button>
                </Grid>

                {/* Preview Section */}
                <Grid item xs={12}>
                  <Typography level="h4" textAlign="center" gutterBottom>
                    Preview
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "150px",
                        height: "150px",
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PreviewBadge
                        title={title}
                        titleShimmer={titleShimmer}
                        shape={shape}
                        shapeColor={shapeColor}
                        bgShape={bgShape}
                        bgColor={bgColor}
                        bgOutline={bgOutline}
                        condition={condition}
                        meetConditions={meetConditions}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default EditBadgeModal;
