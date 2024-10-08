import React, { useState } from "react";
import {
  Modal,
  ModalClose,
  Typography,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Table,
  Box,
  IconButton,
} from "@mui/joy";
import CategoryIcon from "@mui/icons-material/Category";
import Grid3x3Icon from "@mui/icons-material/Grid3x3";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CldImage } from "next-cloudinary";
import dayjs from "dayjs";

const MoreDetailsModal = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        sx={{
          display: { xs: "none", sm: "block" }, // Hide on xs, show on sm and up
          fontSize: "0.8rem",
        }}
        onClick={() => setOpen(true)}
      >
        More Details
      </Button>
      <IconButton
        sx={{
          display: { xs: "block", sm: "none" }, // Show on xs, hide on sm and up
          fontSize: "1.5rem",
        }}
        onClick={() => setOpen(true)}
      >
        <MoreVertIcon />
      </IconButton>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <ModalDialog sx={{ maxWidth: "300px", width: "100%" }}>
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <DialogTitle id="modal-title">Modal Dialog</DialogTitle>
          <DialogContent sx={{ padding: 0 }}>
            <Tabs
              variant="outlined"
              aria-label="Basic tabs"
              defaultValue={0}
              sx={{ marginY: "1rem" }}
            >
              <TabList>
                <Tab>Details</Tab>
                <Tab>Records</Tab>
                <Tab>Image</Tab>
              </TabList>
              <TabPanel value={0}>
                <Table
                  size="sm"
                  sx={{
                    width: "100%",
                    tableLayout: "fixed",
                    "& td, & th": {
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.875rem",
                      wordWrap: "break-word",
                      wordBreak: "break-all",
                    },
                    "& td:nth-of-type(1)": {
                      width: "20%",
                      borderRight: "1px solid #e0e0e0",
                    },
                    "& td:nth-of-type(2)": {
                      width: "80%",
                      paddingLeft: "1rem",
                    },
                    "& tr": {
                      borderBottom: "1px solid #e0e0e0",
                    },
                  }}
                >
                  <tr>
                    <td>
                      <abbr title="ID">
                        <Grid3x3Icon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{item.itemId}</td>
                  </tr>
                  <tr>
                    <td>
                      <abbr title="Item">
                        <InventoryIcon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{item.name}</td>
                  </tr>
                  <tr>
                    <td>
                      <abbr title="Category">
                        <CategoryIcon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{item.category}</td>
                  </tr>
                  <tr>
                    <td>
                      <abbr
                        title={item.isFoundItem ? "Found Location" : "Lost Location"}
                      >
                        <LocationOnIcon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{item.location}</td>
                  </tr>
                  <tr>
                    <td>
                      <abbr title={item.isFoundItem ? "Found Date" : "Lost Date"}>
                        <CalendarMonthIcon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{dayjs(item.date).format('MMMM D, YYYY')}</td>
                  </tr>
                  <tr>
                    <td> 
                      <abbr title={item.isFoundItem ? "Found Time" : "Lost Time"}>
                        <AccessTimeIcon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{item.time}</td>
                  </tr>
                </Table>
              </TabPanel>
              <TabPanel value={1}>
                <Typography>
                  <b>Second</b> tab panel
                </Typography>
              </TabPanel>
              <TabPanel value={2}>
                <CldImage
                  src={item.image}
                  alt={item.name}
                  width={0}
                  height={0}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ width: '100%', height: 'auto', objectFit: 'cover', marginBottom: '1rem' }}
                />
              </TabPanel>
            </Tabs>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.status === "Validating" ? (
                <>
                  <Button
                    sx={{ width: "100%", fontSize: "0.8rem" }}
                    color="danger"
                  >
                    Back to Request
                  </Button>
                  <Button sx={{ width: "100%" }}>Published</Button>
                </>
              ) : item.status === "Published" ? (
                <>
                  {
                    !item.officerId ?
                      <Button sx={{ width: "100%" }} color="danger">
                        Validating
                      </Button> : <Button sx={{ width: "100%" }} color="danger">
                        Invalid
                      </Button>
                  }
                  <Button sx={{ width: "100%" }}>Reserved</Button>
                </>
              ) : item.status === "Reserved" ? (
                <>
                  <Button sx={{ width: "100%" }} color="danger">
                    Published
                  </Button>
                  <Button sx={{ width: "100%" }}>Released</Button>
                </>
              ) : null}
            </Box>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default MoreDetailsModal;
