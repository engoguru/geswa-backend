
import crypto from "crypto";
import prisma from "../../src/config/prisma.js";
// prisma
const generateMemberId = () => {
  return `GEM-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

// Create Purchase
export const createPurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      membershipId,
      paymentMethod,
      transactionId,
      employeeAssignmentId
    } = req.body;

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: "Membership plan required"
      });
    }
    console.log(req.body)
    const membership = await prisma.membership.findUnique({
      where: { id: Number(membershipId) }
    });
    const assignment = await prisma.employeeAssignment.findFirst({
      where: {
        employeeId: Number(employeeAssignmentId)
      }
    });
    

    if (!membership || !membership.isActive) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not available"
      });
    }

    const startDate = new Date();
    let endDate = null;

    if (membership.durationUnit !== "LIFETIME") {
      endDate = new Date(startDate);

      if (membership.durationUnit === "MONTH")
        endDate.setMonth(endDate.getMonth() + membership.durationValue);

      if (membership.durationUnit === "YEAR")
        endDate.setFullYear(endDate.getFullYear() + membership.durationValue);
    }

    const purchase = await prisma.membershipPurchase.create({
      data: {
        userId,
        employeeAssignmentId: assignment
          ? Number(assignment?.id)
          : null,
        membershipId: membership.id,
        memberId: generateMemberId(),
        amountPaid: membership.price,
        paymentStatus: "SUCCESS",
        status: "ACTIVE",
        startDate,
        endDate,
        paymentMethod,
        transactionId
      },
      include: {
        membership: true,
        user: true,
        employeeAssignment: true
      }
    });

    return res.status(201).json({
      success: true,
      message: "Membership purchased successfully",
      data: purchase
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get All Purchases
export const getPurchases = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      search
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.memberId = {
        contains: search,
        mode: "insensitive"
      };
    }

    const [purchases, total] = await Promise.all([
      prisma.membershipPurchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        include:{
    membership:true,
    user:true,
    employeeAssignment:{
      include:{
        employee:{
          include:{
            user:true
          }
        },
        department:true,
        role:true,
        state:true,
        district:true,
        taluka:true,
        village:true
      }
    }
  }
      }),
      prisma.membershipPurchase.count({ where })
    ]);

    return res.json({
      success: true,
      data: purchases,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Get Purchase By ID
export const getPurchaseById = async (req, res) => {
  try {
    // const purchase = await prisma.membershipPurchase.findFirst({
    //   where: {
    //     userId: Number(req.params.id)
    //   },
    //   include: {
    //     user: true,
    //     membership: true,
    //     employeeAssignment: {
    //       include: {
    //         employee: true,
    //         department: true,
    //         role: true,
    //         state: true,
    //         district: true,
    //         taluka: true,
    //         village: true
    //       }
    //     }
    //   }
    // });
 const purchase = await prisma.membershipPurchase.findFirst({
  where:{
    userId:Number(req.params.id)
  },
  include:{
    membership:true,
    user:true,
    employeeAssignment:{
      include:{
        employee:{
          include:{
            user:true
          }
        },
        department:true,
        role:true,
        state:true,
        district:true,
        taluka:true,
        village:true
      }
    }
  }
});
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found"
      });
    }

    return res.json({
      success: true,
      data: purchase
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// get purchase data by emplyee assign id using emplyee id
export const getPurchaseByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find employee assignment
    const assignment = await prisma.employeeAssignment.findFirst({
      where: {
        employeeId: Number(employeeId),
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Employee assignment not found.",
      });
    }

    // Fetch all purchases assigned to this employee
    const purchases = await prisma.membershipPurchase.findMany({
      where: {
        employeeAssignmentId: assignment.id,
      },
      include: {
        membership: true,
        user: true,
        employeeAssignment: {
          include: {
            employee: {
              include: {
                user: true,
              },
            },
            department: true,
            role: true,
            state: true,
            district: true,
            taluka: true,
            village: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get Purchase By Member ID
export const getPurchaseByMemberId = async (req, res) => {
  try {
    const purchase = await prisma.membershipPurchase.findUnique({
      where: {
        memberId: req.params.memberId
      },
      include: {
        user: true,
        membership: true,
        employeeAssignment: {
          include: {
            employee: true,
            department: true,
            role: true
          }
        }
      }
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Membership not found"
      });
    }

    return res.json({
      success: true,
      data: purchase
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Get User Membership History
export const getUserPurchases = async (req, res) => {
  try {
    const purchases = await prisma.membershipPurchase.findMany({
      where: {
        userId: Number(req.params.userId)
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        membership: true
      }
    });

    return res.json({
      success: true,
      data: purchases
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Update Payment Status
export const updatePaymentStatus = async (req, res) => {
  try {
    const purchase = await prisma.membershipPurchase.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        paymentStatus: req.body.paymentStatus
      }
    });

    return res.json({
      success: true,
      message: "Payment status updated",
      data: purchase
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Update Membership Status
export const updateMembershipStatus = async (req, res) => {
  try {
    const purchase = await prisma.membershipPurchase.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        status: req.body.status
      }
    });

    return res.json({
      success: true,
      message: "Membership status updated",
      data: purchase
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Cancel Membership
export const cancelMembership = async (req, res) => {
  try {
    const purchase = await prisma.membershipPurchase.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        status: "CANCELLED"
      }
    });

    return res.json({
      success: true,
      message: "Membership cancelled",
      data: purchase
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};