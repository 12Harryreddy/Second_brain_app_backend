import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET  as string;



export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const decoded = jwt.verify(header as string, JWT_SECRET) as { id: string };
    if(decoded) {
        req.userId = decoded.id; 
        next();
    } else {
        res.status(403).json({
            error: "user not logged in!"
        })
    }
};