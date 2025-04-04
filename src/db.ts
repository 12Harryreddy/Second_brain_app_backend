// rO6d3JcCV2sSVkc7


import mongoose , {model, Schema} from "mongoose";
import dotenv from "dotenv";
import { string } from "zod";
dotenv.config();

mongoose.connect(process.env.MONGO_URL as string)

const userSchema = new Schema({
    username: {type: String, unique:true, required: true},
    password: {type: String, required: true}
})

export const userModel = model("User", userSchema);

const contentSchema = new Schema({
    title: {type: String, required: true},
    link: {type: String},
    type: {type: String, required: true},
    tag: [{type: mongoose.Types.ObjectId, ref: "Tag"}],
    userId: {type: mongoose.Types.ObjectId, ref: "User", required: true}
});

export const contentModel = model("Content", contentSchema);

const linkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, required: true, ref: "User", unique: true},
})

export const linkModel = model('Links', linkSchema);