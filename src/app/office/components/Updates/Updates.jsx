"use client";

import React from "react";
import { Avatar, Link, Card, CardContent, Chip, Typography } from "@mui/joy";
import { Paper } from "@mui/material";

const Updates = () => {
  return (
    <>
      <Paper elevation={2} sx={{ padding: "1rem", height: "31.5rem", overflowY: 'auto'}}>
        <h2>Updates</h2>
        {[1, 2, 3, 4].map((item, index) => {
          return (
            <Card
              key={index}
              variant="outlined"
              orientation="horizontal"
              sx={{
                width: "auto",
                marginBottom: "1rem",
                "&:hover": {
                  boxShadow: "md",
                  borderColor: "neutral.outlinedHoverBorder",
                },
              }}
            >
              <Avatar />
              <CardContent>
                <Typography level="title-lg" id="card-description">
                  Yosemite Park
                </Typography>
                <Typography
                  level="body-sm"
                  aria-describedby="card-description"
                  mb={1}
                >
                  <Link
                    overlay
                    underline="none"
                    href="#interactive-card"
                    sx={{ color: "text.tertiary" }}
                  >
                    California, USA
                  </Link>
                </Typography>
                <Chip
                  variant="outlined"
                  color="primary"
                  size="sm"
                  sx={{ pointerEvents: "none" }}
                >
                  Cool weather all day long
                </Chip>
              </CardContent>
            </Card>
          );
        })}
      </Paper>
    </>
  );
};

export default Updates;
