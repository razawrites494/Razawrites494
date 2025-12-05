
import { GoogleGenAI } from "@google/genai";
import { Entry, FinancialStats } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateLabReport = async (
  entries: Entry[],
  stats: FinancialStats,
  month: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "API Key is missing. Please configure your environment to use AI features.";
  }

  // Summarize data for the prompt to save tokens
  const simplifiedData = entries.map(e => `${e.date} (${e.shift}): ${e.amount} PKR`).join('\n');

  const prompt = `
    You are a financial analyst for a medical laboratory. 
    Analyze the revenue data for ${month}.
    All monetary values are in PKR (Pakistani Rupee).
    
    Financial Context:
    - Total Revenue: ${stats.totalRevenue} PKR
    - Government Share (85%): ${stats.govtShare} PKR
    - Gross Staff Pool (15%): ${stats.grossStaffShare} PKR
    - Shared Expenses (deducted from pool): ${stats.totalExpenses} PKR
    - Net Distributable Pool: ${stats.netStaffShareTotal} PKR
    - Number of Staff Members: ${stats.staffCount}
    - Base Share Per Staff Member: ${stats.perStaffShare} PKR (before personal advances)

    Raw Data (Date - Shift - Amount):
    ${simplifiedData}

    Please provide a concise but professional summary report that includes:
    1. A brief overview of the financial performance.
    2. Identification of the highest performing shift (Morning, Evening, or Night).
    3. Any notable trends or anomalies in the dates provided.
    4. A motivating closing remark for the staff.
    
    Keep the tone professional and encouraging. Format with Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate report due to an API error. Please try again later.";
  }
};
