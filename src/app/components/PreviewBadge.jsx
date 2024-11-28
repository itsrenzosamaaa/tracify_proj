import React from 'react';
import { Tooltip, Box, Typography } from '@mui/joy';
import { useTheme, useMediaQuery } from '@mui/material';
import './../styles/animation.css';

const PreviewBadge = ({ title, titleColor, titleShimmer, titleOutlineColor, shape, shapeColor, bgShape, bgColor, bgOutline, condition, meetConditions }) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));

    // Determine size based on screen size
    const containerSize = isXs ? '60px' : isSm ? '80px' : '100px';
    const shapeSize = isXs ? '40px' : isSm ? '55px' : '70px'; // Smaller size for the shape
    const fontSize = isXs ? '12px' : isSm ? '14px' : '16px';

    const createStarShape = (size, color) => ({
        width: size,
        height: size,
        backgroundColor: color,
        boxSizing: 'border-box',
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    });

    const createTriangleShape = (size, color) => ({
        width: 0,
        height: 0,
        borderLeft: `${parseInt(size) / 2}px solid transparent`,
        borderRight: `${parseInt(size) / 2}px solid transparent`,
        borderBottom: `${size} solid ${color}`,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    });

    const createHexagonShape = (size, color) => ({
        width: size,
        height: `calc(${parseInt(size) * 0.6}px)`,
        backgroundColor: color,
        boxSizing: 'border-box',
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    });

    const shapeStyle = () => {
        switch (shape) {
            case 'star':
                return createStarShape(shapeSize, shapeColor);
            case 'triangle':
                return createTriangleShape(shapeSize, shapeColor);
            case 'hexagon':
                return createHexagonShape(shapeSize, shapeColor);
            default:
                return {
                    width: shapeSize,
                    height: shapeSize,
                    backgroundColor: shapeColor,
                    borderRadius: shape === 'circle' ? '50%' : '0',
                    position: 'absolute',
                };
        }
    };

    const description = (condition) => {
        if (condition === 'Found Item/s') {
            return `Accommodate ${meetConditions} ${meetConditions === 1 ? 'found item' : 'found items'} successfully.`;
        } else if (condition === 'Rating/s') {
            return `Provide ${meetConditions} ${meetConditions === 1 ? 'feedback' : 'feedbacks'} to students.`;
        }
    };

    const badgePreviewStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: containerSize,
        height: containerSize,
        backgroundColor: bgColor,
        borderRadius: bgShape === 'circle' ? '50%' : '0',
        border: `5px solid ${bgOutline}`,
        position: 'relative',
    };

    return (
        <>
            <Tooltip title={description(condition)} arrow placement="top">
                <Box sx={badgePreviewStyle}>
                    <Box sx={shapeStyle()}></Box>
                </Box>
            </Tooltip>
            <Typography
                className={titleShimmer ? 'animate-shimmer' : ''}
                sx={{
                    textAlign: 'center',
                    marginTop: '10px',
                    color: titleColor,
                    WebkitTextStrokeWidth: '0.5px',
                    WebkitTextStrokeColor: titleOutlineColor,
                    fontSize,
                }}
                fontWeight="700"
                level="h5"
            >
                {title}
            </Typography>
        </>
    );
};

export default PreviewBadge;
