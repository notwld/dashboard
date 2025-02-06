import { Router,Request,Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import bcyrpt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const router = Router();
const prisma = new PrismaClient();

router.post('/create', async (req: any, res: any) => {
    try {
        const { 
            fullname, 
            email, 
            phoneNumber, 
            paymentAmount, 
            paymentDescription, 
            packageType, 
            service 
        } = req.body;

        if (!fullname || !email || !phoneNumber || !paymentAmount || !packageType || !service) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const priceInCents = Math.round(paymentAmount * 100);

        // Create product
        const product = await stripe.products.create({
            name: `${service} - ${packageType}`,
            description: paymentDescription || `Service: ${service}, Package: ${packageType}`
        });

        // Create price
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: priceInCents,
            currency: "usd"
        });

        // Create payment link
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [{ price: price.id, quantity: 1 }],
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            customer_creation: 'always',
            metadata: {
                customer_name: fullname,
                email: email,
                phone: phoneNumber,
                service_type: service,
                package: packageType
            }
        });

        return res.json({
            success: true,
            payment_link: paymentLink.url,
            payment_link_id: paymentLink.id,
            expires_at: paymentLink.expires_at ? new Date(paymentLink.expires_at * 1000).toISOString() : null
        });
    } catch (error) {
        console.error("Error creating payment link:", error);
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
})

export default router;