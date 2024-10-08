import { Dropdown, MenuButton, Menu, MenuItem } from "@mui/joy";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";

const AddItem = () => {
  const router = useRouter();
  return (
    <>
      <Dropdown>
        <MenuButton
          startDecorator={<AddIcon />}
          variant="solid"
          color="primary"
        >
          Add Item
        </MenuButton>
        <Menu>
          <MenuItem onClick={() => router.push('items/add_found_item')}>
            Found Item
          </MenuItem>
          <MenuItem onClick={() => router.push('items/add_lost_item')}>Lost Item</MenuItem>
        </Menu>
      </Dropdown>
    </>
  );
};

export default AddItem;
