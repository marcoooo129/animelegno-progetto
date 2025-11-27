
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";

let chatSession: Chat | null = null;

const getAIClient = () => {
  // Using embedded API key as requested for external deployment stability
  return new GoogleGenAI({ apiKey: 'AIzaSyAtl3uJurXSI6aBG1E2PVy_xM_f39Iy6Ok' });
};

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const ai = getAIClient();
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are the friendly and knowledgeable assistant for 'AnimeLegno Studio'.
      We are a high-end wood carving studio in Florence, Italy, specializing in Anime art.
      
      Tone: Warm, artisanal, polite, enthusiastic about anime, but professional.
      
      Key Info:
      - Location: Florence, Italy.
      - Services: Handcrafted wood carvings of anime characters.
      - Custom Orders: Yes! Design fee is +5 Euros on top of base price.
      - Process: Chat -> Confirm Design -> Deposit -> Crafting -> Delivery.
      - Contact: Best via WhatsApp or Instagram.
      
      Keep responses concise (under 60 words). Use emojis occasionally like 🪵, 🎨, 🖌️, 🇮🇹.`,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = initializeChat();
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Sorry, I didn't catch that.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    // Reset session on error in case of expiry
    chatSession = null;
    return "I seem to be having trouble connecting to the studio. Please try again in a moment.";
  }
};

/**
 * Analyzes an image (Base64) and returns product details (Name, Category, Description)
 */
export const analyzeProductImage = async (base64Data: string, mimeType: string = 'image/jpeg') => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: "Analyze this image of a wood carving or anime figure. Return a strict JSON object describing it for a product catalog. Fields required: 'name' (Character Name), 'category' (Anime Series Name English), 'category_it' (Anime Series Name Italian), 'description' (English marketing description, max 30 words), 'name_it' (Italian name), 'description_it' (Italian description), 'sku' (Generate a creative SKU code)." }
        ]
      },
      config: {
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

    const text = response.text || "{}";
    return JSON.parse(text);

  } catch (error: any) {
    console.error("Gemini Image Analysis Failed:", error);
    throw new Error(`AI Analysis Failed: ${error.message || 'Unknown error'}`);
  }
};
