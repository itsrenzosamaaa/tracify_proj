import { Dropdown, MenuButton, Menu, MenuItem } from "@mui/joy";
import React, { useState } from "react";
import AddFoundItemModal from "../Modals/AddFoundItemModal";
import AddLostItemModal from "../Modals/AddLostItemModal";
import AddIcon from "@mui/icons-material/Add";

const AddItem = () => {
  const [openFoundModal, setOpenFoundModal] = useState(false);
  const [openLostModal, setOpenLostModal] = useState(false);
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
          <MenuItem onClick={() => setOpenFoundModal(true)}>
            Found Item
          </MenuItem>
          <MenuItem onClick={() => setOpenLostModal(true)}>Lost Item</MenuItem>
        </Menu>
      </Dropdown>

      <AddFoundItemModal
        open={openFoundModal}
        onClose={() => setOpenFoundModal(false)}
      />
      <AddLostItemModal
        open={openLostModal}
        onClose={() => setOpenLostModal(false)}
      />
    </>
  );
};

export default AddItem;
