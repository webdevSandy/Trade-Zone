# Tasks — 2-Day Plan Execution

## Backend Hardening
- [x] API rate limiting (`express-rate-limit`) — global 100/15min + admin 5/15min
- [x] Request logging (`morgan`) — dev mode colored logs
- [x] Global error handler middleware
- [x] Enhanced health check endpoint (uptime, memory, auth status)
- [x] Token status endpoint (`/api/upstox/token-info`)

## Frontend Polish
- [x] Loading skeletons for TopMovers and YourInvestment
- [x] Fix branding ("Groww" → "TradAdda") in Navbar + TopMovers
- [x] Dark mode toggle

## New Pages & Sub-routing
- [x] Stock Detail Page (`/stock/[symbol]`)
- [x] Holdings Page (`/holdings`)
- [x] Positions Page (`/positions`)
- [x] Orders Page (`/orders`)
- [x] Watchlist Page (`/watchlist`)

## User Authentication & Setup
- [x] Prisma schema update (optional `pancard`)
- [x] Backend register, login, profile me, and PAN verification endpoints
- [x] Frontend Auth Context with JWT local session sync
- [x] Modal popup supporting custom inputs, validations, and Groww aesthetic
- [x] Dashboard alerts prompting optional PAN card verification

## Dynamic Investments & Simulated Trading
- [x] Backend GET /holdings and GET /summary endpoints with live price mapping
- [x] Backend POST /order atomic transaction logic supporting delivery (CNC) and intraday (MIS) trades
- [x] Client YourInvestment panel connected to live WebSocket quotes for real-time returns recalculation
- [x] Client order placement connected to POST /order API with error checking and login modals

## Branding Assets
- [x] Set logo.png as the brand logo in the Navbar
- [x] Set logo.png as the favicon.ico and icon.png of the application

## Interactive Charts Extensions
- [x] Add timeline (X-axis labels) to the bottom of the chart
- [x] Add dynamic toggle selectors for Line, Candle, and Bar chart representations
- [x] Add candlestick interval dropdown menu (30s, 1m, 2m, 5m, 10m, 15m, 30m) linked to responsive mock data generation
