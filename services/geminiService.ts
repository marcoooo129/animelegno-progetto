
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
          { text: "Analyze this image. It is a wood carving, anime figure, or character art. Act as a curator for a high-end wood carving studio. Return a JSON object with: 1. 'name' (A creative, epic title for the piece) 2. 'category' (The exact Anime Series name) 3. 'description' (A compelling, artisanal description highlighting the craftsmanship and character, max 40 words). Output strictly JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Image Analysis Failed:", error);
    throw new Error("Failed to analyze image with AI.");
  }
};
