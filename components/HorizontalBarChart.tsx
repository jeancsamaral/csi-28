"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { month: "Janeiro", desktop: 186 },
  { month: "Fevereiro", desktop: 305 },
  { month: "Março", desktop: 237 },
  { month: "Abril", desktop: 73 },
  { month: "Maio", desktop: 209 },
  { month: "Junho", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function HorizontalBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aulas Assistidas</CardTitle>
        <CardDescription>Janeiro - Junho 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
            <XAxis type="number" dataKey="desktop" hide />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Aumentou 5,2% nesse mês <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Monstrando o total de aulas que você viu nos últimos 6 meses
        </div>
      </CardFooter>
    </Card>
  )
}
