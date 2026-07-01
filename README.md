# TradAdda — Stock Trading Platform

A modern, responsive stock trading dashboard built with **Next.js 14**, **Express.js**, **PostgreSQL**, and **Tailwind CSS**.

![TradAdda](https://img.shields.io/badge/TradAdda-Stock%20Trading-00B386?style=for-the-badge)

## 🏗️ Architecture

```
tradadda/
├── client/              # Next.js 14 (App Router, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/         # Pages & layouts
│   │   ├── components/  # Reusable UI components
│   │   └── lib/         # Types, mock data, utilities
│   └── ...
│
├── server/              # Express.js API (TypeScript, Prisma ORM)
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   └── types/       # Shared TypeScript types
│   └── ...
└── ...
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### Frontend (Client)
```bash
cd client
npm install
npm run dev        # → http://localhost:3000
```

### Backend (Server)
```bash
cd server
npm install
cp .env.example .env   # Configure DATABASE_URL
npx prisma generate
npx prisma migrate dev
npm run dev             # → http://localhost:8000
```

## 🎯 Features

- **Market Indices Ticker** — Live NIFTY, SENSEX, BANKNIFTY prices
- **Top Movers** — Gainers, Losers, Volume Shockers with ApexCharts sparklines
- **Portfolio Dashboard** — Investment metrics + donut chart
- **Products & Tools** — IPO, Bonds, ETFs quick links
- **Full REST API** — Users, Wallet, Orders, Holdings, Positions, Watchlists

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Charts | ApexCharts (react-apexcharts) |
| Icons | Lucide React |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | bcryptjs (password hashing) |

## 📊 Database Models

- **User** — Registration with PAN card verification
- **Wallet** — Balance management with transactions
- **Order** — BUY/SELL with PENDING/EXECUTED/CANCELLED status
- **Holding** — Portfolio holdings with average buy price
- **Position** — Intraday/delivery positions
- **Watchlist** — Custom watchlists with stock symbols

## 🔀 Branching Strategy

```
main
├── feature/db-schema
├── feature/frontend-dashboard
├── feature/api-routes
└── feature/charts
```

Always create feature branches and merge via Pull Requests.

## 📄 License

MIT
