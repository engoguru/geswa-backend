import { generateSignUrl } from "../config/awsSigned.js";
import prisma from "../src/config/prisma.js"


export const createHospital = async (req, res) => {
    try {
        let {
            name,
            address,
            city,
            state,
            zip,
            services,
            contact,
            tagline,
            rating,
            reviews,
            about,
            availability,
            email,
            imageUrl,
            imagePublicKey
        } = req.body;
        services = services ? JSON.parse(services) : [];
        rating = parseFloat(rating)
        reviews = parseInt(reviews)
        console.log(req.body, "kj")
        // Required fields validation
        if (!name || !address || !contact || !city || !state) {
            return res.status(400).json({
                success: false,
                message: "Name, address and contact are required",
            });
        }

        // Services validation
        if (!services || !Array.isArray(services) || services.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Services must be a non-empty array",
            });
        }

        // Email validation (if provided)
        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        // Rating validation (if provided)
        if (
            rating !== undefined &&
            (rating < 0 || rating > 5)
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 0 and 5",
            });
        }

        const hospital = await prisma.hospital.create({
            data: {
                name,
                tagline,
                rating,
                reviews,
                address,
                city,
                state,
                zip,
                about,
                services,
                availability,
                contact,
                email,
                imageUrl,
                imagePublicKey
            },
        });

        return res.status(201).json({
            success: true,
            message: "Hospital created successfully",
            data: hospital,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const viewAllHospital = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const { search, service, availability, city, state } = req.query;

        const filters = [];

        //  SEARCH (name, address, tagline)
        if (search) {
            filters.push({
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        address: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        tagline: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            });
        }

        //  FILTER BY SERVICE (String[])
        if (service) {
            filters.push({
                services: {
                    has: service, // Prisma array filter
                },
            });
        }

        //  FILTER BY AVAILABILITY
        if (availability) {
            filters.push({
                availability: {
                    equals: availability,
                },
            });
        }

        //  FILTER BY RATING RANGE
        if (city) {
            filters.push({
                city: {
                    equals: city
                },
            });
        }
        if (state) {
            filters.push({
                state: {
                    equals: state
                }
            })
        }

        let hospitals = await prisma.hospital.findMany({
            where: filters.length > 0 ? { AND: filters } : {},
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                name: true,
                contact: true,
                address: true,
                city: true,
                state: true,
                availability: true,
                imagePublicKey: true,
                services: true,
                rating: true
            },
        });


        if (hospitals) {
            for (let hospital of hospitals) {
                if (hospital?.imagePublicKey) {
                    const url = await generateSignUrl(hospital?.imagePublicKey)
                    hospital.imageUrl = url
                }
            }
        }

        const totalHospitals = await prisma.hospital.count({
            where: filters.length > 0 ? { AND: filters } : {},
        });

        return res.status(200).json({
            success: true,
            data: hospitals,
            total: totalHospitals,
            page,
            totalPages: Math.ceil(totalHospitals / limit),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const viewOneHospital = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID is required",
            });
        }

        let hospital = await prisma.hospital.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                doctors: true, // ✅ include doctors
            },
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        if (hospital?.imagePublicKey) {
            const url = await generateSignUrl(hospital?.imagePublicKey)
            hospital.imageUrl = url
        }

        if(hospital?.doctors){
            for(let doctor of hospital.doctors){
                if(doctor?.imagePublicKey){
                    const url=await generateSignUrl(doctor?.imagePublicKey)
                    doctor.imageUrl=url
                }
            }
        }
        return res.status(200).json({
            success: true,
            data: hospital,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const updateHospital = async (req, res) => {
    try {
        const { id } = req.params;
        // console.log(id,req.body)
        if (!id) {

            return res.status(400).json({
                success: false,
                message: "Hospital ID is required",
            })
        }
        let {
            name,
            address,
            city,
            state,
            zip,
            services,
            contact,
            tagline,
            rating,
            reviews,
            about,
            availability,
            email,
            imageUrl,
            imagePublicKey
        } = req.body;
        services = services ? JSON.parse(services) : [];
        rating = parseFloat(rating)
        reviews = parseInt(reviews)
        const data = await prisma.hospital.update({
            where: {
                id: Number(id),
            },
            data: {
                name,
                tagline,
                rating,
                reviews,
                address,
                city,
                state,
                zip,
                about,
                services,
                availability,
                contact,
                email,
                imageUrl,
                imagePublicKey
            },
        })

        return res.status(200).json({
            success: true,
            message: "Hospital updated successfully",
            data
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

// create Docters data inside the hospital

export const createDoctors = async (req, res) => {
    try {
        let { name, specialty, experience, hospitalId, imageUrl,
            imagePublicKey } = req.body;

        //  Required fields validation
        if (!name || !specialty || !hospitalId) {
            return res.status(400).json({
                success: false,
                message: "name, specialty, and hospitalId are required",
            });
        }

        //  Check hospital exists
        const hospitalExists = await prisma.hospital.findUnique({
            where: { id: Number(hospitalId) },
        });

        if (!hospitalExists) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        //  Experience validation (optional)
        if (experience !== undefined && experience < 0) {
            return res.status(400).json({
                success: false,
                message: "Experience cannot be negative",
            });
        }
        hospitalId = Number(hospitalId)
        experience = parseInt(experience)
        //  Create doctor
        const doctor = await prisma.doctor.create({
            data: {
                name,
                specialty,
                experience,
                hospitalId,
                imageUrl,
                imagePublicKey
            },
        });

        return res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


