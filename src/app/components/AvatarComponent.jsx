import React from "react";
import styled from "styled-components";
import { Menu, MenuButton, MenuItem, Avatar, Typography, Dropdown } from "@mui/joy";
import { signOut } from "next-auth/react";

// Styled component for the dropdown container
const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-right: 2rem;
`;

const AvatarComponent = ({ profile }) => {
  console.log(profile); // To check the profile object

  return (
    <DropdownContainer>
      <Dropdown>
        <MenuButton
          startDecorator={
            profile ? (
              <Avatar
                alt={`${profile.firstname} ${profile.lastname}'s Profile Picture` || 'Student'}
                src={profile.profile_picture || "https://via.placeholder.com/92"} // Fallback to a placeholder image if profile_picture is missing
                sx={{
                  width: 45,
                  height: 45,
                  borderRadius: "50%",
                  boxShadow: 2,
                }}
              />
            ) : (
              <Avatar />
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
