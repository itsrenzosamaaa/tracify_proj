import dbConnect from "@/lib/mongodb";
import Items from "@/lib/models/items";

export async function GET(request) {
  await dbConnect();

  try {
    // Fetch items from the database
    const items = await Items.find(); // You can customize the query as needed

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching items: ", error);
    return new Response(JSON.stringify({ error: "Failed to fetch items" }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  await dbConnect();

  const formData = await request.formData();

  const isFoundItem = formData.get("isFoundItem");
  const reportedByNotUser = formData.get("reportedByNotUser");
  const name = formData.get("name");
  const category = formData.get("category");
  const description = formData.get("description");
  const location = formData.get("location");
  const date = formData.get("date");
  const time = formData.get("time");
  const user = formData.get("user");
  const status = formData.get("status");

  // Handle file upload (if needed, you need additional middleware for handling files)
  // const image = formData.get('image'); // You'll need middleware for handling file uploads

  try {
    const newItem = new Items({
      isFoundItem,
      reportedByNotUser,
      name,
      category,
      description,
      location,
      date: new Date(date).toLocaleDateString(),
      time: new Date(time).toLocaleTimeString(),
      user,
      status,
      // imageUrl: image ? `/uploads/${image.name}` : null // Example path for file URL if used
    });

    console.log(newItem);

    await newItem.save();
    return new Response(
      JSON.stringify({ message: "Item added successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding item: ", error);
    return new Response(JSON.stringify({ error: "Failed to add item" }), {
      status: 500,
    });
  }
}
