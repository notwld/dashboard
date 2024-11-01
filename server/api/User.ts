import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const router = Router();
const prisma = new PrismaClient();


router.post('/create-user', async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: req.body.email,
            },
        });
        
        if (user !== null) {
            res.status(400).json({ message: 'User already exists' });
            return; 
        }

        const newUser = await prisma.user.create({
            data: {
                email: req.body.email,
                name: req.body.username,
                password: req.body.password,
            },
        });

        res.status(201).json(newUser); 
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/get-users', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        console.log(users);
        res.json(users);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' });
    }
});

// module.exports = router;
export default router;