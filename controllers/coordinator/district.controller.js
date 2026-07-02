import prisma from "../../src/config/prisma.js";

export const createDistrict = async (req, res) => {
  try {
    const { name, stateId } = req.body;

// console.log(req.body,"pop")
// prisma

    if (!name || !stateId) {
      return res.status(400).json({
        success: false,
        message: "Name and StateId are required",
      });
    }

    const state = await prisma.state.findUnique({
      where: { id: Number(stateId) },
    });

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "State not found",
      });
    }

    const existing = await prisma.district.findFirst({
      where: {
        name,
        stateId: Number(stateId),
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "District already exists in this state",
      });
    }

    const district = await prisma.district.create({
      data: {
        name,
        stateId: Number(stateId),
      },
    });

    return res.status(201).json({
      success: true,
      data: district,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const getDistrictsByState = async (req, res) => {
  try {
    const { stateId } = req.params;

    const districts = await prisma.district.findMany({
      where: { stateId: Number(stateId) },
    });

    return res.status(200).json({
      success: true,
      data: districts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};