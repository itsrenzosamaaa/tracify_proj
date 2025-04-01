import React, { useState } from "react";
import {
  Grid,
  Box,
  FormControl,
  FormLabel,
  Chip,
  RadioGroup,
  Radio,
  Button,
  Select,
  Option,
  Input,
  Snackbar,
  IconButton,
  Typography,
} from "@mui/joy";
import { Paper, Badge, useMediaQuery, CircularProgress } from "@mui/material";
import ItemsTable from "./Table/ItemsTable";
import AddIcon from "@mui/icons-material/Add";
import PublishFoundItem from "./Modal/PublishFoundItem";
import TitleBreadcrumbs from "./Title/TitleBreadcrumbs";
import { Refresh, Search } from "@mui/icons-material";

const FoundItemsList = ({
  finders,
  fetchItems,
  session,
  locationOptions,
  isFetchingItems,
}) => {
  const [status, setStatus] = useState("Published");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Track search input
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Tracks current page
  const isMobile = useMediaQuery("(max-width:600px)");

  // Define status options
  const statusOptions = ["Published", "Request", "Declined", "Canceled"]; // Group 'Request' and 'Surrender Pending'
  const requestStatuses = ["Request", "Surrender Pending"];

  // Count how many items have each status
  const statusCounts = statusOptions.reduce((acc, currentStatus) => {
    if (currentStatus === "Request") {
      acc["Request"] = finders.filter((finder) =>
        requestStatuses.includes(finder.item.status)
      ).length;
    } else {
      acc[currentStatus] = finders.filter(
        (finder) => finder.item.status === currentStatus
      ).length;
    }
    return acc;
  }, {});

  // Filter items based on selected status and search query
  const filteredItems = finders.filter((finder) => {
    const matchesStatus =
      status === "Request"
        ? requestStatuses.includes(finder.item.status)
        : finder.item.status === status;

    // Search across multiple fields (name, description, category, location, etc.)
    const matchesSearch =
      finder.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finder.user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finder.user.lastname.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Render chips for status selection
  const StatusChip = ({ name, count, isChecked }) => (
    <Badge badgeContent={count} color="error" key={name}>
      <Chip
        variant="plain"
        color={isChecked ? "primary" : "neutral"}
        onClick={() => {
          setStatus(name);
          setCurrentPage(1);
        }}
        sx={{ cursor: "pointer" }}
      >
        <Radio
          variant="outlined"
          color={isChecked ? "primary" : "neutral"}
          disableIcon
          overlay
          label={name}
          value={name}
          checked={isChecked}
          onChange={() => {
            setStatus(name);
          }}
        />
      </Chip>
    </Badge>
  );

  return (
    <>
      <TitleBreadcrumbs title="List of Found Items" text="Found Items" />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper
            elevation={2}
            sx={{ padding: "1rem", borderTop: "3px solid #3f51b5" }}
          >
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <FormControl>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FormLabel sx={{ mb: 0 }}>Filter by Status</FormLabel>
                  <IconButton
                    size="small"
                    onClick={() => fetchItems()}
                    sx={{ p: 0.5, mt: "-2px" }} // Optional vertical tweak
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ mt: 1 }}>
                  {isMobile ? (
                    <Select
                      value={status}
                      onChange={(e, newValue) => setStatus(newValue)}
                      size="sm"
                    >
                      {statusOptions.map((name) => (
                        <Option key={name} value={name}>
                          {name} ({statusCounts[name] || 0})
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <RadioGroup
                      name="status-selection"
                      aria-labelledby="status-selection"
                      orientation="horizontal"
                      sx={{ display: "flex", gap: 1 }}
                    >
                      {statusOptions.map((name) => {
                        const isChecked = status === name;
                        const itemCount = statusCounts[name];
                        return itemCount > 0 ? (
                          <StatusChip
                            key={name}
                            name={name}
                            count={itemCount}
                            isChecked={isChecked}
                          />
                        ) : (
                          <StatusChip
                            key={name}
                            name={name}
                            count={0}
                            isChecked={isChecked}
                          />
                        );
                      })}
                    </RadioGroup>
                  )}
                </Box>
              </FormControl>
              <Button
                size="small"
                startDecorator={<AddIcon />}
                onClick={() => setOpen(true)}
              >
                Post Found Item
              </Button>
              <PublishFoundItem
                open={open}
                onClose={() => setOpen(false)}
                fetchItems={fetchItems}
                setOpenSnackbar={setOpenSnackbar}
                setMessage={setMessage}
                locationOptions={locationOptions}
              />
            </Box>
            {/* Search Input */}
            <Input
              startDecorator={<Search />}
              sx={{ mb: 3, width: isMobile ? "100%" : "30%" }}
              placeholder="Search for items"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Update search query
            />

            {!isFetchingItems ? (
              <ItemsTable
                locationOptions={locationOptions}
                session={session}
                items={filteredItems}
                fetchItems={fetchItems}
                isFoundItem={true}
                status={status}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <Typography level="title-md" sx={{ mr: 2 }}>
                  Loading items...
                </Typography>
                <CircularProgress size={28} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
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

export default FoundItemsList;
