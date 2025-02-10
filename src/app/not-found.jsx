"use client";

import { Box, Typography, Button, Container } from "@mui/joy";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
        backgroundColor: "#f9f9f9",
        textAlign: "center",
      }}
    >
      <Container
        sx={{
          backgroundColor: "white",
          p: 4,
          borderRadius: "12px",
          boxShadow: 5,
          maxWidth: 500,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: "fadeIn 0.5s ease-in-out",
        }}
      >
        {/* 🎨 Illustration Image */}
        <Image
          src="/not_found.png" // Add a relevant image in your public/images folder
          alt="Page Not Found"
          width={400}
          height={250}
          style={{ marginBottom: "1.5rem" }}
        />

        {/* 🔥 Modern Typography */}
        <Typography
          level="h1"
          sx={{
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "#333",
            mb: 1,
          }}
        >
          404 - Page Not Found
        </Typography>
        <Typography
          level="body1"
          sx={{
            fontSize: "1.2rem",
            color: "#666",
            mb: 3,
          }}
        >
          Oops! The page you are looking for doesn&apos;t exist or has been moved.
        </Typography>

        {/* 🎯 Action Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={() => router.back()}
            variant="solid"
            color="primary"
            sx={{ fontSize: "1rem", px: 4, py: 1 }}
          >
            Go Back
          </Button>
          <Button
            component="a"
            href="/dashboard"
            variant="outlined"
            color="neutral"
            sx={{ fontSize: "1rem", px: 4, py: 1 }}
          >
            Home
          </Button>
        </Box>
      </Container>

      {/* ✨ Fade-in Animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
}
