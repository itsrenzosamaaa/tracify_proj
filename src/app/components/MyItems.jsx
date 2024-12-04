'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import { Grid, Typography, Button, Modal, ModalDialog, ModalClose, DialogContent, Tabs, TabList, Tab, ListItemDecorator, Badge, Select, Option, Chip } from '@mui/joy';
import { Box, Card, CardContent } from '@mui/material';
import { CldImage } from 'next-cloudinary';
import AddIcon from '@mui/icons-material/Add';
import { usePathname, useRouter } from 'next/navigation';
import InfoIcon from '@mui/icons-material/Info';
import ConfirmationRetrievalRequest from './Modal/ConfirmationRetrievalRequest';
import CancelRequest from './Modal/CancelRequest';
import RatingsModal from './Modal/Ratings';
import ItemDetails from './Modal/ItemDetails';
import { useTheme, useMediaQuery } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const validTabs = ['found-item', 'lost-item', 'completed-item', 'declined-item', 'canceled-item', 'requested-item', 'suggested-item'];

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
  const [activeTab, setActiveTab] = useState('lost-item'); // State to track the active tab
  const [ratingModal, setRatingModal] = useState(null);
  const router = useRouter();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('lg'));

  console.log(suggestedMatches)

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
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
      console.error('User is not logged in or session is not available');
      return;
    }

    try {
      // Fetch all required data concurrently
      const [itemsResponse, ratingsResponse, foundItemsResponse, matchItemsResponse] = await Promise.all([
        fetch(`/api/items/${session.user.id}`),
        fetch('/api/ratings'),
        fetch('/api/finder'),
        fetch('/api/match-items')
      ]);

      if (!itemsResponse.ok || !ratingsResponse.ok || !foundItemsResponse.ok || !matchItemsResponse.ok) {
        throw new Error('Failed to fetch data from one or more endpoints');
      }

      const [itemsData, ratingsData, foundItemsData, matchItemsData] = await Promise.all([
        itemsResponse.json(),
        ratingsResponse.json(),
        foundItemsResponse.json(),
        matchItemsResponse.json(),
      ]);

      // Filter and categorize items before processing
      const lostItems = itemsData.filter(
        (item) => !item.item.isFoundItem && ['Missing', 'Unclaimed'].includes(item.item.status)
      );

      const foundItems = itemsData.filter(
        (item) => item.item.isFoundItem && !['Request', 'Resolved', 'Declined', 'Canceled'].includes(item.item.status)
      );

      const otherFoundItems = foundItemsData.filter(
        (fItem) => fItem?.user?._id !== session.user.id && fItem?.item?.status === 'Published'
      );

      // Filter ratings for the current user
      const filteredRatings = ratingsData.filter(
        (rating) => rating.sender?._id.toString() === session.user.id
      );

      const filteredMatches = matchItemsData.filter((match) => match.request_status === 'Pending');

      // Set states
      setLostItems(lostItems);
      setFoundItems(foundItems);
      setCompletedItems(filteredRatings);
      setRequestedItems(itemsData.filter((item) => item.item.status === 'Request'));
      setDeclinedItems(itemsData.filter((item) => item.item.status === 'Declined'));
      setCanceledItems(itemsData.filter((item) => item.item.status === 'Canceled'));

      // Fetch cosine similarity for lost items and potential matches concurrently
      const matches = await Promise.all(
        lostItems.map(async (lostItem) => {
          // Fetch all similarity results for one lost item in parallel
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

          // Filter and sort matches
          const sortedMatches = matchedItems
            .filter((match) => match.similarity >= 60) // Similarity threshold
            .sort((a, b) => b.similarity - a.similarity);

          // Skip already matched lost items
          const alreadyMatched = filteredMatches.some(
            (matched) => matched.owner.item._id === lostItem.item._id
          );
          if (alreadyMatched) return null;

          return { lostItem, matches: sortedMatches };
        })
      );

      // Remove null values and set the matches
      setSuggestedMatches(matches.filter(Boolean));

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
            <Tabs 
              value={activeTab}
              onChange={(e, newValue) => handleTabChange(newValue)}
              aria-label="Icon tabs"
              variant="scrollable"
            >
              <TabList sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: 0 }}>
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
                <Badge badgeContent={suggestedMatches.reduce((total, item) => total + (item.matches?.length || 0), 0)}>
                  <Tab value="suggested-item">
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
            onChange={(e, newValue) => handleTabChange(newValue)}
          >
            <Option value="lost-item" label="Lost Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Lost Items
              {lostItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{lostItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value="found-item" label="Found Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Found Items
              {foundItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{foundItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value="completed-item" label="Completed Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Completed Items
              {completedItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{completedItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value="declined-item" label="Declined Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Declined Items
              {declinedItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{declinedItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value="canceled-item" label="Canceled Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Canceled Items
              {canceledItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{canceledItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value="requested-item" label="Requested Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Requested Items
              {requestedItems.length > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{requestedItems.length}</Chip>
                </ListItemDecorator>
              )}
            </Option>
            <Option value="suggested-item" label="Suggested Items" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Suggested Items
              {suggestedMatches.reduce((total, item) => total + (item.matches?.length || 0), 0) > 0 && (
                <ListItemDecorator>
                  <Chip color="danger" variant="solid">{suggestedMatches.reduce((total, item) => total + (item.matches?.length || 0), 0)}</Chip>
                </ListItemDecorator>
              )}
            </Option>
          </Select>
        </>
      )}

      <Box sx={{ padding: '1rem' }}>
        {
          activeTab === 'lost-item' &&
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
              <Typography level="h4" gutterBottom>
                Lost Items
              </Typography>
              <Button size="small" startDecorator={<AddIcon />} onClick={() => router.push('/my-items/report-lost-item')}>
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
                          backgroundColor: lostItem.item?.status === 'Unclaimed' ? '#ffb74d' : '#e57373',
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
                    padding: 3,
                    textAlign: 'center', // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: '#ccc' }}>
                    <SearchOffIcon /> {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    No lost items available
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you&apos;ve lost something, please report it immediately.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }


        {
          activeTab === 'found-item' &&
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
              <Typography level="h4" gutterBottom>
                Found Items
              </Typography>
              <Button size="small" startDecorator={<AddIcon />} onClick={() => router.push('my-items/report-found-item')}>
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
                    padding: 3,
                    textAlign: 'center', // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: '#ccc' }}>
                    <SearchOffIcon /> {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    No found items available
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you&apos;ve found something, please report it to help others.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }

        {
          activeTab === 'completed-item' &&
          <>
            <Typography level="h4" gutterBottom sx={{ mb: 5 }}>
              Completed Items
            </Typography>
            <Grid container spacing={2}>
              {completedItems.length > 0 ?
                completedItems.map((completedItem, index) => (
                  <>
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
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <RatingsModal open={ratingModal} onClose={() => setRatingModal(null)} item={completedItem} session={session} refreshData={fetchItems} />
                  </>
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
                    padding: 3,
                    textAlign: 'center', // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: '#ccc' }}>
                    <SearchOffIcon /> {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    No completed items available
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    The items you lost or found has not been completed yet.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }

        {
          activeTab === 'declined-item' &&
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
                    padding: 3,
                    textAlign: 'center', // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: '#ccc' }}>
                    <SearchOffIcon /> {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    No declined items available.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you believe this item should not have been declined, please report it again.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }

        {
          activeTab === 'canceled-item' &&
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
                    padding: 3,
                    textAlign: 'center', // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: '#ccc' }}>
                    <SearchOffIcon /> {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    No canceled items available.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you’ve canceled an item, you can always re-report it or check its status.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }

        {
          activeTab === 'requested-item' &&
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
                    padding: 3,
                    textAlign: 'center', // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: '#ccc' }}>
                    <SearchOffIcon /> {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    No requested items available.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    If you’re looking for something specific, please feel free to create a request.
                  </Typography>
                </Box>
              }
            </Grid>
          </>
        }

        {
          activeTab === 'suggested-item' &&
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
                    const { foundItem, similarity } = match;
                    return lostItem.item.status === 'Missing' && (
                      <>
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
                                top: 12,
                                left: 12,
                                backgroundColor: '#81c784', // A vibrant green background
                                color: '#fff',
                                padding: '8px 8px', // Slightly bigger padding for readability
                                borderRadius: '50%', // Rounded corners
                                fontSize: '1rem', // Larger font size for better visibility
                                fontWeight: 'bold',
                                textShadow: '0px 0px 6px rgba(0, 0, 0, 0.7)', // Slight shadow for text readability
                                boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.2)', // Added shadow for better contrast
                              }}
                            >
                              {Math.round(similarity)}%
                            </Box>
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
                                      `/my-items/${lostItem._id}/matchedTo/${foundItem._id}`
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
                          </Card>
                        </Grid>
                        <ConfirmationRetrievalRequest refreshData={fetchItems} open={confirmationRetrievalModal === foundItem.item._id} onClose={() => setConfirmationRetrievalModal(null)} foundItem={foundItem} lostItem={lostItem} />
                      </>
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
                    padding: 3,
                    textAlign: 'center', // Centers the content
                    gap: 2, // Adds space between elements
                  }}
                >
                  <Box sx={{ fontSize: 50, color: '#ccc' }}>
                    <SearchOffIcon /> {/* Optional icon indicating no results */}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    No suggested items available.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    We don’t have any suggested items at the moment. Check back later for new recommendations.
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
