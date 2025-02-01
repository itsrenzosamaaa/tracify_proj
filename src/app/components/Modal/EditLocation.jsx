"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  FormLabel,
  Checkbox,
  FormControl,
  ModalDialog,
  ModalClose,
  DialogContent,
  Modal,
  Snackbar,
  Select,
  Option,
} from "@mui/joy";
import { FormGroup } from "@mui/material";

const EditLocation = ({
  open,
  onClose,
  refreshData,
  location,
  setMessage,
  setOpenSnackbar,
}) => {
  const [name, setName] = useState(location?.name || ""); // Default to an empty string if role or role.name is undefined
  const [rooms, setRooms] = useState(location?.areas || [""]);
  const [loading, setLoading] = useState(false); // Default to false

  const handleRoomChange = (index, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = value;
    setRooms(updatedRooms);
  };

  const handleAddRoom = () => {
    setRooms([...rooms, ""]);
  };

  const handleRemoveRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const locationData = {
      name,
      areas: rooms.filter((room) => room.trim() !== ""),
    };

    try {
      const response = await fetch(`/api/location/${location._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });
      if (response.ok) {
        onClose();
        refreshData();
        setOpenSnackbar("success");
        setMessage("Location updated successfully!");
      } else {
        const data = await response.json();
        setOpenSnackbar("danger");
        setMessage(`Failed to update location: ${data.error}`);
      }
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("An error occurred while updating the location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open === location._id} onClose={onClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Edit Location
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
              {/* Role Name Input */}
              <FormControl fullWidth sx={{ mb: 1 }}>
                <FormLabel>Location Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. RLO Building"
                />
              </FormControl>

              {rooms.map((room, index) => (
                <FormControl fullWidth sx={{ mb: 1 }} key={index}>
                  <FormLabel>Room/Area {index + 1}</FormLabel>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Input
                      type="text"
                      value={room}
                      onChange={(e) => handleRoomChange(index, e.target.value)}
                      placeholder="Enter room/area"
                    />
                    <Button
                      color="danger"
                      onClick={() => handleRemoveRoom(index)}
                    >
                      Remove
                    </Button>
                  </Box>
                </FormControl>
              ))}
              <Button
                sx={{ mb: 2 }}
                fullWidth
                color="neutral"
                onClick={handleAddRoom}
              >
                + Add Room/Area
              </Button>
              <Button
                fullWidth
                sx={{ mt: 2 }}
                type="submit"
                loading={loading}
                disabled={loading}
              >
                Update Location
              </Button>
            </form>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default EditLocation;
