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
import Payment from './api/Payment';
import  Attendance  from './api/Attendance';
import path from 'node:path';
import Brand from './api/Brand';

declare module 'express-session' {
    export interface SessionData {
        user_id: number,
        token: string
    }
}

dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(ExpressSession({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000,}
   
    
}));
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ 
    limit: '50mb', 
    extended: true 
}));
app.use(cors());
app.use("/auth", Auth);
const authorize = require('./middleware/auth');
app.get('/get-session', authorize, (req: Request, res: Response) => {
    res.json(req.session.token);
});

app.use("/user", User);
app.use('/role', Role);
app.use('/perm', Permission);
app.use('/lead', Lead);
app.use('/payment', Payment);
app.use('/attendance', Attendance);
app.use("/brand", Brand);



http.createServer(app).listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});