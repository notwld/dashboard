import express from 'express';
import http from 'node:http';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import ExpressSession from "express-session";

declare module 'express-session' {
    export interface SessionData {
        user: string,
        token: string
    }
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ExpressSession({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Hello World');
});


http.createServer(app).listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});