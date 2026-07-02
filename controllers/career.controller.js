import { generateSignUrl } from "../config/awsSigned.js";
import prisma from "../src/config/prisma.js";
// Job Section
export const createJob = async (req, res) => {
    try {
        const { title, description, responsibilities, requirements, benefits,
            location, salaryRange, employmentType, experience, isActive
        } = req.body;
        // console.log(req.body,"hhf")
        if (!title || !description || !responsibilities || !requirements || !benefits ||
            !location || !salaryRange || !employmentType || !experience) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const data = await prisma.job.create({
            data: {
                title,
                description,
                responsibilities,
                requirements,
                benefits,
                location,
                salaryRange,
                employmentType,
                experience,
                isActive
            }

        })

        return res.status(200).json({
            message: "Job created successfully",
            data

        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })

    }
}

export const viewAllJob = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 50;
        const skip = (page - 1) * itemsPerPage;


        const [totalCount, data] = await Promise.all([
            prisma.job.count(),
            prisma.job.findMany({
                skip,
                take: itemsPerPage,
            })
        ])

        return res.status(200).json({
            message: "Jobs fetched successfully",
            totalCount,
            data
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })

    }
}


export const viewOneJob = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "Invalid Job ID"
            })
        }
        const data = await prisma.job.findUnique({
            where: {
                id: Number(id)
            }
        })

        if (!data) {
            return res.status(404).json({
                message: "Job not found"
            })
        }

        return res.status(200).json({
            message: "Jobs fetched successfully",
            data
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const deleteJob = async (req, res) => {
    try {

        const {id}=req.params;
        if(!id){
          return res.status(400).json({
           message:"Id is missing"
          })
        }

        const data=await prisma.job.delete({
          where:{
            id:Number(id)
          }
        })

        return res.status(200).json({
          message:"Deleted Successfully !"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })


    }
}

// Application 

export const createApplication = async (req, res) => {
    try {
        // console.log(req.body)

        let { fullName, email, phone, experience, coverLetter, jobId, resume_Url, resume_publicId } = req.body
        if (!fullName || !email || !phone || !experience || !coverLetter || !jobId || !resume_Url || !resume_publicId) {
            return res.status(400).json({
                message: "All fileds required !"
            })
        }
        jobId=Number(jobId)
        const data = await prisma.application.create({
            data: {
                fullName,
                email,
                phone,
                experience,
                coverLetter,
                jobId,
                resume_Url,
                resume_publicId
            }
        })
        return res.status(200).json({
            message: "Application submitted successfully",
            data
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const viewAllApplication = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 50;
    const skip = (page - 1) * itemsPerPage;

    const [data, count] = await Promise.all([
      prisma.application.findMany({
        skip,
        take: itemsPerPage,
        include: {
          job: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.application.count(),
    ]);

    await Promise.all(
      data.map(async (item) => {
        if (item.resume_publicId) {
          item.resume_Url = await generateSignUrl(item.resume_publicId);
        }
      })
    );

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems: count,
        currentPage: page,
        itemsPerPage,
        totalPages: Math.ceil(count / itemsPerPage),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


export const viewOneApplication = async (req, res) => {
  try {
    const { id } = req.params;

    let application = await prisma.application.findUnique({
      where: {
        id:Number(id),
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

 const url = await generateSignUrl(application?.resume_publicId)
                    application.resume_Url = url

                    // generateSignUrl

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        id:Number(id),
      },
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id:Number(id),
      },
      data: {
        status,  
      }
    });

    return res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteApplication = async (req, res) => {
    try {

    } catch (error) { 
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
