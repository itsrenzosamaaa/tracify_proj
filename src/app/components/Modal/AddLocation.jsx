"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  FormLabel,
  FormControl,
  ModalDialog,
  ModalClose,
  DialogContent,
  Modal,
} from "@mui/joy";

const AddLocation = ({
  open,
  onClose,
  refreshData,
  setOpenSnackbar,
  setMessage,
}) => {
  const [name, setName] = useState("");
  const [rooms, setRooms] = useState([""]);
  const [loading, setLoading] = useState(false);

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
      const response = await fetch("/api/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });
      if (response.ok) {
        onClose();
        await refreshData();
        setOpenSnackbar("success");
        setMessage("Location added successfully!");
        setName("");
        setRooms([""]);
      } else {
        const data = await response.json();
        setOpenSnackbar("danger");
        setMessage(`Failed to add location: ${data.error}`);
      }
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("An error occurred while adding the location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2 }}>
          Add Location
        </Typography>
        <DialogContent
          sx={{
            overflowX: "hidden",
            overflowY: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
          }}
        >
          <form onSubmit={handleSubmit}>
            <FormControl required fullWidth sx={{ mb: 2 }}>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="e.g. RLO Building"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              Add Location
            </Button>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default AddLocation;
