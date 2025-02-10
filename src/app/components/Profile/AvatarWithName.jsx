import React, { useState } from "react";
import { Paper, useTheme, useMediaQuery } from "@mui/material";
import {
  Avatar,
  Box,
  Typography,
  Menu,
  MenuItem,
  MenuButton,
  Dropdown,
  ModalDialog,
  Modal,
  ModalClose,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormHelperText,
} from "@mui/joy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChangeProfilePicture from "../Modal/ChangeProfilePicture";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import ChangeContactNumber from "../Modal/ChangeContactNumber";
import PreviewBadge from "../PreviewBadge";

const AvatarWithName = ({
  profile,
  session,
  refreshData,
  setOpenSnackbar,
  setMessage,
  update,
}) => {
  const [image, setImage] = useState(profile.profile_picture || null);
  const [openModal, setOpenModal] = useState(false);
  const [openUsernameModal, setOpenUsernameModal] = useState(false);
  const [openBirthdayModal, setOpenBirthdayModal] = useState(false);
  const [birthday, setBirthday] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch(`/api/users/${session?.user?.id}/birthday`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ birthday }),
      });

      setOpenBirthdayModal(false);
      setBirthday(false);
      refreshData();
      setOpenSnackbar("success");
      setMessage("Birthday saved successfully!");
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage("Failed to save birthday.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          borderTop: "3px solid #3f51b5",
          padding: "1rem",
          marginX: isMd ? 0 : "13rem",
          display: "flex",
          gap: { xs: 2, md: 0 },
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Box sx={{ position: "relative", display: "inline-block" }}>
          {image ? (
            <Avatar
              alt={`${profile.firstname} ${profile.lastname}'s Profile Picture`}
              src={profile.profile_picture}
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                boxShadow: 2,
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 100,
                height: 100,
                marginBottom: "1rem",
                backgroundColor: "primary.light",
              }}
            >
              <Typography level="h2">
                {profile.firstname?.charAt(0).toUpperCase() || "U"}
              </Typography>
            </Avatar>
          )}
          {/* Pencil Icon */}
          <Box
            sx={{
              position: "absolute",
              bottom: 7,
              right: 7,
              backgroundColor: "#f5f5f5",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: 1,
              cursor: "pointer",
              border: "2px solid white",
            }}
            onClick={() => {
              setOpenModal(true);
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography level="body-lg" fontWeight="500">
            {profile.firstname} {profile.lastname}
          </Typography>
          <PreviewBadge
            resolvedItemCount={profile?.resolvedItemCount}
            shareCount={profile?.shareCount}
            birthday={profile?.birthday}
            inherit={true}
          />
          <Typography level="body-sm" fontWeight="400">
            {profile.role.name}
          </Typography>
        </Box>
        <Box
          sx={{
            width: "100%",
            mt: 3,
            textAlign: isMd ? "left" : "",
          }}
        >
          {[
            { label: "Username", value: profile.username },
            { label: "Contact Number", value: profile.contactNumber },
            { label: "Email Address", value: profile.emailAddress },
            { label: "Birthday", value: profile.birthday },
          ].map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                mb: { xs: 2, md: 1 },
                gap: { xs: 0.5, md: 0 }, // Ensures spacing between label and value
              }}
            >
              <Typography
                level="body-md"
                fontWeight="700"
                sx={{
                  flexShrink: 0, // Ensures labels don't squish in tight spaces
                  textAlign: { xs: "left", md: "left" }, // Aligns labels properly
                  width: { md: "30%" }, // Consistent label width on larger screens
                }}
              >
                {item.label}{" "}
                {(item.label === "Contact Number" ||
                  (item.label === "Birthday" && profile.birthday === null)) && (
                  <EditIcon
                    sx={{ fontSize: 16, cursor: "pointer" }}
                    onClick={() => {
                      if (item.label === "Contact Number")
                        setOpenUsernameModal(true);
                      if (item.label === "Birthday") setOpenBirthdayModal(true);
                    }}
                  />
                )}
              </Typography>
              <Typography
                sx={{
                  textAlign: { xs: "left", md: "right" }, // Keeps values aligned to the left
                  wordBreak: "break-word", // Prevents overflow for long text
                  width: { md: "70%" }, // Consistent value width on larger screens
                }}
              >
                {item.label === "Birthday" ? (
                  profile.birthday !== null ? (
                    dayjs(profile.birthday).format("MMMM DD, YYYY")
                  ) : (
                    <Typography>Not assigned</Typography>
                  )
                ) : (
                  item.value
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
      <Modal
        open={openBirthdayModal}
        onClose={() => setOpenBirthdayModal(false)}
      >
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" gutterBottom>
            Set Birthday
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>Birthday</FormLabel>
              <Input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                slotProps={{
                  input: {
                    max: dayjs().format("YYYY-MM-DD"), // Formats to "YYYY-MM-DD" for compatibility
                  },
                }}
              />

              <FormHelperText>
                You can only set your birthday once!
              </FormHelperText>
            </FormControl>
            <Button
              sx={{ mt: 2 }}
              type="submit"
              disabled={!birthday || loading}
              loading={loading}
              fullWidth
            >
              Save
            </Button>
          </form>
        </ModalDialog>
      </Modal>
      <ChangeProfilePicture
        loading={loading}
        setImage={setImage}
        setLoading={setLoading}
        refreshData={refreshData}
        session={session}
        setOpenSnackbar={setOpenSnackbar}
        setMessage={setMessage}
        setOpenModal={setOpenModal}
        openModal={openModal}
        update={update}
      />
      <ChangeContactNumber
        session={session}
        profile={profile}
        openUsernameModal={openUsernameModal}
        setOpenUsernameModal={setOpenUsernameModal}
        refreshData={refreshData}
        setOpenSnackbar={setOpenSnackbar}
        setMessage={setMessage}
      />
    </>
  );
};

export default AvatarWithName;
