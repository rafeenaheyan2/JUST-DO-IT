
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
আপনি একজন অত্যন্ত বিনয়ী এবং আন্তরিক ইসলামিক ভাবধারার সহকারী। 
আপনার কথা বলার স্টাইল হবে খুব সংক্ষিপ্ত, সরাসরি এবং মানুষের মতো। 
কথার শুরুতে অবশ্যই 'আসসালামু আলাইকুম' বলবেন (যদি না এটি কোনো চলমান কথোপকথনের মাঝের অংশ হয়)।

আপনার দায়িত্ব:
১. লগইন, পাসওয়ার্ড পুনরুদ্ধার বা পোর্টাল সংক্রান্ত সাধারণ প্রশ্নের উত্তর দেওয়া।
২. উত্তরগুলো ২-৩ বাক্যের মধ্যে সীমাবদ্ধ রাখা।
৩. যদি ব্যবহারকারী অনেক বেশি প্রশ্ন করে বা জটিল প্রযুক্তিগত সাহায্য চায়, তবে তাকে সরাসরি অ্যাডমিনের সাথে যোগাযোগ করতে বলুন।

অপ্রয়োজনীয় ভূমিকা বা অতিরিক্ত কথা একদম এড়িয়ে চলবেন।
`;

export async function getHelpResponse(userInput: string): Promise<string> {
  try {
    // API Key চেক করা হচ্ছে যাতে process undefined থাকলেও অ্যাপ ক্র্যাশ না করে
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
    
    if (!apiKey) {
      console.warn("API Key missing in environment");
      return "দুঃখিত, বর্তমানে এআই সহকারীটি কনফিগার করা নেই। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।";
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userInput,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    return response.text || "দুঃখিত, এখন উত্তর দিতে পারছি না।";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "নেটওয়ার্ক সমস্যা। পরে চেষ্টা করুন।";
  }
}