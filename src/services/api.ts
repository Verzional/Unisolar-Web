import type {
  PredictionResponse,
  DailyPredictionResponse,
  PredictRequest,
  DailyPredictRequest,
  GeocodeResponse,
  CurrentLocationResponse,
  WeatherResponse,
  ForecastResponse,
  HealthResponse,
  ApiError,
} from "@/types/solar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      const data = await response.json();

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }

  /* Health Check */
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health");
  }

  /* Geocoding */
  async geocode(location: string): Promise<GeocodeResponse> {
    const params = new URLSearchParams({ location });
    return this.request<GeocodeResponse>(`/geocode?${params}`);
  }

  /* Get Current Location using Browser Geolocation API */
  async getCurrentLocation(): Promise<CurrentLocationResponse> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 30000, 
        maximumAge: 60000, 
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            // Reverse Geocode to Get Location Details
            const geocodeResult = await this.reverseGeocode(lat, lon);
            resolve({
              lat,
              lon,
              city: geocodeResult.city,
              region: geocodeResult.region,
              country: geocodeResult.country,
              country_code: geocodeResult.country_code,
              accuracy: position.coords.accuracy,
            });
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            resolve({
              lat,
              lon,
              accuracy: position.coords.accuracy,
            });
          }
        },
        (error) => {
          if (error.code === error.TIMEOUT) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                  const geocodeResult = await this.reverseGeocode(lat, lon);
                  resolve({
                    lat,
                    lon,
                    city: geocodeResult.city,
                    region: geocodeResult.region,
                    country: geocodeResult.country,
                    country_code: geocodeResult.country_code,
                    accuracy: position.coords.accuracy,
                  });
                } catch {
                  resolve({
                    lat,
                    lon,
                    accuracy: position.coords.accuracy,
                  });
                }
              },
              (fallbackError) => {
                let errorMessage = "Could not get your location";
                switch (fallbackError.code) {
                  case fallbackError.PERMISSION_DENIED:
                    errorMessage = "Location permission denied. Please enable location access in your browser settings.";
                    break;
                  case fallbackError.POSITION_UNAVAILABLE:
                    errorMessage = "Location information unavailable. Please check your device settings.";
                    break;
                  case fallbackError.TIMEOUT:
                    errorMessage = "Location request timed out. Please try again or enter location manually.";
                    break;
                }
                reject(new Error(errorMessage));
              },
              {
                enableHighAccuracy: false, 
                timeout: 15000,
                maximumAge: 300000, 
              }
            );
            return;
          }

          let errorMessage = "Could not get your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable. Please check your device settings.";
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /* Reverse Geocoding */
  async reverseGeocode(lat: number, lon: number): Promise<{
    city?: string;
    region?: string;
    country?: string;
    country_code?: string;
  }> {
    return this.request(`/reverse-geocode?lat=${lat}&lon=${lon}`);
  }

  /* Current Weather */
  async getWeather(options: {
    lat?: number;
    lon?: number;
    location?: string;
  }): Promise<WeatherResponse> {
    const params = new URLSearchParams();

    if (options.lat !== undefined) {
      params.append("lat", options.lat.toString());
    }
    if (options.lon !== undefined) {
      params.append("lon", options.lon.toString());
    }
    if (options.location) {
      params.append("location", options.location);
    }

    return this.request<WeatherResponse>(`/weather?${params}`);
  }

  /* Weather Forecast */
  async getForecast(options: {
    lat?: number;
    lon?: number;
    location?: string;
  }): Promise<ForecastResponse> {
    const params = new URLSearchParams();

    if (options.lat !== undefined) {
      params.append("lat", options.lat.toString());
    }
    if (options.lon !== undefined) {
      params.append("lon", options.lon.toString());
    }
    if (options.location) {
      params.append("location", options.location);
    }

    return this.request<ForecastResponse>(`/forecast?${params}`);
  }

  /* Solar Generation Predictions */
  async predict(request: PredictRequest): Promise<PredictionResponse> {
    return this.request<PredictionResponse>("/predict", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /* Daily Solar Generation Predictions */
  async predictDaily(
    request: DailyPredictRequest
  ): Promise<DailyPredictionResponse> {
    return this.request<DailyPredictionResponse>("/predict/daily", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }
}

/* Export Singleton Instance */
export const api = new ApiService();

/* Export Class for Custom Instances */
export { ApiService };