import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey: process.env.Pinecone_KEY
});
const index = pc.index('quickstart');
export default index