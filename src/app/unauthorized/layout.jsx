import React from "react";
import { Box } from "@mui/joy";

export default function Layout({ children }) {
    return (
        <html>
            <head>
                <title>Unauthorized</title>
            </head>
            <body>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {children}
                </Box>
            </body>
        </html>
    );
}
