import React from 'react'
import { Tooltip, Box, Typography, } from '@mui/joy';
import './../styles/animation.css';

const PreviewBadge = ({ title, titleColor, titleShimmer, titleOutlineColor, description, shape, shapeColor, bgShape, bgColor, bgOutline }) => {
    const createStarShape = (size, color) => ({
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        boxSizing: 'border-box',
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    });

    const createTriangleShape = (size, color) => ({
        width: '0',
        height: '0',
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid ${color}`,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    });

    const createHexagonShape = (size, color) => ({
        width: `${size}px`,
        height: `${size * 0.6}px`,
        backgroundColor: color,
        boxSizing: 'border-box',
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    });

    const shapeStyle = () => {
        switch (shape) {
            case 'star':
                return createStarShape(70, shapeColor);
            case 'triangle':
                return createTriangleShape(60, shapeColor);
            case 'hexagon':
                return createHexagonShape(70, shapeColor);
            default:
                return {
                    width: '60px',
                    height: '60px',
                    backgroundColor: shapeColor,
                    borderRadius: shape === 'circle' ? '50%' : '0',
                    position: 'absolute',
                };
        }
    };

    const badgePreviewStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100px',
        height: '100px',
        backgroundColor: bgColor,
        borderRadius: bgShape === 'circle' ? '50%' : '0',
        border: `5px solid ${bgOutline}`,
        position: 'relative',
    };
    return (
        <>
            <Tooltip title={description} arrow>
                <Box sx={badgePreviewStyle}>
                    <Box sx={shapeStyle()}></Box>
                </Box>
            </Tooltip>
            <Typography className={titleShimmer ? 'animate-shimmer' : ''} sx={{ textAlign: 'center', marginTop: '10px', color: titleColor, WebkitTextStrokeWidth: '0.5px', WebkitTextStrokeColor: titleOutlineColor, }} fontWeight="700" level="h5">
                {title}
            </Typography>
        </>
    )
}

export default PreviewBadge