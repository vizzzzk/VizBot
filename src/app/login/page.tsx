"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import { Bot, User, Loader, Rocket, KeyRound, Newspaper, Send, Briefcase, XCircle, RefreshCw, BookOpen, LogIn, Github, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import ChatMessage from '@/components/chat-message';
import { sendMessage, getUserData, saveUserData, UserData } from './actions';
import { BotResponsePayload, Portfolio, TradeHistoryItem, Message, Expiry } from '@/lib/bot-logic';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';

// A mock user type for client-side state
export type ClientUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
};

const initialPortfolio: Portfolio = {
    positions: [],
    initialFunds: 400000,
    realizedPnL: 0,
    blockedMargin: 0,
    winningTrades: 0,
    totalTrades: 0,
    tradeHistory: [],
};

const initialMessages: Message[] = [{
    id: crypto.randomUUID(),
    role: 'bot',
    content: "Hello! I am VizBot, your NIFTY options analysis assistant. Please sign in to begin, or type 'start' or use the menu below if you're already logged in.",
}];

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
                        <CardTitle className="text-2xl font-bold text-foreground">VizBot Live Demo</CardTitle>
                        <CardDescription className="text-muted-foreground">Automated Walkthrough</CardDescription>
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
                    placeholder="Automated demo running..."
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


