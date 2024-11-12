'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import { Grid, Typography, Button, Modal, ModalDialog, ModalClose, DialogContent, DialogTitle } from '@mui/joy';
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
import BadgeIcon from '@mui/icons-material/Badge';
import DescriptionIcon from '@mui/icons-material/Description';

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

  const router = useRouter();

  const fetchItems = useCallback(async () => {
    try {
      // Fetch user-specific items (lost and found)
      const response = await fetch(`/api/items/${session?.user?.id}`);
      const data = await response.json();

      if (response.ok) {
        // Filter items based on various statuses and types
        const lostItems = data.filter(lostItem => !lostItem.item.isFoundItem && lostItem.item.status === 'Missing');
        const foundItems = data.filter(foundItem => foundItem.item.isFoundItem && !['Request', 'Resolved', 'Invalid', 'Canceled'].includes(foundItem.item.status));
        const requestedItems = data.filter(requestedItem => requestedItem.item.status === 'Request');
        const completedItems = data.filter(completedItem => ['Claimed', 'Resolved'].includes(completedItem.item.status));
        const declinedItems = data.filter(declinedItem => declinedItem.item.status === 'Invalid');
        const canceledItems = data.filter(canceledItem => canceledItem.item.status === 'Canceled');

        // Fetch all found items for potential matches
        const foundItemsResponse = await fetch('/api/finder');
        const foundItemsData = await foundItemsResponse.json();

        // Filter found items that are published and do not belong to the current user
        const filteredFoundItems = foundItemsData.filter(fItem =>
          fItem?.user?._id !== session?.user?.id && fItem?.item?.status === 'Published'
        );

        // Match found items with lost items based on similarity score
        const matches = lostItems.map(lostItem => {
          const matchesForLostItem = filteredFoundItems.map(foundItem => {
            const distance = Levenshtein.get(lostItem.item.name, foundItem.item.name);
            const maxLength = Math.max(lostItem.item.name.length, foundItem.item.name.length);
            const similarityScore = 100 * (1 - (distance / maxLength));

            return similarityScore >= 70 ? { foundItem, similarityScore } : null;
          }).filter(match => match !== null); // Filter out null matches

          return { lostItem, matches: matchesForLostItem.map(match => match.foundItem) };
        });

        setSuggestedMatches(matches);
        setLostItems(lostItems);
        setFoundItems(foundItems);
        setRequestedItems(requestedItems);
        setCompletedItems(completedItems);
        setDeclinedItems(declinedItems);
        setCanceledItems(canceledItems);
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
  const scrollRefDeclined = useRef(null);
  const scrollRefCanceled= useRef(null);
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
              lostItems.map((lostItem, index) => (
                <Card
                  key={index}
                  sx={{ maxWidth: 250, flexShrink: 0, boxShadow: 3, borderRadius: 2 }} // Adjusted maxWidth
                >
                  <CldImage
                    priority
                    src={lostItem.item.image}
                    width={500} // Adjusted width to match smaller card size
                    height={150} // Adjusted height to match smaller card size
                    alt={lostItem.item.name || "Item Image"}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{lostItem.item.name}</Typography>
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
                      {lostItem.item.description}
                    </Typography>
                    <Button fullWidth onClick={() => router.push(`my-items/lost-item/${lostItem.item._id}`)}>View Details</Button>
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
            foundItems.map((foundItem, index) => (
              <Card
                key={index}
                sx={{ maxWidth: 250, flexShrink: 0, boxShadow: 3, borderRadius: 2 }} // Adjusted maxWidth
              >
                <CldImage
                  priority
                  src={foundItem.item.image}
                  width={500} // Adjusted width to match smaller card size
                  height={150} // Adjusted height to match smaller card size
                  alt={foundItem.item.name || "Item Image"}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
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
            completedItems.map((completedItem, index) => (
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
                  src={completedItem.item.image}
                  width={500}
                  height={150}
                  alt={completedItem.item.name || "Item Image"}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
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
                            <Typography level="body1" color="text.secondary">{completedItem.item.name}</Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography level="body1" fontWeight="bold">Description:</Typography>
                            <Typography level="body1" color="text.secondary">{completedItem.item.description}</Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOnIcon color="action" />
                            <Typography level="body1" color="text.secondary">{completedItem.item.location}</Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarTodayIcon color="action" />
                            <Typography level="body1" color="text.secondary">
                              {format(parseISO(completedItem.item.date), 'MMMM dd, yyyy')}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <AccessTimeIcon color="action" />
                            <Typography level="body1" color="text.secondary">
                              {format(new Date().setHours(...completedItem.item.time.split(':')), 'hh:mm a')}
                            </Typography>
                          </Box>
                        </DialogContent>
                      </ModalDialog>
                    </Modal>
                    <RatingsModal item={completedItem.item} session={session} status={status} />
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
              <Typography>No found items available.</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                If you have found something, please report it.
              </Typography>
            </Box>
          }
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography level="h4" gutterBottom>
            Declined Items
          </Typography>
        </Box>
        <Box
          ref={scrollRefDeclined}
          onMouseDown={(e) => handleDragStart(e, scrollRefDeclined)} // Handle mouse down event
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
          {declinedItems.length > 0 ?
            declinedItems.map((declinedItem, index) => (
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
                  src={declinedItem.item.image}
                  width={500}
                  height={150}
                  alt={declinedItem.item.name || "Item Image"}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
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
                          <Typography level="body1" color="text.secondary">{declinedItem.item.name}</Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography level="body1" fontWeight="bold">Description:</Typography>
                          <Typography level="body1" color="text.secondary">{declinedItem.item.description}</Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOnIcon color="action" />
                          <Typography level="body1" color="text.secondary">{declinedItem.item.location}</Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarTodayIcon color="action" />
                          <Typography level="body1" color="text.secondary">
                            {format(parseISO(declinedItem.item.date), 'MMMM dd, yyyy')}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTimeIcon color="action" />
                          <Typography level="body1" color="text.secondary">
                            {format(new Date().setHours(...declinedItem.item.time.split(':')), 'hh:mm a')}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography level="body1" fontWeight="bold">Reason for Decline:</Typography>
                          <Typography level="body1" color="text.secondary">{declinedItem.item.reason}</Typography>
                        </Box>
                      </DialogContent>
                    </ModalDialog>
                  </Modal>
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
              <Typography>No declined items available.</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                If you have found something, please report it.
              </Typography>
            </Box>
          }
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography level="h4" gutterBottom>
            Canceled Items
          </Typography>
        </Box>
        <Box
          ref={scrollRefCanceled}
          onMouseDown={(e) => handleDragStart(e, scrollRefCanceled)} // Handle mouse down event
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
          {canceledItems.length > 0 ?
            canceledItems.map((canceledItem, index) => (
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
                  src={canceledItem.item.image}
                  width={500}
                  height={150}
                  alt={canceledItem.item.name || "Item Image"}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
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
                          <Typography level="body1" color="text.secondary">{canceledItem.item.name}</Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography level="body1" fontWeight="bold">Description:</Typography>
                          <Typography level="body1" color="text.secondary">{canceledItem.item.description}</Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOnIcon color="action" />
                          <Typography level="body1" color="text.secondary">{canceledItem.item.location}</Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarTodayIcon color="action" />
                          <Typography level="body1" color="text.secondary">
                            {format(parseISO(canceledItem.item.date), 'MMMM dd, yyyy')}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTimeIcon color="action" />
                          <Typography level="body1" color="text.secondary">
                            {format(new Date().setHours(...canceledItem.item.time.split(':')), 'hh:mm a')}
                          </Typography>
                        </Box>
                      </DialogContent>
                    </ModalDialog>
                  </Modal>
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
              <Typography>No canceled items available.</Typography>
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
            requestedItems.map((requestedItem, index) => (
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
                    backgroundColor: requestedItem.item?.isFoundItem ? '#81c784' : '#e57373',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textShadow: '0px 0px 4px rgba(0, 0, 0, 0.7)', // Slight shadow for text readability
                  }}
                >
                  {requestedItem.item?.isFoundItem ? 'Found' : 'Lost'}
                </Box>

                <CldImage
                  priority
                  src={requestedItem.item.image}
                  width={500}
                  height={150}
                  alt={requestedItem.item.name || "Item Image"}
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
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

                        <Grid container spacing={2}>
                          <Grid item xs={2}>
                            <BadgeIcon fontSize="small" color="primary" />
                          </Grid>
                          <Grid item xs={10}>
                            <Typography level="body1" sx={{ fontWeight: 500 }}>
                              {requestedItem.item.name}
                            </Typography>
                          </Grid>

                          <Grid item xs={2}>
                            <DescriptionIcon fontSize="small" color="primary" />
                          </Grid>
                          <Grid item xs={10}>
                            <Typography level="body2" color="text.secondary">
                              {requestedItem.item.description}
                            </Typography>
                          </Grid>

                          <Grid item xs={2}>
                            <LocationOnIcon fontSize="small" color="primary" />
                          </Grid>
                          <Grid item xs={10}>
                            <Typography level="body2" color="text.secondary">
                              {requestedItem.item.location}
                            </Typography>
                          </Grid>

                          <Grid item xs={2}>
                            <CalendarTodayIcon fontSize="small" color="primary" />
                          </Grid>
                          <Grid item xs={10}>
                            <Typography level="body2" color="text.secondary">
                              {format(parseISO(requestedItem.item.date), 'MMMM dd, yyyy')}
                            </Typography>
                          </Grid>

                          <Grid item xs={2}>
                            <AccessTimeIcon fontSize="small" color="primary" />
                          </Grid>
                          <Grid item xs={10}>
                            <Typography level="body2" color="text.secondary">
                              {format(new Date().setHours(...requestedItem.item.time.split(':')), 'hh:mm a')}
                            </Typography>
                          </Grid>
                        </Grid>
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
          {suggestedMatches.length > 0 && suggestedMatches.some(({ matches }) => matches.length > 0) ? (
            suggestedMatches.flatMap(({ lostItem, matches }) =>
              matches.map((foundItem, index) => (
                lostItem.item.status === 'Missing' && (
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
                      src={foundItem.item.image}
                      width={500}
                      height={150}
                      alt={foundItem.item.name || "Item Image"}
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
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
                    <ConfirmationRetrievalRequest open={confirmationRetrievalModal === foundItem.item._id} onClose={() => setConfirmationRetrievalModal(null)} foundItem={foundItem} lostItem={lostItem} />
                  </Card>
                )
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
