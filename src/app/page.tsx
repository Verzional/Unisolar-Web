"use client";

import { useState } from "react";
import { api } from "@/services/api";
import { formatKwh } from "@/utils/format";
import { calculateSystemKwp } from "@/utils/calculate";
import type { DailyPredictionResponse, HourlyPrediction } from "@/types/solar";

export default function Home() {
  // Form State
  const [location, setLocation] = useState("");
  const [numPanels, setNumPanels] = useState(15);
  const [panelRatingW, setPanelRatingW] = useState(330);
  const [inverterKw, setInverterKw] = useState(5);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow">("today");

  // Results State
  const [dailyPrediction, setDailyPrediction] =
    useState<DailyPredictionResponse | null>(null);

  const systemKwp = calculateSystemKwp(numPanels, panelRatingW);

  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    setError(null);

    try {
      const locationData = await api.getCurrentLocation();
      const locationName = [
        locationData.city,
        locationData.region,
        locationData.country,
      ]
        .filter(Boolean)
        .join(", ");
      setLocation(locationName || `${locationData.lat}, ${locationData.lon}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not detect location automatically"
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const targetDate = activeTab === "today" ? today : tomorrow;

      const response = await api.predictDaily({
        location,
        num_panels: numPanels,
        panel_rating_w: panelRatingW,
        inverter_kw: inverterKw,
        date: targetDate.toISOString().split("T")[0], // YYYY-MM-DD Format
      });
      setDailyPrediction(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            ☀️ Solar Generation Predictor
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Estimate your solar panel output based on location and system
            configuration
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              System Configuration
            </h2>

            <form onSubmit={handlePredict} className="space-y-6">
              {/* Location Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📍 Location
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city name (e.g., Sydney, Australia)"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    disabled={isDetectingLocation}
                    className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    title="Auto-detect location from IP"
                  >
                    {isDetectingLocation ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>📍</span>
                        <span className="hidden sm:inline">Auto-Detect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Number of Panels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔢 Number of Panels
                </label>
                <input
                  type="number"
                  value={numPanels}
                  onChange={(e) => setNumPanels(parseInt(e.target.value) || 0)}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Panel Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ⚡ Panel Rating (Watts)
                </label>
                <select
                  value={panelRatingW}
                  onChange={(e) => setPanelRatingW(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="250">250W (Budget)</option>
                  <option value="300">300W (Standard)</option>
                  <option value="330">330W (Standard+)</option>
                  <option value="370">370W (Efficient)</option>
                  <option value="400">400W (High Efficiency)</option>
                  <option value="435">435W (Premium)</option>
                  <option value="500">500W (Commercial)</option>
                </select>
              </div>

              {/* Inverter Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔌 Inverter Capacity (kW)
                </label>
                <input
                  type="number"
                  value={inverterKw}
                  onChange={(e) =>
                    setInverterKw(parseFloat(e.target.value) || 0)
                  }
                  min="0.5"
                  max="100"
                  step="0.5"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* System Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>System Size:</strong> {systemKwp.toFixed(2)} kWp
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  {numPanels} panels × {panelRatingW}W = {systemKwp.toFixed(2)}{" "}
                  kWp
                </p>
              </div>

              {/* Prediction Type Tabs */}
              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => setActiveTab("today")}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition ${
                    activeTab === "today"
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  📅 Today
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tomorrow")}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition ${
                    activeTab === "tomorrow"
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  🌅 Tomorrow
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Calculating...
                  </span>
                ) : (
                  "⚡ Predict Generation"
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    ❌ {error}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Results Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Prediction Results
            </h2>

            {!dailyPrediction && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p>Enter your system details and select Today or Tomorrow</p>
              </div>
            )}

            {/* Daily Prediction Results */}
            {dailyPrediction && (
              <div className="space-y-6">
                {/* Total Daily Generation */}
                <div className="bg-linear-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Total Daily Generation
                  </p>
                  <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                    {formatKwh(dailyPrediction.total_kwh)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {activeTab === "today" ? "📅 Today" : "🌅 Tomorrow"} (
                    {dailyPrediction.date})
                  </p>
                </div>

                {/* Hourly Chart */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-4">
                    📊 Hourly Breakdown
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {dailyPrediction.hourly
                      .filter((h) => h.generation_kwh > 0.001)
                      .map((hour: HourlyPrediction) => {
                        const maxKwh = Math.max(
                          ...dailyPrediction.hourly.map((h) => h.generation_kwh)
                        );
                        const percentage =
                          maxKwh > 0 ? (hour.generation_kwh / maxKwh) * 100 : 0;

                        return (
                          <div
                            key={hour.hour}
                            className="flex items-center gap-3"
                          >
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-12">
                              {hour.hour.toString().padStart(2, "0")}:00
                            </span>
                            <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-yellow-400 to-orange-500 rounded"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-700 dark:text-gray-300 w-20 text-right">
                              {hour.generation_kwh.toFixed(3)} kWh
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Peak Hour */}
                {dailyPrediction.hourly.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      🏆 Peak Generation
                    </h3>
                    {(() => {
                      const peakHour = dailyPrediction.hourly.reduce(
                        (max, h) =>
                          h.generation_kwh > max.generation_kwh ? h : max,
                        dailyPrediction.hourly[0]
                      );
                      return (
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {peakHour.hour.toString().padStart(2, "0")}:00 -{" "}
                          {formatKwh(peakHour.generation_kwh)} (Elevation:{" "}
                          {peakHour.solar_elevation.toFixed(1)}°)
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>
            ⚠️ Predictions are estimates and may vary based on actual weather
            conditions
          </p>
          <p className="mt-1">
            Powered by OpenWeatherMap API | Built with Next.js & Flask
          </p>
        </footer>
      </div>
    </div>
  );
}
