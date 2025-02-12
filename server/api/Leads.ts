import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();
const authorize = require('../middleware/auth');

router.get('/get-leads', authorize, async (req: Request, res: Response) => {
    try {
        const leads = await prisma.lead.findMany(
            {
                include: {
                    assignee: true,
                },
            }
        );
        res.json(leads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 500 });
    }
}
);

router.post('/create-lead', authorize, async (req: Request, res: Response) => {
    try {
        const _id = req.session.user_id

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
                User: {
                    connect: {
                        id: Number(_id)
                    }
                }

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

router.put('/update-lead/:id', authorize, async (req: Request, res: Response) => {
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

router.delete('/delete-lead/:id', authorize , async (req: Request, res: Response) => {
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
router.get('/download-leads', authorize, async (req: Request, res: Response) => {
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
const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req:any, file:any, cb:any) {
        cb(null, 'uploads/') // Ensure this directory exists
    },
    filename: function (req:any, file:any, cb:any) {
        cb(null, 'leads-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req:any, file:any, cb:any) => {
        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv', // .csv
            'application/csv'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only Excel and CSV files are allowed!'));
        }
    }
});



router.post('/import-leads', authorize, upload.single('file'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel file', status: 400 });
        }

        // Read the Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Define field mappings (Excel column names to model fields)
        const fieldMappings = {
            'Date': 'date',
            'Time': 'time',
            'Platfrom': 'platform', // Note: handling the typo in Excel
            'First Call': 'firstCall',
            'Comments': 'comments',
            'Service': 'service',
            'Name': 'name',
            'Email': 'email',
            'Number': 'number',
            'Address': 'address',
            'Credits': 'credits',
            'Assigned': 'assignee'
        };

        // Validate the data structure
        const requiredFields = ['Date', 'Time', 'Platfrom']; // Using Excel column names
        const isValidData = data.every((row: any) => {
            return requiredFields.every(field => 
                Object.keys(row).some(key => key === field)
            );
        });

        if (!isValidData) {
            return res.status(400).json({ 
                message: 'Invalid Excel format. Please ensure all required fields are present', 
                requiredFields,
                status: 400 
            });
        }

        // Helper function to convert Excel date number to ISO string
        const excelDateToISO = (excelDate: number): string => {
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            return date.toISOString();
        };

        // Helper function to convert Excel time to string
        const excelTimeToString = (excelTime: number): string => {
            const totalMinutes = Math.round(excelTime * 24 * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        // Process and insert the data
        const importedLeads = await Promise.all(data.map(async (row: any) => {
            // Find assignee by name if provided
            let assigneeId: number | undefined;
            if (row['Assigned']) {
                const assignee = await prisma.user.findFirst({
                    where: { name: row['Assigned'] }
                });
                assigneeId = assignee?.id;
            }

            return await prisma.lead.create({
                data: {
                    date: excelDateToISO(row['Date']),
                    time: excelTimeToString(row['Time']),
                    platform: row['Platfrom'],
                    firstCall: String(row['First Call'] || '').toLowerCase(),
                    service: row['Service'] || '',
                    name: row['Name'] || '',
                    email: row['Email'] || '',
                    number: String(row['Number'] || ''),
                    cost: 0.0,
                    credits: Number(row['Credits'] || 0),
                    comments: row['Comments'] || '',
                    address: row['Address'] || '',
                    status: 'NEW',
                    assigneeId: assigneeId,
                    userId: Number(req.session.user_id)
                },
                include: {
                    assignee: true,
                }
            });
        }));

        // Clean up the uploaded file
        const fs = require('fs');
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            message: 'Leads imported successfully',
            count: importedLeads.length,
            leads: importedLeads
        });

    } catch (error) {
        console.error('Error importing leads:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 500 
        });
    }
});

export default router;