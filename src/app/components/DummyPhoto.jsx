import { Box } from "@mui/joy";
import Image from "next/image";

const DummyPhoto = ({ category, height = 220, width = "100%" }) => {
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
        position: "relative",
        width: width,
        height: height,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Image
        src={imageSource}
        alt={`Image of ${category}`}
        fill
        style={{ objectFit: "cover" }}
        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw"
      />
    </Box>
  );
};

export default DummyPhoto;
