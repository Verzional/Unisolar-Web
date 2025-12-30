export function formatKwh(kwh: number): string {
  if (kwh >= 1000) {
    return `${(kwh / 1000).toFixed(2)} MWh`;
  }
  return `${kwh.toFixed(3)} kWh`;
}

export function formatTemperature(celsius: number): string {
  return `${celsius.toFixed(1)}°C`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function formatWindSpeed(ms: number): string {
  return `${ms.toFixed(1)} m/s`;
}

export function getWeatherEmoji(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes("clear")) return "☀️";
  if (desc.includes("cloud")) return "☁️";
  if (desc.includes("rain")) return "🌧️";
  if (desc.includes("thunder")) return "⛈️";
  if (desc.includes("snow")) return "🌨️";
  if (desc.includes("mist") || desc.includes("fog")) return "🌫️";
  return "🌤️";
}
