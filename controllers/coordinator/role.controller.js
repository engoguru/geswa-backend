import prisma from "../../src/config/prisma.js";

export const createRole = async (req, res) => {
  try {
    const { name, departmentId } = req.body;

    // validation
    if (!name || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Name and DepartmentId are required",
      });
    }

    // check department exists
    const department = await prisma.department.findUnique({
      where: { id: Number(departmentId) },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // check duplicate role in same department
    const existing = await prisma.role.findFirst({
      where: {
        name,
        departmentId: Number(departmentId),
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Role already exists in this department",
      });
    }

    // create role
    const role = await prisma.role.create({
      data: {
        name,
        departmentId: Number(departmentId),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        department: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRoleByDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findMany({
      where: {
        departmentId: Number(id),
      },
      include: {
        department: true,
        employeeAssignments: true,
      },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, departmentId } = req.body;

    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const updated = await prisma.role.update({
      where: { id: Number(id) },
      data: {
        name: name || role.name,
        departmentId: departmentId
          ? Number(departmentId)
          : role.departmentId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: {
        employeeAssignments: true,
      },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // safety check
    if (role.employeeAssignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete role with active assignments",
      });
    }

    await prisma.role.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};