import prisma from "../src/config/prisma.js";

export const createContact = async (req, res) => {
    try {
        const { name, email, contact, subject, message } = req.body;

        // Trim values
        const trimmedName = name?.trim();
        const trimmedEmail = email?.trim();
        const trimmedContact = contact?.trim();
        const trimmedSubject = subject?.trim();
        const trimmedMessage = message?.trim();

        // Required field validation
        if (
            !trimmedName ||
            !trimmedEmail ||
            !trimmedContact ||
            !trimmedSubject ||
            !trimmedMessage
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        // Indian phone validation
        const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;

        if (!phoneRegex.test(trimmedContact)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number",
            });
        }

        // Create contact
        await prisma.contact.create({
            data: {
                name: trimmedName,
                email: trimmedEmail,
                contact: trimmedContact,
                subject: trimmedSubject,
                message: trimmedMessage,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Contact created successfully",
        });
    } catch (error) {
        console.error("Create Contact Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const viewAllContact = async (req, res) => {
    try {
        // console.log("ferbf")
        const page =  1;
        const itemsPerPage = 50;
        const skip = (page - 1) * itemsPerPage;

        const {search}=req.query
        const filters=[]
        if(search){
             filters.push({
              OR:[
                 {
                    name:{
                    contains:search,
                    mode:"insensitive"
                }
                 },
                   {
                    email:{
                    contains:search,
                    mode:"insensitive"
                }
                 },
                    {
                    contact:{
                    contains:search,
                    mode:"insensitive"
                }
                 }
              ]

             })
        }
     let whereClause=filters.length>0?{AND:filters}:{}

        const [contacts, count] = await Promise.all([
            prisma.contact.findMany({
                where:whereClause,
                skip,
                take: itemsPerPage,
                orderBy: {
                    createdAt: "desc"
                }
            }),
            prisma.contact.count({
                where:whereClause
            })
        ])
        const totalPages = Math.ceil(count / itemsPerPage);
        return res.status(200).json({
            success: true,
            contacts,
            pagination: {
                totalItems: count,
                totalPages,
                currentPage: page,
                itemsPerPage
            }

        })


    } catch (error) {
        console.log(error)
        return res.status(200).json({
            sucess: false,
            message: "Internal Server Error"
        })
    }
}

export const viewOneContact = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                sucess: false,
                message: "User ID is required"
            })
        }
        const contact = await prisma.contact.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                name: true,
                email: true,
                contact: true,
                subject: true,
                message: true,
                status:true,
                createdAt: true
            }

        })
        if (!contact) {
            return res.status(404).json({
                sucess: false,
                message: "Contact not found"
            })
        }
        return res.status(200).json({
            sucess: true,
            contact
        })


    } catch (error) {
        console.log(error)
        return res.status(200).json({
            sucess: false,
            message: "Internal Server Error"
        })
    }
}


export const updateContact = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, email, contact, subject, message } = req.body;
        const updatedContact = await prisma.contact.update({
            where: {
                id: parseInt(id)
            },
            data: {
                ...req.body
            }
        })
        return res.status(200).json({
            sucess: true,
            message: "Contact updated successfully",
            updatedContact
        })

    } catch (error) {
        console.log(error)
        return res.status(200).json({
            sucess: false,
            message: "Internal Server Error"
        })
    }
}


                