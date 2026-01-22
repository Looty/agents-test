# Architecture Notes

**Owner:** TL

This document outlines the architecture for the Weather Information Application, as detailed in the [feature request](../user-stories/weather-app-fr.md).

## High-Level Architecture

The system is composed of three main components:
1.  **Frontend:** A Next.js application responsible for the user interface and user experience.
2.  **Backend Proxy:** A Go service that acts as an intermediary between the frontend and the external WeatherAPI.com service.
3.  **Caching Layer:** A Redis instance used to cache responses from WeatherAPI.com to improve performance and reduce rate-limiting issues.

### Diagram

```mermaid
graph TD
    A[User] --> B{Frontend (Next.js)};
    B --> C{Backend Proxy (Go)};
    C --> D{Caching (Redis)};
    C --> E[WeatherAPI.com];
    D -- Cache Hit --> B;
    E -- Weather Data --> C;
```

## Component Responsibilities

### Frontend (Next.js)

-   **Responsibilities:**
    -   Render the user interface.
    -   Handle user input (search, unit toggle).
    -   Display weather data, forecasts, and dynamic themes.
    -   Make API calls to the Backend Proxy.
    -   Manage client-side state.
-   **Interfaces:**
    -   Communicates with the Backend Proxy via a RESTful API over HTTPS.

### Backend Proxy (Go)

-   **Responsibilities:**
    -   Provide a secure endpoint for the frontend to fetch weather data.
    -   Store and manage the `WeatherAPI.com` API key securely.
    -   Forward requests to `WeatherAPI.com`.
    -   Cache responses from `WeatherAPI.com` in Redis.
    -   Handle rate limiting and error responses from the external API.
-   **Interfaces:**
    -   Exposes a RESTful API for the frontend.
    -   Connects to Redis for caching.
    -   Makes outbound HTTPS requests to `WeatherAPI.com`.

### Caching (Redis)

-   **Responsibilities:**
    -   Store weather data for a defined TTL (15 minutes).
    -   Reduce latency for frequently requested locations.
    -   Help mitigate rate-limiting from the external API.
-   **Interfaces:**
    -   Accessed by the Backend Proxy.

## Data Flow

1.  The user's browser loads the Next.js frontend application.
2.  The frontend requests weather data from the Backend Proxy, including the desired location.
3.  The Backend Proxy first checks Redis for a cached response for that location.
4.  **Cache Hit:** If a valid, non-expired entry exists in Redis, it is returned to the frontend.
5.  **Cache Miss:** If no valid entry is found, the Backend Proxy makes a request to `WeatherAPI.com` using its stored API key.
6.  The response from `WeatherAPI.com` is stored in Redis with a 15-minute TTL.
7.  The response is then forwarded to the frontend.
8.  The frontend renders the weather information.

## Scaling, Reliability, and Security

-   **Scaling:**
    -   The frontend and backend services will be deployed on AWS App Runner or ECS, allowing for autoscaling based on traffic.
    -   Redis can be scaled as needed.
-   **Reliability:**
    -   The caching layer improves resilience by reducing dependency on the external API's availability.
    -   If `WeatherAPI.com` is down, the system can potentially serve stale data from the cache for a short period.
-   **Security:**
    -   The `WeatherAPI.com` API key is kept secret on the backend and is not exposed to the client.
    -   All communication between the frontend and backend should be over HTTPS.

## Constraints, Assumptions, and Trade-offs

-   **Constraint:** We must use `WeatherAPI.com` as the data source.
-   **Assumption:** The 15-minute caching TTL is a good balance between data freshness and performance.
-   **Trade-off:** Using a backend proxy adds a small amount of latency but significantly improves security and resilience.

When making decisions, update `docs/technology-stack/README.md` and add governance rules to `docs/general-instructions/`.
