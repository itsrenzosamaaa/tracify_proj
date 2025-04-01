import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Box,
  DialogContent,
  Button,
  Typography,
  FormLabel,
} from "@mui/joy";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";

const ChangeProfilePicture = ({
  setImage,
  setLoading,
  refreshData,
  session,
  setOpenSnackbar,
  setOpenModal,
  openModal,
  loading,
  setMessage,
  update
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState(null);
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];

    const validMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    const validExtensions = ["jpg", "jpeg", "png", "gif"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      alert("Invalid file extension.");
      return;
    }

    // Validate MIME type
    if (!file) {
      alert("No file provided.");
      return;
    }

    if (!validMimeTypes.includes(file.type)) {
      alert(
        `Invalid file type: ${file.type}. Only JPEG, PNG, and GIF are allowed.`
      );
      return;
    }

    // Check file size
    if (file.size > 2 * 1024 * 1024) {
      alert("File size should not exceed 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/gif": [],
    },
    multiple: false,
  });

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCropArea(croppedAreaPixels);
  }, []);

  const getCroppedImage = async () => {
    const imageElement = new Image();
    imageElement.src = previewImage;

    await new Promise((resolve) => {
      imageElement.onload = resolve; // Ensure image is fully loaded before proceeding
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const { width, height, x, y } = cropArea;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
      imageElement,
      x,
      y,
      width,
      height, // Source rectangle
      0,
      0,
      width,
      height // Destination rectangle
    );

    return canvas.toDataURL("image/jpeg", 1.0); // Return the base64 data URL
  };

  const handleSavePicture = async () => {
    setLoading(true);
    try {
      const croppedDataUrl = await getCroppedImage();

      const response = await fetch(
        `/api/users/${session.user.id}/profile-picture`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profile_picture: croppedDataUrl }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setImage(data.profile_picture); // Update the displayed image
        await refreshData(session.user.id);
        await update({
          ...session,
          user: {
            ...session.user,
            profile_picture: data.profile_picture,
          },
        });
        setOpenModal(false);
        setPreviewImage(null);    
        setOpenSnackbar("success");
        setMessage("Profile picture updated successfully!");
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData.error);
        setOpenSnackbar("danger");
        setMessage("Failed to upload profile picture. Please try again.");
      }
    } catch (error) {
      console.error("Error during save:", error);
      setOpenSnackbar("danger");
      setMessage("Failed to upload profile picture. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog>
          <ModalClose />
          <Box sx={{ mb: 2 }}>
            <FormLabel>Upload and Crop Profile Picture</FormLabel>
          </Box>
          <DialogContent
            sx={{
              overflowX: "hidden",
              overflowY: "auto", // Allows vertical scrolling
              "&::-webkit-scrollbar": { display: "none" }, // Hides scrollbar in WebKit-based browsers (Chrome, Edge, Safari)
              "-ms-overflow-style": "none", // Hides scrollbar in IE and Edge
              "scrollbar-width": "none", // Hides scrollbar in Firefox
            }}
          >
            {previewImage ? (
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 300,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* Cropper Component */}
                <Box
                  sx={{ position: "relative", flex: 1, height: "100%", mb: 2 }}
                >
                  <Cropper
                    image={previewImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // Square aspect ratio
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                  />
                </Box>

                {/* Button Container */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Button
                    onClick={handleSavePicture}
                    disabled={loading}
                    color="primary"
                  >
                    {loading ? "Saving..." : "Save Picture"}
                  </Button>
                  <Button onClick={() => setPreviewImage(null)} color="danger" disabled={loading} loading={loading}>
                    Discard
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                {...getRootProps({ className: "dropzone" })}
                sx={{
                  border: "2px dashed #888",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                  backgroundColor: "#f9f9f9",
                  cursor: "pointer",
                }}
              >
                <input
                  {...getInputProps()}
                  aria-label="Upload profile picture"
                />
                <Typography>
                  Drag and drop a file, or click to select
                </Typography>
              </Box>
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default ChangeProfilePicture;
