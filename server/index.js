import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./db/db.js";
import routes from "./routes/index.js";

import "./models/user.model.js";
import "./models/post.model.js";
import "./models/comment.model.js";

dotenv.config({});

// call database connection here
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

// default middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin:process.env.FRONT_END_URL,
    credentials:true
}));
 
// apis
app.use('/api/v1',routes)
 
 
app.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
})

