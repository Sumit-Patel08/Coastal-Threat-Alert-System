export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  coord: {
    lat: number;
    lon: number;
  };
}

export interface WeatherFetchOptions {
  /** Bypass the 30-minute cache and hit the API again. */
  forceRefresh?: boolean;
}

interface CachedWeatherEntry {
  data: WeatherData;
  fetchedAt: number;
}

export class WeatherAPI {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "demo_key";
  private static readonly BASE_URL = "https://api.openweathermap.org/data/2.5";
  /** Weather responses are reused for 30 minutes unless forceRefresh is set. */
  static readonly CACHE_TTL_MS = 30 * 60 * 1000;
  private static readonly CACHE_PREFIX = "cta_weather_cache_v1_";

  static async getCurrentWeather(
    city: string,
    options: WeatherFetchOptions = {},
  ): Promise<WeatherData> {
    const cacheKey = this.cityCacheKey(city);

    if (!options.forceRefresh) {
      const cached = this.readCache(cacheKey);
      if (cached) return cached.data;
    }

    try {
      if (this.API_KEY === "demo_key" || this.API_KEY === "your_openweather_api_key_here") {
        console.warn(`No valid OpenWeatherMap API key found. Using mock data for ${city}.`);
        const mock = this.getMockWeatherData(city);
        this.writeCache(cacheKey, mock);
        return mock;
      }

      const response = await fetch(
        `${this.BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${this.API_KEY}&units=metric`,
      );

      if (!response.ok) {
        console.warn(`Weather API error ${response.status} for ${city}. Using mock data.`);
        const mock = this.getMockWeatherData(city);
        this.writeCache(cacheKey, mock);
        return mock;
      }

      const data = (await response.json()) as WeatherData;
      this.writeCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching weather data for ${city}:`, error);

      const stale = this.readCache(cacheKey, true);
      if (stale) return stale.data;

      const mock = this.getMockWeatherData(city);
      this.writeCache(cacheKey, mock);
      return mock;
    }
  }

  static getCachedWeather(city: string): { data: WeatherData; fetchedAt: number } | null {
    return this.readCache(this.cityCacheKey(city), true);
  }

  static getCacheAgeMs(city: string): number | null {
    const cached = this.readCache(this.cityCacheKey(city), true);
    if (!cached) return null;
    return Date.now() - cached.fetchedAt;
  }

  static isCacheFresh(city: string): boolean {
    return this.readCache(this.cityCacheKey(city)) !== null;
  }

  private static cityCacheKey(city: string): string {
    return `${this.CACHE_PREFIX}${city.trim().toLowerCase()}`;
  }

  private static readCache(
    key: string,
    allowStale = false,
  ): CachedWeatherEntry | null {
    if (typeof window === "undefined") return null;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;

      const entry = JSON.parse(raw) as CachedWeatherEntry;
      if (!entry?.data || typeof entry.fetchedAt !== "number") return null;

      const age = Date.now() - entry.fetchedAt;
      if (!allowStale && age > this.CACHE_TTL_MS) return null;

      return entry;
    } catch {
      return null;
    }
  }

  private static writeCache(key: string, data: WeatherData): void {
    if (typeof window === "undefined") return;

    try {
      const entry: CachedWeatherEntry = { data, fetchedAt: Date.now() };
      window.localStorage.setItem(key, JSON.stringify(entry));
    } catch {
      // Ignore quota / private-mode storage errors.
    }
  }

  private static getMockWeatherData(city: string): WeatherData {
    const mockData: { [key: string]: Partial<WeatherData> } = {
      Mumbai: {
        name: "Mumbai",
        main: { temp: 28, feels_like: 32, temp_min: 26, temp_max: 30, pressure: 1013, humidity: 78 },
        weather: [{ id: 801, main: "Clouds", description: "few clouds", icon: "02d" }],
        wind: { speed: 3.5, deg: 240 },
        clouds: { all: 20 },
        visibility: 8000,
        sys: { country: "IN", sunrise: 1694745600, sunset: 1694789200 },
        coord: { lat: 19.076, lon: 72.8777 },
      },
      Chennai: {
        name: "Chennai",
        main: { temp: 32, feels_like: 36, temp_min: 30, temp_max: 34, pressure: 1010, humidity: 65 },
        weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
        wind: { speed: 4.2, deg: 180 },
        clouds: { all: 5 },
        visibility: 10000,
        sys: { country: "IN", sunrise: 1694745800, sunset: 1694789000 },
        coord: { lat: 13.0827, lon: 80.2707 },
      },
      Kochi: {
        name: "Kochi",
        main: { temp: 29, feels_like: 33, temp_min: 27, temp_max: 31, pressure: 1012, humidity: 82 },
        weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }],
        wind: { speed: 2.8, deg: 200 },
        clouds: { all: 75 },
        visibility: 6000,
        sys: { country: "IN", sunrise: 1694746200, sunset: 1694789400 },
        coord: { lat: 9.9312, lon: 76.2673 },
      },
      Kolkata: {
        name: "Kolkata",
        main: { temp: 31, feels_like: 35, temp_min: 29, temp_max: 33, pressure: 1008, humidity: 70 },
        weather: [{ id: 802, main: "Clouds", description: "scattered clouds", icon: "03d" }],
        wind: { speed: 3.1, deg: 160 },
        clouds: { all: 40 },
        visibility: 9000,
        sys: { country: "IN", sunrise: 1694745400, sunset: 1694788800 },
        coord: { lat: 22.5726, lon: 88.3639 },
      },
      Visakhapatnam: {
        name: "Visakhapatnam",
        main: { temp: 30, feels_like: 34, temp_min: 28, temp_max: 32, pressure: 1011, humidity: 75 },
        weather: [{ id: 803, main: "Clouds", description: "broken clouds", icon: "04d" }],
        wind: { speed: 3.8, deg: 150 },
        clouds: { all: 60 },
        visibility: 8500,
        sys: { country: "IN", sunrise: 1694745500, sunset: 1694788900 },
        coord: { lat: 17.6868, lon: 83.2185 },
      },
    };

    const cityData = mockData[city] || mockData.Mumbai;
    return cityData as WeatherData;
  }

  static async getWeatherByCoords(
    lat: number,
    lon: number,
    options: WeatherFetchOptions = {},
  ): Promise<WeatherData> {
    const cacheKey = `${this.CACHE_PREFIX}coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;

    if (!options.forceRefresh) {
      const cached = this.readCache(cacheKey);
      if (cached) return cached.data;
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`,
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = (await response.json()) as WeatherData;
      this.writeCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching weather data by coordinates:", error);
      const stale = this.readCache(cacheKey, true);
      if (stale) return stale.data;
      throw error;
    }
  }

  static getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  static kelvinToCelsius(kelvin: number): number {
    return Math.round(kelvin - 273.15);
  }

  static formatTemperature(temp: number): string {
    return `${Math.round(temp)}°C`;
  }

  static formatLastUpdated(fetchedAt: number): string {
    return new Date(fetchedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
