package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestTimeHandler_Success(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/time", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(timeHandler)

	before := time.Now().UTC()
	handler.ServeHTTP(rr, req)
	after := time.Now().UTC()

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check content type
	if contentType := rr.Header().Get("Content-Type"); contentType != "application/json" {
		t.Errorf("handler returned wrong content type: got %v want %v",
			contentType, "application/json")
	}

	// Parse response
	var response map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to parse JSON response: %v", err)
	}

	// Verify response structure
	if _, ok := response["time"]; !ok {
		t.Error("response missing 'time' field")
	}
	if _, ok := response["timestamp"]; !ok {
		t.Error("response missing 'timestamp' field")
	}

	// Verify time format (RFC3339)
	timeStr, ok := response["time"].(string)
	if !ok {
		t.Fatal("'time' field is not a string")
	}
	parsedTime, err := time.Parse(time.RFC3339, timeStr)
	if err != nil {
		t.Errorf("'time' field is not valid RFC3339: %v", err)
	}

	// Verify timestamp is reasonable (between before and after)
	timestamp, ok := response["timestamp"].(float64) // JSON numbers are float64
	if !ok {
		t.Fatal("'timestamp' field is not a number")
	}
	timestampInt := int64(timestamp)
	if timestampInt < before.Unix()-1 || timestampInt > after.Unix()+1 {
		t.Errorf("timestamp %d not between %d and %d", timestampInt, before.Unix(), after.Unix())
	}

	// Verify time and timestamp represent the same moment
	if parsedTime.Unix() != timestampInt {
		t.Errorf("time and timestamp mismatch: %d vs %d", parsedTime.Unix(), timestampInt)
	}
}

func TestTimeHandler_MethodNotAllowed(t *testing.T) {
	methods := []string{http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodPatch}

	for _, method := range methods {
		t.Run(method, func(t *testing.T) {
			req, err := http.NewRequest(method, "/time", nil)
			if err != nil {
				t.Fatal(err)
			}

			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(timeHandler)
			handler.ServeHTTP(rr, req)

			if status := rr.Code; status != http.StatusMethodNotAllowed {
				t.Errorf("handler returned wrong status code for %s: got %v want %v",
					method, status, http.StatusMethodNotAllowed)
			}
		})
	}
}

func TestTimeHandler_ReturnsUTC(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/time", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(timeHandler)
	handler.ServeHTTP(rr, req)

	var response map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to parse JSON response: %v", err)
	}

	timeStr := response["time"].(string)
	parsedTime, err := time.Parse(time.RFC3339, timeStr)
	if err != nil {
		t.Fatal(err)
	}

	// Verify the time is in UTC by checking the location
	if parsedTime.Location() != time.UTC {
		t.Errorf("expected UTC time, got %v", parsedTime.Location())
	}
}
