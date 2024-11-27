"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { app } from "@/firebase";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUserId(user.uid);
      setShowBudgetForm(true);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Failed to register");
    }
  };

  const handleBudgetSubmit = async (budget: number) => {
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'user', userId, 'budget'), {
        value: budget,
        updatedAt: new Date().toISOString()
      });
      router.push("/market");
    } catch (err) {
      console.error("Budget setup error:", err);
      setError(err instanceof Error ? err.message : "Failed to set initial budget");
    }
  };

  if (showBudgetForm) {
    return <InitialBudgetForm onSubmit={handleBudgetSubmit} />;
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter your information to get started
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Enter your email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Enter your password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button className="w-full" type="submit">
            Create account
          </Button>
        </form>
      </div>
    </div>
  );
}

function InitialBudgetForm({ onSubmit }: { onSubmit: (budget: number) => Promise<void> }) {
  const [initialBudget, setInitialBudget] = useState("1000");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const budgetValue = parseFloat(initialBudget);
    if (isNaN(budgetValue) || budgetValue < 1000 || budgetValue > 20000) {
      setError("Initial budget must be between $1,000 and $20,000");
      return;
    }

    onSubmit(budgetValue);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Set Initial Budget</h1>
          <p className="text-gray-500 dark:text-gray-400">
            How much would you like to start with?
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Initial Budget ($)</Label>
            <Input
              id="budget"
              placeholder="Enter initial budget (1000-20000)"
              required
              type="number"
              min="1000"
              max="20000"
              step="100"
              value={initialBudget}
              onChange={(e) => setInitialBudget(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter an amount between $1,000 and $20,000
            </p>
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button className="w-full" type="submit">
            Start Trading
          </Button>
        </form>
      </div>
    </div>
  );
}