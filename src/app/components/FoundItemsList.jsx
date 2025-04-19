"use client";

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
  IconButton,
  Typography,
} from "@mui/joy";
import { Paper, Badge, useMediaQuery, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ItemsTable from "./Table/ItemsTable";
import PublishFoundItem from "./Modal/PublishFoundItem";
import TitleBreadcrumbs from "./Title/TitleBreadcrumbs";
import { Refresh, Search } from "@mui/icons-material";

const FoundItemsList = ({
  finders,
  fetchItems,
  session,
  locationOptions,
  isFetchingItems,
  setOpenSnackbar,
  setMessage,
}) => {
  const [status, setStatus] = useState("Published");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useMediaQuery("(max-width:600px)");

  const activeStatuses = ["Published", "Request"];
  const archivedStatuses = ["Resolved", "Declined", "Canceled"];
  const requestStatuses = ["Request", "Surrender Pending"];

  const statusCounts = [...activeStatuses, ...archivedStatuses].reduce(
    (acc, currentStatus) => {
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
    },
    {}
  );

  const filteredItems = finders.filter((finder) => {
    const matchesStatus =
      status === "Request"
        ? requestStatuses.includes(finder.item.status)
        : finder.item.status === status;

    const matchesSearch =
      finder?.item?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finder?.user?.firstname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      finder?.user?.lastname.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

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
          onChange={() => setStatus(name)}
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
                    onClick={fetchItems}
                    sx={{ p: 0.5, mt: "-2px" }}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ mt: 1 }}>
                  {isMobile ? (
                    <Select
                      value={status}
                      onChange={(e, newValue) => {
                        setStatus(newValue);
                        setCurrentPage(1);
                      }}
                      size="sm"
                    >
                      {[...activeStatuses, ...archivedStatuses].map((name) => (
                        <Option key={name} value={name}>
                          {name} ({statusCounts[name] || 0})
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <RadioGroup
                      name="status-selection"
                      orientation="horizontal"
                      sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                    >
                      {/* Active */}
                      {activeStatuses.map((name) => (
                        <StatusChip
                          key={name}
                          name={name}
                          count={statusCounts[name]}
                          isChecked={status === name}
                        />
                      ))}

                      {/* Divider */}
                      <Typography
                        level="body-sm"
                        sx={{ mx: 1, fontWeight: 600, color: "#888" }}
                      >
                        |
                      </Typography>

                      {/* Archived */}
                      {archivedStatuses.map((name) => (
                        <StatusChip
                          key={name}
                          name={name}
                          count={statusCounts[name]}
                          isChecked={status === name}
                        />
                      ))}
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

            <Input
              startDecorator={<Search />}
              sx={{ mb: 3, width: isMobile ? "100%" : "30%" }}
              placeholder="Search for items"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                setMessage={setMessage}
                setOpenSnackbar={setOpenSnackbar}
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
                <Typography level="title-md">Loading items...</Typography>
                <CircularProgress size={28} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default FoundItemsList;
