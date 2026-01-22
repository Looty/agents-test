package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

var (
	redisClient *redis.Client
	apiKey      string
)

func main() {
	apiKey = os.Getenv("WEATHER_API_KEY")
	if apiKey == "" {
		log.Fatal("WEATHER_API_KEY environment variable not set")
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	redisClient = redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	http.HandleFunc("/weather", weatherHandler)
	http.HandleFunc("/search", searchHandler)
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/time", timeHandler)
	log.Println("Backend server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("could not start server: %s\n", err)
	}
}

func weatherHandler(w http.ResponseWriter, r *http.Request) {
	location := r.URL.Query().Get("location")
	if location == "" {
		http.Error(w, "location parameter is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Check cache first
	cachedData, err := redisClient.Get(ctx, location).Result()
	if err == nil {
		log.Printf("Cache hit for %s", location)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cachedData))
		return
	}

	if err != redis.Nil {
		log.Printf("Redis error: %s", err)
	}

	log.Printf("Cache miss for %s", location)

	// Fetch from WeatherAPI.com
	weatherAPIURL := fmt.Sprintf("http://api.weatherapi.com/v1/forecast.json?key=%s&q=%s&days=5", apiKey, location)
	resp, err := http.Get(weatherAPIURL)
	if err != nil {
		http.Error(w, "Failed to fetch weather data", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Failed to get weather data from provider", resp.StatusCode)
		return
	}

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read weather data", http.StatusInternalServerError)
		return
	}

	// Cache the response
	err = redisClient.Set(ctx, location, body, 15*time.Minute).Err()
	if err != nil {
		log.Printf("Failed to cache data: %s", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		http.Error(w, "q parameter is required", http.StatusBadRequest)
		return
	}

	// Simple cache key prefixed to avoid collisions with weather cache
	cacheKey := "search:" + q
	ctx := context.Background()

	if cached, err := redisClient.Get(ctx, cacheKey).Result(); err == nil {
		log.Printf("Search cache hit for %s", q)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cached))
		return
	}

	// cache miss; continue to fetch from provider

	escaped := url.QueryEscape(q)
	searchURL := fmt.Sprintf("http://api.weatherapi.com/v1/search.json?key=%s&q=%s", apiKey, escaped)
	resp, err := http.Get(searchURL)
	if err != nil {
		http.Error(w, "Failed to fetch search data", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Failed to get search data from provider", resp.StatusCode)
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read search data", http.StatusInternalServerError)
		return
	}

	if err := redisClient.Set(ctx, cacheKey, body, 15*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache search data: %s", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	// Check Redis connectivity
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Printf("Health check failed: Redis unhealthy: %s", err)
		w.WriteHeader(http.StatusServiceUnavailable)
		w.Write([]byte(`{"status":"unhealthy","redis":"down"}`))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"healthy","redis":"up"}`))
}

func timeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	currentTime := time.Now().UTC()
	response := map[string]interface{}{
		"time":      currentTime.Format(time.RFC3339),
		"timestamp": currentTime.Unix(),
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding time response: %s", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}
