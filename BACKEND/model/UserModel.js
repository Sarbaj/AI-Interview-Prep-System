import { mongoose } from "mongoose";
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: 30,
            minLength: 2,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        salt: String,
    },
    {timestamps: true}
);

const interviewModel = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        data: String,
    },
    {timestamps: true}
);

const User = mongoose.model('User', userSchema);
const InterviewDataModel = mongoose.model('Interviewdata', interviewModel);

export {User,InterviewDataModel};