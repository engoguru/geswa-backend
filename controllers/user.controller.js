import bcrypt from "bcrypt"
import prisma from "../src/config/prisma.js";
import { generateOTP } from "../utils/genrateOtp.js";
import jwt from "jsonwebtoken";
import { emailOtp } from "../config/emailSender.js";

// export const userRegister = async (req, res) => {
//   try {
//     const { name, email, contact, password, role } = req.body;

//     // validation
//     if (!name || !email || !contact || !password || !role) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // check existing user
//     const existingUser = await prisma.user.findFirst({
//       where: {
//         OR: [{ email }, { contact }],
//       },
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists",
//       });
//     }

//     // hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // generate OTP
//     const otp = generateOTP();

//     // send OTP email
//     await emailOtp(email, otp);

//     // create user (store OTP if you added OTP field/table)
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         contact,
//         password: hashedPassword,
//         role,
//       },
//     });

//     const { password: _, ...userData } = user;

//     return res.status(201).json({
//       success: true,
//       message: "User registered. OTP sent to email.",
//       data: userData,
//     });
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };


export const userRegister = async (req, res) => {
  try {
    const { name, email, contact, password, role } = req.body;

    if (!name || !email || !contact || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Run independent operations in parallel
    const [existingUser, hashedPassword] = await Promise.all([
      prisma.user.findFirst({
        where: {
          OR: [{ email }, { contact }],
        },
      }),
      bcrypt.hash(password, 10),
    ]);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const otp = generateOTP();

    // Create user and OTP in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          contact,
          password: hashedPassword,
          role,
        },
      });

      await tx.otptable.create({
        data: {
          userId: newUser.id,
          code: otp,
          type: "EMAIL_VERIFICATION",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      return newUser;
    });

    const { password: _, ...userData } = user;

    // Send response immediately
    res.status(201).json({
      success: true,
      message: "User registered successfully. OTP will be sent shortly.",
      data: userData,
    });

    // Send email in the background
    emailOtp(user.email, otp).catch((err) => {
      console.error("Email sending failed:", err);
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// export const userLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password are required",
//       });
//     }

//     // find user
//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     // check password
//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     // create JWT (24 hours)
//     const token = jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         contact: user.contact
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
//     );
//     // Step 10: Set JWT cookie
//     res.cookie("microGeswa", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//       maxAge: 24 * 60 * 60 * 1000,
//     })
//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         contact: user.contact
//       },
//     });
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };


export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    let employeePayload = null;

    // 4. EMPLOYEE FLOW (NEW CONDITION)
    if (user.role === "EMPLOYEE") {
      const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
        include: {
          employeeAssignments: {
            where: { isActive: true },
            include: {
              department: true,
              role: true,
              state: true,
              district: true,
              taluka: true,
              village: true,
            },
          },
        },
      });

      // 4.1 Employee must exist
      if (!employee) {
        return res.status(403).json({
          success: false,
          message: "Employee profile not found",
        });
      }

      // 4.2 Must have active assignment
      const assignment = employee.employeeAssignments?.[0];

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: "No active assignment found",
        });
      }

      // 4.3 Build clean payload (VALUES ONLY)
      employeePayload = {
        employeeId: employee.id,

        department: assignment.department?.name,
        role: assignment.role?.name,

        state: assignment.state?.name,
        district: assignment.district?.name,
        taluka: assignment.taluka?.name,
        village: assignment.village?.name,
      };
    }

    // 5. Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        contact: user.contact,

        ...(employeePayload && { employee: employeePayload }),
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 6. Set cookie
    res.cookie("microGeswa", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 7. Response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        contact: user.contact,
      },
      employee: employeePayload,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const viewAllUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.limit) || 50;

    const skip = itemsPerPage * (page - 1);

    const { search, userType } = req.query;
    const filters = []
    if (search) {
      filters.push({
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            email: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            contact: {
              contains: search,
              mode: "insensitive"
            }
          }
        ]
      })
    }

    if (userType) {
      filters.push({
        role: {
          equals: userType,
        }
      })
    }

    // const [data, totalItems] = await Promise.all([
    //   prisma.user.findMany({
    //     where:filters.length>0?{AND:filters}:{},
    //     skip,
    //     take: itemsPerPage,
    //   }),
    //   prisma.user.count(),
    // ]);
    const whereClause = filters.length ? { AND: filters } : {};

    const [data, totalItems] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: itemsPerPage,
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    res.json({
      success: true,
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= VIEW ONE USER =================
export const viewOneUser = async (req, res) => {
  try {

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        sucess: false,
        message: "User ID is required"
      })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        email: true,
        contact: true,
        role: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};

// ================= UPDATE USER =================
// export const updateUser = async (req, res) => {
//   try {

//     const { id } = req.params;

//     const updatedUser = await prisma.user.update({
//       where: {
//         id: Number(id),
//       },

//       data: {
//         ...req.body,
//       },

//       select: {
//         id: true,
//         name: true,
//         email: true,
//         contact: true,
//         role: true,
//         isVerified: true,
//         updatedAt: true,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "User updated successfully",
//       data: updatedUser,
//     });

//   } catch (error) {

//     console.log(error);

//     // Prisma P2025 Error
//     if (error.code === "P2025") {

//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//         errorCode: error.code,
//       });

//     }

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });

//   }
// };

export const deleteUser = async (req, res) => {
  try {

    const { id } = req.params;

    await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {

    console.log(error);

    // Prisma P2025 Error
    if (error.code === "P2025") {

      return res.status(404).json({
        success: false,
        message: "User not found",
        errorCode: error.code,
      });

    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otpcode = generateOTP();

    // save OTP
    await prisma.otptable.create({
      data: {
        userId: user.id,
        code: otpcode,
        type: "FORGOT_PASSWORD",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // send email
    emailOtp(email, otpcode);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    console.log(req.body, "ioo")
    if (!email || !otp) {
      console.log("rotpecord")
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("userecord")
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // find otp
    const record = await prisma.otptable.findFirst({
      where: {
        userId: user.id,
        code: otp,
        type: type,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!record) {
      console.log("record")
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // mark verified
    await prisma.otptable.update({
      where: { id: record.id },
      data: { verified: true },
    });

    await prisma.user.update({
      where: { email: email },
      data: { isVerified: true },
    });
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // check verified OTP
    const record = await prisma.otptable.findFirst({
      where: {
        userId: user.id,
        type: "FORGOT_PASSWORD",
        verified: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not verified or expired",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // delete used OTPs
    await prisma.otptable.deleteMany({
      where: {
        userId: user.id,
        type: "FORGOT_PASSWORD",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ================= Logout USER =================
export const userLogout = async (req, res) => {
  try {
    res.clearCookie("microGeswa", {
      httpOnly: true,
      secure: false, // process.env.NODE_ENV === "production" in production
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    let { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }
    role = role?.toUpperCase();

    const updateUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        role,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updateUser,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};