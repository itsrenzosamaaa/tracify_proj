"use client";

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Stepper,
  Step,
  Divider,
  Chip,
  Tooltip,
  Table,
} from "@mui/joy";
import {
  LocationOn,
  Inventory2,
  Palette,
  Straighten,
  Category,
  Build,
  AssignmentTurnedIn,
  Fingerprint,
  Description,
  CalendarToday,
  HourglassBottom,
} from "@mui/icons-material";
import { format, isToday } from "date-fns";
import DummyPhoto from "../DummyPhoto";
import { TableBody, TableCell, TableHead, TableRow } from "@mui/material";

const TimelineStep = ({ label, timestamp, remark }) => (
  <Step>
    <Typography>
      <strong>{label}</strong>
    </Typography>
    {remark && (
      <Typography>
        <strong>Remarks:</strong> {remark}
      </Typography>
    )}
    <Typography>
      {isToday(new Date(timestamp))
        ? `Today, ${format(new Date(timestamp), "hh:mm a")}`
        : format(new Date(timestamp), "MMMM dd, yyyy - hh:mm a")}
    </Typography>
  </Step>
);

const ItemRetrievalDetails = ({ row, isXs }) => {
  console.log(row);

  const statusColor =
    {
      Pending: "warning",
      Approved: "primary",
      Completed: "success",
      Declined: "danger",
      Canceled: "neutral",
    }[row?.request_status] || "neutral";

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Chip variant="solid" size={isXs ? "sm" : "md"} color={statusColor}>
              {row?.request_status || "Unknown"}
            </Chip>

            <Box>
              <Typography level="h5" fontWeight="bold">
                {row?.owner?.item?.name || "Unnamed Item"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography level="body-md">
                  Lost in {row?.owner?.item?.location || "Unknown Area"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Item Info */}
        <Grid item xs={12}>
          <Typography level="h5" fontWeight="bold" color="primary">
            Item Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <InfoRow
              icon={<Inventory2 />}
              label="Item Name"
              value={row?.owner.item.name}
              isXs={isXs}
            />
            <InfoRow
              icon={<Palette />}
              label="Color"
              value={row?.owner.item.color?.join(", ")}
              isXs={isXs}
            />
            <InfoRow
              icon={<Straighten />}
              label="Size"
              value={row?.owner.item.size}
              isXs={isXs}
            />
            <InfoRow
              icon={<Category />}
              label="Category"
              value={row?.owner.item.category}
              isXs={isXs}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <InfoRow
              icon={<LocationOn />}
              label="Location"
              value={row?.owner.item.location}
              isXs={isXs}
            />
            <InfoRow
              icon={<Build />}
              label="Material"
              value={row?.owner.item.material}
              isXs={isXs}
            />
            <InfoRow
              icon={<AssignmentTurnedIn />}
              label="Condition"
              value={row?.owner.item.condition}
              isXs={isXs}
            />
            <InfoRow
              icon={<Fingerprint />}
              label="Distinctive Marks"
              value={row?.owner.item.distinctiveMarks}
              isXs={isXs}
            />
          </Box>
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <Typography level="h5" fontWeight="bold" color="primary">
            Description
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Description fontSize="small" sx={{ mr: 0.5 }} />
            <Typography level={isXs ? "body-sm" : "body-md"}>
              {row?.owner.item.description || "N/A"}
            </Typography>
          </Box>
        </Grid>

        {/* Date Info */}
        <Grid item xs={12}>
          <Typography level="h5" fontWeight="bold" color="primary">
            Date Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <InfoRow
              icon={<CalendarToday />}
              label="Start Date"
              value={
                row?.owner?.item?.date_time !== "Unidentified"
                  ? row?.owner?.item?.date_time?.split(" to ")[0]
                  : "Unidentified"
              }
              isXs={isXs}
            />
            <InfoRow
              icon={<HourglassBottom />}
              label="End Date"
              value={
                row?.owner?.item?.date_time !== "Unidentified"
                  ? row?.owner?.item?.date_time?.split(" to ")[1]
                  : "Unidentified"
              }
              isXs={isXs}
            />
          </Box>
        </Grid>

        {Array.isArray(row?.finder?.item?.questions) &&
          row?.finder?.item?.questions.length > 0 &&
          Array.isArray(row?.owner?.item?.answers) &&
          row?.owner?.item?.answers.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ overflowX: "auto" }}>
                <Typography
                  level="h5"
                  sx={{
                    marginBottom: 2,
                    fontWeight: "bold",
                    color: "primary.plainColor",
                  }}
                >
                  Ownership Verification
                </Typography>
                <Table stickyHeader hoverRow sx={{ minWidth: 500 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Security Question</TableCell>
                      <TableCell>Claimer&apos;s Answer</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row?.finder?.item?.questions.map((q, i) => (
                      <TableRow key={i}>
                        <TableCell>{q}</TableCell>
                        <TableCell
                          sx={{ color: "success.700", fontWeight: 600 }}
                        >
                          {row?.owner?.item?.answers?.[i] ||
                            "No answer provided"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Grid>
          )}

        {/* Timeline */}
        <Grid item xs={12}>
          <Typography level="h5" fontWeight="bold" color="primary" mb={1}>
            Item Tracking History
          </Typography>
          <Stepper orientation="vertical">
            {row.dateCompleted && (
              <TimelineStep
                label="The item has been resolved."
                timestamp={row.dateCompleted}
              />
            )}
            {row.dateDeclined && (
              <TimelineStep
                label="The request has been declined."
                timestamp={row.dateDeclined}
                remark={row.remarks}
              />
            )}
            {row.dateCanceled && (
              <TimelineStep
                label="The request has been canceled."
                timestamp={row.dateCanceled}
                remark={row.remarks}
              />
            )}
            {row.dateApproved && (
              <TimelineStep
                label="The item has been approved."
                timestamp={row.dateApproved}
              />
            )}
            {row.datePending && (
              <TimelineStep
                label="The retrieval request has been sent."
                timestamp={row.datePending}
              />
            )}
          </Stepper>
        </Grid>

        {/* Item Image */}
        <Grid item xs={12}>
          <Typography level="h5" fontWeight="bold" color="primary" mb={1}>
            Item Image
          </Typography>
          <DummyPhoto category={row?.finder?.item?.category} height={220} />
        </Grid>
      </Grid>
    </Box>
  );
};

const InfoRow = ({ icon, label, value, isXs }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
    <Tooltip title={label}>{icon}</Tooltip>
    <Typography level={isXs ? "body-sm" : "body-md"}>
      <strong>{label}: </strong>
      {value || "N/A"}
    </Typography>
  </Box>
);

export default ItemRetrievalDetails;
