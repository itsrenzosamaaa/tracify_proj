import accounts from "./models/accounts";
import dbConnect from "./mongodb";

const getUserbyEmail = async (email) => {
    try {
        await dbConnect();
        const user = await accounts.findOne({ email }).lean();
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export default getUserbyEmail;