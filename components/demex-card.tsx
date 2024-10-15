'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DemexCard({ status }: { status: string }) {
  return (
    <Card className="w-full max-w-[360px] h-[380px] relative bg-white bg-opacity-5 border border-white border-opacity-10 shadow-lg rounded-[24px] overflow-hidden backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl mx-auto">
      <div className="absolute w-full h-[120px] left-0 top-0 bg-gradient-to-br from-[#2D313C] to-[#1D1F26] rounded-t-[24px] overflow-hidden">
        <img src="https://via.placeholder.com/360x120.png?text=Demex+Header" alt="Demex header" className="w-full h-full object-cover opacity-50" />
      </div>
      <div className="absolute w-[90px] h-[90px] left-[20px] top-[75px] bg-gradient-to-br from-[#2D313C] to-[#1D1F26] rounded-full border-4 border-white border-opacity-20 overflow-hidden shadow-md">
        <img 
          src="https://api.dicebear.com/6.x/bottts/svg?seed=Demex&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4"
          alt="Demex logo" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute left-[120px] top-[100px] right-[20px]">
        <h3 className="font-poppins font-semibold text-[20px] text-white mb-1">Demex</h3>
        <p className="font-inter font-medium text-[14px] text-gray-300">$DMX</p>
      </div>
      <Button 
        variant="destructive" 
        className="absolute right-[20px] top-[140px] h-[28px] text-[12px] font-poppins font-medium bg-[#D50000] rounded-full px-4"
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Button>
      <p className="absolute w-[calc(100%-40px)] left-[20px] top-[180px] font-inter font-medium text-[14px] leading-[22px] text-gray-300">
        Demex is a multi-chain platform that provides the deepest liquidity in the market for altcoins.
      </p>
      <div className="absolute w-[calc(100%-40px)] h-[1px] left-[20px] bottom-[100px] bg-white bg-opacity-10" />
      <div className="absolute left-[20px] bottom-[20px] right-[20px] grid grid-cols-2 gap-4">
        {[
          { label: 'Raised Amount', value: '$TBA' },
          { label: 'Token Price', value: 'TBA' },
          { label: 'IDO Date', value: 'TBA' },
        ].map((item, index) => (
          <div key={index} className="flex flex-col">
            <span className="font-inter font-medium text-[12px] text-gray-400">{item.label}</span>
            <span className="font-inter font-bold text-[14px] text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
