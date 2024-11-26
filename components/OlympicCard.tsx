import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OlympicCard() {
  return (
        <Card className="w-full max-w-sm rounded-lg overflow-hidden">
          <img src="https://picsum.photos/200" alt="Card Image" width={400} height={300} className="w-full h-[300px] object-cover" />
          <CardContent className="p-4 space-y-2">
            <h3 className="text-xl font-semibold">OBMEP</h3>
            <p className="text-muted-foreground">Olimpíada Brasileira de Matemática das escolas públicas</p>
            <div className="flex flex-wrap gap-2">
              <div className="bg-muted rounded-full px-3 py-1 text-xs text-muted-foreground">Matemática</div>
              <div className="bg-muted rounded-full px-3 py-1 text-xs text-muted-foreground">Raciocínio lógico</div>
              <div className="bg-muted rounded-full px-3 py-1 text-xs text-muted-foreground">Computação</div>
            </div>
          </CardContent>
        </Card>
      )
}
