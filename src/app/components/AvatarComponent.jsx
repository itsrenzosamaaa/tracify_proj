import React from "react";
import styled from "styled-components";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Dropdown from "@mui/joy/Dropdown";
import Avatar from "@mui/joy/Avatar";
import { Typography } from "@mui/joy";
import { signOut } from "next-auth/react";

// Styled component for the dropdown container
const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-right: 2rem;
`;

const AvatarComponent = ({ role }) => {
  return (
    <DropdownContainer>
      <Dropdown>
        <MenuButton
          startDecorator={<Avatar />}
          sx={{
            color: "white",
            display: "flex", // Flex display to align items in a row
            alignItems: "center", // Center items vertically
            gap: 1, // Add space between avatar and text
          }}
          variant="solid"
          color="inherit"
        >
          {/* Show the role text only on medium to large screens */}
          <Typography
            color="inherit"
            sx={{
              display: { xs: "none", sm: "none", md: "block", lg: "block" }, // Hide on small screens
            }}
          >
            {role}
          </Typography>
        </MenuButton>
        <Menu>
          <MenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            Logout
          </MenuItem>
        </Menu>
      </Dropdown>
    </DropdownContainer>
  );
};

export default AvatarComponent;
