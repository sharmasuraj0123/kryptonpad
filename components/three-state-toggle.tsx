'use client'

import { useState } from 'react'

type ToggleState = 'live' | 'upcoming' | 'past'

interface ThreeStateToggleProps {
  onChange?: (state: ToggleState) => void;
}

export function ThreeStateToggle({ onChange }: ThreeStateToggleProps) {
  const [state, setState] = useState<ToggleState>('live')

  const handleClick = () => {
    setState(currentState => {
      const newState = currentState === 'live' ? 'upcoming' : currentState === 'upcoming' ? 'past' : 'live';
      onChange?.(newState);
      return newState;
    })
  }

  const getBackgroundColor = () => {
    switch (state) {
      case 'live': return 'bg-red-500'
      case 'upcoming': return 'bg-blue-500'
      case 'past': return 'bg-gray-500'
    }
  }

  const getTranslate = () => {
    switch (state) {
      case 'live': return 'translate-x-0'
      case 'upcoming': return 'translate-x-[12rem]'
      case 'past': return 'translate-x-[24rem]'
    }
  }

  const getButtonColor = () => {
    switch (state) {
      case 'live': return 'text-yellow-300'
      case 'upcoming': return 'text-green-300'
      case 'past': return 'text-white'
    }
  }

  return (
    <div className="relative w-[36rem] h-16 rounded-full overflow-hidden">
      <div
        className={`absolute inset-0 transition-colors duration-300 ease-in-out ${getBackgroundColor()}`}
      />
      <button
        className="relative w-full h-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={handleClick}
        aria-pressed={state === 'live'}
        aria-label={`Toggle state: currently ${state}`}
      >
        <span
          className={`absolute top-2 left-2 flex items-center justify-center w-[11rem] h-12 rounded-full bg-white text-2xl font-semibold transition-transform duration-300 ease-in-out transform ${getTranslate()} ${getButtonColor()}`}
        >
          {state === 'live' ? 'Live' : state === 'upcoming' ? 'Upcoming' : 'Past'}
        </span>
      </button>
    </div>
  )
}
