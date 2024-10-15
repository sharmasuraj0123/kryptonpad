"use client";

import Head from 'next/head'
import { DemexCard } from '@/components/demex-card'
import { useState } from 'react'
import { ThreeStateToggle } from '@/components/three-state-toggle'

export default function Home() {
  const [activeTab, setActiveTab] = useState('Live');

  const idoData = [
    { id: 1, status: 'live' },
    { id: 2, status: 'upcoming' },
    { id: 3, status: 'past' },
    { id: 4, status: 'live' },
  ]

  const filteredIdoData = idoData.filter(item => 
    item.status.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black">
      <Head>
        <title>KryptonPad</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <h1 className="text-5xl font-bold text-white mb-12 text-center">KryptonPad</h1>
        
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-white mb-6 text-center">IDO</h2>
          <div className="max-w-md mx-auto">
            <ThreeStateToggle onChange={(newState) => setActiveTab(newState)} />
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIdoData.map((item) => (
            <DemexCard key={item.id} status={item.status} />
          ))}
        </div>
      </main>
    </div>
  )
}
