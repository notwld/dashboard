import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const authorize = require('../middleware/auth.ts');

const router = Router();
const prisma = new PrismaClient();

// Check-in for the day
router.post("/check-in/:id", authorize, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(today);
    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        checkIn: new Date(),
        isPresent: true,
      },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: "Failed to check in" });
  }
});

// Check-out for the day
router.post("/check-out/:id", authorize, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        checkOut: null,
      },
      include: {
        breaks: true,
      },
    });

    if (!attendance) {
      return res.status(404).json({ message: "No active attendance found" });
    }

    const checkOutTime = new Date();
    const totalBreakDuration = attendance.breaks.reduce((acc, curr) => acc + curr.duration, 0);
    const totalHours = (checkOutTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60) - totalBreakDuration;

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        totalHours: Math.max(0, totalHours),
      },
    });

    res.json(updatedAttendance);
  } catch (error) {
    res.status(500).json({ error: "Failed to check out" });
  }
});

// Start break
router.post("/break/start/:id", authorize, async (req:any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({ message: "No active attendance found" });
    }

    const activeBreak = await prisma.break.findFirst({
      where: {
        userId,
        attendanceId: attendance.id,
        endTime: null,
      },
    });

    if (activeBreak) {
      return res.status(400).json({ message: "Already on break" });
    }

    const newBreak = await prisma.break.create({
      data: {
        userId,
        attendanceId: attendance.id,
      },
    });

    res.json(newBreak);
  } catch (error) {
    res.status(500).json({ error: "Failed to start break" });
  }
});

// End break
router.post("/break/end/:id", authorize, async (req:any, res: any) => {
  try {
    const userId =  parseInt(req.params.id);

    const activeBreak = await prisma.break.findFirst({
      where: {
        userId,
        endTime: null,
      },
    });

    if (!activeBreak) {
      return res.status(404).json({ message: "No active break found" });
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - activeBreak.startTime.getTime()) / (1000 * 60 * 60); // in hours

    const updatedBreak = await prisma.break.update({
      where: { id: activeBreak.id },
      data: {
        endTime,
        duration,
      },
    });

    res.json(updatedBreak);
  } catch (error) {
    res.status(500).json({ error: "Failed to end break" });
  }
});

// Request leave
router.post("/leave/:id", authorize, async (req:any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const { date, reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.leaveBalance <= 0) {
      return res.status(400).json({ message: "Insufficient leave balance" });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId,
        date: new Date(date),
        reason,
      },
    });

    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: "Failed to request leave" });
  }
});

// Get user's attendance history
router.get("/history/:id", authorize, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { startDate, endDate } = req.query;
    console.log(startDate, endDate);
    const attendance = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      include: {
        breaks: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance history" });
  }
});

export default router;