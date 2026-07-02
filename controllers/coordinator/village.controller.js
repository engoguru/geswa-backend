import prisma from "../../src/config/prisma.js";

export const createVillage = async (req, res) => {
  try {
    const { name, talukaId } = req.body;

    if (!name || !talukaId) {
      return res.status(400).json({
        success: false,
        message: "Name and TalukaId are required",
      });
    }
// prisma
    const taluka = await prisma.taluka.findUnique({
      where: { id: Number(talukaId) },
    });

    if (!taluka) {
      return res.status(404).json({
        success: false,
        message: "Taluka not found",
      });
    }

    const existing = await prisma.village.findFirst({
      where: {
        name,
        talukaId: Number(talukaId),
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Village already exists in this taluka",
      });
    }

    const village = await prisma.village.create({
      data: {
        name,
        talukaId: Number(talukaId),
      },
    });

    return res.status(201).json({
      success: true,
      data: village,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getVillagesByTaluka = async (req, res) => {
  try {
    const { talukaId } = req.params;

    const villages = await prisma.village.findMany({
      where: { talukaId: Number(talukaId) },
    });

    return res.status(200).json({
      success: true,
      data: villages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};