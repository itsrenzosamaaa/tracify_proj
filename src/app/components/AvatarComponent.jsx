import React, { useState } from "react";
import styled from "styled-components";
import {
  Menu,
  MenuButton,
  Button,
  Avatar,
  Box,
  Typography,
  Dropdown,
  Divider,
  Snackbar,
} from "@mui/joy";
import { signOut } from "next-auth/react";
import ChangePassword from "./Modal/ChangePassword";

// Styled component for the dropdown container
const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AvatarComponent = ({ profile, session }) => {
  const [menuOpen, setMenuOpen] = useState(false); // State to manage menu visibility
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(null);

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev); // Toggle the dropdown menu
  };

  const handleMenuItemClick = () => {
    setMenuOpen(false); // Close the dropdown when an item is clicked
  };

  return (
    <>
      <DropdownContainer>
        <Dropdown>
          <MenuButton
            startDecorator={
              profile?.profile_picture ? (
                <Avatar
                  alt={`${profile?.firstname || "Student"} ${
                    profile?.lastname || ""
                  }`}
                  src={
                    profile?.profile_picture || "https://via.placeholder.com/92"
                  }
                  sx={{
                    width: { xs: 40, md: 50 },
                    height: { xs: 40, md: 50 },
                    borderRadius: "50%",
                    boxShadow: 2,
                    border: "2px solid white",
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: { xs: 35, md: 45 },
                    height: { xs: 35, md: 45 },
                  }}
                />
              )
            }
            sx={{
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Subtle hover effect
              },
            }}
            variant="solid"
            color="inherit"
            onClick={handleMenuToggle} // Toggle dropdown on click
          />
          <Menu
            open={menuOpen} // Controlled by state
            onClose={() => setMenuOpen(false)} // Close when clicked outside
            placement="bottom-end"
            sx={{
              zIndex: 1300,
              width: 300,
              maxWidth: "100%",
              backgroundColor: "white",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
              borderRadius: "8px",
              padding: 0,
              overflow: "hidden",
            }}
          >
            {/* Profile Section with Colored Background */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                backgroundColor: "#3d5afe", // Colored background
                color: "white",
                padding: 2,
              }}
            >
              {profile?.profile_picture ? (
                <Avatar
                  alt={`${profile?.firstname || "Student"} ${
                    profile?.lastname || ""
                  }`}
                  src={
                    profile?.profile_picture || "https://via.placeholder.com/92"
                  }
                  sx={{
                    width: { xs: 40, md: 50 },
                    height: { xs: 40, md: 50 },
                    borderRadius: "50%",
                    boxShadow: 2,
                    border: "2px solid white",
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: { xs: 35, md: 45 },
                    height: { xs: 35, md: 45 },
                  }}
                />
              )}
              <Typography
                level="h6"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                {`${session?.user?.firstname} ${session?.user?.lastname}` || "Unknown User"}
              </Typography>
              <Typography level="body2" sx={{ fontSize: 12, opacity: 0.8 }}>
                {session?.user?.roleName || "Guest"}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                paddingX: 2,
                paddingY: 1,
                backgroundColor: "white", // Uncolored background
              }}
            >
              <Button
                variant="outlined"
                sx={{
                  color: "#3d5afe",
                  borderColor: "#3d5afe",
                  "&:hover": {
                    backgroundColor: "rgba(61, 90, 254, 0.1)",
                    borderColor: "#3d5afe",
                  },
                }}
                onClick={() => {
                  setOpenChangePassword(true);
                  handleMenuItemClick();
                }} // Close menu on click
              >
                Change Password
              </Button>
              <Button
                variant="solid"
                sx={{
                  color: "white",
                  backgroundColor: "#3d5afe",
                  "&:hover": {
                    backgroundColor: "#304ffe",
                  },
                }}
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  handleMenuItemClick(); // Close menu after signing out
                }}
              >
                Logout
              </Button>
            </Box>
          </Menu>
        </Dropdown>
      </DropdownContainer>
      <ChangePassword
        session={session}
        setOpenSnackbar={setOpenSnackbar}
        setMessage={setMessage}
        openChangePassword={openChangePassword}
        setOpenChangePassword={setOpenChangePassword}
      />
      <Snackbar
        autoHideDuration={5000}
        open={openSnackbar}
        variant="solid"
        color={openSnackbar}
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setOpenSnackbar(null);
        }}
      >
        {message}
      </Snackbar>
    </>
  );
};

export default AvatarComponent;
