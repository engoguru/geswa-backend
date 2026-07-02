import prisma from "../../src/config/prisma.js";


export const createAssignedRole = async (req, res) => {
  try {
    //  prisma
    const {
      employeeId,
      departmentId,
      roleId,
      stateId,
      districtId,
      talukaId,
      villageId,
      isActive = true,
    } = req.body;

    // Required validation
    if (!employeeId || !departmentId || !roleId) {
      return res.status(400).json({
        success: false,
        message: "Employee, Department and Role are required.",
      });
    }

    // Validate foreign keys
    const [employee, department, role] = await Promise.all([
      prisma.employee.findUnique({
        where: { id: Number(employeeId) },
      }),
      prisma.department.findUnique({
        where: { id: Number(departmentId) },
      }),
      prisma.role.findUnique({
        where: { id: Number(roleId) },
      }),
    ]);

    if (!employee)
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });

    if (!department)
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });

    if (!role)
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });

    // Prevent duplicate assignment
    const alreadyAssigned = await prisma.employeeAssignment.findFirst({
      where: {
        employeeId: Number(employeeId),
        departmentId: Number(departmentId),
        roleId: Number(roleId),
        stateId: stateId ? Number(stateId) : null,
        districtId: districtId ? Number(districtId) : null,
        talukaId: talukaId ? Number(talukaId) : null,
        villageId: villageId ? Number(villageId) : null,
      },
    });

    if (alreadyAssigned) {
      return res.status(409).json({
        success: false,
        message: "Assignment already exists.",
      });
    }

    const assignment = await prisma.employeeAssignment.create({
      data: {
        employeeId: Number(employeeId),
        departmentId: Number(departmentId),
        roleId: Number(roleId),
        stateId: stateId ? Number(stateId) : null,
        districtId: districtId ? Number(districtId) : null,
        talukaId: talukaId ? Number(talukaId) : null,
        villageId: villageId ? Number(villageId) : null,
        isActive,
      },
      include: {
        employee: true,
        department: true,
        role: true,
        state: true,
        district: true,
        taluka: true,
        village: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      data: assignment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};



export const getAllAssignedRoles = async (req, res) => {
  try {
    const assignments = await prisma.employeeAssignment.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const getAssignedRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id,"pppp")
    const assignment = await prisma.employeeAssignment.findFirst({
      where: {
        employeeId: Number(id),
      },
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
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getTeam = async (req, res) => {
  try {
    const loginUser = req.user.employee;

    if (!loginUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Find department by unique name
    const department = await prisma.department.findUnique({
      where: {
        name: loginUser.department,
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Get all assignments of same department
    const assignments = await prisma.employeeAssignment.findMany({
      where: {
        departmentId: department.id,
        isActive: true,
      },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        role: true,
        department: true,
        state: true,
        district: true,
        taluka: true,
        village: true,
      },
    });

    let team = [];

    switch (loginUser.role) {
      case "State-Coordinator":
        team = assignments.filter(
          (item) =>
            ["District-Coordinator", "Taluka-Coordinator", "Village-Coordinator"].includes(
              item.role.name
            ) &&
            item.state?.name === loginUser.state
        );
        break;

      case "District-Coordinator":
        team = assignments.filter(
          (item) =>
            ["Taluka-Coordinator", "Village-Coordinator"].includes(item.role.name) &&
            item.state?.name === loginUser.state &&
            item.district?.name === loginUser.district
        );
        break;

      case "Taluka-Coordinator":
        team = assignments.filter(
          (item) =>
            item.role.name === "Village-Coordinator" &&
            item.state?.name === loginUser.state &&
            item.district?.name === loginUser.district &&
            item.taluka?.name === loginUser.taluka
        );
        break;

      case "Village-Coordinator":
        team = [];
        break;

      default:
        team = [];
    }

    return res.status(200).json({
      success: true,
      count: team.length,
      data: team,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const updateAssignedRole = async (req, res) => {
  try {
    const { id } = req.params;

    const exists = await prisma.employeeAssignment.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const assignment = await prisma.employeeAssignment.update({
      where: {
        id: Number(id),
      },
      data: {
        ...req.body,
        employeeId: Number(req.body.employeeId),
        departmentId: Number(req.body.departmentId),
        roleId: Number(req.body.roleId),
        stateId: req.body.stateId ? Number(req.body.stateId) : null,
        districtId: req.body.districtId ? Number(req.body.districtId) : null,
        talukaId: req.body.talukaId ? Number(req.body.talukaId) : null,
        villageId: req.body.villageId ? Number(req.body.villageId) : null,
      },
    });

    return res.json({
      success: true,
      message: "Assignment updated successfully.",
      data: assignment,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const deleteAssignedRole = async (req, res) => {
  try {
    const { id } = req.params;

    const exists = await prisma.employeeAssignment.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    await prisma.employeeAssignment.delete({
      where: {
        id: Number(id),
      },
    });

    return res.json({
      success: true,
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};