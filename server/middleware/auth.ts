import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction } from 'express';

const authorize = (req : Request, res : Response, next : NextFunction) => {
    let token = req.session.token || req.headers['x-access-token'] || req.headers['authorization'] || req.cookies['Authorization']

    if (!token) return res.send("Access Denied")
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET||"JWT_SECRET")
        req.session.user = verified?.user_id || null
        next()
    } catch (err) {
        res.status(400).send("Invalid Token")
    }
}

module.exports = authorize;