import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Stack, Chip, Divider, Grid } from "@mui/joy";
import { CheckCircle, Refresh, Cancel } from "@mui/icons-material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { CldImage } from "next-cloudinary";
import { formatDate } from "date-fns";

const LostItemDetails = ({ lostItem, onClose }) => {
  const [status, setStatus] = useState("Published");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const publishedDate = new Date(lostItem.item.dateMissing);
    const currentDate = new Date();
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;

    if (currentDate - publishedDate > twoWeeksInMs) {
      setIsExpired(true);
      setStatus("Expired");
    }
  }, [lostItem.item.dateMissing]);

  const handleStatusUpdate = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === "Republish") setIsExpired(false);
  };

  return (
    <>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        {/* Left Side: Item Details */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1.5}>
            <Typography>
              <strong>Item Name:</strong> {lostItem.item.name}
            </Typography>
            <Typography>
              <strong>Description:</strong> {lostItem.item.description}
            </Typography>
            <Typography>
              <strong>Location:</strong> {lostItem.item.location}
            </Typography>
            <Typography>
              <strong>Date Range:</strong> {lostItem.item.date_time}
            </Typography>
            {!isExpired && (
              <Typography>
                <strong>Published on:</strong>{" "}
                {formatDate(
                  new Date(lostItem.item.dateLostItemPublished),
                  "MMMM dd, yyyy - hh:mm a"
                )}
              </Typography>
            )}
            <Box>
              <Typography>
                <strong>Status:</strong>{" "}
                <Chip
                  size="sm"
                  variant="soft"
                  color={
                    status === "Expired"
                      ? "warning"
                      : status === "Republish"
                      ? "primary"
                      : status === "Claimed"
                      ? "success"
                      : status === "Terminate"
                      ? "danger"
                      : "neutral"
                  }
                >
                  {status}
                </Chip>
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Right Side: Image Carousel */}
        <Grid item xs={12} md={6}>
          <Typography fontWeight="md" mb={1}>
            Image Preview:
          </Typography>
          <Carousel showThumbs={false} useKeyboardArrows>
            {lostItem.item.images?.map((image, index) => {
              if (!image || image === "null") return null;

              return (
                <Box
                  key={index}
                  sx={{
                    overflow: "hidden",
                    display: "inline-block",
                    cursor: "pointer",
                    borderRadius: "8px",
                    mx: "auto",
                  }}
                  onClick={() => window.open(image, "_blank")}
                >
                  <CldImage
                    priority
                    src={image}
                    width={400}
                    height={300}
                    alt={lostItem.item?.name || "Item Image"}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                    style={{
                      objectFit: "cover",
                      borderRadius: "8px",
                      maxHeight: "300px",
                    }}
                  />
                </Box>
              );
            })}
          </Carousel>
        </Grid>

        {/* Track Records Table */}
        {Array.isArray(lostItem.item.trackRecords) &&
          lostItem.item.trackRecords.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ mb: 1 }} />
              <Typography fontWeight="lg" level="h5" gutterBottom>
                Track Records
              </Typography>

              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  overflowX: "auto",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9f9f9" }}>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Status
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lostItem.item.trackRecords.map((record, index) => (
                      <tr key={index} style={{ borderTop: "1px solid #eee" }}>
                        <td style={{ padding: "10px" }}>
                          <Chip
                            size="sm"
                            variant="soft"
                            color={
                              record.status === "Published"
                                ? "primary"
                                : record.status === "Claimed"
                                ? "success"
                                : record.status === "Expired"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {record.status}
                          </Chip>
                        </td>
                        <td style={{ padding: "10px" }}>
                          {record.date
                            ? new Date(record.date).toLocaleString("en-US", {
                                month: "long",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Grid>
          )}

        {/* Expired Action Buttons */}
        {isExpired && (
          <Grid item xs={12}>
            <Typography fontWeight="md" mb={1}>
              This report has expired. Choose an action:
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                fullWidth
                variant="solid"
                color="primary"
                onClick={() => handleStatusUpdate("Republish")}
                startDecorator={<Refresh />}
              >
                Republish
              </Button>
              <Button
                fullWidth
                variant="solid"
                color="success"
                onClick={() => handleStatusUpdate("Claimed")}
                startDecorator={<CheckCircle />}
              >
                Mark as Claimed
              </Button>
              <Button
                fullWidth
                variant="solid"
                color="danger"
                onClick={() => handleStatusUpdate("Terminate")}
                startDecorator={<Cancel />}
              >
                Terminate
              </Button>
            </Stack>
          </Grid>
        )}

        {/* Close Button */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="neutral"
              onClick={onClose}
            >
              Close
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default LostItemDetails;
