import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        username: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true },
        refreshToken: { type: String, default: null },
    },
    { timestamps: true }
);

// Ensure password and refreshToken are never returned by default
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.refreshToken;
    return user;
};

const User = mongoose.model("User", userSchema);

export { User };