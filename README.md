Here's the updated `README.md` with details about the scoring algorithm formula:

---

# GitHub Scoring Algorithm

## Overview

This project is a backend service that fetches GitHub repositories based on specified filters and ranks them using a scoring algorithm. It includes caching, rate limiting, structured logging, and robust error handling.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (Latest LTS recommended)
- **Redis** (Required for caching and rate limiting)
- **Docker** (Optional, if running via container)

---

## 🛠 Installation

### Clone the repository:
```sh
git clone https://github.com/Saad9768/github_scoring_algorithm.git
cd github_scoring_algorithm
```

### Install dependencies:
```sh
npm install
```

### Start Redis (Required)
Ensure Redis is running before starting the service:
```sh
docker run -d -p 6379:6379 redis
```

---

## ▶ Running Locally

### Start the Application:
```sh
npm run start:dev
```

### Running Tests
- **Unit Tests:**
  ```sh
  npm test
  ```
- **End-to-End (E2E) Tests:**
  ```sh
  npm run test:e2e
  ```

---

## 📦 Build & Deployment

### Create a Build:
```sh
npm run build
```

### Start the Built Application:
- **Development Mode:**
  ```sh
  npm run start:build:dev
  ```
- **Production Mode:**
  ```sh
  npm run start:build:prod
  ```

---

## 🐳 Running with Docker

To build and run the application using Docker (Redis is still required):
```sh
docker build -t github_scoring_algorithm .
docker run -p 3000:3000 github_scoring_algorithm
```

---

## 🏆 Scoring Algorithm

The scoring algorithm is implemented as a separate module and ranks repositories based on:
- **Stars** ⭐ (Higher weight)
- **Forks** 🍴
- **Recency** 📆 (Last updated)

### 📊 Scoring Formula

The repository score is calculated using the following formula:

```typescript
function calculateScore(stars: number, forks: number, updatedAt: Date): number {
  const updatedAtDate = new Date(updatedAt);
  const recencyDays = Math.floor((Date.now() - updatedAtDate.getTime()) / (1000 * 60 * 60 * 24));

  const starWeight = 0.5;  // Stars contribute the most to the score
  const forkWeight = 0.3;  // Forks have a moderate impact
  const recencyWeight = 0.25; // Newer repos score higher

  // Reduce score for older repositories, giving priority to more recent updates
  const recencyFactor = Math.max(0, 100 - recencyDays) * recencyWeight;

  return (stars * starWeight) + (forks * forkWeight) + recencyFactor;
}
```

### 🔢 Breakdown of the Formula:

- **Stars Weight (0.5)** → Stars have the highest influence on the ranking.
- **Forks Weight (0.3)** → Forks have a moderate influence.
- **Recency Weight (0.25)** → More recently updated repositories receive a higher score.
- **Recency Factor** → Older repositories lose points. If the repository was updated more than 100 days ago, its recency factor is `0`.

For example:
- A repo with **200 stars, 50 forks, last updated 10 days ago** would have:
  ```math
  (200 × 0.5) + (50 × 0.3) + ((100 - 10) × 0.25) = 100 + 15 + 22.5 = 137.5
  ```
- A repo with **50 stars, 20 forks, last updated 200 days ago** would have:
  ```math
  (50 × 0.5) + (20 × 0.3) + (0 × 0.25) = 25 + 6 + 0 = 31
  ```
  Since it was updated **more than 100 days ago**, it receives no recency points.

---

## ⚙ Features
- ✅ **Caching** (via Redis)
- ✅ **Rate Limiting** (to prevent excessive GitHub API requests)
- ✅ **Logging Interceptor** (`logging.interceptor.ts`)
- ✅ **Global Error Handling** (`unhandled-exception.filter.ts`)
- ✅ **Modular Design** (`app.module.ts`)

---

## 🔮 Future Enhancements
- 🔹 Configurable Redis-based rate limiter.

---

## 📌 Example API Request

```http
GET http://localhost:3000/repos?language=javascript&date=2024-01-02&sort=stars&order=desc
```