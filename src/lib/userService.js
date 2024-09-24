import Office from "./models/office";
import User from "./models/user";
import dbConnect from "./mongodb";

const getUserbyEmail = async (email) => {
    try {
        await dbConnect();

        const office = await Office.findOne({ email }).lean();
        const user = await User.findOne({ email }).lean();

        if(office){
            return {
                ...office,
                role: "office",
            };
        }

        if(user){
            return {
                ...user,
                role: "user",
            };
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export default getUserbyEmail;