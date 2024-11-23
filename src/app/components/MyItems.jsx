'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import { Grid, Typography, Button, Modal, ModalDialog, ModalClose, DialogContent, Tabs, TabList, Tab, ListItemDecorator, Badge, Select, Option, Chip } from '@mui/joy';
import { Box, Card, CardContent } from '@mui/material';
import { CldImage } from 'next-cloudinary';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import InfoIcon from '@mui/icons-material/Info';
import ConfirmationRetrievalRequest from './Modal/ConfirmationRetrievalRequest';
import CancelRequest from './Modal/CancelRequest';
import RatingsModal from './Modal/Ratings';
import ItemDetails from './Modal/ItemDetails';
import { useTheme, useMediaQuery } from '@mui/material';

const MyItemsComponent = ({ session, status }) => {
  const [completedItemDetailsModal, setCompletedItemDetailsModal] = useState(null);
  const [invalidItemDetailsModal, setInvalidItemDetailsModal] = useState(null);
  const [cancelRequestModal, setCancelRequestModal] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);
  const [declinedItems, setDeclinedItems] = useState([]);
  const [canceledItems, setCanceledItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [requestedItems, setRequestedItems] = useState([]);
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [openDetails, setOpenDetails] = useState(null);
  const [confirmationRetrievalModal, setConfirmationRetrievalModal] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // State to track the active tab
  const [ratingModal, setRatingModal] = useState(null);
  const router = useRouter();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('lg'));

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };


  const fetchItems = useCallback(async () => {
    if (!session?.user?.id) {
      console.error('User is not logged in or session is not available');
      return;
    }

    try {
      // Fetch user-specific items and ratings concurrently
      const [itemsResponse, ratingsResponse, foundItemsResponse] = await Promise.all([
        fetch(`/api/items/${session.user.id}`),
        fetch('/api/ratings'),
        fetch('/api/finder'),
      ]);

      if (!itemsResponse.ok || !ratingsResponse.ok || !foundItemsResponse.ok) {
        throw new Error('Failed to fetch data from one or more endpoints');
      }

      const [itemsData, ratingsData, foundItemsData] = await Promise.all([
        itemsResponse.json(),
        ratingsResponse.json(),
        foundItemsResponse.json(),
      ]);

      // Filter ratings for the current user
      const filteredRatings = ratingsData.filter(
        (rating) => rating.sender?._id.toString() === session.user.id
      );

      // Categorize user-specific items
      const lostItems = itemsData.filter(
        (item) =>
          !item.item.isFoundItem && ['Missing', 'Unclaimed'].includes(item.item.status)
      );
      const foundItems = itemsData.filter(
        (item) =>
          item.item.isFoundItem && !['Request', 'Resolved', 'Declined', 'Canceled'].includes(item.item.status)
      );
      const requestedItems = itemsData.filter((item) => item.item.status === 'Request');
      const declinedItems = itemsData.filter((item) => item.item.status === 'Declined');
      const canceledItems = itemsData.filter((item) => item.item.status === 'Canceled');

      // Set categorized items
      setLostItems(lostItems);
      setFoundItems(foundItems);
      setCompletedItems(filteredRatings);
      setRequestedItems(requestedItems);
      setDeclinedItems(declinedItems);
      setCanceledItems(canceledItems);

      // Filter potential matches for lost items
      const otherFoundItems = foundItemsData.filter(
        (fItem) => fItem?.user?._id !== session.user.id && fItem?.item?.status === 'Published'
      );

      // Fetch cosine similarity for lost items and potential matches
      const matches = await Promise.all(
        lostItems.map(async (lostItem) => {
          const matchedItems = await Promise.all(
            otherFoundItems.map(async (foundItem) => {
              const response = await fetch('/api/similarity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lostItem, foundItem }),
              });

              const similarity = await response.json();
              return { foundItem, similarity };
            })
          );

          // Sort and filter matches
          const sortedMatches = matchedItems
            .filter((match) => match.similarity >= 50) // Threshold for similarity
            .sort((a, b) => b.similarity - a.similarity);

          return { lostItem, matches: sortedMatches };
        })
      );

      // Set suggested matches
      setSuggestedMatches(matches);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchItems();
    }
  }, [status, fetchItems]);

  return (
    <>
      <TitleBreadcrumbs title="List of My Items" text="My Items" />

      {isMd ? (
        <>
          <Box sx={{ width: '100%', mb: 5 }}>
            <Tabs value={activeTab} onChange={handleChange} aria-label="Icon tabs" defaultValue={0}>
              <TabList>
                <Badge badgeContent={lostItems.length}>
                  <Tab>
                    <Typography level="body-md">Lost Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={foundItems.length}>
                  <Tab>
                    <Typography level="body-md">Found Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={completedItems.length}>
                  <Tab>
                    <Typography level="body-md">Completed Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={declinedItems.length}>
                  <Tab>
                    <Typography level="body-md">Declined Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={canceledItems.length}>
                  <Tab>
                    <Typography level="body-md">Canceled Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={requestedItems.length}>
                  <Tab>
                    <Typography level="body-md">Requested Items</Typography>
                  </Tab>
                </Badge>
                <Badge badgeContent={suggestedMatches.reduce((total, item) => total + (item.matches?.length || 0), 0)}>
                  <Tab>
                    <Typography level="body-md">Suggested Items</Typography>
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
            onChange={handleChange}
          >
            <Option value={0} label="Lost Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Lost Items
              {lostItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{lostItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value={1} label="Found Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Found Items
              {foundItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{foundItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value={2} label="Completed Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Completed Items
              {completedItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{completedItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value={3} label="Declined Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Declined Items
              {declinedItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{declinedItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value={4} label="Canceled Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Canceled Items
              {canceledItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{canceledItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value={5} label="Requested Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Requested Items
              {requestedItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{requestedItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value={6} label="Suggested Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Suggested Items
              {suggestedMatches.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{suggestedMatches.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
          </Select>
        </>
      )}

      <Box sx={{ padding: '1rem' }}>
        {
          activeTab === 0 &&
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
              <Typography level="h4" gutterBottom>
                Lost Items
              </Typography>
              <Button startDecorator={<AddIcon />} onClick={() => router.push('/my-items/report-lost-item')}>
                Report Lost Item
              </Button>
            </Box>

            {/* Grid layout for the Lost Items */}
            <Grid container spacing={2}>
              {lostItems.length > 0 ?
                lostItems.map((lostItem, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}> {/* Adjust grid item sizes for different screen widths */}
                    <Card
                      sx={{
                        maxWidth: 250,
                        flexShrink: 0,
                        boxShadow: 3,
                        borderRadius: 2,
                        overflow: 'hidden', // Ensures that content doesn't overflow the card
                        position: 'relative', // Allows absolutely positioning elements inside
                      }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: lostItem.item?.status === 'Matched' ? '#81c784' : lostItem.item.status === 'Surrender Pending' ? '#e57373' : 'blue',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textShadow: '0px 0px 4px rgba(0, 0, 0, 0.7)', // Slight shadow for text readability
                        }}
                      >
                        {lostItem.item?.status}
                      </Box>
                      <CldImage
                        priority
                        src={lostItem.item.images[0]}
                        width={250} // Adjusted width to match smaller card size
                        height={250} // Adjusted height to match smaller card size
                        alt={lostItem.item.name || "Item Image"}
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'fill' }}
                      />
                      <CardContent sx={{ flex: 1, paddingLeft: 2 }}>
                        <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          {lostItem.item.name}
                        </Typography>
                        <Typography
                          level="body2"
                          sx={{
                            color: 'text.secondary',
                            marginBottom: '0.5rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '250px', // Adjust the width as needed
                          }}
                        >
                          {lostItem.item.description}
                        </Typography>
                        <Button fullWidth onClick={() => router.push(`my-items/lost-item/${lostItem.item._id}`)}>
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                )) :
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '200px',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    padding: 2,
                    gridColumn: 'span 4', // Make the "No lost items" message span across the grid
                  }}
                >
                  <Typography>No lost items found.</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you have lost something, please report it.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }


        {
          activeTab === 1 &&
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
              <Typography level="h4" gutterBottom>
                Found Items
              </Typography>
              <Button startDecorator={<AddIcon />} onClick={() => router.push('my-items/report-found-item')}>
                Report Found Item
              </Button>
            </Box>

            <Grid container spacing={2}>
              {foundItems.length > 0 ?
                foundItems.map((foundItem, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card
                      sx={{
                        maxWidth: 250,
                        flexShrink: 0,
                        boxShadow: 3,
                        borderRadius: 2,
                        overflow: 'hidden', // Ensures that content doesn't overflow the card
                        position: 'relative', // Allows absolutely positioning elements inside
                      }} // Adjusted maxWidth
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: foundItem.item?.status === 'Matched' ? '#81c784' : foundItem.item.status === 'Surrender Pending' ? '#e57373' : 'blue',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textShadow: '0px 0px 4px rgba(0, 0, 0, 0.7)', // Slight shadow for text readability
                        }}
                      >
                        {foundItem.item?.status}
                      </Box>
                      <CldImage
                        priority
                        src={foundItem.item.images[0]}
                        width={250} // Adjusted width to match smaller card size
                        height={250} // Adjusted height to match smaller card size
                        alt={foundItem.item.name || "Item Image"}
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'fill' }}
                      />
                      <CardContent>
                        <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{foundItem.item.name}</Typography>
                        <Typography
                          level="body2"
                          sx={{
                            color: 'text.secondary',
                            marginBottom: '0.5rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '250px', // Adjust the width as needed
                          }}>
                          {foundItem.item.description}
                        </Typography>
                        <Button fullWidth onClick={() => router.push(`my-items/found-item/${foundItem.item._id}`)}>View Details</Button>
                      </CardContent>
                    </Card>
                  </Grid>
                )) :
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '200px',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    padding: 2,
                  }}
                >
                  <Typography>No found items available.</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you have found something, please report it.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }

        {
          activeTab === 2 &&
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Completed Items
            </Typography>
            <Grid container spacing={2}>
              {completedItems.length > 0 ?
                completedItems.map((completedItem, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card
                      sx={{
                        maxWidth: 250,
                        flexShrink: 0,
                        boxShadow: 3,
                        borderRadius: 2,
                        overflow: 'hidden', // Ensures that content doesn't overflow the card
                        position: 'relative', // Allows absolutely positioning elements inside
                      }}
                    >
                      {/* Identifier at the top-left of the image */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: completedItem.item?.isFoundItem ? '#81c784' : '#e57373',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textShadow: '0px 0px 4px rgba(0, 0, 0, 0.7)', // Slight shadow for text readability
                        }}
                      >
                        {completedItem.item?.isFoundItem ? 'Found Item' : 'Lost Item'}
                      </Box>

                      <CldImage
                        priority
                        src={completedItem.item.images[0]}
                        width={250}
                        height={250}
                        alt={completedItem.item.name || "Item Image"}
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'fill' }}
                      />
                      <CardContent>
                        <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                          {completedItem.item.name}
                        </Typography>
                        <Typography
                          level="body2"
                          sx={{
                            color: 'text.secondary',
                            marginBottom: '0.5rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '250px', // Adjust the width as needed
                          }}
                        >
                          {completedItem.item.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                          <Button
                            variant="contained"
                            sx={{ minWidth: '0', padding: '6px 8px' }}
                            onClick={() => setCompletedItemDetailsModal(completedItem.item._id)}
                          >
                            <InfoIcon color="action" />
                          </Button>

                          <Modal open={completedItemDetailsModal === completedItem.item._id} onClose={() => setCompletedItemDetailsModal(null)}>
                            <ModalDialog sx={{ borderRadius: 4, boxShadow: 6, padding: 3 }}>
                              <ModalClose />
                              <Typography level="h4" fontWeight="bold">
                                Completed Item
                              </Typography>

                              <DialogContent sx={{ overflowX: 'hidden' }}>
                                <ItemDetails row={completedItem} />
                              </DialogContent>
                            </ModalDialog>
                          </Modal>
                          <Button
                            color={completedItem?.done_review ? 'primary' : 'success'}
                            fullWidth
                            sx={{ padding: '6px 0' }}
                            onClick={() => setRatingModal(completedItem._id)}
                          >
                            {completedItem?.done_review ? 'View Review' : 'Leave Review'}
                          </Button>
                          <RatingsModal open={ratingModal} onClose={() => setRatingModal(null)} item={completedItem} session={session} refreshData={fetchItems} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )) :
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '200px',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    padding: 2,
                  }}
                >
                  <Typography>No found items available.</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you have found something, please report it.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }

        {
          activeTab === 3 &&
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Declined Items
            </Typography>

            <Grid container spacing={2}>
              {declinedItems.length > 0 ?
                declinedItems.map((declinedItem, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card
                      sx={{
                        maxWidth: 250,
                        flexShrink: 0,
                        boxShadow: 3,
                        borderRadius: 2,
                        overflow: 'hidden', // Ensures that content doesn't overflow the card
                        position: 'relative', // Allows absolutely positioning elements inside
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: declinedItem.item?.isFoundItem ? '#81c784' : '#e57373',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textShadow: '0px 0px 4px rgba(0, 0, 0, 0.7)', // Slight shadow for text readability
                        }}
                      >
                        {declinedItem.item?.isFoundItem ? 'Found Item' : 'Lost Item'}
                      </Box>

                      <CldImage
                        priority
                        src={declinedItem.item.images[0]}
                        width={250}
                        height={250}
                        alt={declinedItem.item.name || "Item Image"}
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'fill' }}
                      />
                      <CardContent>
                        <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{declinedItem.item.name}</Typography>
                        <Typography
                          level="body2"
                          sx={{
                            color: 'text.secondary',
                            marginBottom: '0.5rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '250px', // Adjust the width as needed
                          }}>
                          {declinedItem.item.description}
                        </Typography>
                        <Button fullWidth onClick={() => setInvalidItemDetailsModal(declinedItem.item._id)}>View Details</Button>
                        <Modal open={invalidItemDetailsModal === declinedItem.item._id} onClose={() => setInvalidItemDetailsModal(null)}>
                          <ModalDialog>
                            <ModalClose />
                            <Typography level="h5" fontWeight="bold" >
                              Item Details
                            </Typography>

                            <DialogContent>
                              <ItemDetails row={declinedItem} />
                            </DialogContent>
                          </ModalDialog>
                        </Modal>
                      </CardContent>
                    </Card>
                  </Grid>
                )) :
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '200px',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    padding: 2,
                  }}
                >
                  <Typography>No declined items available.</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you have found something, please report it.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }

        {
          activeTab === 4 &&
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Canceled Items
            </Typography>

            <Grid container spacing={2}>
              {canceledItems.length > 0 ?
                canceledItems.map((canceledItem, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card
                      sx={{
                        maxWidth: 250,
                        flexShrink: 0,
                        boxShadow: 3,
                        borderRadius: 2,
                        overflow: 'hidden', // Ensures that content doesn't overflow the card
                        position: 'relative', // Allows absolutely positioning elements inside
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: canceledItem.item?.isFoundItem ? '#81c784' : '#e57373',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textShadow: '0px 0px 4px rgba(0, 0, 0, 0.7)', // Slight shadow for text readability
                        }}
                      >
                        {canceledItem.item?.isFoundItem ? 'Found Item' : 'Lost Item'}
                      </Box>

                      <CldImage
                        priority
                        src={canceledItem.item.images[0]}
                        width={250}
                        height={250}
                        alt={canceledItem.item.name || "Item Image"}
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'fill' }}
                      />
                      <CardContent>
                        <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{canceledItem.item.name}</Typography>
                        <Typography
                          level="body2"
                          sx={{
                            color: 'text.secondary',
                            marginBottom: '0.5rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '250px', // Adjust the width as needed
                          }}>
                          {canceledItem.item.description}
                        </Typography>
                        <Button fullWidth onClick={() => setInvalidItemDetailsModal(canceledItem.item._id)}>View Details</Button>
                        <Modal open={invalidItemDetailsModal === canceledItem.item._id} onClose={() => setInvalidItemDetailsModal(null)}>
                          <ModalDialog>
                            <ModalClose />
                            <Typography level="h4" fontWeight="bold">
                              Item Details
                            </Typography>
                            <DialogContent>
                              <ItemDetails row={canceledItem} />
                            </DialogContent>
                          </ModalDialog>
                        </Modal>
                      </CardContent>
                    </Card>
                  </Grid>
                )) :
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '200px',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    padding: 2,
                  }}
                >
                  <Typography>No canceled items available.</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you have found something, please report it.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }

        {
          activeTab === 5 &&
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Requested Items
            </Typography>

            <Grid container spacing={2}>
              {requestedItems.length > 0 ?
                requestedItems.map((requestedItem, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card
                      sx={{
                        maxWidth: 250,
                        flexShrink: 0,
                        boxShadow: 3,
                        borderRadius: 2,
                        overflow: 'hidden', // Ensures that content doesn't overflow the card
                        position: 'relative', // Allows absolutely positioning elements inside
                      }}
                    >
                      {/* Identifier at the top-left of the image */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: requestedItem.item?.isFoundItem ? '#81c784' : '#e57373',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textShadow: '0px 0px 4px rgba(0, 0, 0, 0.7)', // Slight shadow for text readability
                        }}
                      >
                        {requestedItem.item?.isFoundItem ? 'Found' : 'Lost'} Item
                      </Box>

                      <CldImage
                        priority
                        src={requestedItem.item.images[0]}
                        width={250}
                        height={250}
                        alt={requestedItem.item.name || "Item Image"}
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'fill' }}
                      />
                      <CardContent>
                        <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                          {requestedItem.item.name}
                        </Typography>
                        <Typography
                          level="body2"
                          sx={{
                            color: 'text.secondary',
                            marginBottom: '0.5rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '250px', // Adjust the width as needed
                          }}
                        >
                          {requestedItem.item.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                          <Button
                            variant="contained"
                            sx={{ minWidth: 0, padding: '6px 8px', borderRadius: '8px' }}
                            onClick={() => setOpenDetails(requestedItem?.item?._id)}
                          >
                            <InfoIcon color="action" />
                          </Button>

                          <Modal open={openDetails} onClose={() => setOpenDetails(null)}>
                            <ModalDialog>
                              <ModalClose />
                              <Typography level="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Item Details
                              </Typography>
                              <DialogContent>
                                <ItemDetails row={requestedItem} />
                              </DialogContent>
                            </ModalDialog>
                          </Modal>
                          <Button
                            fullWidth
                            color="danger"
                            sx={{ padding: '6px 0' }}
                            onClick={() => setCancelRequestModal(requestedItem.item._id)}
                          >
                            Cancel Request
                          </Button>
                          <CancelRequest open={cancelRequestModal} onClose={() => setCancelRequestModal(null)} item={requestedItem.item} api={requestedItem.item?.isFoundItem ? 'found-items' : 'lost-items'} refreshData={fetchItems} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )) :
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '200px',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    padding: 2,
                  }}
                >
                  <Typography>No requested items available.</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you found or lost an item, kindly report it.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }

        {
          activeTab === 6 &&
          <>
            <Box sx={{ mb: 5 }}>
              <Typography level="h4" gutterBottom>
                Suggested Matches
              </Typography>
              <Typography level="body-sm" color="neutral" sx={{ marginTop: 1 }}>
                These are the found items matched based on your lost items
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {suggestedMatches.length > 0 && suggestedMatches.some(({ matches }) => matches.length > 0) ? (
                suggestedMatches.flatMap(({ lostItem, matches }) =>
                  matches.map((match, index) => {
                    const { foundItem } = match;
                    return lostItem.item.status === 'Missing' && (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Card
                          sx={{
                            maxWidth: 250,
                            flexShrink: 0,
                            boxShadow: 3,
                            borderRadius: 2,
                          }}
                        >
                          <CldImage
                            priority
                            src={foundItem.item.images[0]}
                            width={250}
                            height={250}
                            alt={foundItem.item.name || "Item Image"}
                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'fill', borderRadius: '8px 8px 0 0' }}
                          />
                          <CardContent>
                            <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                              {foundItem.item.name}
                            </Typography>
                            <Typography
                              level="body2"
                              sx={{
                                color: 'text.secondary',
                                marginBottom: '0.5rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '250px',
                              }}
                            >
                              {foundItem.item.description}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                              <Button
                                onClick={() =>
                                  router.push(
                                    `/my-items/${lostItem.item._id}/matchedTo/${foundItem.item._id}?owner=${lostItem.user._id}&finder=${foundItem.user._id}`
                                  )
                                }
                                variant="contained"
                                sx={{ minWidth: '0', padding: '6px 8px' }}
                                aria-label={`View details for ${foundItem.item.name}`}
                              >
                                <InfoIcon color="action" />
                              </Button>
                              <Button
                                onClick={() => setConfirmationRetrievalModal(foundItem.item._id)}
                                fullWidth
                                sx={{ padding: '6px 0' }}
                                aria-label={`Claim request for ${foundItem.item.name}`}
                              >
                                Claim Request
                              </Button>
                            </Box>
                          </CardContent>
                          <ConfirmationRetrievalRequest refreshData={fetchItems} open={confirmationRetrievalModal === foundItem.item._id} onClose={() => setConfirmationRetrievalModal(null)} foundItem={foundItem} lostItem={lostItem} />
                        </Card>
                      </Grid>
                    )
                  })
                )
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '200px',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    padding: 2,
                  }}
                >
                  <Typography>No suggested items available.</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Please report any lost item to see this content.
                  </Typography>
                </Box>
              )}
            </Grid>
          </>
        }
      </Box>
    </>
  );
};

export default MyItemsComponent;
