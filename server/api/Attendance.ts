import { Router,Request,Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import bcyrpt from 'bcrypt';


const router = Router();
const prisma = new PrismaClient();