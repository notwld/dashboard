import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';


const authorize = (req: Request, res: Response, next: NextFunction) => {
    const token = req.session.token || req.headers['x-access-token'] || req.headers['authorization'] || req.cookies['Authorization']
    if (!token) return res.send("Access Denied")
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'default') as any
        req.session.user = verified.user_id
        next()
    } catch (err) {
        res.status(400).send(`Invalid Token: ${err.message}`)
    }
}

module.exports = authorize;