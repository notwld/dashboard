import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import bycrpt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

const authorize = require('../middleware/auth');


router.post('/create-user',authorize, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: req.body.email,
            },
        });
        
        if (user !== null) {
            res.status(400).json({ message: 'User already exists',status:400 });
            return; 
        }
        if(!req.body.roleId){
            res.status(400).json({ message: 'Role ID is required',status:400 });
            return
        }

        if(!req.body.password || req.body.password !== req.body.confirmPassword ){
            res.status(400).json({ message: 'Passwords do not match',status:400 });
            return
        }
        const salt = await bycrpt.genSalt(10);
        const hashedPassword = await bycrpt.hash(req.body.password, salt);
        const newUser = await prisma.user.create({
            data: {
                email: req.body.email,
                name: req.body.username,
                department: req.body.department,
                password: hashedPassword,
                leaveBalance: req.body.leaveBalance || 5,
                role: {
                    connect: {
                        id: req.body.roleId,
                    },
                },
            },
            include: {
                role: true,
            },
        });
        // console.log(newUser);
        res.status(201).json(newUser); 
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Internal server error',status:500 });
    }
});

router.get('/get-users', authorize, async (req: Request, res: Response) => {
    try {
        let users = await prisma.user.findMany({
            include: {
                role: {
                    include: {
                        permissions: true,
                    }
                }
            },
        });
     
        // console.log(users);
        res.json(users);
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Internal server error',status:500 });
    }
});


router.put('/update-user/:id', authorize, async (req: Request, res: Response) => {
    try {
        const updateData: any = {
            email: req.body.email,
            name: req.body.username,
            leaveBalance: req.body.leaveBalance,
            department: req.body.department,
            role: {
                connect: {
                    id: req.body.roleId,
                },
            },
        };

        // Check if password is provided
        if (req.body.password) {
            const salt = await bycrpt.genSalt(10);
            updateData.password = await bycrpt.hash(req.body.password, salt);
        }

        const user = await prisma.user.update({
            where: {
                id: parseInt(req.params.id),
            },
            data: updateData,
            include: {
                role: true,
            },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found', status: 404 });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
});

router.delete('/delete-user/:id', authorize, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.delete({
            where: {
                id: parseInt(req.params.id),
            }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found',status:404 });
            return;
        }
        // console.log(user);
        res.json({
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Internal server error',status:500 });
    }
});

router.get('/get-user/', authorize, async (req: Request, res: Response) => {
    try {
        const user_id = req.session.user_id 
        const user = await prisma.user.findUnique({
            where: {
                id: user_id,
            },
            include: {
                role: {
                    include: {
                        permissions: true,
                    }
                }
            },
        });
        if (!user) {
            res.status(404).json({ message: 'User not found',status:404 });
            return;
        }
        // console.log(user);
        res.json(user);
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Internal server error',status:500 });
    }
}
);

// Profile endpoint - returns the current user's profile
router.get('/profile', authorize, async (req: Request, res: Response) => {
    try {
        const user_id = req.session.user_id;
        const user = await prisma.user.findUnique({
            where: {
                id: user_id,
            },
            include: {
                role: {
                    include: {
                        permissions: true,
                    }
                }
            },
        });
        
        if (!user) {
            res.status(404).json({ message: 'User not found', status: 404 });
            return;
        }

        // Remove sensitive information
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
});

export default router;