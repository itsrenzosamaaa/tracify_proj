import React from "react";
import styled from "styled-components";
import { Menu, MenuButton, MenuItem, Avatar, Typography, Dropdown } from "@mui/joy";
import { signOut } from "next-auth/react";

// Styled component for the dropdown container
const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AvatarComponent = ({ profile }) => {
  return (
    <DropdownContainer>
      <Dropdown>
        <MenuButton
          startDecorator={
            profile?.profile_picture ? (
              <Avatar
                alt={`${profile.firstname} ${profile.lastname}'s Profile Picture` || 'Student'}
                src={profile.profile_picture || "https://via.placeholder.com/92"} // Fallback to a placeholder image if profile_picture is missing
                sx={{
                  width: { xs: 35, md: 45 },
                  height: { xs: 35, md: 45 },
                  borderRadius: "50%",
                  boxShadow: 2,
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
            display: "flex", // Flex display to align items in a row
            alignItems: "center", // Center items vertically
            gap: 1, // Add space between avatar and text
          }}
          variant="solid"
          color="inherit"
        />
        <Menu
          placement="bottom-end"
          sx={{
            zIndex: 1300, // Ensure menu is above other components
          }}
        >
          <MenuItem
            onClick={() => {
              signOut({ callbackUrl: "/" });
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Dropdown>
    </DropdownContainer>
  );
};

export default AvatarComponent;
