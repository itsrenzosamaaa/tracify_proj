"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Stepper,
  Step,
  Divider,
  Table,
  Sheet,
} from "@mui/joy";
import { format, isToday } from "date-fns";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { CldImage } from "next-cloudinary";
import {
  useTheme,
  useMediaQuery,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";

const Section = ({ title, children }) => (
  <Box sx={{ marginBottom: 4 }}>
    <Typography
      level="h5"
      sx={{ marginBottom: 2, fontWeight: "bold", color: "primary.plainColor" }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

const InfoCard = ({ avatarSrc, title, children }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      padding: 2,
      bgcolor: "background.level1",
      borderRadius: "md",
      boxShadow: "sm",
    }}
  >
    <Avatar src={avatarSrc} sx={{ width: 80, height: 80, boxShadow: 2 }} />
    <Box sx={{ width: "100%" }}>{children}</Box>
  </Box>
);

const DetailsList = ({ data }) => (
  <Box
    sx={{
      bgcolor: "background.level1",
      borderRadius: "md",
      boxShadow: "sm",
      padding: 3,
    }}
  >
    {Object.entries(data).map(([label, value]) => (
      <Typography key={label}>
        <strong>{label}:</strong> {value || "N/A"}
      </Typography>
    ))}
  </Box>
);

const ImageGallery = ({ title, images, alt }) => (
  <Section title={title}>
    <Carousel showThumbs={false} useKeyboardArrows>
      {images?.map((img, idx) => (
        <Box key={idx} sx={{ display: "inline-block", margin: 1 }}>
          <CldImage src={img} alt={alt} width={250} height={250} priority />
        </Box>
      ))}
    </Carousel>
  </Section>
);

const VerificationTable = ({ questions, answers }) => (
  <Box sx={{ overflowX: "auto" }}>
    <Typography
      level="h5"
      sx={{ marginBottom: 2, fontWeight: "bold", color: "primary.plainColor" }}
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
        {questions.map((q, i) => (
          <TableRow key={i}>
            <TableCell>{q}</TableCell>
            <TableCell sx={{ color: "success.700", fontWeight: 600 }}>
              {answers[i] || "No answer provided"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);

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

const MatchedItemsDetails = ({ row }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));

  console.log(row)

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Section title="Owner Information">
          <InfoCard avatarSrc={row?.owner?.user?.profile_picture}>
            <Typography
              fontWeight={700}
              level={isXs ? "body-sm" : "body-md"}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            >
              {row?.owner?.user?.firstname} {row?.owner?.user?.lastname}
            </Typography>
            <Typography
              level={isXs ? "body-sm" : "body-md"}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            >
              {row?.owner?.user?.emailAddress}
            </Typography>
            <Typography
              level={isXs ? "body-sm" : "body-md"}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            >
              {row?.owner?.user?.contactNumber}
            </Typography>
          </InfoCard>
        </Section>
        <Section title="Lost Item Information">
          <DetailsList
            data={{
              "Item Name": row.owner.item.name,
              Color: row.owner.item.color?.join(", "),
              Size: row.owner.item.size,
              Category: row.owner.item.category,
              Material: row.owner.item.material,
              Condition: row.owner.item.condition,
              "Distinctive Marks": row.owner.item.distinctiveMarks,
              Location: row.owner.item.location,
              Description: row.owner.item.description,
              "Start Date Lost":
                row?.owner?.item?.date_time === "Unidentified"
                  ? "Unidentified"
                  : row.owner.item.date_time?.split(" to ")[0],
              "End Date Lost":
                row?.owner?.item?.date_time === "Unidentified"
                  ? "Unidentified"
                  : row.owner.item.date_time?.split(" to ")[1],
            }}
          />
        </Section>
      </Grid>
      <Grid item xs={12} md={6}>
        <Section title="Finder Information">
          <InfoCard avatarSrc={row?.finder?.user?.profile_picture}>
            <Typography
              fontWeight={700}
              level={isXs ? "body-sm" : "body-md"}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            >
              {row?.finder?.user?.firstname} {row?.finder?.user?.lastname}
            </Typography>
            <Typography
              level={isXs ? "body-sm" : "body-md"}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            >
              {row?.finder?.user?.emailAddress}
            </Typography>
            <Typography
              level={isXs ? "body-sm" : "body-md"}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            >
              {row?.finder?.user?.contactNumber}
            </Typography>
          </InfoCard>
        </Section>
        <Section title="Found Item Information">
          <DetailsList
            data={{
              "Item Name": row.finder.item.name,
              Color: row.finder.item.color?.join(", "),
              Size: row.finder.item.size,
              Category: row.finder.item.category,
              Material: row.finder.item.material,
              Condition: row.finder.item.condition,
              "Distinctive Marks": row.finder.item.distinctiveMarks,
              Location: row.finder.item.location,
              Description: row.finder.item.description,
              "Date Found": format(
                new Date(row.finder.item.date_time),
                "MMMM dd, yyyy"
              ),
              "Time Found": format(
                new Date(row.finder.item.date_time),
                "hh:mm a"
              ),
            }}
          />
        </Section>
      </Grid>

      <Grid item xs={12}>
        {row?.finder?.item?.questions.length !== 0 &&
          row?.owner?.item?.answers.length !== 0 && (
            <VerificationTable
              questions={row?.finder?.item?.questions || []}
              answers={row?.owner?.item?.answers || []}
            />
          )}
      </Grid>

      <Grid item xs={12}>
        <Section title="Item Tracking History">
          <Box sx={{ bgcolor: "background.level1", p: 3, borderRadius: "md" }}>
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
          </Box>
        </Section>
      </Grid>

      <Grid item xs={12} md={6}>
        <ImageGallery
          title="Lost Item Image"
          images={row.owner.item?.images || []}
          alt={row.owner.item?.name || "Lost item"}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <ImageGallery
          title="Found Item Image"
          images={row.finder.item?.images || []}
          alt={row.finder.item?.name || "Found item"}
        />
      </Grid>
    </Grid>
  );
};

export default MatchedItemsDetails;
