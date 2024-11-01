import { Request,Response,Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.put('/role/:id', async (req: Request, res: Response) => {
    try {
        const role = await prisma.role.findUnique({
            where: {
                id: Number(req.params.id),
            },
        });

        if (role === null) {
            res.status(400).json({ message: 'Role does not exist',status:400 });
            return;
        }

        const permissions = req.body.items
        if(!permissions){
            res.status(400).json({ message: 'Permissions are required',status:400 });
            return
        }
        const updatedRole = await prisma.role.update({
            where: {
                id: Number(req.params.id),
            },
            data: {
                permissions: {
                    create: permissions.map((permission: string) => {
                        return {
                            name: permission,
                        };
                    }),
                },
            },
        });
        if (!updatedRole) {
            res.status(400).json({ message: 'Role could not be updated',status:400 });
            return;
        }
        res.json(updatedRole);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error',status:500 });
    }
})


export default router;