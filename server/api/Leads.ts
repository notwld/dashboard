import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get('/get-leads', async (req: Request, res: Response) => {
    try {
        const leads = await prisma.lead.findMany(
            {
                include: {
                    assignee: true,
                },
            }
        );
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
        const _id = 4;

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
                cost: parseFloat(body.cost),
                comments: body.comments,
                credits: Number(body.credits),
                address: body.address,
                status: body.status,
                assignee: {
                    connect: {
                        id: Number(body.userId)
                    }
                },

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
        // remove asignee
        await prisma.lead.update({
            where: {
                id: Number(req.params.id),
            },
            data: {
                assignee: {
                    disconnect: true,
                },
            },
        });

        const body = req.body;
        const updatedLead = await prisma.lead.update({
            where: {
                id: Number(req.params.id),
            },
            data: {
                date: body.date,
                time: body.time,
                platform: body.platform,
                firstCall: body.firstCall,
                service: body.service,
                name: body.name,
                email: body.email,
                number: body.number,
                cost: parseFloat(body.cost),
                status: body.status,
                comments: body.comments,
                credits: Number(body.credits),
                address: body.address,
                assignee: {
                    connect: {
                        id: Number(body.userId)
                    }
                },

            }
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
import { json2csv } from 'json-2-csv';
router.get('/download-leads', async (req: Request, res: Response) => {
    try {
        const leads = await prisma.lead.findMany();
        const csv = await json2csv(leads, { emptyFieldValue: '' });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=devmize_leads.csv');
        res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
});

export default router;