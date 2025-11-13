import { GoogleGenAI } from "@google/genai";
import type { ExtractedFrame } from '../types';
import type { Part } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDocumentFromVideoContent = async (
  transcript: string,
  frames: ExtractedFrame[],
  language: string
): Promise<string> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
You are an expert technical writer. Your task is to transform a video transcript into a formal markdown document. I will provide you with the transcript and a series of key frames extracted from the video.

**IMPORTANT: Generate the entire document in ${language}.**

Instructions:
1. Read the entire transcript to understand the context and key topics.
2. Synthesize the information into a well-structured, formal document. Do not simply copy the transcript. Rephrase it in a professional tone. Use headings, bullet points, and bold text to organize the content.
3. Analyze the provided key frames. These are labeled as 'Frame 1', 'Frame 2', etc.
4. Identify frames that appear to be charts, graphs, presentation slides, or important diagrams.
5. Where relevant in the document, insert a reference to these key frames using markdown link syntax. For example: 'As shown in the slide ([See Frame 3](#frame-3)), the results indicate...'. Use the ID provided for each frame in the link (e.g., #frame-3).
6. Create a final section at the end of the document titled '## Key Visuals' and list all the provided frames with their corresponding links, for example:
   - [Frame 1](#frame-1)
   - [Frame 2](#frame-2)
   ...and so on for all provided frames.

Here is the transcript:
---
${transcript}
---

And here are the key frames from the video:
  `;
  
  const contentParts: Part[] = [{ text: prompt }];

  frames.forEach((frame, index) => {
    contentParts.push({ text: `Frame ${index + 1} (id: ${frame.id}):` });
    contentParts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: frame.base64,
      },
    });
  });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: contentParts },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    if (error instanceof Error) {
        return `Error from AI: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI service.";
  }
};