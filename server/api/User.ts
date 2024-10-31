import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const router = Router();
const prisma = new PrismaClient();

interface User {
    id: number;
    email: string;
    name: string;
    password: string;
}

// Create user endpoint
router.post<{}, User>('/create-user', async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: req.body.email,
            },
        });
        
        if (user !== null) {
            res.status(400).json({ message: 'User already exists' });
            return; // Return to exit the function after sending the response
        }

        const newUser = await prisma.user.create({
            data: {
                email: req.body.email,
                name: req.body.name,
                password: req.body.password,
            },
        });

        res.status(201).json(newUser); // Respond with 201 Created status
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get users endpoint
router.get<{}, User>('/get-users', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
