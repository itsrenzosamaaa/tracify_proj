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

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/items/${session?.user?.id}`);
      const data = await response.json();
      
      if (response.ok) {
        // Filter lost, found, and requested items
        const lostItems = data.filter(item => item.owner && item.status !== 'Request');
        const foundItems = data.filter(item => item.finder && item.status !== 'Request');
        const requestedItems = data.filter(item => item.status === 'Request');
        
        // Fetch additional found items
        const foundItemsResponse = await fetch('/api/found-items');
        const foundItemsData = await foundItemsResponse.json();
        const filteredFoundItems = foundItemsData.filter(fItem => fItem?.finder?._id !== session?.user?.id && fItem?.status === 'Published');
  
        // Match lost items with found items based on item names
        const matches = lostItems.map(lostItem => {
          const matchesForLostItem = filteredFoundItems.map(foundItem => {
            const distance = Levenshtein.get(lostItem.name, foundItem.name); // Assuming 'name' is the field for item names
            const maxLength = Math.max(lostItem.name.length, foundItem.name.length);
            const similarityScore = 100 * (1 - (distance / maxLength));

            console.log(similarityScore)
            
            return {
              foundItem,
              similarityScore,
            };
          });
  
          // Filter matches above a certain threshold (e.g., 70%)
          const filteredMatches = matchesForLostItem.filter(match => match.similarityScore >= 70); // Adjust threshold as needed
          
          return {
            lostItem,
            matches: filteredMatches,
          };
        });
  
        // Now you can do something with the matches, e.g., set state or log
        const suggested = matches.flatMap(match => match.matches.map(m => m.foundItem));
        console.log(suggested)
        setSuggestedMatches(suggested);
        // You can use setState to store the matches if needed
        
        setLostItems(lostItems);
        setFoundItems(foundItems);
        setRequestedItems(requestedItems);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, [session?.user?.id])

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
          These are the found item/s matched based on your lost item/s
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
          {suggestedMatches.length > 0 ?
            suggestedMatches.map((item, index) => (
              <Card
                key={index}
                sx={{
                    maxWidth: 250,
                    flexShrink: 0,
                    boxShadow: 3,
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s', // Add a transition for hover effects
                    '&:hover': {
                        transform: 'scale(1.05)', // Scale up on hover
                        boxShadow: 6, // Increase shadow on hover
                    },
                }}
              >
                <CldImage
                    src={item.image}
                    width={500}
                    height={150}
                    alt={item.name || "Item Image"}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover', borderRadius: '8px 8px 0 0' }} // Rounded top corners
                />
                <CardContent>
                    <Typography level="h6" sx={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                        {item.name}
                    </Typography>
                    <Typography level="body2" sx={{ color: 'text.secondary', marginBottom: '0.5rem' }}>
                        {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                        <Button
                            onClick={() => router.push(`/my-items/${item._id}`)}
                            sx={{ minWidth: '0', padding: '6px 8px' }} // Minimize button size
                            aria-label={`View details for ${item.name}`} // Accessibility label
                        >
                            <InfoIcon />
                        </Button>
                        <Button
                            onClick={() => setConfirmationRetrievalModal(item._id)}
                            color="success"
                            variant="contained" // Make it a contained button for better visibility
                            fullWidth
                            sx={{ padding: '6px 0' }} // Consistent button padding
                            aria-label={`Claim request for ${item.name}`} // Accessibility label
                        >
                            Claim Request
                        </Button>
                    </Box>
                </CardContent>
                <ConfirmationRetrievalRequest open={confirmationRetrievalModal === item._id} onClose={() => setConfirmationRetrievalModal(null)} item={item} />
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
              <Typography>No suggested items available.</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Please report any lost item to see this content.
              </Typography>
            </Box>
          }
        </Box>
      </Box>
    </>
  );
};

export default MyItemsComponent;
