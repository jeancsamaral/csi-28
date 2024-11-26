"use client"

import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Bell, Bot, Gauge, Mail, Network, TrendingUp } from 'lucide-react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from '../../firebase'
import { notFound } from 'next/navigation'

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!userEmail) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1">
        <section className="w-full pt-12 md:pt-24 lg:pt-32 border-y">
          <div className="px-4 md:px-6 space-y-10 xl:space-y-16">
            <div className="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
              <div>
                <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                  Automate Your Asset Monitoring and Trading Alerts
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Our powerful system fetches real-time price data, sets custom price tunnel parameters, and sends
                  timely alerts to help you stay on top of your B3 asset trading opportunities.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Automate Asset Monitoring</h3>
                      <p className="text-muted-foreground">
                        Our system continuously monitors your B3 assets, fetching real-time price data to identify
                        trading opportunities.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Receive Email Alerts</h3>
                      <p className="text-muted-foreground">
                        Get timely email notifications when your assets reach your specified price thresholds, so you
                        can act quickly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                      <Network className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">User-Friendly Interface</h3>
                      <p className="text-muted-foreground">
                        Easily configure your asset monitoring and alert settings through our intuitive web-based
                        interface.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Welcome, {userEmail || 'Loading...'}
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our asset monitoring and trading alert system provides powerful features to help you stay on top of your
                investments.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold">Real-Time Price Data</CardTitle>
                  <TrendingUp className="w-6 h-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our system continuously fetches real-time price data for your B3 assets, ensuring you have the
                    latest information to make informed trading decisions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold">Custom Price Tunnels</CardTitle>
                  <Gauge className="w-6 h-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Set custom price tunnel parameters to define your buy and sell thresholds, and our system will
                    monitor your assets accordingly.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold">Timely Alerts</CardTitle>
                  <Bell className="w-6 h-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive email notifications when your assets reach your specified price thresholds, allowing you to
                    act quickly on trading opportunities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Asset Monitoring. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
