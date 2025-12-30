"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../components/ui/chart"

export const description = "A bar chart"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function BarGraph({ fullName }) {
  return (
    <Card className="border-transparent bg-base-100 font-[DM_Sans]">
      <CardHeader>
        <CardTitle className="font-bold text-3xl">Welcome back, {fullName}</CardTitle>
        <CardDescription>Here's how your study habits are showing up for this week:</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-60">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="bg-white border-transparent"/>}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} barSize={80} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
