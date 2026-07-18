import prisma from "../../src/config/prisma.js";



// Create Service History
export const createServiceHistory = async (req, res) => {
  try {
    const {
      membershipPurchaseId,
      hospitalId,
      serviceName,
      serviceDetails,
      actualBillAmount,
      offerAmount = 0,
      finalAmount,
      bill_publicId,
      bill_Url
    } = req.body;

    if (!membershipPurchaseId || !hospitalId || !serviceName || !actualBillAmount || !finalAmount) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    const purchase = await prisma.membershipPurchase.findUnique({
      where: {
        id: Number(membershipPurchaseId)
      }
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Membership purchase not found"
      });
    }

    const history = await prisma.membershipServiceHistory.create({
      data: {
        membershipPurchaseId: Number(membershipPurchaseId),
        hospitalId: Number(hospitalId),
        serviceName,
        serviceDetails,
        actualBillAmount,
        offerAmount,
        finalAmount,
        bill_publicId,
        bill_Url
      },
      include: {
        hospital: true,
        membershipPurchase: {
          include: {
            user: true,
            membership: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: "Service history created successfully",
      data: history
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Get All Service History
export const getServiceHistory = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      hospitalId,
      search
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const where = {};

    if (hospitalId) {
      where.hospitalId = Number(hospitalId);
    }

    if (search) {
      where.serviceName = {
        contains: search,
        mode: "insensitive"
      };
    }

    const [history, total] = await Promise.all([
      prisma.membershipServiceHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          hospital: true,
          membershipPurchase: {
            include: {
              user: true,
              membership: true
            }
          }
        }
      }),
      prisma.membershipServiceHistory.count({
        where
      })
    ]);

    return res.json({
      success: true,
      data: history,
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


// Get History By Member ID
export const getMemberServiceHistory = async (req, res) => {
  try {
    const history = await prisma.membershipServiceHistory.findMany({
      where: {
        membershipPurchase: {
          memberId: req.params.memberId
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        hospital: true,
        membershipPurchase: {
          include: {
            membership: true
          }
        }
      }
    });

    return res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Get History By Purchase ID
export const getPurchaseServiceHistory = async (req, res) => {
  try {
    const history = await prisma.membershipServiceHistory.findMany({
      where: {
        membershipPurchaseId: Number(req.params.purchaseId)
      },
      include: {
        hospital: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
// Get service history by userId
export const getPurchaseServiceHistoryUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the membership purchase for the user
    const purchase = await prisma.membershipPurchase.findFirst({
      where: {
        userId: Number(userId),
      },
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Membership purchase not found for this user.",
      });
    }

    // Fetch service history using the purchase ID
    const history = await prisma.membershipServiceHistory.findMany({
      where: {
        membershipPurchaseId: purchase.id,
      },
      include: {
        hospital: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getByHospitalServiceHistory = async (req, res) => {
  try {
    const history = await prisma.membershipServiceHistory.findMany({
      where: {
        hospitalId: Number(req.params.hospitalId)
      },
      include: {
        hospital: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Get Single History
export const getServiceHistoryById = async (req, res) => {
  try {
    const history = await prisma.membershipServiceHistory.findUnique({
      where: {
        id: Number(req.params.id)
      },
      include: {
        hospital: true,
        membershipPurchase: {
          include: {
            user: true,
            membership: true
          }
        }
      }
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "History not found"
      });
    }

    return res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Update Service History
export const updateServiceHistory = async (req, res) => {
  try {
    const history = await prisma.membershipServiceHistory.update({
      where: {
        id: Number(req.params.id)
      },
      data: req.body
    });

    return res.json({
      success: true,
      message: "History updated successfully",
      data: history
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Delete Service History
export const deleteServiceHistory = async (req, res) => {
  try {
    await prisma.membershipServiceHistory.delete({
      where: {
        id: Number(req.params.id)
      }
    });

    return res.json({
      success: true,
      message: "History deleted successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};