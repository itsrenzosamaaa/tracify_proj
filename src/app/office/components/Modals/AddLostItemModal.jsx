"use client";

import {
  Modal,
  ModalDialog,
  ModalClose,
  Button,
  DialogTitle,
  DialogContent,
  FormControl,
  Stack,
  FormLabel,
  Input,
  Textarea,
  ModalOverflow,
} from "@mui/joy";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import React, { useState } from "react";
import dayjs from "dayjs";

const AddLostItemModal = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(dayjs());
  const [time, setTime] = useState(dayjs());
  const [owner, setOwner] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const status = "Published"; // or whatever status you want to set

    const formData = new FormData();
    formData.append("isFoundItem", false);
    formData.append("reportedByNotUser", true);
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("date", date.toISOString());
    formData.append("time", time.toISOString());
    formData.append("user", owner);
    formData.append("status", status);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("Item added successfully");
        onClose();
      } else {
        alert("Failed to add item.");
      }
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalOverflow>
          <ModalDialog>
            <ModalClose onClick={onClose} />
            <DialogTitle>Add Lost Item</DialogTitle>
            <DialogContent>Please input some details below.</DialogContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input autoFocus required value={name} onChange={(e) => setName(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-form-control-label-placement"
                    name="position"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <FormControlLabel
                      value="Electronics"
                      control={<Radio />}
                      label="Electronics"
                    />
                    <FormControlLabel
                      value="Clothing"
                      control={<Radio />}
                      label="Clothing"
                    />
                    <FormControlLabel
                      value="Accessories"
                      control={<Radio />}
                      label="Accessories"
                    />
                  </RadioGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea minRows={4} required value={description} onChange={(e) => setDescription(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Item Location</FormLabel>
                  <Input required value={location} onChange={(e) => setLocation(e.target.value)} />
                </FormControl>
                <FormControl>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack direction="row" spacing={2}>
                      <div>
                        <FormLabel>Date</FormLabel>
                        <MobileDatePicker
                          value={date}
                          onChange={(newValue) => setDate(newValue)}
                        />
                      </div>
                      <div>
                        <FormLabel>Time</FormLabel>
                        <MobileTimePicker
                          value={time}
                          onChange={(newValue) => setTime(newValue)}
                        />
                      </div>
                    </Stack>
                  </LocalizationProvider>
                </FormControl>
                <FormControl>
                  <FormLabel>Owner</FormLabel>
                  <Input required value={owner} onChange={(e) => setOwner(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Upload Image</FormLabel>
                  <Input type="file" onChange={(e) => setImage(e.target.files[0])} />
                </FormControl>
                <Button type="submit">Submit</Button>
              </Stack>
            </form>
          </ModalDialog>
        </ModalOverflow>
      </Modal>
    </>
  );
};

export default AddLostItemModal;
