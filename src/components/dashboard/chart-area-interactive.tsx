"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getRevenueChartData } from "@/lib/services/invoiceService"

// Type pour les données du graphique
interface ChartDataItem {
  date: string
  revenus: number
  factures: number
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}

export function ChartAreaInteractive() {
  const [period, setPeriod] = React.useState("year")
  const [dataType, setDataType] = React.useState("revenus")
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Récupérer les données du graphique depuis Firestore
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true)
        const data = await getRevenueChartData()
        setChartData(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des données du graphique:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchChartData()
  }, [])
  
  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return []
    
    if (period === "year") {
      // Prendre les 12 derniers mois
      return chartData.slice(-12)
    } else if (period === "6months") {
      // Prendre les 6 derniers mois
      return chartData.slice(-6)
    } else {
      // Prendre les 3 derniers mois
      return chartData.slice(-3)
    }
  }, [period, chartData])

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Analyse des performances</CardTitle>
          <CardDescription>
            Évolution des {dataType === "revenus" ? "revenus HT" : "factures"} sur la période sélectionnée
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={dataType} onValueChange={(value) => value && setDataType(value)}>
            <ToggleGroupItem value="revenus" size="sm">Revenus HT</ToggleGroupItem>
            <ToggleGroupItem value="factures" size="sm">Factures</ToggleGroupItem>
          </ToggleGroup>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Année</SelectItem>
              <SelectItem value="6months">6 mois</SelectItem>
              <SelectItem value="3months">3 mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>Aucune donnée disponible pour cette période</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInvoices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => 
                    dataType === "revenus" 
                      ? `${value / 1000}k €` 
                      : value.toString()
                  }
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip 
                  formatter={(value: number) => {
                    if (dataType === "revenus") {
                      return [formatCurrency(value), "Revenus HT"]
                    } else {
                      return [value, "Factures"]
                    }
                  }}
                  labelFormatter={(label) => {
                    const date = new Date(label)
                    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date)
                  }}
                />
                {dataType === "revenus" && (
                  <Area 
                    type="monotone" 
                    dataKey="revenus" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                )}
                {dataType === "factures" && (
                  <Area 
                    type="monotone" 
                    dataKey="factures" 
                    stroke="#82ca9d" 
                    fillOpacity={1} 
                    fill="url(#colorInvoices)" 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
