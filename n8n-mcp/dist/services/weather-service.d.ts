/**
 * Structured weather data interface for consistent data representation.
 */
export interface WeatherData {
    location: string;
    temperature: number;
    feelsLike: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
}
/**
 * Service class for interacting with the OpenWeather API.
 *
 * Provides methods to fetch current weather conditions for cities worldwide.
 * Handles API authentication, request construction, response validation,
 * and data transformation. Includes proper error handling for missing API keys
 * and network issues.
 */
export declare class WeatherService {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly units;
    constructor();
    /**
     * Fetches current weather data for a specified city.
     *
     * @param city - Name of the city to get weather for
     * @returns Promise resolving to structured weather data
     * @throws Error if API key is not configured or if API request fails
     */
    getWeatherByCity(city: string): Promise<WeatherData>;
    /**
     * Transforms raw OpenWeather API response into structured WeatherData format.
     *
     * @param data - Validated OpenWeather API response
     * @returns Structured weather data with consistent field names
     */
    private transformWeatherData;
}
