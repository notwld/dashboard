import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const authorize = require('../middleware/auth.ts');

const router = Router();
const prisma = new PrismaClient();

router.post('/check-in', authorize, async (req: any, res: any) => {
  const { userId, checkInTime } = req.body;
  try {
    console.log(userId, checkInTime);
    await prisma.attendance.create({
      data: {
        user: {
          connect: { id: parseInt(userId) }
        },
        checkIn: checkInTime,
        isPresent: true
      }
    });
    return res.status(200).send({ message: 'Check-in successful' });
  }
  catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});
import { subHours, startOfDay, endOfDay } from 'date-fns';

router.post('/check-out', authorize, async (req: any, res: any) => {
  const { userId, checkOutTime } = req.body;

  try {
    const today = new Date();
    const todayStart = startOfDay(today); // 00:00:00 of today
    const todayEnd = endOfDay(today); // 23:59:59 of today
    console.log(todayStart, todayEnd);
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: parseInt(userId),
        checkOut: null, // Ensure it's an active check-in
        checkIn: {
          gte: todayStart, // Check-in must be today
          lte: todayEnd,
        },
      },
    });
    const workedHours = (new Date(checkOutTime).getTime() - new Date(existingAttendance?.checkIn || 0).getTime()) / (1000 * 60 * 60);
    const updatedAttendance = await prisma.attendance.updateMany({
      where: {
        userId: parseInt(userId),
        checkOut: null, // Ensure it's an active check-in
        checkIn: {
          gte: todayStart, // Check-in must be today
          lte: todayEnd,
        },
      },
      data: {
        checkOut: checkOutTime,
        totalHours: workedHours || 0,

      },
    });

    if (updatedAttendance.count === 0) {
      return res.status(404).send({ message: "No active check-in found for today" });
    }

    return res.status(200).send({ message: "Check-out successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post('/all-attendance', authorize, async (req: any, res: any) => {
  try {
    const allAttendance = await prisma.attendance.findMany(
      {
        where: {
          userId: parseInt(req.body.userId),

        },

      }
    );
    return res.status(200).send(allAttendance);
  }
  catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});
router.get("/all/hr", authorize, async (req: any, res: any) => {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
      include: {
        user: true,
      },
    });

    const formattedData = attendanceRecords.map((record) => ({
      id: record.id,
      username: record.user.name,
      checkInTime: record.checkIn,
      checkOutTime: record.checkOut,
      date: record.date,
      isPresent: record.isPresent,
      isOnLeave: record.isOnLeave,
      leaveStatus: record.leaveStatus,
      leaveReason: record.leaveReason,
      leaveType: record.leaveType,
    }));
    console.log(formattedData);
    res.json({ formattedData });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
})

router.post("/apply-leave", authorize, async (req: any, res: any) => {
  const { userId, reason, leaveType, date } = req.body;
  try {
    await prisma.attendance.create({
      data: {
        user: {
          connect: { id: parseInt(userId) }
        },

        isOnLeave: true,
        leaveStatus: 'PENDING',
        leaveType,
        date,
        leaveReason: reason
      }
    });
    return res.status(200).send({ message: 'Leave applied successfully' });
  }
  catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.post("/update-leave", authorize, async (req: any, res: any) => {
  const { id, status } = req.body;
  console.log(id, status);
  try {
    const updated = await prisma.attendance.update({
      where: {
        id: parseInt(id)
      },
      data: {
        leaveStatus: status
      }
    });
    if(status === 'APPROVED') {
      await prisma.user.update({
        where: {
          id: updated?.userId
        },
        data: {
          leaveBalance: {
            decrement: 1
          }
        }
      });
    }
    return res.status(200).send({ message: 'Leave updated successfully' });
  }
  catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
})

router.get("/get-users", authorize, async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany(
      {
        select: {
          id: true,
          name: true,
          leaveBalance: true,
        }
      }
    );
    return res.status(200).send(users);
  }
  catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
}
)
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};
router.post("/user-summary", async (req:any, res:any) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch all attendance records for the user
    const attendanceRecords = await prisma.attendance.findMany({
      where: { userId:parseInt(userId) },
      select: { checkIn: true, isLate: true, isOnLeave: true },
    });

    // Define the cutoff time for on-time attendance (6:15 PM)
    const cutoffTime = new Date();
    cutoffTime.setHours(18, 15, 0, 0); // 6:15 PM

    // Calculate on-time count
    let onTimeCount = 0;
    let lateCount = 0;
    let leaveCount = 0;

    attendanceRecords.forEach((record) => {
      const checkInTime = new Date(record.checkIn);

      if (record.isOnLeave) {
        leaveCount++;
      } else if (checkInTime < cutoffTime) {
        onTimeCount++;
      } else {
        lateCount++;
      }
    });

    // Get leave balance from User table
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { leaveBalance: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      onTime: onTimeCount,
      late: lateCount,
      leavesTaken: leaveCount,
      leaveBalance: user.leaveBalance,
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// API to get employee attendance summary
router.get("/summary", async (req, res) => {
  try {
    const today = getToday();
    const checkInCutoff = new Date(today);
    checkInCutoff.setHours(18, 15, 0, 0); // 6:15 PM

    // Get total employees
    const totalEmployees = await prisma.user.count();

    // Get today's attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      select: {
        userId: true,
        isPresent: true,
        isOnLeave: true,
        checkIn: true,
      },
    });

    // Count present, absent, and late employees
    let presentToday = 0;
    let lateToday = 0;
    let presentUserIds = new Set();

    attendanceRecords.forEach((record) => {
      if (record.isPresent) {
        presentToday++;
        presentUserIds.add(record.userId);
        if (record.checkIn && record.checkIn > checkInCutoff) {
          lateToday++;
        }
      }
    });

    // Absent employees = Total users - Present users
    const absentToday = totalEmployees - presentToday;

    res.json({
      totalEmployees,
      presentToday,
      absentToday,
      lateToday,
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;