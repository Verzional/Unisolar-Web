// Location Types
export interface Location {
  lat: number;
  lon: number;
  name?: string;
  country?: string;
}

// Weather Types
export interface Weather {
  air_temperature: number;
  relative_humidity: number;
  wind_speed: number;
  wind_direction: number;
  dew_point?: number;
  description?: string;
  clouds?: number;
}

export interface WeatherForecast extends Weather {
  timestamp: string;
}

// System Configuration Types
export interface SystemConfig {
  num_panels: number;
  panel_rating_w: number;
  inverter_kw: number;
  kwp?: number;
}

// Prediction Types
export interface PredictionFeatures {
  AirTemperature: number;
  RelativeHumidity: number;
  WindSpeed: number;
  WindDirection: number;
  kWp: number;
  NumberOfPanels: number;
  TotalInverterKW: number;
  Hour: number;
  Month: number;
  DayOfYear: number;
  HourSin: number;
  HourCos: number;
  MonthSin: number;
  MonthCos: number;
  Season: number;
  SolarElevation: number;
  TempDeviation: number;
  TempDewSpread: number;
  HumidityTemp: number;
  WindCoolingEffect: number;
  AvgPanelKW: number;
  InverterPanelRatio: number;
}

export interface PredictionResult {
  generation_kwh: number;
  method: "ml_model" | "simple_estimation";
  timestamp: string;
}

export interface PredictionResponse {
  prediction: PredictionResult;
  system: SystemConfig;
  weather: Weather;
  location: Location;
  features: PredictionFeatures;
}

// Hourly Prediction Types
export interface HourlyPrediction {
  hour: number;
  generation_kwh: number;
  solar_elevation: number;
}

export interface DailyPredictionResponse {
  date: string;
  hourly: HourlyPrediction[];
  total_kwh: number;
  system: SystemConfig;
  location: Location;
}

// API Request Types
export interface PredictRequest {
  lat?: number;
  lon?: number;
  location?: string;
  num_panels?: number;
  panel_rating_w?: number;
  inverter_kw?: number;
  kwp?: number;
  weather?: Weather;
  timestamp?: string;
}

export interface DailyPredictRequest {
  lat?: number;
  lon?: number;
  location?: string;
  num_panels?: number;
  panel_rating_w?: number;
  inverter_kw?: number;
  kwp?: number;
  date?: string;
}

// API Response Types
export type GeocodeResponse = Location

export interface CurrentLocationResponse {
  lat: number;
  lon: number;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  timezone?: string;
  accuracy?: number; // Accuracy in meters (from browser geolocation)
}

export interface WeatherResponse {
  weather: Weather;
  location: Location;
}

export interface ForecastResponse {
  forecasts: WeatherForecast[];
  location: Location;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  openweather_configured: boolean;
}

// Error Type
export interface ApiError {
  error: string;
  hint?: string;
}

// Form State Type 
export interface SolarFormState {
  location: string;
  numPanels: number;
  panelRatingW: number;
  inverterKw: number;
  isLoading: boolean;
  error: string | null;
}
