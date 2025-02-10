import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const authorize = require('../middleware/auth');

const router = Router();
const prisma = new PrismaClient();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads', 'brands');
        
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `brand-logo-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter for image uploads
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'));
    }
};

// Configure multer upload
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 50 * 1024 * 1024 // 50MB file size limit
    }
});
router.post("/add",authorize, upload.single('logo'), async (req: any, res: any) => {
    try {
        const { 
            name, 
            description, 
            stripeSecretKey, 
            stripePublishableKey 
        } = req.body;

        // Validate required fields
        if (!name || !description || !stripeSecretKey || !stripePublishableKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Relative path for database storage
        const logoPath = req.file 
            ? path.join('uploads', 'brands', path.basename(req.file.path))
            : null;

        // Create brand using Prisma
        const newBrand = await prisma.brand.create({
            data: {
                name,
                description,
                logo: logoPath,
                stripeSecretKey,
                stripePublishableKey
            }
        });

        res.status(201).json({
            message: 'Brand created successfully',
            brand: newBrand
        });
    } catch (error) {
        console.error('Brand creation error:', error);
        
        // Remove uploaded file if error occurs
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error removing uploaded file:', unlinkError);
            }
        }

        res.status(500).json({ error: 'Failed to create brand' });
    }
});
router.get("/logo/:filename", (req: Request, res: Response) => {
    const filename = req.params.filename;
    const logoPath = path.join(__dirname, 'public', ...filename.split(/[/\\]/));
    
    res.sendFile(logoPath, (err) => {
      if (err) {
        console.error('Logo not found:', err);
        res.status(404).send('Logo not found');
      }
    });
  });
router.get("/all", authorize, async (req: any, res: any) => {
    try {
        const brands = await prisma.brand.findMany();
        res.status(200).json(brands);
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
);

// router.get("/:id", authorize, async (req: any, res: any) => {
//     try {
//         const brand = await prisma.brand.findUnique({
//             where: {
//                 id: parseInt(req.params.id),
//             },
//         });

//         if (!brand) {
//             return res.status(404).json({ error: 'Brand not found' });
//         }

//         res.status(200).json(brand);
//     } catch (error) {
//         console.error('Error fetching brand:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }
// );

// router.put("/:id", authorize, upload.single('logo'), async (req: any, res: any) => {
//     try {
//         const { 
//             name, 
//             description, 
//             stripeSecretKey, 
//             stripePublishableKey 
//         } = req.body;

//         // Validate required fields
//         if (!name || !description || !stripeSecretKey || !stripePublishableKey) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         // Relative path for database storage
//         const logoPath = req.file 
//             ? path.join('uploads', 'brands', path.basename(req.file.path))
//             : null;

//         // Update brand using Prisma
//         const updatedBrand = await prisma.brand.update({
//             where: {
//                 id: parseInt(req.params.id),
//             },
//             data: {
//                 name,
//                 description,
//                 logo: logoPath,
//                 stripeSecretKey,
//                 stripePublishableKey
//             }
//         });

//         res.status(200).json({
//             message: 'Brand updated successfully',
//             brand: updatedBrand
//         });
//     } catch (error) {
//         console.error('Brand update error:', error);
        
//         // Remove uploaded file if error occurs
//         if (req.file) {
//             try {
//                 fs.unlinkSync(req.file.path);
//             } catch (unlinkError) {
//                 console.error('Error removing uploaded file:', unlinkError);
//             }
//         }

//         res.status(500).json({ error: 'Failed to update brand' });
//     }
// }
// );
export default router;