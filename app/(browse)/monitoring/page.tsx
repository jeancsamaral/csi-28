"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Edit, Trash, Settings, Store } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import sendEmail from '@/emails/mailSend';
import { stopCoverage } from 'v8';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"



interface Stock {
  symbol: string;
  price: number;
  lower: number;
  upper: number;
  frequency: number;
  timestamp: string;
}

export default function Page() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [alerts, setAlerts] = useState<{ symbol: string; message: string }[]>([]);
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [userMail, setUserMail] = useState("");

  useEffect(() => {
    setUserMail("inoachallenge@gmail.com");
  }, []);


  useEffect(() => {
    const fetchStocks = () => {
      fetch('http://127.0.0.1:8000/api/stocks/')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Fetched stocks:', data);
          setStocks(Array.isArray(data) ? data : [data]);
        })
        .catch(error => console.error('Error fetching data:', error));
    };

    fetchStocks(); // Call the function to fetch stocks
  }, []);

  useEffect(() => {
    const intervalIds = stocks.map(stock => {
      const frequency = parseInt((stock.frequency).toString());
      const checkAlerts = () => {
        const symbol = stock.symbol;
        const price = parseFloat((stock.price).toString());
        const lower = parseFloat((stock.lower).toString());
        const upper = parseFloat((stock.upper).toString());



        let message = '';

        if (price < lower) {
          message = `Alert: ${symbol} stock price: ${price} is below the lower threshold (${lower}). Consider buying.`;

        } else if (price > upper) {
          message = `Alert: ${symbol} stock price: ${price} is above the upper threshold (${upper}). Consider selling.`;
        }



        if (message) {
          console.log(message);
          fetch('http://127.0.0.1:8000/api/send-email/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subject: 'Stock Alert',
              message: message,
              recipient_list: ["inoachallenge@gmail.com"],
            }),
          })
            .then(response => {
              // Verifica o Content-Type antes de tentar converter para JSON
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                return response.json();
              } else {
                throw new Error('Resposta não é JSON');
              }
            })
            .then(data => {
              console.log(data);
            })
            .catch(error => {
              console.error('Error sending email:', error);
            });
        }
      };

      checkAlerts();

      return setInterval(checkAlerts, frequency * 60 * 1000);
    });

    return () => {
      intervalIds.forEach(clearInterval);
    };
  }, [stocks]);



  const handleDelete = (symbol: string) => {
    fetch(`http://127.0.0.1:8000/stocks/delete/${symbol}/`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          setStocks(stocks.filter(stock => stock.symbol !== symbol));
        } else {
          console.error('Failed to delete stock');
        }
      })
      .catch(error => console.error('Error deleting stock:', error));
  };

  const handleAddStock = (symbol: string, upper: number, lower: number, frequency: number) => {
    if (symbol && lower !== undefined && upper !== undefined && frequency !== undefined) {
      fetch('http://127.0.0.1:8000/api/stocks/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, upper, lower, frequency }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('API response:', data);
          if (data && data.price !== undefined) {
            const newStock = { ...data, upper, lower, frequency };
            setStocks([...stocks, newStock]);
          } else {
            console.error('Price is undefined in the API response.');
          }
        })
        .catch(error => console.error('Error adding stock:', error));
    } else {
      alert("Please provide a stock symbol and the required parameters.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <main className="flex-1 p-4 sm:p-6">
        <div className="grid gap-6">

          <PortfolioOverview stocks={stocks} onDelete={handleDelete} onAddStock={handleAddStock} userMail={userMail} setUserMail={setUserMail} />
        </div>
      </main>
    </div>
  );
}


function PortfolioOverview({ stocks, onDelete, onAddStock, userMail, setUserMail }: { stocks: Stock[], onDelete: (symbol: string) => void, onAddStock: (symbol: string, lower: number, upper: number, frequency: number) => void, userMail: string, setUserMail: React.Dispatch<React.SetStateAction<string>> }) {
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [newStockUpper, setNewStockUpper] = useState("");
  const [newStockLower, setNewStockLower] = useState("");
  const [newStockFrequency, setNewStockFrequency] = useState("");

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
        <CardWithForm userMail={userMail} setUserMail={setUserMail}></CardWithForm>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset Management</CardTitle>
          <CardDescription>Configure and monitor your investments on the B3 stock exchange.</CardDescription>
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
                  <AssetRow key={stock.symbol} label={stock.symbol} frequency={stock.frequency} lower={stock.lower} upper={stock.upper} value={`$${stock.price}`} onDelete={onDelete} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssetRow({ label, value, frequency, lower, upper, onDelete }: { label: string; value: string; frequency: number; lower: number; upper: number; onDelete: (symbol: string) => void }) {
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
      <TableCell>{value}</TableCell>
      <TableCell>{frequency} min</TableCell>
      <TableCell className="text-red-500">${lower}</TableCell>
      <TableCell className="text-green-500">${upper}</TableCell>
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
    </TableRow >
  );
}

interface CardWithForm {
  userMail: string;
  setUserMail: React.Dispatch<React.SetStateAction<string>>;
}

export function CardWithForm({ userMail, setUserMail }: CardWithForm) {
  const handleMailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserMail(event.target.value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personal Info</CardTitle>
        <CardDescription>E-mail access data.</CardDescription>
        <CardDescription>Current receiver: {userMail}</CardDescription>
        <CardDescription>Password: inoasistemas123</CardDescription>
      </CardHeader>
      {/*
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="mail">User mail</Label>
              <Input
                id="mail"
                type="email"
                placeholder="E-mail"
                value={userMail}
                onChange={handleMailChange}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button>Refresh</Button>
      </CardFooter>*/}
    </Card>
  );
}