import { Dropdown, MenuButton, Menu, MenuItem } from "@mui/joy";
import React from "react";
import AddFoundItemModal from "../Modals/AddFoundItemModal";
import AddLostItemModal from "../Modals/AddLostItemModal";
import AddIcon from "@mui/icons-material/Add";

const AddItem = ({ onAddItem }) => {
  const [openFoundModal, setOpenFoundModal] = React.useState(false);
  const [openLostModal, setOpenLostModal] = React.useState(false);

  const handleCloseFoundModal = () => {
    setOpenFoundModal(false);
    onAddItem(); // Refresh items after closing the modal
  };

  const handleCloseLostModal = () => {
    setOpenLostModal(false);
    onAddItem(); // Refresh items after closing the modal
  };

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
        onClose={handleCloseFoundModal}
      />
      <AddLostItemModal
        open={openLostModal}
        onClose={handleCloseLostModal}
      />
    </>
  );
};

export default AddItem;
