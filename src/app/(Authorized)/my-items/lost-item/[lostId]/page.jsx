"use client";

import Loading from "@/app/components/Loading";
import {
  Box,
  Typography,
  Card,
  Divider,
  Stack,
  Button,
  Grid,
  Chip,
  Stepper,
  Step,
  Avatar,
  StepIndicator,
  Modal,
  ModalDialog,
  ModalClose,
  DialogContent,
  RadioGroup,
  Radio,
  Input,
  FormLabel,
} from "@mui/joy";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { isToday, format } from "date-fns";
import CancelRetrievalRequest from "@/app/components/Modal/CancelRetrievalRequest";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { CldImage } from "next-cloudinary";
import ViewRetrievalHistory from "@/app/components/Modal/ViewRetrievalHistory";
import { FindInPage } from "@mui/icons-material";
import { FormControlLabel, useMediaQuery, useTheme } from "@mui/material";

const formatDate = (date, fallback = "Unidentified") => {
  if (!date) return fallback;
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return fallback;
  }
};

const ViewItemPage = ({ params }) => {
  const { lostId } = params;
  const [lostItem, setLostItem] = useState(null);
  const [foundItem, setFoundItem] = useState(null);
  const [itemRetrievalHistory, setItemRetrievalHistory] = useState([]);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [openUnpublishModal, setOpenUnpublishModal] = useState(false);
  const [inputConfirmation, setInputConfirmation] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  console.log(foundItem);

  const formatDate1 = (date) =>
    isToday(new Date(date))
      ? `Today, ${format(new Date(date), "hh:mm a")}`
      : format(new Date(date), "MMMM dd, yyyy, hh:mm a");

  const fetchFoundItem = useCallback(async (lostItemId) => {
    setError(null);
    try {
      const response = await fetch("/api/match-items");

      if (!response.ok) {
        throw new Error("Failed to fetch matched items");
      }

      const data = await response.json();
      const findFoundItem = data.find(
        (foundItem) =>
          foundItem?.owner?.item?._id === lostItemId &&
          ["Pending", "Approved"].includes(foundItem.request_status)
      );
      const findUncompletedItems = data.filter(
        (uncompletedItem) =>
          uncompletedItem.owner.item._id === lostItemId &&
          (uncompletedItem.request_status === "Canceled" ||
            uncompletedItem.request_status === "Declined")
      );
      setFoundItem(findFoundItem);
      setItemRetrievalHistory(findUncompletedItems);
    } catch (error) {
      console.error(error);
      setError("Unable to load matched item details. Please try again later.");
    }
  }, []);

  const fetchLostItem = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`/api/lost-items/${lostId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch item details");
      }

      const data = await response.json();
      setLostItem(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load item details. Please try again later.");
    }
  }, [lostId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/lost-items/${lostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Canceled",
        }),
      });

      if (!response.ok)
        throw new Error(data.message || "Failed to update status");
      router.push("/my-items");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (lostId) {
        setLoading(true);
        try {
          await Promise.all([fetchLostItem(), fetchFoundItem(lostId)]);
        } catch (error) {
          console.error(error);
          setError("Failed to load data. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [lostId, fetchLostItem, fetchFoundItem]);

  if (loading) return <Loading />;
  if (error) return <Typography color="danger">{error}</Typography>;

  return (
    <>
      {lostItem ? (
        <Grid container spacing={2} sx={{ maxWidth: 1200 }}>
          <Grid item xs={12}>
            {lostItem.status === "Unclaimed" && (
              <Grid container spacing={2}>
                {/* Full-width Card containing details and the stepper */}
                <Grid item xs={12}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      boxShadow: 2,
                      maxWidth: "100%",
                      mx: "auto",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        level={isXs ? "h4" : "h3"}
                        sx={{
                          color: "primary.main",
                          fontWeight: "bold",
                          mb: 2,
                        }}
                      >
                        Claim Instructions
                      </Typography>
                      <Button
                        size={isXs ? "small" : "medium"}
                        onClick={() => router.push("/my-items#lost-item")}
                        color="danger"
                        aria-label="Back to my items"
                      >
                        Back
                      </Button>
                    </Box>
                    <Divider sx={{ borderColor: "primary.main" }} />

                    <Grid container spacing={2} alignItems="flex-start">
                      {/* Left Side: Surrender Details */}
                      <Grid item xs={12} md={3}>
                        <Typography
                          level={isXs ? "body-sm" : "body-md"}
                          color="danger"
                          textAlign="justify"
                          sx={{ my: 2, fontWeight: "bold" }}
                        >
                          <strong>Reminder:</strong> Falsely claiming an item
                          that does not belong to you is a serious offense and
                          may result in consequences such as suspension.
                        </Typography>
                      </Grid>

                      {/* Vertical Divider */}
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ display: { xs: "none", md: "block" }, mx: 2 }}
                      />

                      {/* Right Side: Stepper */}
                      <Grid item xs={12} md={8}>
                        <Stepper
                          size="md"
                          orientation={
                            isSmallScreen ? "vertical" : "horizontal"
                          }
                          sx={{
                            display: "flex",
                            flexDirection: isSmallScreen ? "column" : "row",
                            justifyContent: "center",
                          }}
                        >
                          {/* Step 1 */}
                          <Step
                            orientation="vertical"
                            indicator={
                              <StepIndicator variant="solid" color="neutral">
                                1
                              </StepIndicator>
                            }
                          >
                            <Box
                              sx={{
                                textAlign: isSmallScreen ? "left" : "center",
                                maxWidth: { xs: "100%", md: 200 },
                                marginLeft: { xs: "1rem", md: "" },
                              }}
                            >
                              <Typography
                                level={isXs ? "title-sm" : "h6"}
                                sx={{ fontWeight: "bold", mb: 1 }}
                              >
                                Visit the Office
                              </Typography>
                              <Typography
                                level={isXs ? "body-sm" : "body-md"}
                                sx={{ color: "text.secondary" }}
                              >
                                Please go to <strong>SASO</strong> for claiming
                                an item. Make sure to bring any required
                                documents or proof of ownership.
                              </Typography>
                            </Box>
                          </Step>

                          {/* Step 2 */}
                          <Step
                            orientation="vertical"
                            indicator={
                              <StepIndicator variant="solid" color="neutral">
                                2
                              </StepIndicator>
                            }
                          >
                            <Box
                              sx={{
                                textAlign: isSmallScreen ? "left" : "center",
                                maxWidth: { xs: "100%", md: 200 },
                                marginLeft: { xs: "1rem", md: "" },
                              }}
                            >
                              <Typography
                                level={isXs ? "title-sm" : "h6"}
                                sx={{ fontWeight: "bold", mb: 1 }}
                              >
                                Verify Ownership
                              </Typography>
                              <Typography
                                level={isXs ? "body-sm" : "body-md"}
                                sx={{ color: "text.secondary" }}
                              >
                                Present your proof of ownership or
                                identification to the person-in-charge. Answer
                                any questions to confirm you are the rightful
                                owner.
                              </Typography>
                            </Box>
                          </Step>

                          {/* Step 3 */}
                          <Step
                            orientation="vertical"
                            indicator={
                              <StepIndicator variant="solid" color="neutral">
                                3
                              </StepIndicator>
                            }
                          >
                            <Box
                              sx={{
                                textAlign: isSmallScreen ? "left" : "center",
                                maxWidth: { xs: "100%", md: 200 },
                                marginLeft: { xs: "1rem", md: "" },
                              }}
                            >
                              <Typography
                                level={isXs ? "title-sm" : "h6"}
                                sx={{ fontWeight: "bold", mb: 1 }}
                              >
                                Claim the Item
                              </Typography>
                              <Typography
                                level={isXs ? "body-sm" : "body-md"}
                                sx={{ color: "text.secondary" }}
                              >
                                Once your claim is verified, the item will be
                                handed to you. Sign any required documents to
                                finalize the process.
                              </Typography>
                            </Box>
                          </Step>
                        </Stepper>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Grid>
          {/* Lost Item Details */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 3, boxShadow: 2 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography level={isXs ? "h3" : "h2"}>
                    {lostItem.name}
                  </Typography>
                  {lostItem.status === "Missing" && (
                    <Button
                      onClick={() => router.push("/my-items#lost-item")}
                      color="danger"
                      aria-label="Back to my items"
                    >
                      Back
                    </Button>
                  )}
                </Box>

                <Typography
                  level={isXs ? "body-sm" : "body-md"}
                  color="neutral"
                >
                  <strong>Status:</strong>{" "}
                  <Chip
                    variant="solid"
                    color={lostItem.status === "Missing" ? "danger" : "warning"}
                  >
                    {lostItem.status}
                  </Chip>
                </Typography>

                <Carousel showThumbs={false} useKeyboardArrows>
                  {lostItem?.images?.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        overflow: "hidden",
                        display: "inline-block",
                        margin: 1, // Adds some spacing between images
                      }}
                    >
                      <CldImage
                        priority
                        src={image}
                        width={250}
                        height={250}
                        alt={lostItem?.name || "Item Image"}
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                      />
                    </Box>
                  ))}
                </Carousel>

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Button fullWidth onClick={() => setOpenHistoryModal(true)}>
                    View Retrieval History
                  </Button>
                  {!foundItem && (
                    <Button
                      fullWidth
                      onClick={() => setOpenUnpublishModal(true)}
                      color="danger"
                    >
                      Unpublish an Item
                    </Button>
                  )}
                </Box>
                <ViewRetrievalHistory
                  open={openHistoryModal}
                  onClose={() => setOpenHistoryModal(false)}
                  retrievalItems={itemRetrievalHistory}
                />

                <Typography
                  level={isXs ? "body-sm" : "body-md"}
                  color="neutral"
                >
                  <strong>Description:</strong> {lostItem.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      level={isXs ? "body-sm" : "body-md"}
                      color="neutral"
                    >
                      <strong>Color:</strong> {lostItem.color.join(", ")}
                    </Typography>
                    <Typography
                      level={isXs ? "body-sm" : "body-md"}
                      color="neutral"
                    >
                      <strong>Size:</strong> {lostItem.size}
                    </Typography>
                    <Typography
                      level={isXs ? "body-sm" : "body-md"}
                      color="neutral"
                    >
                      <strong>Category:</strong> {lostItem.category}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      level={isXs ? "body-sm" : "body-md"}
                      color="neutral"
                    >
                      <strong>Material:</strong> {lostItem.material}
                    </Typography>
                    <Typography
                      level={isXs ? "body-sm" : "body-md"}
                      color="neutral"
                    >
                      <strong>Condition:</strong> {lostItem.condition}
                    </Typography>
                    <Typography
                      level={isXs ? "body-sm" : "body-md"}
                      color="neutral"
                    >
                      <strong>Distinctive Marks:</strong>{" "}
                      {lostItem.distinctiveMarks}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    level={isXs ? "body-sm" : "body-md"}
                    color="neutral"
                  >
                    <strong>Location Lost:</strong> {lostItem.location}
                  </Typography>
                  <Typography
                    level={isXs ? "body-sm" : "body-md"}
                    color="neutral"
                  >
                    <strong>Lost Start Date:</strong>{" "}
                    {formatDate(lostItem.date_time?.split(" to ")[0])}
                  </Typography>
                  <Typography
                    level={isXs ? "body-sm" : "body-md"}
                    color="neutral"
                  >
                    <strong>Lost End Date:</strong>{" "}
                    {formatDate(lostItem.date_time?.split(" to ")[1])}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ marginBottom: 4 }}>
                  <Stepper orientation="vertical">
                    {lostItem.dateClaimed && (
                      <Step>
                        <Typography>
                          <strong>
                            The item has successfully returned to owner!
                          </strong>
                        </Typography>
                        <Typography>
                          {formatDate1(lostItem.dateClaimed)}
                        </Typography>
                      </Step>
                    )}
                    {lostItem.dateUnclaimed && (
                      <Step>
                        <Typography>
                          <strong>The item has been tracked!</strong>
                        </Typography>
                        <Typography>
                          {formatDate1(lostItem.dateUnclaimed)}
                        </Typography>
                      </Step>
                    )}
                    {lostItem.dateMissing && (
                      <Step>
                        <Typography>
                          <strong>
                            {lostItem.dateRequest
                              ? "The item was approved!"
                              : "The item has been published!"}
                          </strong>
                        </Typography>
                        <Typography>
                          {formatDate1(lostItem.dateMissing)}
                        </Typography>
                      </Step>
                    )}
                    {lostItem.dateRequest && (
                      <Step>
                        <Typography>
                          <strong>Request has been sent!</strong>
                        </Typography>
                        <Typography>
                          {formatDate1(lostItem.dateRequest)}
                        </Typography>
                      </Step>
                    )}
                  </Stepper>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Found Item Details */}
          <Grid item xs={12} md={6}>
            <Card
              variant="outlined"
              sx={{ p: 3, boxShadow: 4, mb: 2, borderRadius: 2 }}
            >
              {foundItem ? (
                <Stack spacing={3}>
                  {/* Found Item Details */}
                  <Box>
                    <Stack spacing={2}>
                      <Typography
                        level={isXs ? "h4" : "h3"}
                        sx={{ color: "success.main", fontWeight: "bold" }}
                      >
                        {lostItem.status === "Missing"
                          ? "Potential Matched Item"
                          : "Your Item Has Been Found!"}
                      </Typography>
                      <Carousel showThumbs={false} useKeyboardArrows>
                        {foundItem?.finder.item.images?.map((image, index) => (
                          <Box
                            key={index}
                            sx={{
                              overflow: "hidden",
                              display: "inline-block",
                              margin: 1, // Adds some spacing between images
                            }}
                          >
                            <CldImage
                              priority
                              src={image}
                              width={250}
                              height={250}
                              alt={
                                foundItem?.finder?.item?.name || "Item Image"
                              }
                              sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
                            />
                          </Box>
                        ))}
                      </Carousel>

                      {foundItem.request_status === "Pending" && (
                        <>
                          <Button
                            fullWidth
                            color="danger"
                            onClick={() => setCancelModal(true)}
                          >
                            Cancel Retrieval Request
                          </Button>
                          <CancelRetrievalRequest
                            open={cancelModal}
                            onClose={() => setCancelModal(false)}
                            matchItem={foundItem}
                          />
                        </>
                      )}

                      <Divider />

                      <Grid container spacing={2}>
                        <Grid
                          item
                          xs={12}
                          md={2}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Avatar
                            alt={`${foundItem.finder.user.firstname} ${foundItem.finder.user.lastname}'s Profile Picture`}
                            src={foundItem.finder.user.profile_picture}
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              boxShadow: 2,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={10}>
                          <Typography
                            level={isXs ? "body-sm" : "body-md"}
                            color="neutral"
                            fontWeight="700"
                            sx={{
                              whiteSpace: { xs: "nowrap" },
                              overflow: { xs: "hidden" },
                              textOverflow: { xs: "ellipsis" },
                            }}
                          >
                            {foundItem.finder.user.firstname}{" "}
                            {foundItem.finder.user.lastname}
                          </Typography>
                          <Typography
                            level={isXs ? "body-sm" : "body-md"}
                            color="neutral"
                            sx={{
                              whiteSpace: { xs: "nowrap" },
                              overflow: { xs: "hidden" },
                              textOverflow: { xs: "ellipsis" },
                            }}
                          >
                            {foundItem.finder.user.emailAddress}
                          </Typography>
                          <Typography
                            level={isXs ? "body-sm" : "body-md"}
                            color="neutral"
                            sx={{
                              whiteSpace: { xs: "nowrap" },
                              overflow: { xs: "hidden" },
                              textOverflow: { xs: "ellipsis" },
                            }}
                          >
                            {foundItem.finder.user.contactNumber}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Divider />

                      <Typography
                        level={isXs ? "body-sm" : "body-md"}
                        color="neutral"
                      >
                        <strong>Description:</strong>{" "}
                        {foundItem.finder.item.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography
                            level={isXs ? "body-sm" : "body-md"}
                            color="neutral"
                          >
                            <strong>Color:</strong>{" "}
                            {foundItem.finder.item.color}
                          </Typography>
                          <Typography
                            level={isXs ? "body-sm" : "body-md"}
                            color="neutral"
                          >
                            <strong>Size:</strong> {foundItem.finder.item.size}
                          </Typography>
                          <Typography
                            level={isXs ? "body-sm" : "body-md"}
                            color="neutral"
                          >
                            <strong>Category:</strong>{" "}
                            {foundItem.finder.item.category}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            level={isXs ? "body-sm" : "body-md"}
                            color="neutral"
                          >
                            <strong>Material:</strong>{" "}
                            {foundItem.finder.item.material}
                          </Typography>
                          <Typography
                            level={isXs ? "body-sm" : "body-md"}
                            color="neutral"
                          >
                            <strong>Condition:</strong>{" "}
                            {foundItem.finder.item.condition}
                          </Typography>
                          <Typography
                            level={isXs ? "body-sm" : "body-md"}
                            color="neutral"
                          >
                            <strong>Distinctive Marks:</strong>{" "}
                            {foundItem.finder.item.distinctiveMarks}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography
                          level={isXs ? "body-sm" : "body-md"}
                          color="neutral"
                        >
                          <strong>Found Location:</strong>{" "}
                          {foundItem.finder.item.location}
                        </Typography>
                        <Typography
                          level={isXs ? "body-sm" : "body-md"}
                          color="neutral"
                        >
                          <strong>Found Date:</strong>{" "}
                          {foundItem.finder.item.date_time}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    boxShadow: 3, // Adds some depth
                  }}
                >
                  <FindInPage
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography
                    color="text.primary"
                    sx={{ fontSize: "1.4rem", fontWeight: "bold", mb: 1 }}
                  >
                    No Matching Item Found
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
                    Try browsing the news feed to see if someone has reported
                    finding your item.
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Typography>No item details available.</Typography>
      )}
      <Modal
        open={openUnpublishModal}
        onClose={() => setOpenUnpublishModal(false)}
      >
        <ModalDialog>
          <ModalClose />
          <Typography level="h4">Confirmation</Typography>
          <Typography level="body-md" sx={{ my: 1 }}>
            Are you sure you want to unpublish your lost item?
          </Typography>
          <FormLabel>
            Type &quot;{`${lostItem.name}`}&quot; to confirm the deletion.
          </FormLabel>
          <Input
            value={inputConfirmation}
            onChange={(e) => setInputConfirmation(e.target.value)}
          />
          <Button
            disabled={inputConfirmation !== lostItem.name || isLoading}
            loading={isLoading}
            fullWidth
            onClick={(e) => handleSubmit(e)}
          >
            Confirm
          </Button>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default ViewItemPage;
