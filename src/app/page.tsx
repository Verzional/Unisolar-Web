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
          : "Could not detect location automatically",
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-300/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-200/10 to-yellow-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced Header */}
        <header className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
            Solar Generation Predictor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Harness the power of AI to estimate your solar panel output with
            precision
          </p>
          <div className="flex justify-center mt-6">
            <div className="h-1 w-32 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full"></div>
          </div>
        </header>

        <div className="grid xl:grid-cols-2 gap-8 lg:gap-12">
          {/* Enhanced Input Form */}
          <div className="group">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 transition-all duration-500 hover:shadow-3xl animate-slideUp">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">⚙️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  System Configuration
                </h2>
              </div>

              <form onSubmit={handlePredict} className="space-y-8">
                {/* Enhanced Location Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    Location
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter city name (e.g., Sydney, Australia)"
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 text-gray-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500"
                        required
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoDetectLocation}
                      disabled={isDetectingLocation}
                      className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      title="Auto-detect location from IP"
                    >
                      {isDetectingLocation ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span className="hidden sm:inline">Detecting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎯</span>
                          <span className="hidden sm:inline font-medium">
                            Auto-Detect
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Enhanced Number of Panels */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="text-lg">🔢</span>
                    Number of Panels
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      value={numPanels}
                      onChange={(e) =>
                        setNumPanels(parseInt(e.target.value) || 0)
                      }
                      min="1"
                      max="1000"
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 text-gray-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Enhanced Panel Rating */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    Panel Rating (Watts)
                  </label>
                  <div className="relative group">
                    <select
                      value={panelRatingW}
                      onChange={(e) =>
                        setPanelRatingW(parseInt(e.target.value))
                      }
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 text-gray-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer"
                    >
                      <option value="250">250W (Budget)</option>
                      <option value="300">300W (Standard)</option>
                      <option value="330">330W (Standard+)</option>
                      <option value="370">370W (Efficient)</option>
                      <option value="400">400W (High Efficiency)</option>
                      <option value="435">435W (Premium)</option>
                      <option value="500">500W (Commercial)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Enhanced Inverter Capacity */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="text-lg">🔌</span>
                    Inverter Capacity (kW)
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      value={inverterKw}
                      onChange={(e) =>
                        setInverterKw(parseFloat(e.target.value) || 0)
                      }
                      min="0.5"
                      max="100"
                      step="0.5"
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 text-gray-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Enhanced System Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <h3 className="font-bold text-blue-800 dark:text-blue-200">
                      System Overview
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-blue-800 dark:text-blue-200 font-semibold text-lg">
                      Total Capacity: {systemKwp.toFixed(2)} kWp
                    </p>
                    <p className="text-blue-600 dark:text-blue-300 text-sm">
                      {numPanels} panels × {panelRatingW}W ={" "}
                      {systemKwp.toFixed(2)} kWp
                    </p>
                  </div>
                </div>

                {/* Enhanced Prediction Type Tabs */}
                <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-2xl backdrop-blur-sm">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => setActiveTab("today")}
                      className={`flex-1 py-3 px-6 text-sm font-bold rounded-xl transition-all duration-300 ${
                        activeTab === "today"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105"
                          : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                      }`}
                    >
                      📅 Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("tomorrow")}
                      className={`flex-1 py-3 px-6 text-sm font-bold rounded-xl transition-all duration-300 ${
                        activeTab === "tomorrow"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105"
                          : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                      }`}
                    >
                      🌅 Tomorrow
                    </button>
                  </div>
                </div>

                {/* Enhanced Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-8 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-lg">
                        Calculating Predictions...
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      <span className="text-xl">⚡</span>
                      <span className="text-lg">Predict Solar Generation</span>
                    </span>
                  )}
                </button>

                {/* Enhanced Error Display */}
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 animate-shake">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">❌</span>
                      </div>
                      <p className="text-red-600 dark:text-red-400 font-medium">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Enhanced Results Panel */}
          <div className="group">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 transition-all duration-500 hover:shadow-3xl animate-slideUp delay-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📈</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Prediction Results
                </h2>
              </div>

              {!dailyPrediction && (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full flex items-center justify-center animate-pulse">
                      <svg
                        className="w-12 h-12 text-gray-400"
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
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full animate-ping"></div>
                  </div>
                  <p className="text-xl font-medium text-center">
                    Configure your solar system above
                  </p>
                  <p className="text-gray-500 mt-2 text-center">
                    Select Today or Tomorrow to get your prediction
                  </p>
                </div>
              )}

              {/* Enhanced Daily Prediction Results */}
              {dailyPrediction && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Enhanced Total Daily Generation */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 dark:from-amber-900/40 dark:via-orange-900/40 dark:to-yellow-900/40 rounded-3xl p-8 text-center border border-amber-200/50 dark:border-amber-700/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/10 to-orange-300/10 animate-pulse"></div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4 shadow-lg">
                        <span className="text-2xl">🌟</span>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-2">
                        Total Daily Generation
                      </p>
                      <p className="text-5xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                        {formatKwh(dailyPrediction.total_kwh)}
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                        {activeTab === "today" ? "📅 Today" : "🌅 Tomorrow"} •{" "}
                        {dailyPrediction.date}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Hourly Chart */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-3xl p-6 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📊</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        Hourly Generation Breakdown
                      </h3>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {dailyPrediction.hourly
                        .filter((h) => h.generation_kwh > 0.001)
                        .map((hour: HourlyPrediction, index) => {
                          const maxKwh = Math.max(
                            ...dailyPrediction.hourly.map(
                              (h) => h.generation_kwh,
                            ),
                          );
                          const percentage =
                            maxKwh > 0
                              ? (hour.generation_kwh / maxKwh) * 100
                              : 0;

                          return (
                            <div
                              key={hour.hour}
                              className="flex items-center gap-4 group animate-slideUp"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono w-16 flex-shrink-0">
                                {hour.hour.toString().padStart(2, "0")}:00
                              </span>
                              <div className="flex-1 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
                                  style={{
                                    width: `${percentage}%`,
                                    animationDelay: `${index * 100}ms`,
                                  }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300 w-24 text-right font-mono">
                                {hour.generation_kwh.toFixed(3)} kWh
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Enhanced Peak Hour */}
                  {dailyPrediction.hourly.length > 0 && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl p-6 border border-emerald-200/50 dark:border-emerald-700/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🏆</span>
                        </div>
                        <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                          Peak Generation Hour
                        </h3>
                      </div>
                      {(() => {
                        const peakHour = dailyPrediction.hourly.reduce(
                          (max, h) =>
                            h.generation_kwh > max.generation_kwh ? h : max,
                          dailyPrediction.hourly[0],
                        );
                        return (
                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                  {peakHour.hour.toString().padStart(2, "0")}:00
                                </p>
                                <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                                  Peak Hour
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                  {formatKwh(peakHour.generation_kwh)}
                                </p>
                                <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                                  Solar Elevation:{" "}
                                  {peakHour.solar_elevation.toFixed(1)}°
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="text-center mt-16 animate-fadeIn delay-1000">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">ℹ️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Important Information
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              ⚠️ Predictions are estimates based on weather forecasts and may
              vary from actual conditions
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Powered by OpenWeatherMap API • Built with Next.js & Machine
              Learning
            </p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #d97706, #dc2626);
        }
      `}</style>
    </div>
  );
}
