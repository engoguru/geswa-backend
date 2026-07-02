import prisma from "../../src/config/prisma.js";

export const createTaluka = async (req, res) => {
  try {
    const { name, districtId } = req.body;
// prisma
    if (!name || !districtId) {
      return res.status(400).json({
        success: false,
        message: "Name and DistrictId are required",
      });
    }

    const district = await prisma.district.findUnique({
      where: { id: Number(districtId) },
    });

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found",
      });
    }

    const existing = await prisma.taluka.findFirst({
      where: {
        name,
        districtId: Number(districtId),
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Taluka already exists in this district",
      });
    }

    const taluka = await prisma.taluka.create({
      data: {
        name,
        districtId: Number(districtId),
      },
    });

    return res.status(201).json({
      success: true,
      data: taluka,
    });
  } catch (error) {
    console.log()
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const getTalukasByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;

    const talukas = await prisma.taluka.findMany({
      where: { districtId: Number(districtId) },
    });

    return res.status(200).json({
      success: true,
      data: talukas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};