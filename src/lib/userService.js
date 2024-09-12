import accounts from "./models/accounts";

const getUserbyEmail = async (email) => {
    try {
        const user = await accounts.findOne({ email }).lean();
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export default getUserbyEmail;