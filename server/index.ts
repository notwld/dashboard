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
        user_id: number,
        token: string
    }
}

dotenv.config();

const app = express();
app.use(ExpressSession({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000,}
   
    
}));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
));
app.use("/auth", Auth);
const authorize = require('./middleware/auth');
app.get('/get-session', authorize, (req: Request, res: Response) => {
    res.json(req.session.token);
});

app.use("/user", User);
app.use('/role', Role);
app.use('/perm', Permission);
app.use('/lead', Lead);



http.createServer(app).listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});