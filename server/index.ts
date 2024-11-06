import express from 'express';
import http from 'node:http';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import ExpressSession from "express-session";
import cors from 'cors';
import User from './api/User';
import Role from './api/Roles';
import Permission from './api/Permissions';
import Lead from './api/Leads';
import Auth from './api/Auth';

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
app.use(express.urlencoded({ extended: false }));
app.use(ExpressSession({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Hello World');
});

app.use("/user", User);
app.use("/auth", Auth);
app.use('/role', Role);
app.use('/perm', Permission);
app.use('/lead', Lead);
http.createServer(app).listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});