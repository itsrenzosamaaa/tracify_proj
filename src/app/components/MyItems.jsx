"use client";

import React, { useState, useEffect, useCallback } from "react";
import TitleBreadcrumbs from "./Title/TitleBreadcrumbs";
import {
  Grid,
  Typography,
  Button,
  Modal,
  ModalDialog,
  ModalClose,
  DialogContent,
  Tabs,
  TabList,
  Tab,
  ListItemDecorator,
  Badge,
  Select,
  Option,
  Chip,
  Snackbar,
  AspectRatio,
} from "@mui/joy";
import { Box, Card, CardContent } from "@mui/material";
import { CldImage } from "next-cloudinary";
import AddIcon from "@mui/icons-material/Add";
import { usePathname, useRouter } from "next/navigation";
import InfoIcon from "@mui/icons-material/Info";
import ConfirmationRetrievalRequest from "./Modal/ConfirmationRetrievalRequest";
import CancelRequest from "./Modal/CancelRequest";
import ItemDetails from "./Modal/ItemDetails";
import { useTheme, useMediaQuery } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";

const validTabs = [
  "found-item",
  "lost-item",
  "completed-item",
  "declined-item",
  "canceled-item",
  "requested-item",
];

const MyItemsComponent = ({ session, status }) => {
  const [locationOptions, setLocationOptions] = useState([]);
  const [completedItemDetailsModal, setCompletedItemDetailsModal] =
    useState(null);
  const [invalidItemDetailsModal, setInvalidItemDetailsModal] = useState(null);
  const [cancelRequestModal, setCancelRequestModal] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);
  const [declinedItems, setDeclinedItems] = useState([]);
  const [canceledItems, setCanceledItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [requestedItems, setRequestedItems] = useState([]);
  const [openDetails, setOpenDetails] = useState(null);
  const [confirmationRetrievalModal, setConfirmationRetrievalModal] =
    useState(null);
  const [activeTab, setActiveTab] = useState("lost-item"); // State to track the active tab
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(null);
  const [openLostRequestModal, setOpenLostRequestModal] = useState(false);
  const [openFoundRequestModal, setOpenFoundRequestModal] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("lg"));
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (validTabs.includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (newValue) => {
    if (validTabs.includes(newValue)) {
      setActiveTab(newValue);
      window.location.hash = newValue;
    }
  };

  const fetchItems = useCallback(async () => {
    if (!session?.user?.id) {
      console.error("User is not logged in or session is not available");
      return;
    }

    try {
      // Fetch all required data concurrently
      const [itemsResponse] = await Promise.all([
        fetch(`/api/items/${session.user.id}`),
      ]);

      if (!itemsResponse.ok) {
        throw new Error("Failed to fetch data from one or more endpoints");
      }

      const [itemsData] = await Promise.all([itemsResponse.json()]);

      // Filter and categorize items before processing
      const lostItems = itemsData.filter(
        (item) =>
          !item.item.isFoundItem &&
          ["Missing", "Unclaimed"].includes(item.item.status)
      );

      const foundItems = itemsData.filter(
        (item) =>
          item.item.isFoundItem &&
          !["Request", "Resolved", "Declined", "Canceled"].includes(
            item.item.status
          )
      );

      // Set states
      setLostItems(lostItems);
      setFoundItems(foundItems);
      setCompletedItems(
        itemsData.filter(
          (item) =>
            item.item.status === "Claimed" || item.item.status === "Resolved"
        )
      );
      setRequestedItems(
        itemsData.filter((item) => item.item.status === "Request")
      );
      setDeclinedItems(
        itemsData.filter((item) => item.item.status === "Declined")
      );
      setCanceledItems(
        itemsData.filter((item) => item.item.status === "Canceled")
      );
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }, [session?.user?.id]);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch("/api/location");
      const data = await response.json();

      const allRooms = data.reduce((acc, location) => {
        return [...acc, ...location.areas];
      }, []);

      setLocationOptions(allRooms);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchItems();
      fetchLocations();
    }
  }, [status, fetchItems, fetchLocations]);

  return (
    <>
      <TitleBreadcrumbs title="List of My Items" text="My Items" />

      {isMd ? (
        <>
          <Box sx={{ width: "100%", mb: 5 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => handleTabChange(newValue)}
              aria-label="Icon tabs"
              variant="scrollable"
            >
              <TabList
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  padding: 0,
                }}
              >
                <Badge badgeContent={lostItems.length}>
                  <Tab value="lost-item">
                    <Typography level="body-md">Lost Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={foundItems.length}>
                  <Tab value="found-item">
                    <Typography level="body-md">Found Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={completedItems.length}>
                  <Tab value="completed-item">
                    <Typography level="body-md">Completed Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={declinedItems.length}>
                  <Tab value="declined-item">
                    <Typography level="body-md">Declined Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={canceledItems.length}>
                  <Tab value="canceled-item">
                    <Typography level="body-md">Canceled Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={requestedItems.length}>
                  <Tab value="requested-item">
                    <Typography level="body-md">Requested Items</Typography>
                  </Tab>
                </Badge>
              </TabList>
            </Tabs>
          </Box>
        </>
      ) : (
        <>
          <Select
            value={activeTab}
            onChange={(e, newValue) => handleTabChange(newValue)}
            size="sm"
            sx={{ width: "50%" }}
          >
            <Option
              value="lost-item"
              label="Lost Items"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Lost Items
              {lostItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">
                    {lostItems.length}
                  </Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option
              value="found-item"
              label="Found Items"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Found Items
              {foundItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">
                    {foundItems.length}
                  </Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option
              value="completed-item"
              label="Completed Items"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Completed Items
              {completedItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">
                    {completedItems.length}
                  </Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option
              value="declined-item"
              label="Declined Items"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Declined Items
              {declinedItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">
                    {declinedItems.length}
                  </Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option
              value="canceled-item"
              label="Canceled Items"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Canceled Items
              {canceledItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">
                    {canceledItems.length}
                  </Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option
              value="requested-item"
              label="Requested Items"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Requested Items
              {requestedItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">
                    {requestedItems.length}
                  </Chip>
                </ListItemDecorator>
              )}
            </Option>
          </Select>
        </>
      )}

      <Box sx={{ paddingY: "1rem" }}>
        {activeTab === "lost-item" && (
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Lost Items
            </Typography>

            {/* Grid layout for the Lost Items */}
            <Grid container spacing={2}>
              {lostItems.length > 0 ? (
                lostItems.map((lostItem, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card
                      key={lostItem._id}
                      variant="outlined"
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: { xs: "row", sm: "column" },
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "md",
                          borderColor: "neutral.outlinedHoverBorder",
                        },
                      }}
                    >
                      <Box sx={{ position: "relative", flexShrink: 0 }}>
                        {!isXs && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              zIndex: 1,
                              backgroundColor: ["Unclaimed"].includes(
                                lostItem.item.status
                              )
                                ? "orange"
                                : "red",
                              color: "#fff",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              textShadow: "0px 0px 4px rgba(0, 0, 0, 0.7)",
                            }}
                          >
                            {lostItem.item.status}
                          </Box>
                        )}
                        <AspectRatio
                          ratio="1"
                          sx={{
                            width: { xs: "120px", sm: "100%" },
                            minWidth: { xs: "120px", sm: "auto" },
                            minHeight: { xs: "120px", sm: "220px" },
                          }}
                        >
                          <CldImage
                            priority
                            src={lostItem.item.images[0]}
                            fill
                            alt={lostItem.item.name || "Item Image"}
                            sizes="(max-width: 600px) 120px, (max-width: 960px) 50vw, 33vw"
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        </AspectRatio>
                      </Box>

                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: { xs: 1, sm: 2 },
                          flexGrow: 1,
                          p: { xs: 1.5, sm: 2 },
                        }}
                      >
                        <Typography
                          level="h6"
                          sx={{
                            fontSize: { xs: "0.875rem", sm: "1.125rem" },
                            fontWeight: 600,
                          }}
                        >
                          {lostItem.item.name}
                        </Typography>

                        {isXs && (
                          <Chip
                            size="sm"
                            variant="solid"
                            color={
                              ["Unclaimed"].includes(lostItem.item.status)
                                ? "warning"
                                : "danger"
                            }
                          >
                            {lostItem.item.status}
                          </Chip>
                        )}

                        <Typography
                          level="body2"
                          sx={{
                            color: "text.secondary",
                            display: "-webkit-box",
                            WebkitLineClamp: { xs: 2, sm: 3 },
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            flexGrow: 1,
                          }}
                        >
                          {lostItem.item.description}
                        </Typography>

                        <Button
                          fullWidth
                          size="sm"
                          onClick={() =>
                            router.push(
                              `my-items/lost-item/${lostItem.item._id}`
                            )
                          }
                          sx={{
                            mt: "auto",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "200px",
                    border: "1px dashed #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    padding: 3,
                    textAlign: "center", // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: "#ccc" }}>
                    <SearchOffIcon />{" "}
                    {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    No lost items available
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    If you&apos;ve lost something, please report it immediately.
                  </Typography>
                </Box>
              )}
            </Grid>
          </>
        )}

        {activeTab === "found-item" && (
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Found Items
            </Typography>

            <Grid container spacing={2}>
              {foundItems.length > 0 ? (
                foundItems.map((foundItem, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card
                      key={foundItem._id}
                      variant="outlined"
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: { xs: "row", sm: "column" },
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "md",
                          borderColor: "neutral.outlinedHoverBorder",
                        },
                      }}
                    >
                      <Box sx={{ position: "relative", flexShrink: 0 }}>
                        {!isXs && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              zIndex: 1,
                              backgroundColor: ["Surrender Pending"].includes(
                                foundItem.item.status
                              )
                                ? "orange"
                                : ["Published"].includes(foundItem.item.status)
                                ? "blue"
                                : "green",
                              color: "#fff",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              textShadow: "0px 0px 4px rgba(0, 0, 0, 0.7)",
                            }}
                          >
                            {foundItem.item.status}
                          </Box>
                        )}
                        <AspectRatio
                          ratio="1"
                          sx={{
                            width: { xs: "120px", sm: "100%" },
                            minWidth: { xs: "120px", sm: "auto" },
                            minHeight: { xs: "120px", sm: "220px" },
                          }}
                        >
                          <CldImage
                            priority
                            src={foundItem.item.images[0]}
                            fill
                            alt={foundItem.item.name || "Item Image"}
                            sizes="(max-width: 600px) 120px, (max-width: 960px) 50vw, 33vw"
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        </AspectRatio>
                      </Box>

                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: { xs: 1, sm: 2 },
                          flexGrow: 1,
                          p: { xs: 1.5, sm: 2 },
                        }}
                      >
                        <Typography
                          level="h6"
                          sx={{
                            fontSize: { xs: "0.875rem", sm: "1.125rem" },
                            fontWeight: 600,
                          }}
                        >
                          {foundItem.item.name}
                        </Typography>
                        {isXs && (
                          <Chip
                            size="sm"
                            variant="solid"
                            color={
                              ["Surrender Pending"].includes(
                                foundItem.item.status
                              )
                                ? "warning"
                                : ["Published"].includes(foundItem.item.status)
                                ? "primary"
                                : "success"
                            }
                          >
                            {foundItem.item.status}
                          </Chip>
                        )}
                        <Typography
                          level="body2"
                          sx={{
                            color: "text.secondary",
                            display: "-webkit-box",
                            WebkitLineClamp: { xs: 2, sm: 3 },
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            flexGrow: 1,
                          }}
                        >
                          {foundItem.item.description}
                        </Typography>
                        <Button
                          fullWidth
                          size="sm"
                          onClick={() =>
                            router.push(
                              `my-items/found-item/${foundItem.item._id}`
                            )
                          }
                          sx={{
                            mt: "auto",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "200px",
                    border: "1px dashed #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    padding: 3,
                    textAlign: "center", // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: "#ccc" }}>
                    <SearchOffIcon />{" "}
                    {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    No found items available
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    If you&apos;ve found something, please report it to help
                    others.
                  </Typography>
                </Box>
              )}
            </Grid>
          </>
        )}

        {activeTab === "completed-item" && (
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Completed Items
            </Typography>
            <Grid container spacing={2}>
              {completedItems.length > 0 ? (
                completedItems.map((completedItem, index) => (
                  <>
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card
                        key={completedItem._id}
                        variant="outlined"
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: { xs: "row", sm: "column" },
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "md",
                            borderColor: "neutral.outlinedHoverBorder",
                          },
                        }}
                      >
                        <Box sx={{ position: "relative", flexShrink: 0 }}>
                          {!isXs && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                zIndex: 1,
                                backgroundColor: completedItem?.item
                                  ?.isFoundItem
                                  ? "#81c784"
                                  : "#e57373",
                                color: "#fff",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                textShadow: "0px 0px 4px rgba(0, 0, 0, 0.7)",
                              }}
                            >
                              {completedItem.item?.isFoundItem
                                ? "Found Item"
                                : "Lost Item"}
                            </Box>
                          )}
                          <AspectRatio
                            ratio="1"
                            sx={{
                              width: { xs: "120px", sm: "100%" },
                              minWidth: { xs: "120px", sm: "auto" },
                              minHeight: { xs: "120px", sm: "220px" },
                            }}
                          >
                            <CldImage
                              priority
                              src={completedItem.item.images[0]}
                              fill
                              alt={completedItem.item.name || "Item Image"}
                              sizes="(max-width: 600px) 120px, (max-width: 960px) 50vw, 33vw"
                              style={{
                                objectFit: "cover",
                              }}
                            />
                          </AspectRatio>
                        </Box>

                        <CardContent
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: { xs: 1, sm: 2 },
                            flexGrow: 1,
                            p: { xs: 1.5, sm: 2 },
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
                              level="h6"
                              sx={{
                                fontSize: { xs: "0.875rem", sm: "1.125rem" },
                                fontWeight: 600,
                              }}
                            >
                              {completedItem.item.name}
                            </Typography>
                            {isXs && (
                              <Chip
                                size="sm"
                                variant="solid"
                                color={
                                  completedItem.item.isFoundItem
                                    ? "success"
                                    : "danger"
                                }
                              >
                                {completedItem.item.isFoundItem
                                  ? "Found Item"
                                  : "Lost Item"}
                              </Chip>
                            )}
                          </Box>

                          <Typography
                            level="body2"
                            sx={{
                              color: "text.secondary",
                              display: "-webkit-box",
                              WebkitLineClamp: { xs: 2, sm: 3 },
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              flexGrow: 1,
                            }}
                          >
                            {completedItem.item.description}
                          </Typography>

                          <Button
                            fullWidth
                            onClick={() =>
                              setCompletedItemDetailsModal(
                                completedItem.item._id
                              )
                            }
                          >
                            View Details
                          </Button>

                          <Modal
                            open={
                              completedItemDetailsModal ===
                              completedItem.item._id
                            }
                            onClose={() => setCompletedItemDetailsModal(null)}
                          >
                            <ModalDialog
                              sx={{
                                borderRadius: 4,
                                boxShadow: 6,
                                padding: 3,
                              }}
                            >
                              <ModalClose />
                              <Typography level="h4" fontWeight="bold">
                                Completed Item
                              </Typography>

                              <DialogContent
                                sx={{
                                  paddingRight: "calc(0 + 8px)", // Add extra padding to account for scrollbar width
                                  maxHeight: "85.5vh",
                                  height: "100%",
                                  overflowX: "hidden",
                                  overflowY: "scroll", // Always reserve space for scrollbar
                                  // Default scrollbar styles (invisible)
                                  "&::-webkit-scrollbar": {
                                    width: "8px", // Always reserve 8px width
                                  },
                                  "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "transparent", // Invisible by default
                                    borderRadius: "4px",
                                  },
                                  // Show scrollbar on hover
                                  "&:hover": {
                                    "&::-webkit-scrollbar-thumb": {
                                      backgroundColor: "rgba(0, 0, 0, 0.4)", // Only change the thumb color on hover
                                    },
                                  },
                                  // Firefox
                                  scrollbarWidth: "thin",
                                  scrollbarColor: "transparent transparent", // Both track and thumb transparent
                                  "&:hover": {
                                    scrollbarColor:
                                      "rgba(0, 0, 0, 0.4) transparent", // Show thumb on hover
                                  },
                                  // IE and Edge
                                  msOverflowStyle: "-ms-autohiding-scrollbar",
                                }}
                              >
                                <ItemDetails row={completedItem} />
                              </DialogContent>
                            </ModalDialog>
                          </Modal>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "200px",
                    border: "1px dashed #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    padding: 3,
                    textAlign: "center", // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: "#ccc" }}>
                    <SearchOffIcon />{" "}
                    {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    No completed items available
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    The items you lost or found has not been completed yet.
                  </Typography>
                </Box>
              )}
            </Grid>
          </>
        )}

        {activeTab === "declined-item" && (
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Declined Items
            </Typography>

            <Grid container spacing={2}>
              {declinedItems.length > 0 ? (
                declinedItems.map((declinedItem, index) => (
                  <>
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card
                        key={declinedItem._id}
                        variant="outlined"
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: { xs: "row", sm: "column" },
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "md",
                            borderColor: "neutral.outlinedHoverBorder",
                          },
                        }}
                      >
                        <Box sx={{ position: "relative", flexShrink: 0 }}>
                          {!isXs && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                zIndex: 1,
                                backgroundColor: declinedItem?.item?.isFoundItem
                                  ? "#81c784"
                                  : "#e57373",
                                color: "#fff",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                textShadow: "0px 0px 4px rgba(0, 0, 0, 0.7)",
                              }}
                            >
                              {declinedItem.item?.isFoundItem
                                ? "Found Item"
                                : "Lost Item"}
                            </Box>
                          )}
                          <AspectRatio
                            ratio="1"
                            sx={{
                              width: { xs: "120px", sm: "100%" },
                              minWidth: { xs: "120px", sm: "auto" },
                              minHeight: { xs: "120px", sm: "220px" },
                            }}
                          >
                            <CldImage
                              priority
                              src={declinedItem.item.images[0]}
                              fill
                              alt={declinedItem.item.name || "Item Image"}
                              sizes="(max-width: 600px) 120px, (max-width: 960px) 50vw, 33vw"
                              style={{
                                objectFit: "cover",
                              }}
                            />
                          </AspectRatio>
                        </Box>

                        <CardContent
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: { xs: 1, sm: 2 },
                            flexGrow: 1,
                            p: { xs: 1.5, sm: 2 },
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
                              level="h6"
                              sx={{
                                fontSize: { xs: "0.875rem", sm: "1.125rem" },
                                fontWeight: 600,
                              }}
                            >
                              {declinedItem.item.name}
                            </Typography>
                            {isXs && (
                              <Chip
                                size="sm"
                                variant="solid"
                                color={
                                  declinedItem.item.isFoundItem
                                    ? "success"
                                    : "danger"
                                }
                              >
                                {declinedItem.item.isFoundItem
                                  ? "Found Item"
                                  : "Lost Item"}
                              </Chip>
                            )}
                          </Box>

                          <Typography
                            level="body2"
                            sx={{
                              color: "text.secondary",
                              display: "-webkit-box",
                              WebkitLineClamp: { xs: 2, sm: 3 },
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              flexGrow: 1,
                            }}
                          >
                            {declinedItem.item.description}
                          </Typography>

                          <Button
                            fullWidth
                            onClick={() =>
                              setInvalidItemDetailsModal(declinedItem.item._id)
                            }
                          >
                            View Details
                          </Button>
                          <Modal
                            open={
                              invalidItemDetailsModal === declinedItem.item._id
                            }
                            onClose={() => setInvalidItemDetailsModal(null)}
                          >
                            <ModalDialog>
                              <ModalClose />
                              <Typography level="h5" fontWeight="bold">
                                Item Details
                              </Typography>

                              <DialogContent
                                sx={{
                                  paddingRight: "calc(0 + 8px)", // Add extra padding to account for scrollbar width
                                  maxHeight: "85.5vh",
                                  height: "100%",
                                  overflowX: "hidden",
                                  overflowY: "scroll", // Always reserve space for scrollbar
                                  // Default scrollbar styles (invisible)
                                  "&::-webkit-scrollbar": {
                                    width: "8px", // Always reserve 8px width
                                  },
                                  "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "transparent", // Invisible by default
                                    borderRadius: "4px",
                                  },
                                  // Show scrollbar on hover
                                  "&:hover": {
                                    "&::-webkit-scrollbar-thumb": {
                                      backgroundColor: "rgba(0, 0, 0, 0.4)", // Only change the thumb color on hover
                                    },
                                  },
                                  // Firefox
                                  scrollbarWidth: "thin",
                                  scrollbarColor: "transparent transparent", // Both track and thumb transparent
                                  "&:hover": {
                                    scrollbarColor:
                                      "rgba(0, 0, 0, 0.4) transparent", // Show thumb on hover
                                  },
                                  // IE and Edge
                                  msOverflowStyle: "-ms-autohiding-scrollbar",
                                }}
                              >
                                <ItemDetails row={declinedItem} />
                              </DialogContent>
                            </ModalDialog>
                          </Modal>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "200px",
                    border: "1px dashed #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    padding: 3,
                    textAlign: "center", // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: "#ccc" }}>
                    <SearchOffIcon />{" "}
                    {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    No declined items available.
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    If you believe this item should not have been declined,
                    please report it again.
                  </Typography>
                </Box>
              )}
            </Grid>
          </>
        )}

        {activeTab === "canceled-item" && (
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Canceled Items
            </Typography>

            <Grid container spacing={2}>
              {canceledItems.length > 0 ? (
                canceledItems.map((canceledItem, index) => (
                  <>
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card
                        key={canceledItem._id}
                        variant="outlined"
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: { xs: "row", sm: "column" },
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "md",
                            borderColor: "neutral.outlinedHoverBorder",
                          },
                        }}
                      >
                        <Box sx={{ position: "relative", flexShrink: 0 }}>
                          {!isXs && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                zIndex: 1,
                                backgroundColor: canceledItem?.item?.isFoundItem
                                  ? "#81c784"
                                  : "#e57373",
                                color: "#fff",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                textShadow: "0px 0px 4px rgba(0, 0, 0, 0.7)",
                              }}
                            >
                              {canceledItem.item?.isFoundItem
                                ? "Found Item"
                                : "Lost Item"}
                            </Box>
                          )}
                          <AspectRatio
                            ratio="1"
                            sx={{
                              width: { xs: "120px", sm: "100%" },
                              minWidth: { xs: "120px", sm: "auto" },
                              minHeight: { xs: "120px", sm: "220px" },
                            }}
                          >
                            <CldImage
                              priority
                              src={canceledItem.item.images[0]}
                              fill
                              alt={canceledItem.item.name || "Item Image"}
                              sizes="(max-width: 600px) 120px, (max-width: 960px) 50vw, 33vw"
                              style={{
                                objectFit: "cover",
                              }}
                            />
                          </AspectRatio>
                        </Box>

                        <CardContent
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: { xs: 1, sm: 2 },
                            flexGrow: 1,
                            p: { xs: 1.5, sm: 2 },
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
                              level="h6"
                              sx={{
                                fontSize: { xs: "0.875rem", sm: "1.125rem" },
                                fontWeight: 600,
                              }}
                            >
                              {canceledItem.item.name}
                            </Typography>
                            {isXs && (
                              <Chip
                                size="sm"
                                variant="solid"
                                color={
                                  canceledItem.item.isFoundItem
                                    ? "success"
                                    : "danger"
                                }
                              >
                                {canceledItem.item.isFoundItem
                                  ? "Found Item"
                                  : "Lost Item"}
                              </Chip>
                            )}
                          </Box>

                          <Typography
                            level="body2"
                            sx={{
                              color: "text.secondary",
                              display: "-webkit-box",
                              WebkitLineClamp: { xs: 2, sm: 3 },
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              flexGrow: 1,
                            }}
                          >
                            {canceledItem.item.description}
                          </Typography>

                          <Button
                            fullWidth
                            onClick={() =>
                              setInvalidItemDetailsModal(canceledItem.item._id)
                            }
                          >
                            View Details
                          </Button>
                          <Modal
                            open={
                              invalidItemDetailsModal === canceledItem.item._id
                            }
                            onClose={() => setInvalidItemDetailsModal(null)}
                          >
                            <ModalDialog>
                              <ModalClose />
                              <Typography level="h4" fontWeight="bold">
                                Item Details
                              </Typography>
                              <DialogContent
                                sx={{
                                  paddingRight: "calc(0 + 8px)", // Add extra padding to account for scrollbar width
                                  maxHeight: "85.5vh",
                                  height: "100%",
                                  overflowX: "hidden",
                                  overflowY: "scroll", // Always reserve space for scrollbar
                                  // Default scrollbar styles (invisible)
                                  "&::-webkit-scrollbar": {
                                    width: "8px", // Always reserve 8px width
                                  },
                                  "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "transparent", // Invisible by default
                                    borderRadius: "4px",
                                  },
                                  // Show scrollbar on hover
                                  "&:hover": {
                                    "&::-webkit-scrollbar-thumb": {
                                      backgroundColor: "rgba(0, 0, 0, 0.4)", // Only change the thumb color on hover
                                    },
                                  },
                                  // Firefox
                                  scrollbarWidth: "thin",
                                  scrollbarColor: "transparent transparent", // Both track and thumb transparent
                                  "&:hover": {
                                    scrollbarColor:
                                      "rgba(0, 0, 0, 0.4) transparent", // Show thumb on hover
                                  },
                                  // IE and Edge
                                  msOverflowStyle: "-ms-autohiding-scrollbar",
                                }}
                              >
                                <ItemDetails row={canceledItem} />
                              </DialogContent>
                            </ModalDialog>
                          </Modal>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "200px",
                    border: "1px dashed #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    padding: 3,
                    textAlign: "center", // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: "#ccc" }}>
                    <SearchOffIcon />{" "}
                    {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    No canceled items available.
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    If you’ve canceled an item, you can always re-report it or
                    check its status.
                  </Typography>
                </Box>
              )}
            </Grid>
          </>
        )}

        {activeTab === "requested-item" && (
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Requested Items
            </Typography>

            <Grid container spacing={2}>
              {requestedItems.length > 0 ? (
                requestedItems.map((requestedItem, index) => (
                  <>
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card
                        key={requestedItem._id}
                        variant="outlined"
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: { xs: "row", sm: "column" },
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "md",
                            borderColor: "neutral.outlinedHoverBorder",
                          },
                        }}
                      >
                        <Box sx={{ position: "relative", flexShrink: 0 }}>
                          {!isXs && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                zIndex: 1,
                                backgroundColor: requestedItem?.item
                                  ?.isFoundItem
                                  ? "#81c784"
                                  : "#e57373",
                                color: "#fff",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                textShadow: "0px 0px 4px rgba(0, 0, 0, 0.7)",
                              }}
                            >
                              {requestedItem.item?.isFoundItem
                                ? "Found Item"
                                : "Lost Item"}
                            </Box>
                          )}
                          <AspectRatio
                            ratio="1"
                            sx={{
                              width: { xs: "120px", sm: "100%" },
                              minWidth: { xs: "120px", sm: "auto" },
                              minHeight: { xs: "120px", sm: "220px" },
                            }}
                          >
                            <CldImage
                              priority
                              src={requestedItem.item.images[0]}
                              fill
                              alt={requestedItem.item.name || "Item Image"}
                              sizes="(max-width: 600px) 120px, (max-width: 960px) 50vw, 33vw"
                              style={{
                                objectFit: "cover",
                              }}
                            />
                          </AspectRatio>
                        </Box>

                        <CardContent
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: { xs: 1, sm: 2 },
                            flexGrow: 1,
                            p: { xs: 1.5, sm: 2 },
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
                              level="h6"
                              sx={{
                                fontSize: { xs: "0.875rem", sm: "1.125rem" },
                                fontWeight: 600,
                              }}
                            >
                              {requestedItem.item.name}
                            </Typography>
                            {isXs && (
                              <Chip
                                size="sm"
                                variant="solid"
                                color={
                                  requestedItem.item.isFoundItem
                                    ? "success"
                                    : "danger"
                                }
                              >
                                {requestedItem.item.isFoundItem
                                  ? "Found Item"
                                  : "Lost Item"}
                              </Chip>
                            )}
                          </Box>

                          <Typography
                            level="body2"
                            sx={{
                              color: "text.secondary",
                              display: "-webkit-box",
                              WebkitLineClamp: { xs: 2, sm: 3 },
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              flexGrow: 1,
                            }}
                          >
                            {requestedItem.item.description}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 1,
                              mt: 2,
                            }}
                          >
                            <Button
                              variant="contained"
                              sx={{
                                minWidth: 0,
                                padding: "6px 8px",
                                borderRadius: "8px",
                              }}
                              onClick={() =>
                                setOpenDetails(requestedItem?.item?._id)
                              }
                            >
                              <InfoIcon color="action" />
                            </Button>

                            <Modal
                              open={openDetails === requestedItem?.item?._id}
                              onClose={() => setOpenDetails(null)}
                            >
                              <ModalDialog>
                                <ModalClose />
                                <Typography
                                  level="h5"
                                  sx={{ mb: 2, fontWeight: "bold" }}
                                >
                                  Item Details
                                </Typography>
                                <DialogContent
                                  sx={{
                                    paddingRight: "calc(0 + 8px)", // Add extra padding to account for scrollbar width
                                    maxHeight: "85.5vh",
                                    height: "100%",
                                    overflowX: "hidden",
                                    overflowY: "scroll", // Always reserve space for scrollbar
                                    // Default scrollbar styles (invisible)
                                    "&::-webkit-scrollbar": {
                                      width: "8px", // Always reserve 8px width
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                      backgroundColor: "transparent", // Invisible by default
                                      borderRadius: "4px",
                                    },
                                    // Show scrollbar on hover
                                    "&:hover": {
                                      "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: "rgba(0, 0, 0, 0.4)", // Only change the thumb color on hover
                                      },
                                    },
                                    // Firefox
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "transparent transparent", // Both track and thumb transparent
                                    "&:hover": {
                                      scrollbarColor:
                                        "rgba(0, 0, 0, 0.4) transparent", // Show thumb on hover
                                    },
                                    // IE and Edge
                                    msOverflowStyle: "-ms-autohiding-scrollbar",
                                  }}
                                >
                                  <ItemDetails
                                    locationOptions={locationOptions}
                                    row={requestedItem}
                                    refreshData={fetchItems}
                                    setOpenSnackbar={setOpenSnackbar}
                                    setMessage={setMessage}
                                  />
                                </DialogContent>
                              </ModalDialog>
                            </Modal>
                            <Button
                              fullWidth
                              color="danger"
                              sx={{ padding: "6px 0" }}
                              onClick={() =>
                                setCancelRequestModal(requestedItem.item._id)
                              }
                            >
                              Cancel Request
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <CancelRequest
                      open={cancelRequestModal}
                      onClose={() => setCancelRequestModal(null)}
                      item={requestedItem.item}
                      api={
                        requestedItem.item?.isFoundItem
                          ? "found-items"
                          : "lost-items"
                      }
                      refreshData={fetchItems}
                      setMessage={setMessage}
                      setOpenSnackbar={setOpenSnackbar}
                    />
                  </>
                ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "200px",
                    border: "1px dashed #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    padding: 3,
                    textAlign: "center", // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: "#ccc" }}>
                    <SearchOffIcon />{" "}
                    {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    No requested items available.
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    If you’re looking for something specific, please feel free
                    to create a request.
                  </Typography>
                </Box>
              )}
            </Grid>
          </>
        )}
      </Box>
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

export default MyItemsComponent;
