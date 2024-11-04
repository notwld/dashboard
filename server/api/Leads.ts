import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get('/get-leads', async (req: Request, res: Response) => {
    try {
        const leads = await prisma.lead.findMany();
        res.json(leads);
        console.log(leads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}
);

router.post('/create-lead', async (req: Request, res: Response) => {
    try {
        const id = 4;

        const body = req.body;
        if (!body.date || !body.time || !body.platform || !body.firstCall || !body.service || !body.name || !body.email || !body.number || !body.cost || !body.credits) {
            res.status(400).json({ message: 'Please fill all the fields', status: 400 });
            return;
        }
        const newLead = await prisma.lead.create({
            data: {
                date: body.date,
                time: body.time,
                platform: body.platform,
                firstCall: body.firstCall,
                service: body.service,
                name: body.name,
                email: body.email,
                number: body.number,
                cost:parseFloat(body.cost),
                comments: body.comments,
                credits: Number(body.credits),
                address: body.address,
            },
            include: {
                assignee: true,
            },
        });
        res.status(201).json(newLead);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
});

router.put('/update-lead/:id', async (req: Request, res: Response) => {
    try {
        const lead = await prisma.lead.findUnique({
            where: {
                id: Number(req.params.id),
            },
        });

        if (lead === null) {
            res.status(400).json({ message: 'Lead does not exist', status: 400 });
            return;
        }

        const updatedLead = await prisma.lead.update({
            where: {
                id: Number(req.params.id),
            },
            data: req.body,
        });

        res.json(updatedLead);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
});

router.delete('/delete-lead/:id', async (req: Request, res: Response) => {
    try {
        const lead = await prisma.lead.findUnique({
            where: {
                id: Number(req.params.id),
            },
        });

        if (lead === null) {
            res.status(400).json({ message: 'Lead does not exist', status: 400 });
            return;
        }

        await prisma.lead.delete({
            where: {
                id: Number(req.params.id),
            },
        });

        res.json(lead);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}
);

export default router;