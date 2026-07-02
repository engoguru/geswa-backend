import { generateSignUrl } from "../config/awsSigned.js"
import prisma from "../src/config/prisma.js"

export const createBlog=async(req,res)=>{
    try {
        const{title,excerpt,content,imageUrl,imagePublicKey,metaTitle,metaDescription,createdAt,updatedAt}=req.body

        if(!title|| !excerpt|| !content|| !imageUrl|| !imagePublicKey|| !metaTitle|| !metaDescription){
                return res.status(400).json({
                    message:"All fields are required"
                })
        }

        const data=await prisma.blog.create(
           {
            data:{
                 title
                ,excerpt
                ,content
                ,imageUrl
                ,imagePublicKey
                ,metaTitle
                ,metaDescription
                ,updatedAt
                ,createdAt
            }
        })

        return res.status(200).json({
            message:"Blog created successfully",
            data
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

export const viewAllBlog = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const itemsPerPage = Number(req.query.itemsPerPage) || 50;
    const skip = (page - 1) * itemsPerPage;

    const { search = "" } = req.query;

    const where = search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              excerpt: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    let [data, count] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: itemsPerPage,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.blog.count({
        where,
      }),
    ]);

    //  FIX: attach signed image URLs properly
    data = await Promise.all(
      data.map(async (item) => {
        const imageUrl = item.imagePublicKey
          ? await generateSignUrl(item.imagePublicKey)
          : null;

        return {
          ...item,
          imageUrl,
        };
      })
    );


    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data,
      totalBlogs: count,
      totalPages: Math.ceil(count / itemsPerPage),
      currentPage: page,
      itemsPerPage,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const viewOneBlog=async(req,res)=>{
    try{
        const{id}=req.params
        const data=await prisma.blog.findUnique({
            where:{
                id:Number(id)
            }
        })
        if(!data){
            return res.status(404).json({
                message:"Blog not found"
            })
        }
        return res.status(200).json({
            message:"Blog fetched successfully",
            data
        })


    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

export const updateBlog=async(req,res)=>{
    try{

    }catch(error){
        console.log(error)
        res.status(500).jsson({
            message:"Internal Server Error"
        })
    }
}

export const deleteBlog=async(req,res)=>{
    try{

    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}