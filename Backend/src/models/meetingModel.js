import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
    {
        meetingCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        hostName: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };