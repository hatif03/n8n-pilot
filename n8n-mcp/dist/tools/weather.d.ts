import { z } from "zod";
/**
 * Zod schema for weather tool parameters.
 * Validates that the city parameter is a non-empty string.
 */
declare const weatherToolParams: z.ZodObject<{
    city: z.ZodString;
}, z.core.$strip>;
type WeatherToolParams = z.infer<typeof weatherToolParams>;
/**
 * Weather tool for MCP (Model Context Protocol) server.
 *
 * This tool provides current weather conditions for any specified city using
 * the OpenWeather API. It returns formatted weather data including temperature,
 * conditions, humidity, and wind speed. Includes comprehensive error handling
 * for API key issues and network problems.
 */
export declare const weatherTool: {
    readonly name: "GET_WEATHER";
    readonly description: "Get the current weather conditions for a specified city";
    readonly parameters: z.ZodObject<{
        city: z.ZodString;
    }, z.core.$strip>;
    readonly execute: (params: WeatherToolParams) => Promise<string>;
};
export {};
