import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const client = new MongoClient(process.env.MONGODB_URI);

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    await client.connect();
    const db = client.db("test");
    const usersCollection = db.collection("accounts");

    // Fetch user from the database
    const user = await usersCollection.findOne({ username });

    if (user && bcrypt.compareSync(password, user.password)) {
      // If credentials are valid, return user data
      return NextResponse.json({ id: user._id, name: user.name, email: user.email });
    } else {
      // If credentials are invalid, return an error
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
