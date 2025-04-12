"use client";

import {
  Table,
  Button,
  Snackbar,
  Chip,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Divider,
  Badge,
  CircularProgress,
} from "@mui/joy";
import {
  Paper,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  useMediaQuery,
} from "@mui/material";
import React, { useState } from "react";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import ItemRequestApproveModal from "../Modal/ItemRequestApproveModal";
import ItemValidatingModal from "../Modal/ItemValidatingModal";
import ItemPublishedModal from "../Modal/ItemPublishedModal";
import ItemMissingModal from "../Modal/ItemMissingModal";
import ItemClaimRequestModal from "../Modal/ItemClaimRequestModal";
import ItemReservedModal from "../Modal/ItemReservedModal";
import { format } from "date-fns";

const ItemsTable = ({
  items,
  fetchItems,
  session,
  isFoundItem,
  status,
  locationOptions,
  currentPage,
  setCurrentPage,
  setMessage,
  setOpenSnackbar,
}) => {
  const [approveModal, setApproveModal] = useState(null);
  const [openDeclinedModal, setOpenDeclinedModal] = useState(null);
  const [openCanceledModal, setOpenCanceledModal] = useState(null);
  const [openValidatingModal, setOpenValidatingModal] = useState(null);
  const [openPublishedModal, setOpenPublishedModal] = useState(null);
  const [openMissingModal, setOpenMissingModal] = useState(null);
  const [openClaimRequestModal, setOpenClaimRequestModal] = useState(null);
  const [openReservedModal, setOpenReservedModal] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Tracks rows per page
  const isMobile = useMediaQuery("(max-width:600px)");

  // Handle changing the page
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage + 1);
  };

  // Handle changing the number of rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page
  };

  const sortedData = [...items].sort((a, b) => {
    const getLatestDate = (row) => {
      return new Date(
        row.item.datePublished ||
          row.item.dateValidating ||
          row.item.dateRequest ||
          row.item.dateMissing ||
          row.item.dateCanceled ||
          row.item.dateDeclined ||
          0
      );
    };

    return getLatestDate(b) - getLatestDate(a);
  });

  const paginatedItems = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const ModalButton = ({
    status,
    row,
    setModal,
    modalState,
    ModalComponent,
    isSession,
    fetchItems,
    snackbarMessage,
    isOpenSnackbar,
    locationOptions,
  }) => {
    return (
      status === row.item.status && (
        <>
          <Button onClick={() => setModal(row._id)} size="small">
            View Details
          </Button>
          <ModalComponent
            row={row}
            open={modalState}
            onClose={() => setModal(null)}
            session={isSession}
            refreshData={fetchItems}
            setMessage={snackbarMessage}
            setOpenSnackbar={isOpenSnackbar}
            locationOptions={locationOptions}
          />
        </>
      )
    );
  };

  return (
    <>
      {isMobile ? (
        <>
          {paginatedItems.length !== 0 ? (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {paginatedItems.map((row) => (
                  <Card
                    key={row._id}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    <CardContent>
                      <Typography level="h6">
                        <strong>
                          Item {isFoundItem ? "Finder" : "Owner"}:
                        </strong>{" "}
                        {row?.user?.firstname && row?.user?.lastname
                          ? `${row.user.firstname} ${row.user.lastname}`
                          : "Deleted User"}
                      </Typography>

                      <Typography level="body1">
                        <strong>Item Name:</strong> {row.item.name}
                      </Typography>
                      <Typography level="body2" color="text.secondary">
                        <strong>Date:</strong>{" "}
                        {(() => {
                          const dateMap = row.item.isFoundItem
                            ? {
                                Published: row.item.datePublished,
                                Request: row.item.dateRequest,
                                "Surrender Pending": row.item.dateValidating,
                                Declined: row.item.dateDeclined,
                                Canceled: row.item.dateCanceled,
                              }
                            : {
                                Missing: row.item.dateMissing,
                                Request: row.item.dateRequest,
                                Declined: row.item.dateDeclined,
                                Canceled: row.item.dateCanceled,
                              };

                          const selectedDate = dateMap[row.item.status];

                          return selectedDate
                            ? format(
                                new Date(selectedDate),
                                "MMMM dd, yyyy - hh:mm a"
                              )
                            : "N/A";
                        })()}
                      </Typography>
                      {isFoundItem && status === "Request" && (
                        <Chip
                          variant="solid"
                          color={
                            row.item.status === "Request"
                              ? "warning"
                              : "neutral"
                          }
                          sx={{ mt: 1 }}
                        >
                          {row.item.status}
                        </Chip>
                      )}
                    </CardContent>
                    <CardActions>
                      <ModalButton
                        status="Request"
                        row={row}
                        setModal={setApproveModal}
                        modalState={approveModal}
                        ModalComponent={ItemRequestApproveModal}
                        isSession={session}
                        fetchItems={fetchItems}
                        snackbarMessage={setMessage}
                        isOpenSnackbar={setOpenSnackbar}
                      />
                      <ModalButton
                        status="Surrender Pending"
                        row={row}
                        setModal={setOpenValidatingModal}
                        modalState={openValidatingModal}
                        ModalComponent={ItemValidatingModal}
                        isSession={session}
                        fetchItems={fetchItems}
                        snackbarMessage={setMessage}
                        isOpenSnackbar={setOpenSnackbar}
                      />
                      <ModalButton
                        status="Published"
                        row={row}
                        setModal={setOpenPublishedModal}
                        modalState={openPublishedModal}
                        ModalComponent={ItemPublishedModal}
                        isSession={session}
                        fetchItems={fetchItems}
                        snackbarMessage={setMessage}
                        isOpenSnackbar={setOpenSnackbar}
                        locationOptions={locationOptions}
                      />
                      <ModalButton
                        status="Declined"
                        row={row}
                        setModal={setOpenDeclinedModal}
                        modalState={openDeclinedModal}
                        ModalComponent={ItemPublishedModal}
                        isSession={session}
                        fetchItems={fetchItems}
                        snackbarMessage={setMessage}
                        isOpenSnackbar={setOpenSnackbar}
                      />
                      <ModalButton
                        status="Canceled"
                        row={row}
                        setModal={setOpenCanceledModal}
                        modalState={openCanceledModal}
                        ModalComponent={ItemPublishedModal}
                        isSession={session}
                        fetchItems={fetchItems}
                        snackbarMessage={setMessage}
                        isOpenSnackbar={setOpenSnackbar}
                      />
                      <ModalButton
                        status="Missing"
                        row={row}
                        setModal={setOpenMissingModal}
                        modalState={openMissingModal}
                        ModalComponent={ItemMissingModal}
                        isSession={session}
                        fetchItems={fetchItems}
                        snackbarMessage={setMessage}
                        isOpenSnackbar={setOpenSnackbar}
                        locationOptions={locationOptions}
                      />
                    </CardActions>
                  </Card>
                ))}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    window.scrollTo(0, 0);
                  }}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Typography sx={{ mx: 2 }}>
                  Page {currentPage} of {Math.ceil(items.length / rowsPerPage)}
                </Typography>
                <Button
                  onClick={() => {
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(items.length / rowsPerPage))
                    );
                    window.scrollTo(0, 0);
                  }}
                  disabled={
                    currentPage === Math.ceil(items.length / rowsPerPage)
                  }
                >
                  Next
                </Button>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                mt: 3,
              }}
            >
              <Typography level="title-sm">
                No items found for the current filter.
              </Typography>
              <Typography level="title-sm">
                Try adjusting the filters or check back later.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <EmojiObjectsIcon
                  sx={{ fontSize: 50, color: "text.secondary" }}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={() => fetchItems()}
                sx={{ mt: 2 }}
              >
                Retry
              </Button>
            </Box>
          )}
        </>
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              borderRadius: 2,
              maxWidth: "100%",
              width: "100%",
              height: "340px",
            }}
          >
            <Table
              variant="outlined"
              sx={{
                minWidth: 650,
                borderCollapse: "collapse",
                "@media (max-width: 600px)": {
                  minWidth: 600,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    Item {isFoundItem ? "Finder" : "Owner"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    Item Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      width: "25%",
                    }}
                  >
                    Date
                  </TableCell>
                  {isFoundItem && status === "Request" && (
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      Status
                    </TableCell>
                  )}
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              {paginatedItems.length !== 0 ? (
                <>
                  <TableBody>
                    {paginatedItems.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell>
                          {row?.user?.firstname && row?.user?.lastname
                            ? `${row.user.firstname} ${row.user.lastname}`
                            : "Deleted User"}
                        </TableCell>
                        <TableCell>{row.item.name}</TableCell>
                        <TableCell sx={{ width: "25%" }}>
                          {row.item.isFoundItem
                            ? {
                                Published: row.item.datePublished,
                                Request: row.item.dateRequest,
                                "Surrender Pending": row.item.dateValidating,
                                Declined: row.item.dateDeclined,
                                Canceled: row.item.dateCanceled,
                              }[row.item.status]
                              ? format(
                                  new Date(
                                    {
                                      Published: row.item.datePublished,
                                      Request: row.item.dateRequest,
                                      "Surrender Pending":
                                        row.item.dateValidating,
                                      Declined: row.item.dateDeclined,
                                      Canceled: row.item.dateCanceled,
                                    }[row.item.status]
                                  ),
                                  "MMMM dd, yyyy - hh:mm a"
                                )
                              : "N/A"
                            : {
                                Missing: row.item.dateMissing,
                                Request: row.item.dateRequest,
                                Declined: row.item.dateDeclined,
                                Canceled: row.item.dateCanceled,
                              }[row.item.status]
                            ? format(
                                new Date(
                                  {
                                    Missing: row.item.dateMissing,
                                    Request: row.item.dateRequest,
                                    Declined: row.item.dateDeclined,
                                    Canceled: row.item.dateCanceled,
                                  }[row.item.status]
                                ),
                                "MMMM dd, yyyy - hh:mm a"
                              )
                            : "N/A"}
                        </TableCell>
                        {isFoundItem && status === "Request" && (
                          <TableCell>
                            <Chip
                              variant="solid"
                              color={
                                row.item.status === "Request"
                                  ? "warning"
                                  : "neutral"
                              }
                            >
                              {row.item.status}
                            </Chip>
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                          }}
                        >
                          <ModalButton
                            status="Request"
                            row={row}
                            setModal={setApproveModal}
                            modalState={approveModal}
                            ModalComponent={ItemRequestApproveModal}
                            isSession={session}
                            fetchItems={fetchItems}
                            snackbarMessage={setMessage}
                            isOpenSnackbar={setOpenSnackbar}
                          />
                          <ModalButton
                            status="Surrender Pending"
                            row={row}
                            setModal={setOpenValidatingModal}
                            modalState={openValidatingModal}
                            ModalComponent={ItemValidatingModal}
                            isSession={session}
                            fetchItems={fetchItems}
                            snackbarMessage={setMessage}
                            isOpenSnackbar={setOpenSnackbar}
                          />
                          <ModalButton
                            status="Published"
                            row={row}
                            setModal={setOpenPublishedModal}
                            modalState={openPublishedModal}
                            ModalComponent={ItemPublishedModal}
                            isSession={session}
                            fetchItems={fetchItems}
                            snackbarMessage={setMessage}
                            isOpenSnackbar={setOpenSnackbar}
                            locationOptions={locationOptions}
                          />
                          <ModalButton
                            status="Declined"
                            row={row}
                            setModal={setOpenDeclinedModal}
                            modalState={openDeclinedModal}
                            ModalComponent={ItemPublishedModal}
                            isSession={session}
                            fetchItems={fetchItems}
                            snackbarMessage={setMessage}
                            isOpenSnackbar={setOpenSnackbar}
                          />
                          <ModalButton
                            status="Canceled"
                            row={row}
                            setModal={setOpenCanceledModal}
                            modalState={openCanceledModal}
                            ModalComponent={ItemPublishedModal}
                            isSession={session}
                            fetchItems={fetchItems}
                            snackbarMessage={setMessage}
                            isOpenSnackbar={setOpenSnackbar}
                          />
                          <ModalButton
                            status="Missing"
                            row={row}
                            setModal={setOpenMissingModal}
                            modalState={openMissingModal}
                            ModalComponent={ItemMissingModal}
                            isSession={session}
                            fetchItems={fetchItems}
                            snackbarMessage={setMessage}
                            isOpenSnackbar={setOpenSnackbar}
                            locationOptions={locationOptions}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center", // Center content vertically
                    gap: 2,
                    py: 4,
                    border: "none", // Remove any borders if applied
                    width:
                      status === "Request" || status === "Surrender Pending"
                        ? "500%"
                        : "400%", // Ensure it spans the width of its parent container
                    height: "100%",
                    backgroundColor: "transparent", // Avoid background interference
                    boxSizing: "border-box", // Include padding and border in width and height
                  }}
                >
                  <Typography level="h6" color="text.secondary">
                    No items found for the current filter.
                  </Typography>
                  <Typography level="body2" color="text.secondary">
                    Try adjusting the filters or check back later.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <EmojiObjectsIcon
                      sx={{ fontSize: 50, color: "text.secondary" }}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => fetchItems()}
                    sx={{ mt: 2 }}
                  >
                    Retry
                  </Button>
                </Box>
              )}
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={5}
            component="div"
            count={items.length}
            rowsPerPage={rowsPerPage}
            page={currentPage - 1} // Convert to zero-based index for TablePagination
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </>
  );
};

export default ItemsTable;
