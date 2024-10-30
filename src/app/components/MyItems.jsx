'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import TitleBreadcrumbs from './Title/TitleBreadcrumbs';
import { Typography, Button } from '@mui/joy';
import { Box, Card, CardContent } from '@mui/material';
import { CldImage } from 'next-cloudinary';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import Levenshtein from 'fast-levenshtein';
import InfoIcon from '@mui/icons-material/Info';
import ConfirmationRetrievalRequest from './Modal/ConfirmationRetrievalRequest';

const MyItemsComponent = ({ session, status }) => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [requestedItems, setRequestedItems] = useState([]);
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [confirmationRetrievalModal, setConfirmationRetrievalModal] = useState(null);
  const router = useRouter();

  console.log(suggestedMatches)

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/items/${session?.user?.id}`);
      const data = await response.json();

      if (response.ok) {
        const lostItems = data.filter(item => item.owner && item.status !== 'Request');
        const foundItems = data.filter(item => item.finder && item.status !== 'Request');
        const requestedItems = data.filter(item => item.status === 'Request');

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

  const handleDragStart = (e, ref) => {
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
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <TitleBreadcrumbs title="List of My Items" text="My Items" />

      <Box sx={{ padding: '1rem' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography level="h4" gutterBottom>
            Lost Items
          </Typography>
          <Button startDecorator={<AddIcon />}>
            Report Lost Item
          </Button>
        </Box>
        <Box
          ref={scrollRefLost}
          onMouseDown={(e) => handleDragStart(e, scrollRefLost)} // Handle mouse down event
          sx={{
            display: 'flex',
            overflowX: 'scroll',
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
            overflowX: 'scroll',
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
          Requested Items
        </Typography>
        <Box
          ref={scrollRefFound}
          onMouseDown={(e) => handleDragStart(e, scrollRefFound)} // Handle mouse down event
          sx={{
            display: 'flex',
            overflowX: 'scroll',
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
                sx={{ maxWidth: 250, flexShrink: 0, boxShadow: 3, borderRadius: 2 }} // Adjusted maxWidth
              >
                <CldImage
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
          ref={scrollRefFound}
          onMouseDown={(e) => handleDragStart(e, scrollRefFound)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'scroll',
            paddingY: 2,
            gap: 2,
            cursor: 'grab',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {suggestedMatches.length > 0 ? (
            suggestedMatches.map(({ lostItem, matches }) => (
              <Box key={lostItem._id} sx={{ marginBottom: 4 }}>
                <Typography level="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Lost Item: {lostItem.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {matches.length > 0 ? (
                    matches.map((foundItem, index) => (
                      <Card
                        key={index}
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
                          <Typography level="body2" sx={{ color: 'text.secondary', marginBottom: '0.5rem' }}>
                            {foundItem.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                            <Button
                              onClick={() => router.push(`/my-items/${lostItem._id}/${foundItem._id}`)}
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
                        <ConfirmationRetrievalRequest open={confirmationRetrievalModal === foundItem._id} onClose={() => setConfirmationRetrievalModal(null)} item={foundItem} />
                      </Card>
                    ))
                  ) : (
                    <Typography>No matches found for this lost item.</Typography>
                  )}
                </Box>
              </Box>
            ))
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
