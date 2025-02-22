import User from "../models/user.model.js";

export const createAdminUser = async () => {
    try {
        const adminUser = await User.findOne({email: "kangtheconqueror@admin.brainypath"});
        if (!adminUser) {
            const newAdmin = new User({
                username: 'HeWhoRemains',
                email: "kangtheconqueror@admin.brainypath",
                password: 'adminpassword', // Make sure to hash the password in the User model
                role: 'ADMIN',
                verifiedStatus:true
            });
            await newAdmin.save();
            console.log('Admin user created.....complete----');
        } else {
            console.log('Admin user already exists.....continue---');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};