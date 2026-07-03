'use client'

import { motion } from "framer-motion"
import { CoastalWeather } from "@/components/weather/coastal-weather"
import { CloudRain, Thermometer, Wind } from "lucide-react"

export function WeatherSection() {
  return (
    <section id="weather" className="relative bg-gray-50 py-24 dark:bg-gray-900/50 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-1/3 w-1/3 -translate-x-1/2 bg-gradient-to-br from-blue-100 to-cyan-100 blur-3xl dark:from-blue-900/20 dark:to-cyan-900/20" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          >
            <CloudRain className="mr-2 h-4 w-4" />
            Live Weather Data
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            Real-Time Coastal Weather Monitoring
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300"
          >
            Stay informed with live weather conditions across major Indian coastal cities. 
            Our integrated weather monitoring provides essential data for threat assessment and emergency planning.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 sm:mt-20"
        >
          <CoastalWeather />
        </motion.div>

        {/* Weather features grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
        >
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <Thermometer className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Temperature Monitoring
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Real-time temperature data with heat index calculations for coastal safety assessments.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <Wind className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Wind Analysis
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Wind speed and direction monitoring for storm surge and wave height predictions.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <CloudRain className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Precipitation Tracking
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Rainfall and humidity monitoring for flood risk assessment and early warnings.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
