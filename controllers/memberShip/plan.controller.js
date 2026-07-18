import prisma from "../../src/config/prisma.js";


// Create Membership Plan
export const createMemberPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      durationValue,
      durationUnit,
      benefits
    } = req.body;

// console.log( name,
    //   description,
    //   price,
    //   durationValue,
    //   durationUnit,
    //   benefits,"p")
    if (!name || !price || !durationUnit) {
      return res.status(400).json({
        success: false,
        message: "Name, price and duration are required"
      });
    }


    if (!Array.isArray(benefits)) {
      return res.status(400).json({
        success: false,
        message: "Benefits must be an array"
      });
    }


    const membership = await prisma.membership.create({
      data: {
        name,
        description,
        price,
        durationValue,
        durationUnit,
        benefits
      }
    });


    return res.status(201).json({
      success: true,
      message: "Membership plan created successfully",
      data: membership
    });


  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



// Get All Membership Plans with Pagination
export const getMemberPlans = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      isActive
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;


    const where = {};

    // Search by name
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive"
      };
    }


    // Filter active/inactive
    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }


    const [plans, total] = await Promise.all([
      prisma.membership.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        }
      }),

      prisma.membership.count({
        where
      })
    ]);


    return res.status(200).json({
      success: true,
      data: plans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });


  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



// Get Single Membership Plan
export const getMemberPlanById = async (req,res)=>{
  try {

    const {id}=req.params;


    const plan = await prisma.membership.findUnique({
      where:{
        id:Number(id)
      }
    });


    if(!plan){
      return res.status(404).json({
        success:false,
        message:"Membership plan not found"
      });
    }


    res.json({
      success:true,
      data:plan
    });


  } catch(error){

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Internal server error"
    });

  }
};




// Update Membership Plan
export const updateMemberPlan = async(req,res)=>{
  try {

    const {id}=req.params;

    const {
      name,
      description,
      price,
      durationValue,
      durationUnit,
      benefits
    }=req.body;


    const plan = await prisma.membership.update({
      where:{
        id:Number(id)
      },
      data:{
        name,
        description,
        price,
        durationValue,
        durationUnit,
        benefits
      }
    });


    res.json({
      success:true,
      message:"Membership updated successfully",
      data:plan
    });


  } catch(error){

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
};





// Toggle Active / Inactive
export const toggleMemberPlanStatus = async(req,res)=>{
  try {

    const {id}=req.params;


    const plan = await prisma.membership.findUnique({
      where:{
        id:Number(id)
      }
    });


    if(!plan){
      return res.status(404).json({
        success:false,
        message:"Plan not found"
      });
    }


    const updated = await prisma.membership.update({
      where:{
        id:Number(id)
      },
      data:{
        isActive:!plan.isActive
      }
    });


    res.json({
      success:true,
      message:"Membership status updated",
      data:updated
    });


  }catch(error){

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Internal server error"
    });

  }
};





// Soft Delete Membership
export const deleteMemberPlan = async(req,res)=>{
  try {

    const {id}=req.params;


    const plan = await prisma.membership.update({
      where:{
        id:Number(id)
      },
      data:{
        isActive:false
      }
    });


    res.json({
      success:true,
      message:"Membership disabled successfully",
      data:plan
    });


  }catch(error){

    console.log(error);

    res.status(500).json({
      success:false,
      message:"Internal server error"
    });

  }
};