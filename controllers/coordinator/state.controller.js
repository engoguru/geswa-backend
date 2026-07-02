import prisma from "../../src/config/prisma.js";

export const createState = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "State name is required",
      });
    }

    const existing = await prisma.state.findFirst({
      where: { name },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "State already exists",
      });
    }

    const state = await prisma.state.create({
      data: { name },
    });

    return res.status(201).json({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getAllStates = async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: states,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


