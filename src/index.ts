import express, { Request, Response } from "express";
import mongoose from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import {z} from "zod";
import bcrypt from "bcrypt";
import { contentModel, linkModel, userModel } from "./db";
import dotenv from "dotenv";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import cors from "cors";
dotenv.config();

const app = express();
const secretkey = process.env.JWT_SECRET as string;

interface SignupRequestBody {
    username: string;
    password: string;
  };
  interface SigninRequestBody {
    username: string;
    password: string;
  } ; 



const usernameSchema = z.string().min(3);
const passwordSchema = z.string().min(8);
app.use(express.json());
app.use(cors());
app.post("/api/v1/signup", async (req: Request, res: Response) : Promise<void> => {

    try {
        const {username, password} = req.body as SignupRequestBody;
        const validUserName = usernameSchema.safeParse(username);
        const validPassword = passwordSchema.safeParse(password);

        if(!validUserName.success) {
            res.status(400).json({
                error: "Invalid username: Minimum 3 characters required"
            });
            return;
        }
        if(!validPassword.success) {
            res.status(400).json({
                error: "Invalid password: Minimum 8 characters required"
            });
            return;
        }

        const existingUser = await userModel.findOne({username});
        if(existingUser) {
            res.status(400).json({
                error: "User already exits"
            });
            return;
        } 
        const hashedPassword = await bcrypt.hash(password, 10);
        // const newUser = new userModel({username, password:hashedPassword});
        // newUser.save();
        await userModel.create({
            username,
            password: hashedPassword
        })


        // const token = jwt.sign({username}, secretkey, {expiresIn: "24h"});
        res.status(201).json({
            message: "User registered succesfully",
            // token
        })
        return;
    } catch(error) {
        res.status(500).json({
            error: (error as Error).message
        })
        return;
    }
});

app.post("/api/v1/signin", async (req, res) => {
    try {
        const {username, password} = req.body as SigninRequestBody
        const user = await userModel.findOne({username});
        if(!user) {
            res.status(400).json({
                error: "Username not found"
            })
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password!);
        if(!isMatch) {
            res.status(400).json({
                error: "Invalid Password"
            })
            return;
        }

        const token = jwt.sign({id:user._id}, secretkey,{expiresIn: "24h"} )
        res.status(201).json({
            message: "Login successful",
            token
        })
    } catch(error) {
        res.status(500).json({
            error: (error as Error).message
        });
    }
});

app.post("/api/v1/content", userMiddleware ,async (req: Request, res: Response) => {
    const title = req.body.title;
    const link = req.body.link;
    const type = req.body.type;
    await contentModel.create({
        title: title,
        link: link,
        type: type,
        userId: req.userId,
        tag: []
    })

    res.json({
        message: "Content added"
    })


});

app.get("/api/v1/content",userMiddleware ,async (req: Request, res: Response) => {
    const content = await contentModel.find({
        userId: req.userId,
    }).populate("userId", "username");

    res.json({
        content
    })
});

app.delete("/api/v1/content",userMiddleware, async (req: Request, res: Response) => {
    const contentId = req.body.id;
    await contentModel.deleteMany({
        _id: contentId,
        userId: req.userId
    })
    res.json({
        message: "Content deleted"
    })
});

app.post("/api/v1/brain/share", userMiddleware , async (req: Request, res: Response) => {
    const share = req.body.share;
    if(share) {
        const isExisting = await linkModel.findOne({
          userId: (req).userId  
        })
        if(isExisting) {
            res.json({
                message: "share/" + isExisting.hash
            })
            return;
        }
        const hash = random(10);
        await linkModel.create({
            userId: req.userId,
            hash
        });

        res.json({
            message: "share/" + hash
        })
        return;
    } else {
        await linkModel.deleteMany({
            userId: req.userId,
        })
        res.json({
            message: "link deleted"
        })
        return;
    }
    
});

app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {
    const hash = req.params.shareLink;

    const link = await linkModel.findOne({
        hash
    })
    if(!link) {
        res.status(404).json({
            error: "Link not found"
        })
        return;
    }

    const content = await contentModel.find({
        userId: link.userId
    })

    res.json({
        content
    })
    return;

});

app.listen(3000);