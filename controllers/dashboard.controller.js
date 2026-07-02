

export const dashboardUserData=async(req,res)=>{
    try {
        const []=await Promise.all([
            
        ])
    } catch (error) {
        
    }
}

export const dashboardRevenueData=async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}

// npm install @modelcontextprotocol/sdk
// import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// // 1. MCP सर्वर को इनिशियलाइज़ करें
// const server = new Server(
//   { name: "my-backend-mcp", version: "1.0.0" },
//   { capabilities: { tools: {} } }
// );

// // 2. AI को बताएं कि हमारे पास कौन सा टुलरूप (Tool) उपलब्ध है
// server.setRequestHandler(ListToolsRequestSchema, async () => {
//   return {
//     tools: [
//       {
//         name: "get_dashboard_revenue",
//         description: "डेटाबेस से डैशबोर्ड का लाइव रेवेन्यू डेटा प्राप्त करने के लिए।",
//         inputSchema: { type: "object", properties: {} }, // इसमें किसी इनपुट आर्गुमेंट की ज़रुरत नहीं है
//       },
//     ],
//   };
// });

// // 3. जब AI इस टूल को कॉल करे, तब क्या करना है (Prisma से डेटा लाना)
// server.setRequestHandler(CallToolRequestSchema, async (request) => {
//   if (request.params.name === "get_dashboard_revenue") {
//     try {
//       // आपके Prisma मॉडल के अनुसार डेटा फ़ेच करें (उदाहरण के लिए: prisma.revenue)
//       const revenueData = await prisma.revenue.findMany(); 
      
//       return {
//         content: [{ type: "text", text: JSON.stringify(revenueData) }],
//       };
//     } catch (error) {
//       return {
//         content: [{ type: "text", text: `डेटाबेस एरर: ${error.message}` }],
//         isError: true,
//       };
//     }
//   }
//   throw new Error("टूल नहीं मिला");
// });

// // 4. सर्वर को Stdio ट्रांसपोर्ट पर स्टार्ट करें
// const transport = new StdioServerTransport();
// await server.connect(transport);
// console.error("MCP Server running on stdio");


