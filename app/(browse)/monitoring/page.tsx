"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { app } from '@/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, deleteDoc, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import { Edit, Plus, RefreshCw, Store, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Quote {
  symbol: string;
  shortName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  currency?: string;
}

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  lastUpdated: string;
}

interface Order {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  timestamp: string;
}

interface Stock {
  symbol: string;
  price: number;
  lower: number;
  upper: number;
  frequency: number;
  timestamp: string;
}

interface StockInfo {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
}

interface YahooSearchQuote {
  symbol: string;
  shortname?: string;
  exchange?: string;
  quoteType?: string;
  score?: number;
  typeDisp?: string;
  longname?: string;
  isYahooFinance?: boolean;
}

const POPULAR_SYMBOLS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "PETR4.SA", name: "Petrobras" },
  { symbol: "VALE3.SA", name: "Vale" },
  { symbol: "ITUB4.SA", name: "Itaú Unibanco" },
  { symbol: "BBDC4.SA", name: "Banco Bradesco" },
];

export default function PortfolioPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchResults, setSearchResults] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userMail, setUserMail] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monitoredStocks, setMonitoredStocks] = useState<Stock[]>([]);

  // Firebase auth
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserMail(user.email || "");
        setUserId(user.uid);
        // Load user's positions and orders
        loadUserPortfolio(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserPortfolio = async (uid: string) => {
    const db = getFirestore(app);
    
    // Load positions
    const positionsRef = collection(db, 'user', uid, 'positions');
    const positionsSnap = await getDocs(positionsRef);
    const positionsData = positionsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        symbol: data.symbol,
        quantity: data.quantity,
        averagePrice: data.averagePrice,
        currentPrice: data.currentPrice,
        totalValue: data.totalValue,
        profitLoss: data.profitLoss,
        profitLossPercentage: data.profitLossPercentage,
        lastUpdated: data.lastUpdated
      } as Position;
    });
    setPositions(positionsData);

    // Load orders
    const ordersRef = collection(db, 'users', uid, 'orders');
    const ordersSnap = await getDocs(ordersRef);
    const ordersData = ordersSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        symbol: data.symbol,
        type: data.type as 'BUY' | 'SELL',
        quantity: data.quantity,
        price: data.price,
        status: data.status as 'PENDING' | 'EXECUTED' | 'CANCELLED',
        timestamp: data.timestamp
      } as Order;
    });
    setOrders(ordersData);
  };

  const placeOrder = async (symbol: string, type: 'BUY' | 'SELL', quantity: number, price: number) => {
    if (!userId) return;
    
    const db = getFirestore(app);
    const newOrder: Omit<Order, 'id'> = {
      symbol,
      type,
      quantity,
      price,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };

    try {
      // Add order to Firestore
      const orderRef = await addDoc(collection(db, 'users', userId, 'orders'), newOrder);
      
      // Update positions
      const positionRef = collection(db, 'users', userId, 'positions');
      const positionQuery = query(positionRef, where('symbol', '==', symbol));
      const positionSnap = await getDocs(positionQuery);

      if (positionSnap.empty && type === 'BUY') {
        // Create new position
        await addDoc(positionRef, {
          symbol,
          quantity,
          averagePrice: price,
          currentPrice: price,
          totalValue: quantity * price,
          profitLoss: 0,
          profitLossPercentage: 0,
          lastUpdated: new Date().toISOString()
        });
      } else if (!positionSnap.empty) {
        // Update existing position
        const positionDoc = positionSnap.docs[0];
        const currentPosition = positionDoc.data() as Position;
        
        const newQuantity = type === 'BUY' 
          ? currentPosition.quantity + quantity
          : currentPosition.quantity - quantity;

        if (newQuantity > 0) {
          const newAveragePrice = type === 'BUY'
            ? ((currentPosition.averagePrice * currentPosition.quantity) + (price * quantity)) / newQuantity
            : currentPosition.averagePrice;

          await updateDoc(positionDoc.ref, {
            quantity: newQuantity,
            averagePrice: newAveragePrice,
            totalValue: newQuantity * price,
            lastUpdated: new Date().toISOString()
          });
        } else {
          // Close position if quantity becomes 0
          await deleteDoc(positionDoc.ref);
        }
      }

      // Reload portfolio
      loadUserPortfolio(userId);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    }
  };

  // Buscar dados do Yahoo Finance
  const searchStock = async () => {
    if (!searchTerm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/yahoo?symbol=${searchTerm}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      
      const quote = await response.json();
      
      if (quote) {
        const newQuote: Quote = {
          symbol: quote.symbol,
          shortName: quote.shortName,
          regularMarketPrice: quote.regularMarketPrice,
          regularMarketChange: quote.regularMarketChange,
          regularMarketChangePercent: quote.regularMarketChangePercent,
          currency: quote.currency
        };
        
        setSearchResults([newQuote]);
        localStorage.setItem('lastSearchResults', JSON.stringify([newQuote]));
      }
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to fetch stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar resultados salvos do localStorage
  useEffect(() => {
    const savedResults = localStorage.getItem('lastSearchResults');
    if (savedResults) {
      setSearchResults(JSON.parse(savedResults));
    }

    const savedMonitored = localStorage.getItem('monitoredStocks');
    if (savedMonitored) {
      setMonitoredStocks(JSON.parse(savedMonitored));
    }
  }, []);

  const handleAddToMonitoring = (quote: Quote) => {
    if (!quote.regularMarketPrice) return;

    const newStock: Stock = {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      lower: quote.regularMarketPrice * 0.95,
      upper: quote.regularMarketPrice * 1.05,
      frequency: 5,
      timestamp: new Date().toISOString()
    };

    const updatedStocks = [...monitoredStocks, newStock];
    setMonitoredStocks(updatedStocks);
    localStorage.setItem('monitoredStocks', JSON.stringify(updatedStocks));
  };

  const handleDelete = (symbol: string) => {
    const updatedStocks = monitoredStocks.filter((stock: Stock) => stock.symbol !== symbol);
    setMonitoredStocks(updatedStocks);
    localStorage.setItem('monitoredStocks', JSON.stringify(updatedStocks));
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <main className="flex-1 p-4 sm:p-6">
        <div className="grid gap-6">
          {/* Portfolio Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
              <CardDescription>Your current positions and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Value</TableHead>
                    {/* <TableHead>Price now</TableHead> */}
                    {/* <TableHead>Current Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>P/L</TableHead>
                    <TableHead>P/L %</TableHead>
                    <TableHead>Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position.symbol}>
                      <TableCell>{position.symbol}</TableCell>
                      <TableCell>{position.quantity}</TableCell>
                      <TableCell>{0}</TableCell>
                      {/* <TableCell>{}</TableCell> */}
                      {/* <TableCell>{position?.averagePrice.toFixed(2)}</TableCell>
                      <TableCell>{position?.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>{position?.totalValue.toFixed(2)}</TableCell> */}
                      {/* <TableCell className={position?.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {position?.profitLoss.toFixed(2)}
                      </TableCell>
                      <TableCell className={position?.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {position?.profitLossPercentage.toFixed(2)}%
                      </TableCell> */}
                      {/* <TableCell>
                        <div className="flex gap-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm">Trade</Button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Trade {position.symbol}</SheetTitle>
                              </SheetHeader>
                              Add trade form here
                            </SheetContent>
                          </Sheet>
                        </div>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>


          {/* Search Card */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Search</CardTitle>
              <CardDescription>Enter a stock symbol to get real-time market data.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                  className="max-w-sm"
                />
                <Button 
                  onClick={searchStock}
                  disabled={loading || !searchTerm}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>

              {error && (
                <div className="text-red-500 mb-4">{error}</div>
              )}
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((quote) => (
                  <Card key={quote.symbol} className="border-2 hover:border-primary transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{quote.symbol}</CardTitle>
                          <CardDescription className="text-sm line-clamp-1">
                            {quote.shortName}
                          </CardDescription>
                        </div>
                        {quote.regularMarketChangePercent && (
                          <div className={`px-2 py-1 rounded-md text-sm font-medium ${
                            quote.regularMarketChange && quote.regularMarketChange >= 0 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {quote.regularMarketChangePercent.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Price</span>
                          <span className="text-lg font-bold">
                            {quote.regularMarketPrice?.toFixed(2)} {quote.currency}
                          </span>
                        </div>
                        {quote.regularMarketChange && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Change</span>
                            <span className={`font-medium ${
                              quote.regularMarketChange >= 0 
                                ? "text-green-600" 
                                : "text-red-600"
                            }`}>
                              {Math.abs(quote.regularMarketChange).toFixed(2)} {quote.currency}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => handleAddToMonitoring(quote)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Monitoring
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function PortfolioOverview({ stocks, onDelete, onAddStock, userMail, setUserMail, userId }: { 
  stocks: Stock[], 
  onDelete: (symbol: string) => void, 
  onAddStock: (symbol: string, upper: number, lower: number, frequency: number) => void, 
  userMail: string, 
  setUserMail: React.Dispatch<React.SetStateAction<string>>, 
  userId: string 
}) {
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [newStockUpper, setNewStockUpper] = useState("");
  const [newStockLower, setNewStockLower] = useState("");
  const [newStockFrequency, setNewStockFrequency] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const refreshPortfolio = async () => {
    setRefreshing(true);
    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          const response = await fetch(`/api/yahoo?symbol=${stock.symbol}`);
          if (!response.ok) throw new Error(`Failed to update ${stock.symbol}`);
          const newData = await response.json();
          
          return {
            ...stock,
            price: newData.regularMarketPrice,
            timestamp: new Date().toISOString()
          };
        })
      );
      localStorage.setItem('monitoredStocks', JSON.stringify(updatedStocks));
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
          <CardDescription>View the current value and performance of your investments.</CardDescription>
        </CardHeader>
        {/* <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-2xl font-bold">$119.90</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Weekly Performance</p>
              <p className="text-2xl font-bold text-green-500">+5.2%</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Monthly Performance</p>
              <p className="text-2xl font-bold text-red-500">-2.1%</p>
            </div>
          </div>
        </CardContent>*/}
        <CardWithForm userMail={userMail} setUserMail={setUserMail} userId={userId}></CardWithForm>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Asset Management</CardTitle>
              <CardDescription>Configure and monitor your investments.</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refreshPortfolio}
              disabled={refreshing || stocks.length === 0}
              className={`${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Asset
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Asset details</SheetTitle>
                    <SheetDescription>
                      Add information about the asset you want to add.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="symbol" className="text-right">
                        Symbol
                      </Label>
                      <Input
                        id="symbol"
                        className="col-span-3"
                        type="text"
                        placeholder="Symbol"
                        value={newStockSymbol}
                        onChange={(e) => setNewStockSymbol(e.target.value)}
                      />
                      <Label htmlFor="upper" className="text-right">
                        Upper Limit
                      </Label>
                      <Input
                        id="upper"
                        className="col-span-3"
                        type="number"
                        placeholder="Upper Limit"
                        value={newStockUpper}
                        onChange={(e) => setNewStockUpper(e.target.value)}
                      />
                      <Label htmlFor="lower" className="text-right">
                        Lower Limit
                      </Label>
                      <Input
                        id="lower"
                        className="col-span-3"
                        type="number"
                        placeholder="Lower Limit"
                        value={newStockLower}
                        onChange={(e) => setNewStockLower(e.target.value)}
                      />
                      <Label htmlFor="frequency" className="text-right">
                        Frequency (minutes)
                      </Label>
                      <Input
                        id="frequency"
                        className="col-span-3"
                        type="number"
                        placeholder="Frequency"
                        value={newStockFrequency}
                        onChange={(e) => setNewStockFrequency(e.target.value)}
                      />
                    </div>
                  </div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button
                        type="submit"
                        onClick={() => {
                          const upper = parseFloat(newStockUpper);
                          const lower = parseFloat(newStockLower);
                          const frequency = parseInt(newStockFrequency, 10);
                          if (!isNaN(upper) && !isNaN(lower) && !isNaN(frequency)) {
                            onAddStock(newStockSymbol, upper, lower, frequency);
                          } else {
                            alert("Please enter valid numeric values for upper, lower, and frequency.");
                          }
                        }}
                      >
                        Add Asset
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/*<Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Assets Settings
              </Button>*/}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Check</TableHead>
                  <TableHead>Lower</TableHead>
                  <TableHead>Upper</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => (
                  <AssetRow 
                    key={stock.symbol}
                    label={stock.symbol} 
                    value={`$${stock.price}`} 
                    frequency={stock.frequency} 
                    lower={stock.lower} 
                    upper={stock.upper} 
                    onDelete={onDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssetRow({ 
  label, 
  value, 
  frequency, 
  lower, 
  upper, 
  onDelete 
}: { 
  label: string;
  value: string;
  frequency: number;
  lower: number;
  upper: number;
  onDelete: (symbol: string) => void;
}) {
  const formatNumber = (num: number) => num.toFixed(4);
  const numericValue = parseFloat(value.replace('$', ''));

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary p-1">
            <Store className="h-full w-full" />
          </div>
          <span>{label}</span>
        </div>
      </TableCell>
      <TableCell>${formatNumber(numericValue)}</TableCell>
      <TableCell>{frequency} min</TableCell>
      <TableCell className="text-red-500">${formatNumber(lower)}</TableCell>
      <TableCell className="text-green-500">${formatNumber(upper)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(label)}>
            <Trash className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface CardWithForm {
  userMail: string;
  setUserMail: React.Dispatch<React.SetStateAction<string>>;
  userId: string;
}

export function CardWithForm({ userMail, setUserMail, userId }: CardWithForm) {
  const handleMailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserMail(event.target.value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personal Info</CardTitle>
        <CardDescription>E-mail access data.</CardDescription>
        <CardDescription>Current receiver: {userMail || "Loading..."}</CardDescription>
        <CardDescription>User ID: {userId || "Loading..."}</CardDescription>
      </CardHeader>
    </Card>
  );
}