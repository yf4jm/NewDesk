import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const generateContent = async (prompt) => {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text; // return the response
};