import user from "./models/user";
import dbConnect from "./mongodb";

const getUserbyEmail = async (email) => {
  try {
    await dbConnect();

    const findUser = await user.findOne({ emailAddress: email }).lean();
    return findUser;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export default getUserbyEmail;
