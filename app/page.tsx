'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Import components with dynamic loading
const Navbar = dynamic(() => import('@/components/site/navbar').then(mod => mod.Navbar), { ssr: true })
const Hero = dynamic(() => import('@/components/site/hero').then(mod => mod.Hero), { ssr: true })
const Features = dynamic(() => import('@/components/site/features').then(mod => mod.Features), { ssr: true })
const InteractiveFeatures = dynamic(() => import('@/components/sections/interactive-features').then(mod => mod.InteractiveFeatures), { ssr: true })
const VisualStorytelling = dynamic(() => import('@/components/sections/visual-storytelling').then(mod => mod.VisualStorytelling), { ssr: true })
const WeatherSection = dynamic(() => import('@/components/sections/weather-section').then(mod => mod.WeatherSection), { ssr: true })
const BlueCarbonExpanded = dynamic(() => import('@/components/site/blue-carbon-expanded').then(mod => mod.BlueCarbonExpanded), { ssr: true })
const CoastalAwarenessInterconnectivity = dynamic(() => import('@/components/site/coastal-awareness-interconnectivity').then(mod => mod.CoastalAwarenessInterconnectivity), { ssr: true })
const CTA = dynamic(() => import('@/components/site/cta').then(mod => mod.CTA), { ssr: true })
const Footer = dynamic(() => import('@/components/site/footer').then(mod => mod.Footer), { ssr: true })

// Loading components
function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Suspense fallback={<div className="h-16 w-full bg-white/80 backdrop-blur-lg dark:bg-gray-950/80" />}>
        <Navbar />
      </Suspense>

      <main>
        <Suspense fallback={<div className="h-screen w-full bg-gray-50 dark:bg-gray-900" />}>
          <Hero />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <Features />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <InteractiveFeatures />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <VisualStorytelling />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <WeatherSection />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <BlueCarbonExpanded />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <CoastalAwarenessInterconnectivity />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <CTA />
        </Suspense>
      </main>

      <Suspense fallback={<div className="h-64 w-full bg-gray-50 dark:bg-gray-900" />}>
        <Footer />
      </Suspense>
    </div>
  )
}
