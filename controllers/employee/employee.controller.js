import { generateSignUrl } from "../../config/awsSigned.js";
import prisma from "../../src/config/prisma.js";


export const employeeRegister = async (req, res) => {
    try {
        // prisma
        const {
            userId,
            dob,
            highestEducation,
            address,
            state,
            district,
            pincode,
            bankName,
            accountNumber,
            ifscCode,
            branchName,
        } = req.body;
        console.log(req.body)
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User Id is required",
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId),
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const employeeExist = await prisma.employee.findUnique({
            where: {
                userId: Number(userId),
            },
        });

        if (employeeExist) {
            return res.status(409).json({
                success: false,
                message: "Employee already registered",
            });
        }
        if (!state || !dob || !req.uploadedFiles.profile?.url || !req.uploadedFiles.aadhar?.url || !req.uploadedFiles.pan?.url) {
            return res.status(400).json({
                success: false,
                message: "info is required",
            });
        }
        const employee = await prisma.employee.create({
            data: {
                userId: Number(userId),
                dob: dob ? new Date(dob) : null,
                highestEducation,
                address,
                state,
                district,
                pincode,
                bankName,
                accountNumber,
                ifscCode,
                branchName,

                profileUrl: req.uploadedFiles.profile?.url,
                profilePublicId: req.uploadedFiles.profile?.key,

                aadharUrl: req.uploadedFiles.aadhar?.url,
                aadharPublicId: req.uploadedFiles.aadhar?.key,

                panUrl: req.uploadedFiles.pan?.url,
                panPublicId: req.uploadedFiles.pan?.key,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Employee registered successfully",
            data: employee,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};



export const employeeViewByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required",
            });
        }

        const employee = await prisma.employee.findUnique({
            where: {
                userId: Number(userId),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        contact: true,
                        role: true,
                        isVerified: true,
                    },
                },
                employeeAssignments: true,
            },
        });

        // ✅ HANDLE NOT FOUND FIRST
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
                data: null,
            });
        }

        // ✅ GENERATE SIGNED URLS ONLY IF EXISTS
        const [profileUrl, aadharUrl, panUrl] = await Promise.all([
            generateSignUrl(employee?.profilePublicId),
            generateSignUrl(employee?.aadharPublicId),
            generateSignUrl(employee?.panPublicId),
        ]);

        // ✅ CREATE NEW OBJECT (DO NOT MUTATE PRISMA RESULT)
        const updatedEmployee = {
            ...employee,
            profileUrl,
            aadharUrl,
            panUrl,
        };

        return res.status(200).json({
            success: true,
            message: "Employee details fetched successfully",
            data: updatedEmployee,
        });

    } catch (error) {
        console.error("employeeViewByUserId:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};



export const employeeUpdate = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(req.body, "p")
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "Valid userId is required",
            });
        }

        const employee = await prisma.employee.findUnique({
            where: {
                userId: Number(userId),
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        const {
            dob,
            highestEducation,
            address,
            state,
            district,
            pincode,
            bankName,
            accountNumber,
            ifscCode,
            branchName,
        } = req.body;


        const updatedEmployee = await prisma.employee.update({
            where: {
                userId: Number(userId),
            },
            data: {
                dob: dob ? new Date(dob) : employee.dob,
                highestEducation: highestEducation || employee.highestEducation,
                address: address || employee.address,
                state: state || employee.state,
                district: district || employee.district,
                pincode: pincode || employee.pincode,

                bankName: bankName || employee.bankName,
                accountNumber: accountNumber || employee.accountNumber,
                ifscCode: ifscCode || employee.ifscCode,
                branchName: branchName || employee.branchName,

                // FILES (only update if new files uploaded)
                profileUrl:
                    req.uploadedFiles?.profile?.url || employee.profileUrl,
                profilePublicId:
                    req.uploadedFiles?.profile?.key || employee.profilePublicId,

                aadharUrl:
                    req.uploadedFiles?.aadhar?.url || employee.aadharUrl,
                aadharPublicId:
                    req.uploadedFiles?.aadhar?.key || employee.aadharPublicId,

                panUrl:
                    req.uploadedFiles?.pan?.url || employee.panUrl,
                panPublicId:
                    req.uploadedFiles?.pan?.key || employee.panPublicId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: updatedEmployee,
        });
    } catch (error) {
        console.error("employeeUpdateb error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};