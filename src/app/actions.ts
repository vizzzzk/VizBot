
"use server";

import { kv } from '@vercel/kv';
import { getBotResponse, BotResponsePayload, Portfolio, Message } from '@/lib/bot-logic';

// ===== USER DATA MANAGEMENT =====
export interface UserData {
  portfolio: Portfolio;
  accessToken: string | null;
  messages: Message[];
}

export async function getUserData(uid: string): Promise<UserData | null> {
    if (!uid) return null;
    try {
        const data = await kv.get<UserData>(uid);
        return data;
    } catch (error) {
        console.error("Error fetching user data from Vercel KV:", error);
        return null;
    }
}

export async function saveUserData(uid: string, data: Partial<UserData>): Promise<void> {
    if (!uid) return;
    try {
        // Vercel KV's set command will create or overwrite. To merge, we must first get the existing data.
        const existingData = await kv.get<UserData>(uid) ?? {};
        const newData = { ...existingData, ...data };
        await kv.set(uid, newData);
    } catch (error) {
        console.error("Error saving user data to Vercel KV:", error);
    }
}


// ===== CHAT LOGIC =====

export async function sendMessage(uid: string, userInput: string, currentMessages: Message[], token: string | null | undefined, portfolio: Portfolio): Promise<BotResponsePayload> {
  if (!userInput || typeof userInput !== 'string' || userInput.length > 500) {
    return { type: 'error', message: 'Invalid input. Please provide a valid message.' };
  }

  // Handle demo user specific logic
  if (uid === 'demo-user-session' && (userInput.toLowerCase().includes('/paper') || userInput.toLowerCase().includes('/close'))) {
    return { type: 'error', message: 'Paper trading is disabled in the Live Demo. Please sign in with your own account to use this feature.' };
  }

  try {
    const botResponse = await getBotResponse(userInput, token, portfolio);

    // Construct messages to be saved
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
    };

    const botMessage: Message = {
      id: crypto.randomUUID(),
      role: 'bot',
      // We will fill content and payload on the client, but save the structure
      content: '',
      payload: botResponse,
    };

    const updatedMessages = [...currentMessages, userMessage, botMessage];

    // Prepare data to save to KV store
    const dataToSave: Partial<UserData> = {
      messages: updatedMessages,
    };

    if (botResponse.portfolio) {
      dataToSave.portfolio = botResponse.portfolio;
    }
    if (botResponse.accessToken) {
      dataToSave.accessToken = botResponse.accessToken;
    }

    // Do not save data for the demo user
    if (uid !== 'demo-user-session') {
      await saveUserData(uid, dataToSave);
    }


    return botResponse;
  } catch (e: any) {
    console.error('Error getting bot response:', e);
    return { type: 'error', message: e.message || 'An internal error occurred. Please try again later.' };
  }
}
