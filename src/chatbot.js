const path = require('path');
const result = require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (result.error) {
  console.error('dotenv failed to load .env:', result.error);
  process.exit(1);
} else {
  console.log('dotenv loaded .env from', path.resolve(__dirname, '../.env'));
}

const { Document } = require('@langchain/core/documents');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { ChatOpenAI } = require('@langchain/openai');
const fs = require('fs');

class SimpleDocumentRetriever {
  constructor(documents) {
    this.documents = documents;
  }

  async similaritySearch(query, k = 3) {
    const scores = this.documents.map(doc => ({
      doc,
      score: this.calculateSimilarity(query.toLowerCase(), doc.pageContent.toLowerCase())
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => item.doc);
  }

  calculateSimilarity(query, content) {
    const queryWords = query.split(/\s+/);
    const contentWords = content.split(/\s+/);
    const matches = queryWords.filter(word => contentWords.includes(word)).length;
    return matches / queryWords.length || 0;
  }
}

function loadData() {
  const raw = fs.readFileSync(path.resolve(__dirname, './data/occamsData.json'), 'utf8');
  const data = JSON.parse(raw);
  const documents = [];

  documents.push(new Document({
    pageContent: `Company: ${data.company_info.description} Founded: ${data.company_info.founded} Headquarters: ${data.company_info.headquarters || 'N/A'} Mission: ${data.company_info.mission}`,
    metadata: { type: 'company_info' }
  }));

  data.services.forEach(service => {
    documents.push(new Document({
      pageContent: `Service: ${service.name} Description: ${service.description}`,
      metadata: { type: 'service' }
    }));
  });

  data.awards.forEach(award => {
    documents.push(new Document({
      pageContent: `Award: ${award.name} Description: ${award.description} Year(s): ${award.years ? award.years.join(', ') : award.year}`,
      metadata: { type: 'award' }
    }));
  });

  documents.push(new Document({
    pageContent: `Social Responsibility: ${data.social_responsibility.description}`,
    metadata: { type: 'social_responsibility' }
  }));

  documents.push(new Document({
    pageContent: `Contact: Website: ${data.contact.website} Phone: ${data.contact.phone} Address: ${data.contact.address}`,
    metadata: { type: 'contact' }
  }));

  return documents;
}

async function initializeRetriever() {
  const docs = loadData();
  return new SimpleDocumentRetriever(docs);
}

async function createChatbot() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_API_BASE;

  if (!apiKey) {
    console.error('Error: OPENROUTER_API_KEY is missing in environment variables.');
    process.exit(1);
  }
  if (!baseUrl) {
    console.error('Error: OPENROUTER_API_BASE is missing in environment variables.');
    process.exit(1);
  }

  console.log('OpenRouter API key loaded:', `${apiKey.length} characters`);
  console.log('OpenRouter base URL:', baseUrl);

  const retriever = await initializeRetriever();

  const llm = new ChatOpenAI(
    {
      modelName: 'openai/gpt-4-turbo',
      openAIApiKey: apiKey,
      temperature: 0.5
    },
    {
      basePath: baseUrl,
      baseOptions: {
        headers: {
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Occams Advisory Chatbot'
        }
      }
    }
  );

  const prompt = ChatPromptTemplate.fromTemplate(`
You are a chatbot for Occams Advisory. Answer the query based only on the provided context from the website. Do not use external information. If the query cannot be answered with the context, say so.

Context: {context}

Query: {query}

Answer:
  `);

  const chain = RunnableSequence.from([
    async ({ query }) => {
      try {
        const docs = await retriever.similaritySearch(query, 3);
        const context = docs.map(d => d.pageContent).join('\n');
        console.log('Retrieved context:', context);
        return { query, context };
      } catch (err) {
        console.error('Error retrieving docs:', err);
        return { query, context: '' };
      }
    },
    prompt,
    async (input) => {
      try {
        const result = await llm.invoke(input);
        console.log('LLM response:', result);
        return result.content || 'No response generated from LLM.';
      } catch (err) {
        console.error('Error invoking LLM:', err);
        return 'Error: Could not generate a response. Please try again.';
      }
    }
  ]);

  return async (query) => {
    if (!query) return 'Error: Query cannot be empty.';
    try {
      const res = await chain.invoke({ query });
      console.log('Final chatbot response:', res);
      return res;
    } catch (err) {
      console.error('Error in chatbot chain:', err);
      return 'Error: Could not process the query. Please try again.';
    }
  };
}

module.exports = { createChatbot };