function LoginPage({ onSignIn, onGuestSignIn }: { onSignIn: () => void; onGuestSignIn: () => void; }) {
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
                    <Button className="w-full" onClick={onSignIn}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 60.3l-66.8 64.3c-20.3-18.4-47.9-30.7-79.3-30.7-65.4 0-120.4 53.6-120.4 120.4s55 120.4 120.4 120.4c72.6 0 106.6-58.6 112.2-87.7H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                        Continue with Google
                    </Button>
                     <Button variant="secondary" className="w-full" onClick={onGuestSignIn}>
                       <LogIn className="mr-2 h-4 w-4" />
                        Continue as Guest
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


export default function Home() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio>(initialPortfolio);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isHydrating, setIsHydrating] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auth state listener and data fetcher
  useEffect(() => {
    const checkUserSession = async () => {
      setIsHydrating(true);
      const storedUser = localStorage.getItem('vizbot_user');
      if (storedUser) {
        const currentUser: ClientUser = JSON.parse(storedUser);
        setUser(currentUser);
        const userData = await getUserData(currentUser.uid);
        if (userData) {
          setPortfolio(userData.portfolio ?? initialPortfolio);
          setAccessToken(userData.accessToken ?? null);
          if (userData.messages && userData.messages.length > 0) {
            setMessages(userData.messages);
          } else {
             setMessages([{
                id: crypto.randomUUID(),
                role: 'bot',
                content: "Welcome back! Type 'start' or use the menu below to begin.",
            }]);
          }
        } else if (currentUser.uid !== 'guest-user') { // Don't create server data for guest
          const initialData: UserData = {
            portfolio: initialPortfolio,
            accessToken: null,
            messages: initialMessages,
          };
          await saveUserData(currentUser.uid, initialData);
        }
      }
      setIsHydrating(false);
    };

    checkUserSession();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const resetPortfolio = async () => {
    if (!user) {
        toast.error("You must be logged in to reset the portfolio.");
        return;
    }
    const freshPortfolio = {
        ...initialPortfolio,
        tradeHistory: [] // explicit reset of trade history
    };

    const initialData: UserData = {
        portfolio: freshPortfolio,
        accessToken: null,
        messages: [{
            id: crypto.randomUUID(),
            role: 'bot',
            content: "Portfolio reset. Welcome back! Type 'start' or use the menu below to begin.",
        }],
    };

    if (user.uid !== 'guest-user') {
      await saveUserData(user.uid, initialData);
    }

    // Update client state immediately
    setPortfolio(freshPortfolio);
    setAccessToken(null);
    setMessages(initialData.messages);

    toast.success("Portfolio Reset", {
      description: "Your paper trading portfolio, chat history, and access token have been cleared.",
    });
  }

  const processAndSetMessages = (userInput: string, response: BotResponsePayload) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
    };

    const botMessage: Message = {
      id: crypto.randomUUID(),
      role: 'bot',
      content: '', // Content will be handled by payload renderer
      payload: response,
    };

    if (response.type === 'error') {
        if(response.authUrl) {
           botMessage.content = (
            <div>
              <p>{response.message}</p>
              <a href={response.authUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold mt-2 inline-block">
                Click here to authorize with Upstox
              </a>
              <p className="text-xs mt-2 text-muted-foreground">After authorizing, you will be redirected. Copy the `code` from the new URL's address bar and paste it in the chat.</p>
            </div>
          );
        } else {
           botMessage.content = response.message;
        }
        botMessage.payload = undefined; // Don't render a payload for errors
    } else if (response.type === 'expiries') {
        botMessage.content = "Here are the available expiry dates for NIFTY 50.";
    } else if (response.type === 'analysis') {
        botMessage.content = `Analysis for expiry ${response.opportunities[0]?.strike ? `around strike ${response.opportunities[0].strike}` : ''}:`;
    } else if (response.type === 'paper-trade' || response.type === 'portfolio' || response.type === 'close-position') {
        botMessage.content = response.message;
        botMessage.payload = undefined;
    } else if (response.type === 'reset') {
       // Message is handled by the resetPortfolio function's toast and state update
       return;
    }

    // Update client state immediately. The backend has already saved it.
    if (response.portfolio) {
      setPortfolio(response.portfolio);
    }
    if (response.accessToken) {
        setAccessToken(response.accessToken);
    }
    
    const updatedMessages = [...messages, userMessage, botMessage];

    // Don't save data for the guest user
    if (user && user.uid !== 'guest-user') {
      const dataToSave: Partial<UserData> = {
        messages: updatedMessages,
        portfolio: response.portfolio ?? portfolio,
        accessToken: response.accessToken ?? accessToken
      };
      saveUserData(user.uid, dataToSave);
    }

    setMessages(updatedMessages);
  }

  const handleSendMessage = (messageText: string) => {
    const trimmedInput = messageText.trim();
    if (!trimmedInput || isPending || !user) {
        if (!user) toast.error("Please sign in to chat with the bot.");
        return;
    }

    if (trimmedInput.toLowerCase() === '/reset') {
      resetPortfolio();
      setInput('');
      return;
    }

    // Optimistic update of the user's message
    const tempUserMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedInput,
    };
    setMessages(prev => [...prev, tempUserMessage]);
    setInput('');

    startTransition(async () => {
      // Remove the optimistic user message before processing the real response
      setMessages(prev => prev.slice(0, prev.length - 1));

      const result = await sendMessage(user.uid, trimmedInput, messages, accessToken, portfolio);
      processAndSetMessages(trimmedInput, result);
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleExpirySelect = (expiry: string) => {
      handleSendMessage(`exp:${expiry}`);
  }

  const handleCommandClick = (command: string) => {
      if (command.startsWith('/paper') || command.startsWith('/close')) {
          setInput(command);
          const inputElement = document.querySelector('input[aria-label="Chat input"]');
          if (inputElement) {
            (inputElement as HTMLInputElement).focus();
          }
      } else {
        handleSendMessage(command);
      }
  }

  const handlePaperTrade = () => {
      if (!user) {
          toast.error("Please sign in to place a trade.");
          return;
      }
      const lastAnalysisMessage = messages.slice().reverse().find(msg => msg.payload?.type === 'analysis');
      if (lastAnalysisMessage) {
        const payload = lastAnalysisMessage.payload as BotResponsePayload & { type: 'analysis' };
        if (payload.tradeRecommendation?.tradeCommand) {
            setInput(payload.tradeRecommendation.tradeCommand);
            const inputElement = document.querySelector('input[aria-label="Chat input"]');
            if (inputElement) {
                (inputElement as HTMLInputElement).focus();
            }
        } else {
            toast.error("No Recommendation Found", {
                description: "Run an analysis to get a trade recommendation first."
            })
        }
      } else {
          toast.error("No Analysis Found", {
                description: "Run an analysis to get a trade recommendation first."
            })
      }
  }

  const exportToCSV = (data: TradeHistoryItem[]) => {
    const headers = [
      'Trade ID', 'Instrument', 'Expiry', 'Action', 'Quantity (Lots)',
      'Entry Time', 'Exit Time', 'Entry Price', 'Exit Price', 'Entry Delta', 'Exit Delta',
      'Gross P&L', 'Net P&L', 'Total Costs', 'Status'
    ];
    const rows = data.map(trade => [
      trade.id,
      `${trade.strike} ${trade.type}`,
      trade.expiry,
      trade.action,
      trade.quantity,
      new Date(trade.entryTimestamp).toLocaleString(),
      trade.exitTimestamp ? new Date(trade.exitTimestamp).toLocaleString() : 'N/A',
      trade.entryPrice,
      trade.exitPrice ?? 'N/A',
      trade.entryDelta?.toFixed(3) ?? 'N/A',
      trade.exitDelta?.toFixed(3) ?? 'N/A',
      trade.grossPnl.toFixed(2),
      trade.netPnl.toFixed(2),
      trade.totalCosts.toFixed(2),
      trade.netPnl >= 0 ? 'Win' : 'Loss'
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trade_journal.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleSignIn = async () => {
    // This is a placeholder for a real Google Sign-In flow
    const mockUser: ClientUser = {
      uid: 'mock-user-12345', // A real implementation would get this from Firebase Auth
      displayName: 'Test User',
      email: 'test@example.com',
    };

    localStorage.setItem('vizbot_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsHydrating(true);
    const userData = await getUserData(mockUser.uid);
    if (userData) {
      setPortfolio(userData.portfolio ?? initialPortfolio);
      setAccessToken(userData.accessToken ?? null);
      setMessages(userData.messages && userData.messages.length > 0 ? userData.messages : [{ id: crypto.randomUUID(), role: 'bot', content: "Welcome back!" }]);
    } else {
      const initialData: UserData = { portfolio: initialPortfolio, accessToken: null, messages: initialMessages };
      await saveUserData(mockUser.uid, initialData);
      setPortfolio(initialPortfolio);
      setAccessToken(null);
      setMessages(initialMessages);
    }
    setIsHydrating(false);
    toast.success("Signed in successfully!");
  };

  const handleGuestSignIn = () => {
    const guestUser: ClientUser = {
      uid: 'guest-user',
      displayName: 'Guest User',
      email: null,
    };
    localStorage.setItem('vizbot_user', JSON.stringify(guestUser));
    setUser(guestUser);
    setPortfolio(initialPortfolio);
    setAccessToken(null);
    setMessages([{ id: crypto.randomUUID(), role: 'bot', content: "Welcome, Guest! Your session is local and won't be saved." }]);
    toast.success("Signed in as Guest.");
  };

  const handleSignOut = async () => {
    localStorage.removeItem('vizbot_user');
    setUser(null);
    setPortfolio(initialPortfolio);
    setAccessToken(null);
    setMessages(initialMessages);
    toast.success("Signed out successfully.");
  };

  if (isHydrating) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-background p-4">
              <Loader className="animate-spin text-primary" />
          </div>
      );
  }

  if (!user) {
    return <LoginPage onSignIn={handleSignIn} onGuestSignIn={handleGuestSignIn} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 font-code">
      <Card className="w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl rounded-2xl bg-card border-secondary">
        <CardHeader className="border-b border-secondary">
          <div className="flex items-center justify-between gap-3">
             <div className="flex items-center gap-3">
                <Bot className="w-8 h-8 text-muted-foreground" />
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">VizBot</CardTitle>
                  <CardDescription className="text-muted-foreground">Hey, {user.displayName || user.email}</CardDescription>
                </div>
              </div>
               <div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
               </div>
          </div>
        </CardHeader>
        <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} {...msg} onExpirySelect={handleExpirySelect} onCommandClick={handleCommandClick} />
          ))}
          {isPending && (
             <ChatMessage id="thinking" role="bot" content={<div className="flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Thinking...</div>} onExpirySelect={() => {}} onCommandClick={() => {}} />
          )}
        </CardContent>
        <div className="border-t border-secondary p-4 bg-card/80 backdrop-blur-sm rounded-b-2xl">
           <div className="flex gap-2 mb-3 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => handleCommandClick('start')} disabled={isPending}><Rocket /> Start</Button>
              <Button variant="outline" size="sm" onClick={() => handleCommandClick('auth')} disabled={isPending}><KeyRound /> Auth</Button>
              <Button variant="outline" size="sm" onClick={handlePaperTrade} disabled={isPending}><Newspaper /> Paper Trade</Button>
              <Button variant="outline" size="sm" onClick={() => handleCommandClick('/portfolio')} disabled={isPending}><Briefcase /> Portfolio</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isPending}><BookOpen/> Journal</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-card border-secondary">
                  <DialogHeader>
                    <DialogTitle>Trade Journal</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      A log of all your closed trades.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-secondary">
                          <TableHead>Instrument</TableHead>
                          <TableHead>Entry Date</TableHead>
                           <TableHead>Entry/Exit Price</TableHead>
                           <TableHead>Entry/Exit Delta</TableHead>
                          <TableHead>Net P&L</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {portfolio.tradeHistory?.length > 0 ? portfolio.tradeHistory.map((trade) => (
                          <TableRow key={trade.id} className="border-secondary">
                            <TableCell>{trade.strike} {trade.type}</TableCell>
                            <TableCell>{new Date(trade.entryTimestamp).toLocaleDateString()}</TableCell>
                            <TableCell>{trade.entryPrice.toFixed(2)} / {trade.exitPrice?.toFixed(2) ?? 'N/A'}</TableCell>
                            <TableCell>{trade.entryDelta?.toFixed(3) ?? 'N/A'} / {trade.exitDelta?.toFixed(3) ?? 'N/A'}</TableCell>
                            <TableCell className={trade.netPnl >= 0 ? 'text-green-400' : 'text-red-400'}>{trade.netPnl.toFixed(2)}</TableCell>
                            <TableCell className={trade.netPnl >= 0 ? 'text-green-400' : 'text-red-400'}>{trade.netPnl >= 0 ? 'Win' : 'Loss'}</TableCell>
                          </TableRow>
                        )) : (
                           <TableRow className="border-secondary">
                            <TableCell colSpan={6} className="text-center">No closed trades yet.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                   <DialogFooter>
                     <Button
                        onClick={() => exportToCSV(portfolio.tradeHistory)}
                        disabled={!portfolio.tradeHistory || portfolio.tradeHistory.length === 0}
                      >
                        Export to CSV
                      </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={() => setInput('/close ')} disabled={isPending}><XCircle /> Close</Button>
               <Button variant="outline" size="sm" onClick={resetPortfolio} disabled={isPending}><RefreshCw /> Reset</Button>
              <Button variant="outline" size="sm" onClick={() => handleCommandClick('help')} disabled={isPending}><HelpCircle /> Help</Button>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message or use the menu..."
              className="flex-1"
              disabled={isPending}
              aria-label="Chat input"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isPending} aria-label="Send message">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}