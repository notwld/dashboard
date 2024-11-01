import { Request,Response,Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get('/roles', async (req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany();
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

router.post('/create-role', async (req: Request, res: Response) => {
    try {
        const role = await prisma.role.findFirst({
            where: {
                name: req.body.name,
            },
        });

        if (role !== null) {
            res.status(400).json({ message: 'Role already exists' });
            return;
        }

        const newRole = await prisma.role.create({
            data: {
                name: req.body.name,
            },
        });

        res.status(201).json(newRole);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

export default router;