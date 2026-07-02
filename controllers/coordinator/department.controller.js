import prisma from "../../src/config/prisma.js";

export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    // validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }

    // check duplicate (important)
    const existing = await prisma.department.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Department already exists",
      });
    }

    const data = await prisma.department.create({
      data: { name },
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// view All
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// view one 

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: Number(id) },
      include: {
        roles: true,
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//delete 
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.department.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

