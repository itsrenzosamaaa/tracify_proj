import React, { useEffect, useMemo, useState } from "react";
import {
  Paper,
  useTheme,
  useMediaQuery,
  keyframes,
  styled,
} from "@mui/material";
import {
  Avatar,
  Box,
  Typography,
  ModalDialog,
  Modal,
  ModalClose,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormHelperText,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import ReactConfetti from "react-confetti";
import PreviewBadge from "../PreviewBadge";
import ChangeProfilePicture from "../Modal/ChangeProfilePicture";
import ChangeContactNumber from "../Modal/ChangeContactNumber";

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 10px #FFD700;
  }
  50% {
    box-shadow: 0 0 30px #FFD700;
  }
  100% {
    box-shadow: 0 0 10px #FFD700;
  }
`;

const HighlightAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  borderRadius: "50%",
  boxShadow: `0 0 10px 4px #FFD700`,
  animation: `${pulseGlow} 2s infinite ease-in-out`,
  zIndex: 2,
}));

const AvatarWithName = ({
  profile,
  session,
  refreshData,
  setOpenSnackbar,
  setMessage,
  update,
}) => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  const [image, setImage] = useState(profile.profile_picture || null);
  const [openModal, setOpenModal] = useState(false);
  const [openUsernameModal, setOpenUsernameModal] = useState(false);
  const [openBirthdayModal, setOpenBirthdayModal] = useState(false);
  const [birthday, setBirthday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const isBirthdayToday = useMemo(() => {
    return (
      profile?.birthday &&
      dayjs(profile.birthday).format("MM-DD") === dayjs().format("MM-DD")
    );
  }, [profile?.birthday]);

  const isMilestone =
    (profile?.resolvedItemCount || 0) >= 20 && (profile?.shareCount || 0) >= 20;

  useEffect(() => {
    if (isBirthdayToday) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isBirthdayToday]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch(`/api/users/${session?.user?.id}/birthday`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthday }),
      });

      setOpenBirthdayModal(false);
      setBirthday(null);
      refreshData(session?.user?.id);
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
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        {showConfetti && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 300,
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <ReactConfetti
              width={600}
              height={300}
              numberOfPieces={200}
              recycle={false}
              gravity={0.3}
            />
          </Box>
        )}

        {/* Avatar */}
        <Box sx={{ position: "relative", display: "inline-block" }}>
          {image ? (
            isMilestone ? (
              <HighlightAvatar src={image} alt="Profile" />
            ) : (
              <Avatar
                src={image}
                alt="Profile"
                sx={{
                  width: 100,
                  height: 100,
                  zIndex: 2,
                  border: "3px solid black",
                }}
              />
            )
          ) : (
            <Avatar
              sx={{
                width: 100,
                height: 100,
                backgroundColor: "primary.light",
              }}
            >
              <Typography level="h2">
                {profile.firstname?.charAt(0).toUpperCase() || "U"}
              </Typography>
            </Avatar>
          )}

          {/* Edit Icon */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
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
              zIndex: 3,
            }}
            onClick={() => setOpenModal(true)}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* User Info */}
        <Box
          sx={{
            textAlign: "center",
            display: "flex",
            alignItem: "center",
            flexDirection: "column",
            justifyContent: "center",
            mt: 1,
          }}
        >
          <Typography level="body-lg" fontWeight="500">
            {profile.firstname} {profile.lastname}
          </Typography>

          <PreviewBadge
            resolvedItemCount={profile?.resolvedItemCount || 0}
            shareCount={profile?.shareCount || 0}
            birthday={profile?.birthday}
            inherit
          />

          <Typography level="body-sm" fontWeight="400">
            {profile.role.name}
          </Typography>
        </Box>

        {/* Fields */}
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

      {/* Modals */}
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
                    max: dayjs().format("YYYY-MM-DD"),
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

      {/* Profile & Contact Change Modals */}
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
