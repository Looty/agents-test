# QA Strategy: Weather App

**Owner:** QA

## Testing Pyramid

Our testing strategy follows the standard testing pyramid:

1. **Unit Tests (70%)**: Test individual components and functions in isolation
2. **Integration Tests (20%)**: Test component interactions and API integration
3. **E2E Tests (10%)**: Test critical user flows end-to-end

## Technology Stack

- **Unit & Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **Coverage**: Vitest coverage (target: 80% line coverage)
- **Accessibility**: jest-axe for automated a11y checks

## Unit Testing Strategy

### Components to Test
- `SearchBar`: Input behavior, debouncing, suggestion rendering, keyboard navigation
- `UnitToggle`: Toggle state, localStorage persistence, callback invocation
- `CurrentWeather`: Data rendering, unit conversion display
- `Forecast`: Day rendering, precipitation display, date formatting

### Test Patterns
- Render components with realistic mock data
- Test user interactions (click, type, keyboard)
- Verify accessibility (ARIA labels, roles, keyboard focus)
- Test edge cases (empty data, loading states, errors)

## Integration Testing Strategy

- Test the main page with mocked fetch
- Verify data flow from search → API call → display
- Test unit toggle affecting displayed values
- Test error handling and loading states

## E2E Testing Strategy

### Critical User Flows
1. **Search and View Weather**
   - User enters city name
   - Selects from autocomplete
   - Sees current weather and forecast
2. **Unit Toggle**
   - Toggle between metric/imperial
   - Verify values update
   - Refresh page and verify persistence

### Test Environment
- Run against local dev server (localhost:3000)
- Mock backend API responses for reliability
- Seed consistent test data

## CI/CD Gating

### PR Requirements
- All unit tests pass
- Coverage >= 80% (with exclusions for generated files)
- No accessibility violations in tested components
- Linter passes

### Staging Requirements
- All integration tests pass
- E2E smoke tests pass

## Coverage Targets

- **Overall**: 80% line coverage
- **Components**: 90% coverage (excluding pure presentational)
- **Critical flows**: 100% coverage (search, data display)

## Running Tests

```bash
# Unit & Integration
npm test                  # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # With coverage

# E2E
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Interactive UI

# All
npm run test:all         # Run all test suites
```

## Test Data Management

- Mock weather API responses in `__mocks__` directory
- Use realistic data from WeatherAPI.com schema
- Test data should cover various weather conditions

## Flaky Test Prevention

- Avoid time-based assertions without proper waits
- Use `waitFor` for async updates
- Mock all external dependencies
- Use deterministic test data
