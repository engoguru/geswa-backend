// import { getEmbedding } from "./getEmbeddong";
// import index from "../database/pineconeDatabase";
// export async function upsertData() {
//   const text = "Pinecone is a vector database for AI apps";

//   const vector = await getEmbedding(text);

//   await index.upsert([
//     {
//       id: "doc1",
//       values: vector,
//       metadata: {
//         text,
//       },
//     },
//   ]);

//   console.log("Inserted");
// }


import { index } from "./pinecone.js";
import { getEmbedding } from "./embedding.js";
import { loadPDF } from "./load.js";
import { chunkText } from "./chunk.js";
import fs from "fs";


import pdf from "pdf-parse";

export async function loadPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  return data.text;
}

export function chunkText(text, size = 800) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks; 
}
export async function ingestFolder(folderPath) {
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const text = await loadPDF(`${folderPath}/${file}`);
    const chunks = chunkText(text);

    for (let i = 0; i < chunks.length; i++) {
      const vector = await getEmbedding(chunks[i]);

      await index.upsert([
        {
          id: `${file}-${i}`,
          values: vector,
          metadata: {
            text: chunks[i],
            source: file,
          },
        },
      ]);
    }
  }

  console.log("All docs indexed");
}                            