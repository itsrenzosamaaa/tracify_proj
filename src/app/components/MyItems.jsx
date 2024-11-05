'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import { Typography, Button, Modal, ModalDialog, ModalClose, DialogContent, DialogTitle } from '@mui/joy';
import { Box, Card, CardContent } from '@mui/material';
import { CldImage } from 'next-cloudinary';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import Levenshtein from 'fast-levenshtein';
import InfoIcon from '@mui/icons-material/Info';
import ConfirmationRetrievalRequest from './Modal/ConfirmationRetrievalRequest';
import CancelRequest from './Modal/CancelRequest';
import { format, parseISO } from 'date-fns';
import RatingsModal from './Modal/Ratings';
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const MyItemsComponent = ({ session, status }) => {
  const [completedItemDetailsModal, setCompletedItemDetailsModal] = useState(null);
  const [cancelRequestModal, setCancelRequestModal] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [requestedItems, setRequestedItems] = useState([]);
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [confirmationRetrievalModal, setConfirmationRetrievalModal] = useState(null);
  const router = useRouter();

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/items/${session?.user?.id}`);
      const data = await response.json();

      if (response.ok) {
        const lostItems = data.filter(item => item.owner && item.status === 'Missing');
        const foundItems = data.filter(item => item.finder && (item.status !== 'Request' && item.status !== 'Resolved' && item.status !== 'Invalid'));
        const requestedItems = data.filter(item => item.status === 'Request');
        const completedItems = data.filter(item => item.status === 'Claimed' || item.status === 'Resolved')

        const foundItemsResponse = await fetch('/api/found-items');
        const foundItemsData = await foundItemsResponse.json();
        const filteredFoundItems = foundItemsData.filter(fItem => fItem?.finder?._id !== session?.user?.id && fItem?.status === 'Published');

        const matches = lostItems.map(lostItem => {
          const matchesForLostItem = filteredFoundItems.map(foundItem => {
            const distance = Levenshtein.get(lostItem.name, foundItem.name);
            const maxLength = Math.max(lostItem.name.length, foundItem.name.length);
            const similarityScore = 100 * (1 - (distance / maxLength));

            return {
              foundItem,
              similarityScore,
            };
          });

          const filteredMatches = matchesForLostItem.filter(match => match.similarityScore >= 70);

          return {
            lostItem,
            matches: filteredMatches.map(match => match.foundItem),
          };
        });

        setSuggestedMatches(matches);
        setLostItems(lostItems);
        setFoundItems(foundItems);
        setRequestedItems(requestedItems);
        setCompletedItems(completedItems)
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchItems();
    }
  }, [status, fetchItems]);

  const scrollRefLost = useRef(null);
  const scrollRefFound = useRef(null);
  const scrollRefCompleted = useRef(null);
  const scrollRefRequested = useRef(null);
  const scrollRefSuggested = useRef(null);

  const handleDragStart = (e, ref) => {
    // Prevent dragging if the target is an input or textarea
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
      return; // Don't start dragging
    }

    e.preventDefault();
    const startX = e.clientX;
    const scrollLeft = ref.current.scrollLeft;

    const handleMouseMove = (e) => {
      const x = e.clientX - startX;
      ref.current.scrollLeft = scrollLeft - x;
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };

    const handleMouseLeave = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
  };


  return (
    <>
      <TitleBreadcrumbs title="List of My Items" text="My Items" />

      <Box sx={{ padding: '1rem' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography level="h4" gutterBottom>
            Lost Items
          </Typography>
          <Button startDecorator={<AddIcon />} onClick={() => router.push('/my-items/report-lost-item')}>
            Report Lost Item
          </Button>
        </Box>
        <Box
          ref={scrollRefLost}
          onMouseDown={(e) => handleDragStart(e, scrollRefLost)} // Handle mouse down event
          sx={{
            display: 'flex',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            paddingY: 2,
            gap: 2,
            cursor: 'grab', // Change cursor to indicate dragging
            '&::-webkit-scrollbar': { display: 'none' }, // Hides scrollbar
          }}
        >
          {
            lostItems.length > 0 ?
              lostItems.map((item, index) => (
                <Card
                  key={index}
                  sx={{ maxWidth: 250, flexShrink: 0, boxShadow: 3, borderRadius: 2 }} // Adjusted maxWidth
                >
                  <CldImage
                    priority
                    src={item.image}
                    width={500} // Adjusted width to match smaller card size
                    height={150} // Adjusted height to match smaller card size
                    alt={item.name || "Item Image"}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.name}</Typography>
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
                      {item.description}
                    </Typography>
                    <Button fullWidth onClick={() => router.push(`my-items/${item._id}`)}>View Details</Button>
                  </CardContent>
                </Card>
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
                <Typography>No lost items found.</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  If you have lost something, please report it.
                </Typography>
              </Box>
          }
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography level="h4" gutterBottom>
            Found Items
          </Typography>
          <Button startDecorator={<AddIcon />} onClick={() => router.push('my-items/report-found-item')}>
            Report Found Item
          </Button>
        </Box>
        <Box
          ref={scrollRefFound}
          onMouseDown={(e) => handleDragStart(e, scrollRefFound)} // Handle mouse down event
          sx={{
            display: 'flex',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            paddingY: 2,
            gap: 2,
            cursor: 'grab', // Change cursor to indicate dragging
            '&::-webkit-scrollbar': { display: 'none' }, // Hides scrollbar
          }}
        >
          {foundItems.length > 0 ?
            foundItems.map((item, index) => (
              <Card
                key={index}
                sx={{ maxWidth: 250, flexShrink: 0, boxShadow: 3, borderRadius: 2 }} // Adjusted maxWidth
              >
                <CldImage
                  priority
                  src={item.image}
                  width={500} // Adjusted width to match smaller card size
                  height={150} // Adjusted height to match smaller card size
                  alt={item.name || "Item Image"}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.name}</Typography>
                  <Typography level="body2" sx={{ color: 'text.secondary' }}>{item.description}</Typography>
                </CardContent>
              </Card>
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
        </Box>

        <Typography level="h4" gutterBottom>
          Completed Items
        </Typography>
        <Box
          ref={scrollRefCompleted}
          onMouseDown={(e) => handleDragStart(e, scrollRefCompleted)} // Handle mouse down event
          sx={{
            display: 'flex',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            paddingY: 2,
            gap: 2,
            cursor: 'grab', // Change cursor to indicate dragging
            '&::-webkit-scrollbar': { display: 'none' }, // Hides scrollbar
          }}
        >
          {completedItems.length > 0 ?
            completedItems.map((item, index) => (
              <Card
                key={index}
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
                    backgroundColor: item?.finder ? '#81c784' : '#e57373',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textShadow: '0px 0px 4px rgba(0, 0, 0, 0.7)', // Slight shadow for text readability
                  }}
                >
                  {item?.finder ? 'Found Item' : 'Lost Item'}
                </Box>

                <CldImage
                  priority
                  src={item.image}
                  width={500}
                  height={150}
                  alt={item.name || "Item Image"}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                    {item.name}
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
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      sx={{ minWidth: '0', padding: '6px 8px' }}
                      onClick={() => setCompletedItemDetailsModal(item._id)}
                    >
                      <InfoIcon color="action" />
                    </Button>

                    <Modal open={completedItemDetailsModal} onClose={() => setCompletedItemDetailsModal(null)}>
                      <ModalDialog sx={{ maxWidth: 500, borderRadius: 4, boxShadow: 6, padding: 3 }}>
                        <ModalClose />
                        <DialogTitle>
                          <Typography variant="h5" component="span" fontWeight="bold" color="primary">
                            Item Details
                          </Typography>
                        </DialogTitle>

                        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography level="body1" fontWeight="bold">Name:</Typography>
                            <Typography level="body1" color="text.secondary">{item.name}</Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography level="body1" fontWeight="bold">Description:</Typography>
                            <Typography level="body1" color="text.secondary">{item.description}</Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOnIcon color="action" />
                            <Typography level="body1" color="text.secondary">{item.location}</Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarTodayIcon color="action" />
                            <Typography level="body1" color="text.secondary">
                              {format(parseISO(item.date), 'MMMM dd, yyyy')}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <AccessTimeIcon color="action" />
                            <Typography level="body1" color="text.secondary">
                              {format(new Date().setHours(...item.time.split(':')), 'hh:mm a')}
                            </Typography>
                          </Box>
                        </DialogContent>
                      </ModalDialog>
                    </Modal>
                    <Button
                      color="success"
                      fullWidth
                      sx={{ padding: '6px 0' }}
                      onClick={() => setRatingModal(item._id)}
                    >
                      Leave Review
                    </Button>
                  </Box>
                </CardContent>
                <RatingsModal open={ratingModal} onClose={() => setRatingModal(null)} item={item} session={session} status={status} />
              </Card>
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
        </Box>

        <Typography level="h4" gutterBottom>
          Requested Items
        </Typography>
        <Box
          ref={scrollRefRequested}
          onMouseDown={(e) => handleDragStart(e, scrollRefRequested)} // Handle mouse down event
          sx={{
            display: 'flex',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            paddingY: 2,
            gap: 2,
            cursor: 'grab', // Change cursor to indicate dragging
            '&::-webkit-scrollbar': { display: 'none' }, // Hides scrollbar
          }}
        >
          {requestedItems.length > 0 ?
            requestedItems.map((item, index) => (
              <Card
                key={index}
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
                    backgroundColor: item?.finder ? '#81c784' : '#e57373',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textShadow: '0px 0px 4px rgba(0, 0, 0, 0.7)', // Slight shadow for text readability
                  }}
                >
                  {item?.finder ? 'Found' : 'Lost'}
                </Box>

                <CldImage
                  priority
                  src={item.image}
                  width={500}
                  height={150}
                  alt={item.name || "Item Image"}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                    {item.name}
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
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      sx={{ minWidth: '0', padding: '6px 8px' }}
                    >
                      <InfoIcon color="action" />
                    </Button>
                    <Modal>
                      <ModalDialog>
                        <ModalClose />
                        <DialogContent>
                          <Typography>{item.name}</Typography>
                          <Typography>{item.description}</Typography>
                          <Typography>{item.location}</Typography>
                          <Typography>{format(parseISO(item.date), 'MMMM dd, yyyy')}</Typography>
                          <Typography>{format(new Date().setHours(...item.time.split(':')), 'hh:mm a')}</Typography>
                        </DialogContent>
                      </ModalDialog>
                    </Modal>
                    <Button
                      fullWidth
                      color="danger"
                      sx={{ padding: '6px 0' }}
                      onClick={() => setCancelRequestModal(item._id)}
                    >
                      Cancel Request
                    </Button>
                    <CancelRequest open={cancelRequestModal} onClose={() => setCancelRequestModal(null)} item={item} api={item?.finder ? 'found-items' : 'lost-items'} />
                  </Box>
                </CardContent>
              </Card>
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
        </Box>

        <Typography level="h4" gutterBottom>
          Suggested Matches
        </Typography>
        <Typography level="body-sm" color="neutral" sx={{ marginTop: 1 }}>
          These are the found items matched based on your lost items
        </Typography>
        <Box
          ref={scrollRefSuggested}
          onMouseDown={(e) => handleDragStart(e, scrollRefSuggested)}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            paddingY: 2,
            gap: 2,
            cursor: 'grab',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {suggestedMatches.length > 0 ? (
            suggestedMatches.flatMap(({ lostItem, matches }) =>
              matches.map((foundItem, index) => (
                lostItem.status === 'Missing' &&
                <Card
                  key={`${lostItem._id}-${index}`}
                  sx={{
                    maxWidth: 250,
                    flexShrink: 0,
                    boxShadow: 3,
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CldImage
                    priority
                    src={foundItem.image}
                    width={500}
                    height={150}
                    alt={foundItem.name || "Item Image"}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                  />
                  <CardContent>
                    <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                      {foundItem.name}
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
                      {foundItem.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                      <Button
                        onClick={() => router.push(`/my-items/${lostItem._id}/matchedTo/${foundItem._id}`)}
                        variant="contained"
                        sx={{ minWidth: '0', padding: '6px 8px' }}
                        aria-label={`View details for ${foundItem.name}`}
                      >
                        <InfoIcon color="action" />
                      </Button>
                      <Button
                        onClick={() => setConfirmationRetrievalModal(foundItem._id)}
                        fullWidth
                        sx={{ padding: '6px 0' }}
                        aria-label={`Claim request for ${foundItem.name}`}
                      >
                        Claim Request
                      </Button>
                    </Box>
                  </CardContent>
                  <ConfirmationRetrievalRequest open={confirmationRetrievalModal === foundItem._id} onClose={() => setConfirmationRetrievalModal(null)} item={foundItem} matched={lostItem} />
                </Card>
              ))
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
        </Box>
      </Box>
    </>
  );
};

export default MyItemsComponent;
