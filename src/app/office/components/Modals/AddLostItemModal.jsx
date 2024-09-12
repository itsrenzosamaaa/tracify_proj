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
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import React, { useState } from "react";

const AddLostItemModal = ({ open, onClose }) => {
  const [category, setCategory] = useState("");

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalOverflow>
          <ModalDialog>
            <ModalClose onClick={onClose} />
            <DialogTitle>Add Lost Item</DialogTitle>
            <DialogContent>Please input some details below.</DialogContent>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input autoFocus required />
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-form-control-label-placement"
                  name="position"
                  value={category}
                >
                  <FormControlLabel
                    onClick={() => setCategory("Electronics")}
                    value="Electronics"
                    control={<Radio />}
                    label="Electronics"
                  />
                  <FormControlLabel
                    onClick={() => setCategory("Clothing")}
                    value="Clothing"
                    control={<Radio />}
                    label="Clothing"
                  />
                  <FormControlLabel
                    onClick={() => setCategory("Accessories")}
                    value="Accessories"
                    control={<Radio />}
                    label="Accessories"
                  />
                </RadioGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea minRows={4} required />
              </FormControl>
              <FormControl>
                <FormLabel>Item Location</FormLabel>
                <Input required />
              </FormControl>
              <FormControl>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer
                    components={["MobileDatePicker", "MobileTimePicker"]}
                  >
                    <DemoItem>
                      <FormLabel>Date</FormLabel>
                      <MobileDatePicker />
                    </DemoItem>
                    <DemoItem>
                      <FormLabel>Time</FormLabel>
                      <MobileTimePicker />
                    </DemoItem>
                  </DemoContainer>
                </LocalizationProvider>
              </FormControl>
              <FormControl>
                <FormLabel>Owner</FormLabel>
                <Input required />
              </FormControl>
              <FormControl>
                <FormLabel>Upload Image</FormLabel>
                <Input type="file" />
              </FormControl>
              <Button type="submit">Submit</Button>
            </Stack>
          </ModalDialog>
        </ModalOverflow>
      </Modal>
    </>
  );
};

export default AddLostItemModal;
