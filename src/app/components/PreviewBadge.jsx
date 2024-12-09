import React from 'react';
import { Tooltip, Box } from '@mui/joy';
import { useTheme, useMediaQuery } from '@mui/material';
import './../styles/animation.css';

const PreviewBadge = ({
    title,
    titleShimmer,
    shape,
    shapeColor,
    bgShape,
    bgColor,
    bgOutline
}) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));

    // Determine size based on screen size
    const containerSize = isXs ? '60px' : isSm ? '80px' : '100px';
    const shapeSize = isXs ? '40px' : isSm ? '55px' : '70px';

    const createStarShape = (size, color) => ({
        width: size,
        height: size,
        backgroundColor: color,
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    });

    const createTriangleShape = (size, color) => ({
        width: 0,
        height: 0,
        borderLeft: `${parseInt(size) / 2}px solid transparent`,
        borderRight: `${parseInt(size) / 2}px solid transparent`,
        borderBottom: `${size} solid ${color}`,
    });

    const createHexagonShape = (size, color) => ({
        width: size,
        height: `${Math.sqrt(3) / 2 * parseInt(size)}px`,
        backgroundColor: color,
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
                };
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
        <Tooltip
            title={title}
            arrow
        >
            <Box className={titleShimmer ? 'animate-shimmer' : ''} sx={badgePreviewStyle}>
                <Box className={titleShimmer ? 'animate-shimmer' : ''} sx={shapeStyle()} />
            </Box>
        </Tooltip>
    );
};

export default PreviewBadge;
