import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const authorize = require('../middleware/auth.ts');

const router = Router();
const prisma = new PrismaClient();

router.post('/check-in', authorize, async (req: any, res: any) => {
  const { userId, checkInTime } = req.body;
  try {
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

router.post('/periodic-update', authorize, async (req: any, res: any) => {
  const { userId, attendanceId } = req.body;
  const currentAttendance = await prisma.attendance.findFirst({
    where: {
      id: parseInt(attendanceId),
      userId: parseInt(userId),
    },
  });
  const workedHours = (new Date().getTime() - new Date(currentAttendance?.checkIn || 0).getTime()) / (1000 * 60 * 60);
  try {
    await prisma.attendance.update({
      where: {
        id: currentAttendance?.id || 0,
      },
      data: {
        totalHours: workedHours || 0,
      },
    });
    console.log(workedHours);
    return res.status(200).send({ message: `worked: ${workedHours}` });
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
      orderBy: {
        date: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
    });

    const formattedData = attendanceRecords.map((record) => ({
      id: record.id,
      username: `${record.user.firstName} ${record.user.lastName}`,
      checkInTime: record.checkIn,
      checkOutTime: record.checkOut,
      date: record.date,
      isPresent: record.isPresent,
      isOnLeave: record.isOnLeave,
      leaveStatus: record.leaveStatus,
      leaveReason: record.leaveReason,
      leaveType: record.leaveType,
      totalHours: record.totalHours,
    }));
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
  const { id, status, userId } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { role: true }
    });

    const leaveRequest = await prisma.attendance.findUnique({
      where: { id: parseInt(id) }
    });

    if (!leaveRequest) {
      return res.status(404).send({ message: 'Leave request not found' });
    }

    let newStatus = status;
    let updateData: any = {};

    if (user?.role?.name === 'MANAGER') {
      if (status === 'APPROVED') {
        newStatus = 'MANAGER_APPROVED';
        updateData.managerId = parseInt(userId);
      } else if (status === 'REJECTED') {
        newStatus = 'MANAGER_REJECTED';
        updateData.managerId = parseInt(userId);
      }
    } else if (user?.role?.name === 'HR') {
      if (status === 'APPROVED' && leaveRequest.leaveStatus === 'MANAGER_APPROVED') {
        newStatus = 'APPROVED';
        updateData.hrId = parseInt(userId);
        // Update leave balance only when HR approves
        await prisma.user.update({
          where: { id: leaveRequest.userId },
          data: {
            leaveBalance: {
              decrement: 1
            }
          }
        });
      } else if (status === 'REJECTED') {
        newStatus = 'HR_REJECTED';
        updateData.hrId = parseInt(userId);
      }
    }

    updateData.leaveStatus = newStatus;
    const updated = await prisma.attendance.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return res.status(200).send({ message: 'Leave updated successfully', status: newStatus });
  } catch (err) {
    console.error('Error updating leave:', err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.get("/get-users", authorize, async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany(
      {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          leaveBalance: true,
        }
      }
    );
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      leaveBalance: user.leaveBalance
    }));
    return res.status(200).send(formattedUsers);
  }
  catch (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
})
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};
router.post("/user-summary", async (req: any, res: any) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch all attendance records for the user
    const attendanceRecords = await prisma.attendance.findMany({
      orderBy: {
        date: 'desc',
      },
      where: { userId: parseInt(userId) },
      select: { checkIn: true, isLate: true, isOnLeave: true },
    });

    const cutoffTime = new Date();
    cutoffTime.setHours(18, 15, 0, 0); // 6:15 PM

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
      orderBy: {
        date: 'desc',
      },
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

router.get("/all-absent-users", authorize, async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentUsers = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
          lte: new Date(),
        },
        isPresent: true,
        isOnLeave: false,
      },
      select: {
        userId: true,
      },
    });

    const presentUserIds = presentUsers.map((user) => user.userId);
    console.log(presentUserIds);
    const absentUsers = await prisma.user.findMany({
      where: {
        NOT: {
          id: {
            in: presentUserIds,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
      },
    });
    
    const formattedAbsentUsers = absentUsers.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      department: user.department
    }));
    
    res.json(formattedAbsentUsers);

  } catch (error) {
    console.error("Error fetching absent users:", error);
    res.status(500).json({ message: "Internal server error", status: 500 });
  }
});
const getTopEmployeesByAttendance = async (month: number, year: number, topN: number = 3) => {
  // Get first and last day of the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      attendance: {
        where: {
          date: { gte: startDate, lte: endDate }, // Filter only this month's data
        },
        select: {
          isPresent: true,
          totalHours: true,
          isLate: true,
        },
      },
    },
  });

  // Calculate attendance-based performance score
  const rankedUsers = users.map(user => {
    const totalDaysPresent = user.attendance.filter(a => a.isPresent).length;
    const totalHoursWorked = user.attendance.reduce((sum, a) => sum + a.totalHours, 0);
    const lateDays = user.attendance.filter(a => a.isLate).length;

    const performanceScore = (totalDaysPresent * 2) + (totalHoursWorked * 1) - (lateDays * 3);

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      totalDaysPresent,
      totalHoursWorked,
      lateDays,
      performanceScore,
    };
  });

  // Sort employees by performance score in descending order
  const topEmployees = rankedUsers
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, topN); // Get top N employees

  return topEmployees;
};

router.get("/top-employees", authorize, async (req: Request, res: Response) => {
  const month = new Date().getMonth() + 1; // Current month
  const year = new Date().getFullYear();

  try {
    const topEmployees = await getTopEmployeesByAttendance(month, year);
    res.json(topEmployees);
  } catch (error) {
    console.error("Error fetching top employees:", error);
    res.status(500).json({ message: "Internal server error", status: 500 });
  }
});

export default router;