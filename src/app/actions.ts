
"use server";

import { getBotResponse, BotResponsePayload, Portfolio, Message } from '@/lib/bot-logic';
import { db } from '@/lib/firebase-admin';

// ===== USER DATA MANAGEMENT =====
export interface UserData {
  portfolio: Portfolio;
  accessToken: string | null;
  messages: Message[];
}

export async function getUserData(uid: string): Promise<UserData | null> {
    if (!uid) return null;
    try {
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();
        if (doc.exists) {
            return doc.data() as UserData;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
}

export async function saveUserData(uid: string, data: Partial<UserData>): Promise<void> {
    if (!uid) return;
    try {
        const userRef = db.collection('users').doc(uid);
        await userRef.set(data, { merge: true });
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}


// ===== CHAT LOGIC =====

export async function sendMessage(uid: string, userInput: string, currentMessages: Message[], token: string | null | undefined, portfolio: Portfolio): Promise<BotResponsePayload> {
  if (!userInput || typeof userInput !== 'string' || userInput.length > 500) {
    return { type: 'error', message: 'Invalid input. Please provide a valid message.' };
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

    // Prepare data to save to Firestore
    const dataToSave: Partial<UserData> = {
      messages: updatedMessages,
    };

    if (botResponse.portfolio) {
      dataToSave.portfolio = botResponse.portfolio;
    }
    if (botResponse.accessToken) {
      dataToSave.accessToken = botResponse.accessToken;
    }

    await saveUserData(uid, dataToSave);

    return botResponse;
  } catch (e: any) {
    console.error('Error getting bot response:', e);
    return { type: 'error', message: e.message || 'An internal error occurred. Please try again later.' };
  }
}
