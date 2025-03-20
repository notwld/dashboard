import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import bycrpt from 'bcrypt';
import upload from '../utils/multerConfig';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

const authorize = require('../middleware/auth');

// Middleware for handling multiple file uploads
const uploadFields = upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'cnicFront', maxCount: 1 },
    { name: 'cnicBack', maxCount: 1 }
]);

router.post('/create-user', uploadFields, async (req: Request, res: Response) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        const user = await prisma.user.findFirst({
            where: {
                email: req.body.email,
            },
        });
        
        if (user !== null) {
            res.status(400).json({ message: 'User already exists', status: 400 });
            return;
        }
        if (!req.body.roleId) {
            res.status(400).json({ message: 'Role ID is required', status: 400 });
            return;
        }

        if (!req.body.password || req.body.password !== req.body.confirmPassword) {
            res.status(400).json({ message: 'Passwords do not match', status: 400 });
            return;
        }

        // Process file paths
        const profilePicPath = files['profilePic'] ? `/uploads/${files['profilePic'][0].filename}` : null;
        const cnicFrontPath = files['cnicFront'] ? `/uploads/${files['cnicFront'][0].filename}` : null;
        const cnicBackPath = files['cnicBack'] ? `/uploads/${files['cnicBack'][0].filename}` : null;

        const salt = await bycrpt.genSalt(10);
        const hashedPassword = await bycrpt.hash(req.body.password, salt);
        
        const newUser = await prisma.user.create({
            data: {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                employeeCode: req.body.employeeCode,
                phoneNumber: req.body.phoneNumber,
                profilePic: profilePicPath,
                cnicFront: cnicFrontPath,
                cnicBack: cnicBackPath,
                city: req.body.city,
                country: req.body.country,
                address: req.body.address,
                education: req.body.education,
                experience: req.body.experience,
                department: req.body.department,
                status: req.body.status || 'ACTIVE',
                salary: req.body.salary ? parseFloat(req.body.salary) : null,
                password: hashedPassword,
                leaveBalance: req.body.leaveBalance || 5,
                role: {
                    connect: {
                        id: parseInt(req.body.roleId),
                    },
                },
            },
            include: {
                role: true,
            },
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
});

router.get('/get-users', async (req: Request, res: Response) => {
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


router.put('/update-user/:id', authorize, uploadFields, async (req: Request, res: Response) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Process file paths
        const profilePicPath = files['profilePic'] ? `/uploads/${files['profilePic'][0].filename}` : undefined;
        const cnicFrontPath = files['cnicFront'] ? `/uploads/${files['cnicFront'][0].filename}` : undefined;
        const cnicBackPath = files['cnicBack'] ? `/uploads/${files['cnicBack'][0].filename}` : undefined;

        const updateData: any = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            employeeCode: req.body.employeeCode,
            phoneNumber: req.body.phoneNumber,
            city: req.body.city,
            country: req.body.country,
            address: req.body.address,
            education: req.body.education,
            experience: req.body.experience,
            department: req.body.department,
            status: req.body.status,
            salary: req.body.salary ? parseFloat(req.body.salary) : undefined,
            leaveBalance: req.body.leaveBalance,
            role: {
                connect: {
                    id: parseInt(req.body.roleId),
                },
            },
        };

        // Only update file paths if new files were uploaded
        if (profilePicPath) updateData.profilePic = profilePicPath;
        if (cnicFrontPath) updateData.cnicFront = cnicFrontPath;
        if (cnicBackPath) updateData.cnicBack = cnicBackPath;

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