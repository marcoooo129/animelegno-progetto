
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";

// User provided API Key
const API_KEY = 'AIzaSyAWxZ30OfKqPEFzn2v88tVhfyB2VrE37vg';

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are the friendly assistant for 'AnimeLegno Studio'.
      We are a wood carving studio in Florence, Italy, specializing in Anime art.
      
      Tone: Warm, artisanal, polite, enthusiastic about anime.
      
      Key Info:
      - Location: Florence, Italy.
      - Services: Handcrafted wood carvings of anime characters.
      - Custom Orders: Yes! Design fee is +5 Euros on top of base price.
      - Process: Chat -> Confirm Design -> Deposit -> Crafting -> Delivery.
      - Contact: Best via WhatsApp or Instagram.
      
      Keep responses short (under 50 words). Use emojis like 🪵, 🎨, 🖌️, 🇮🇹.`,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!API_KEY) {
    return "I'm currently sanding a piece... (Missing API Key)";
  }

  try {
    const chat = initializeChat();
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Sorry, I didn't catch that.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I seem to have lost my chisel. Try again later.";
  }
};

/**
 * Analyzes an image (Base64) and returns product details (Name, Category, Description)
 */
export const analyzeProductImage = async (base64Data: string, mimeType: string = 'image/jpeg') => {
  if (!API_KEY) throw new Error("Missing Gemini API Key");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: "Analyze this image of a wood carving. Return a strict JSON object. Fields: 'name' (Character Name), 'category' (The specific Anime Series Name in English, e.g. One Piece), 'category_it' (The specific Anime Series Name in Italian), 'description' (English, max 30 words), 'name_it' (Italian Translation of name), 'description_it' (Italian Translation of desc), 'sku' (Generate a short code like SR-001)." }
        ]
      },
      config: {
        maxOutputTokens: 8192, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            category_it: { type: Type.STRING },
            description: { type: Type.STRING },
            name_it: { type: Type.STRING },
            description_it: { type: Type.STRING },
            sku: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text || "";
    // Clean up potentially dirty JSON (e.g. markdown code blocks)
    const cleanedText = text.replace(/```json|```/g, '').trim();
    
    // Robust parsing: extract content between first { and last }
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
       return JSON.parse(cleanedText.substring(firstBrace, lastBrace + 1));
    }

    return JSON.parse(cleanedText);
  } catch (error: any) {
    console.error("Gemini Image Analysis Failed:", error);
    throw new Error(`AI Analysis Failed: ${error.message || 'Unknown error'}`);
  }
};
