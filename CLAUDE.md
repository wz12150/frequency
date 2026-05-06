# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**10频管分析系统** (Frequency Management Analysis Platform) - A React + TypeScript application for managing and analyzing frequency/station data in China.

## Development Commands

```bash
# Frontend development (port 84)
cd frontend && pnpm install && pnpm dev

# Frontend production build
cd frontend && pnpm build

# Backend is Java (Spring Boot) - notify user to restart after changes
# MySQL 8.0 password: a719721
```

## Architecture

### Frontend (frontend/)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix UI components)
- **Charts**: Recharts
- **Maps**: Leaflet + react-leaflet + d3-geo
- **UI Library**: MUI (Material UI)

### Pages (frontend/src/app/components/)
- `Dashboard.tsx` - Main overview
- `StationMap.tsx` - Geographic station visualization
- `FrequencyPlanning.tsx` - Frequency planning
- `StationStats.tsx` - Station statistics
- `LicenseAnalysis.tsx` - License analysis
- `DataManagement.tsx` - Data management
- `SystemManagement.tsx` - System settings

### Backend (backend/)
- Java Spring Boot project (currently empty/not yet created)
- Connects via API proxies configured in nginx.conf

## Infrastructure

**Nginx ports**:
- Port 80: Root SPA (html directory)
- Port 81: Built dist (html/dist)
- Port 84: Dev server (html/zisu)

**API routing**: All `/api/` requests proxy to Java backend on ports 8080/8081/8084

## Important Rules (from AGENTS.md)

1. Always communicate in Chinese
2. Database is MySQL 8.0 with password `a719721`
3. SQL statements are written directly (not as batch files)
4. All `.md` files go in `md/` folder, `.sql` files in `sql/` folder
5. Do not use `&&` in PowerShell commands
6. Frontend UI is pre-designed - do not redesign or delete
7. After modifying Java code, notify user to restart backend
8. Do not use git unless explicitly instructed