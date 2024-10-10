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
  IconButton,
  ButtonGroup,
  Chip,
  Stepper,
  Step,
  StepIndicator,
  Stack
} from "@mui/joy";
import CategoryIcon from "@mui/icons-material/Category";
import Grid3x3Icon from "@mui/icons-material/Grid3x3";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import dayjs from "dayjs";
import { CldImage } from "next-cloudinary";

const RequestDetailsModal = ({ row }) => {
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
          <DialogTitle id="modal-title">Request Item Details</DialogTitle>
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
              <TabPanel value={0} sx={{ height: '300px' }}>
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
                    <td>{row.itemId}</td>
                  </tr>
                  <tr>
                    <td>
                      <abbr title="Item">
                        <InventoryIcon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{row.name}</td>
                  </tr>
                  <tr>
                    <td>
                      <abbr title="Category">
                        <CategoryIcon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{row.category}</td>
                  </tr>
                  <tr>
                    <td>
                      <abbr title={row.isFoundItem ? "Found Location" : "Lost Location"}>
                        <LocationOnIcon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{row.location}</td>
                  </tr>
                  <tr>
                    <td>
                      <abbr title={row.isFoundItem ? "Found Date" : "Lost Date"}>
                        <CalendarMonthIcon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{dayjs(row.date).format('MMMM D, YYYY')}</td>
                  </tr>
                  <tr>
                    <td>
                      <abbr title={row.isFoundItem ? "Found Time" : "Lost Time"}>
                        <AccessTimeIcon fontSize="small" />
                      </abbr>
                    </td>
                    <td>{row.time}</td>
                  </tr>
                </Table>
              </TabPanel>
              <TabPanel value={1} sx={{ height: '300px' }}>
                <Stepper orientation="vertical">
                  <Step
                    indicator={
                      <StepIndicator variant="solid" color="primary">
                        1
                      </StepIndicator>
                    }
                  >
                    <Typography>Billing Address</Typography>

                    <Stack spacing={1}>
                      <Typography level="body-sm">
                        Ron Swanson <br />
                        14 Lakeshore Drive <br />
                        Pawnee, IN 12345 <br />
                        United States <br />
                        T: 555-555-5555
                      </Typography>
                      <ButtonGroup variant="plain" spacing={1}>
                        <Chip
                          color="primary"
                          variant="solid"
                          onClick={() => {
                            // do something...
                          }}
                        >
                          Next
                        </Chip>
                        <Chip
                          color="neutral"
                          variant="outlined"
                          onClick={() => {
                            // do something...
                          }}
                        >
                          Edit
                        </Chip>
                      </ButtonGroup>
                    </Stack>
                  </Step>
                  <Step indicator={<StepIndicator>2</StepIndicator>}>
                    <div>
                      <Typography level="title-sm">Shipping Address</Typography>
                      <Typography level="body-xs">Pending</Typography>
                    </div>
                  </Step>
                  <Step indicator={<StepIndicator>3</StepIndicator>}>
                    <div>
                      <Typography level="title-sm">Shipping Method</Typography>
                      <Typography level="body-xs">Pending</Typography>
                    </div>
                  </Step>
                </Stepper>
              </TabPanel>
              <TabPanel value={2} sx={{ height: '300px' }}>
                <CldImage
                  src={row.image}
                  alt={row.name}
                  width={0}
                  height={0}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ width: '100%', height: 'auto', objectFit: 'cover', marginBottom: '1rem' }}
                />
              </TabPanel>
            </Tabs>
            <Button>Approve</Button>
            <Button color="danger">Reject</Button>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default RequestDetailsModal;
