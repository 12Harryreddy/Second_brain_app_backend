"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const dotenv_1 = __importDefault(require("dotenv"));
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const secretkey = process.env.JWT_SECRET;
;
;
const usernameSchema = zod_1.z.string().min(3);
const passwordSchema = zod_1.z.string().min(8);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const validUserName = usernameSchema.safeParse(username);
        const validPassword = passwordSchema.safeParse(password);
        if (!validUserName.success) {
            res.status(400).json({
                error: "Invalid username: Minimum 3 characters required"
            });
            return;
        }
        if (!validPassword.success) {
            res.status(400).json({
                error: "Invalid password: Minimum 8 characters required"
            });
            return;
        }
        const existingUser = yield db_1.userModel.findOne({ username });
        if (existingUser) {
            res.status(400).json({
                error: "User already exits"
            });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // const newUser = new userModel({username, password:hashedPassword});
        // newUser.save();
        yield db_1.userModel.create({
            username,
            password: hashedPassword
        });
        // const token = jwt.sign({username}, secretkey, {expiresIn: "24h"});
        res.status(201).json({
            message: "User registered succesfully",
            // token
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        });
        return;
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield db_1.userModel.findOne({ username });
        if (!user) {
            res.status(400).json({
                error: "Username not found"
            });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({
                error: "Invalid Password"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, secretkey, { expiresIn: "24h" });
        res.status(201).json({
            message: "Login successful",
            token
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const link = req.body.link;
    const type = req.body.type;
    yield db_1.contentModel.create({
        title: title,
        link: link,
        type: type,
        userId: req.userId,
        tag: []
    });
    res.json({
        message: "Content added"
    });
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield db_1.contentModel.find({
        userId: req.userId,
    }).populate("userId", "username");
    res.json({
        content
    });
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.id;
    yield db_1.contentModel.deleteMany({
        _id: contentId,
        userId: req.userId
    });
    res.json({
        message: "Content deleted"
    });
}));
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const isExisting = yield db_1.linkModel.findOne({
            userId: (req).userId
        });
        if (isExisting) {
            res.json({
                message: "share/" + isExisting.hash
            });
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield db_1.linkModel.create({
            userId: req.userId,
            hash
        });
        res.json({
            message: "share/" + hash
        });
        return;
    }
    else {
        yield db_1.linkModel.deleteMany({
            userId: req.userId,
        });
        res.json({
            message: "link deleted"
        });
        return;
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.linkModel.findOne({
        hash
    });
    if (!link) {
        res.status(404).json({
            error: "Link not found"
        });
        return;
    }
    const content = yield db_1.contentModel.find({
        userId: link.userId
    });
    res.json({
        content
    });
    return;
}));
app.listen(3000);
