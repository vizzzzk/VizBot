
"use client";

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ChatMessage from '@/components/chat-message';
import { Message, Expiry } from '@/lib/bot-logic';
import Link from 'next/link';


const demoInitialMessages: Message[] = [{
  id: 'demo-1',
  role: 'bot',
  content: "Hello! I'm VizBot, your trading analysis assistant. Watch this quick demo to see how I work.",
}];

const demoSequence: (Message | { type: 'user_input', content: string })[] = [
  { type: 'user_input', content: 'start' },
  {
    id: 'demo-2',
    role: 'bot',
    content: "Here are the available expiry dates for NIFTY 50.",
    payload: {
      type: 'expiries',
      expiries: [
        { value: '2024-09-26', label: '2024-09-26 (M) DTE: 1' },
        { value: '2024-10-03', label: '2024-10-03 (W) DTE: 8' },
        { value: '2024-10-10', label: '2024-10-10 (W) DTE: 15' },
      ] as Expiry[],
    }
  },
  { type: 'user_input', content: 'exp:2024-09-26' },
  {
    id: 'demo-3',
    role: 'bot',
    content: "Analysis for expiry around strike 23500:",
    payload: {
        type: 'analysis',
        spotPrice: 23516.80,
        dte: 1,
        lotSize: 50,
        expiry: "2024-09-26",
        timestamp: new Date().toLocaleTimeString(),
        marketAnalysis: {
            pcr_oi: 0.85,
            pcr_volume: 0.92,
            sentiment: "Neutral",
            confidence: "Medium",
            interpretation: "Market sentiment is neutral, leaning slightly bullish.",
            tradingBias: "Focus on non-directional or range-bound strategies."
        },
        opportunities: [],
        qualifiedStrikes: { ce: [], pe: [] },
        tradeRecommendation: {
            reason: "Based on the analysis, a short strangle strategy is recommended.",
            tradeCommand: "/paper CE 23700 SELL 1 45.50"
        }
    }
  },
  { type: 'user_input', content: '/paper CE 23700 SELL 1 45.50' },
  {
    id: 'demo-4',
    role: 'bot',
    content: "✅ Paper trade executed successfully!",
  }
];


function ChatDemo() {
    const [messages, setMessages] = useState<Message[]>(demoInitialMessages);
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const sequenceIndex = useRef(0);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const processSequence = () => {
            if (sequenceIndex.current >= demoSequence.length) {
                // Restart demo after a delay
                setTimeout(() => {
                    setMessages(demoInitialMessages);
                    sequenceIndex.current = 0;
                    setTimeout(processSequence, 2000);
                }, 5000);
                return;
            }

            const nextItem = demoSequence[sequenceIndex.current];
            sequenceIndex.current++;

            if (nextItem.type === 'user_input') {
                setIsTyping(true);
                // Simulate user typing
                setTimeout(() => {
                    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: nextItem.content }]);
                    setIsTyping(false);
                    // Wait before showing bot response
                    setTimeout(processSequence, 1500);
                }, 2000);
            } else {
                // Add bot message
                setMessages(prev => [...prev, nextItem as Message]);
                setTimeout(processSequence, 2500);
            }
        };

        const timeoutId = setTimeout(processSequence, 2000);
        return () => clearTimeout(timeoutId);
    }, [messages.length]); // Rerun when messages change to continue sequence

    return (
        <Card className="w-full h-full flex flex-col shadow-2xl rounded-2xl bg-card border-secondary overflow-hidden">
            <CardHeader className="border-b border-secondary">
                <div className="flex items-center gap-3">
                    <Bot className="w-8 h-8 text-muted-foreground" />
                    <div>
                        <CardTitle className="text-2xl font-bold text-foreground">VizBot</CardTitle>
                        <CardDescription className="text-muted-foreground">Get Started</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} {...msg} onExpirySelect={() => { }} onCommandClick={() => { }} />
                ))}
                {isTyping && (
                    <ChatMessage id="typing" role="user" content={<div className="flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Typing...</div>} onExpirySelect={() => { }} onCommandClick={() => { }} />
                )}
            </CardContent>
            <div className="border-t border-secondary p-4 bg-card/80 backdrop-blur-sm rounded-b-2xl">
                 <div className="flex items-center gap-3">
                    <Input
                    value=""
                    readOnly
                    placeholder=""
                    className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled>
                    <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background font-code text-foreground">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-6xl p-8">
            {/* Left side: Demo */}
            <div className="h-[80vh] hidden md:flex">
               <ChatDemo />
            </div>

            {/* Right side: Auth */}
            <div className="w-full max-w-md p-8 space-y-8 mx-auto">
                 <div className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <Bot className="w-10 h-10 text-primary" />
                        <h1 className="text-4xl font-bold">VizBot</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Welcome! Please sign in to access your professional options analysis dashboard.
                    </p>
                </div>
                <div className="space-y-4">
                     <Button asChild className="w-full">
                        <Link href="/sign-in">Sign In</Link>
                    </Button>
                     <Button asChild variant="secondary" className="w-full">
                        <Link href="/sign-up">Create an Account</Link>
                    </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    </div>
  );
}
