import { Box } from "@mui/joy";
import Image from "next/image";
import React from "react";

const DummyPhoto = ({ category }) => {
  const imageSource =
    category === "Electronics & Gadgets"
      ? "/electronics&gadgets.jpg"
      : category === "Clothing & Accessories"
      ? "/clothing&accessories.jpg"
      : category === "Personal Items"
      ? "/personal_items.jpg"
      : category === "School & Office Supplies"
      ? "/school&office_supplies.jpg"
      : category === "Books & Documents"
      ? "/books&documents.jpg"
      : category === "Sports & Recreational Equipment"
      ? "/sports.jpg"
      : category === "Jewelry & Valuables"
      ? "/jewelry-box.jpg"
      : "/misc.jpg";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        my: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: { xs: 180, sm: 220, md: 250 }, // responsive width
          height: { xs: 180, sm: 220, md: 250 }, // responsive height
        }}
      >
        <Image
          src={imageSource}
          alt={`Category Image: ${category}`}
          fill
          style={{ objectFit: "contain", borderRadius: 8 }}
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
        />
      </Box>
    </Box>
  );
};

export default DummyPhoto;
