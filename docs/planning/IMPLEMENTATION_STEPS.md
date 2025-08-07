# RentalEasy 実装手順書

## 🚀 Step 1: モノレポ初期化とプロジェクト移行

### 1.1 新しいモノレポプロジェクト作成
```bash
# プロジェクトルートの1つ上で実行
mkdir rental-booking-monorepo
cd rental-booking-monorepo

# pnpmインストール（未インストールの場合）
npm install -g pnpm

# Turborepo初期化
pnpm init
pnpm add -D turbo
```

### 1.2 ディレクトリ構造作成
```bash
# 基本ディレクトリ作成
mkdir -p apps/web apps/api packages/shared packages/database infrastructure/cdk

# pnpmワークスペース設定
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'packages/*'
  - 'infrastructure/*'
EOF
```

### 1.3 既存プロジェクトの移行
```bash
# 既存のReactアプリをwebに移動
cp -r ../rental-booking-app/* apps/web/
cd apps/web
rm -rf node_modules package-lock.json

# TypeScript設定追加
pnpm add -D typescript @types/react @types/react-dom @types/node
```

### 1.4 Turbo設定
```json
// turbo.json (プロジェクトルート)
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "outputs": []
    }
  }
}
```

## 🔧 Step 2: 共通パッケージ作成

### 2.1 Sharedパッケージ（型定義）
```bash
cd packages/shared
pnpm init
```

```json
// packages/shared/package.json
{
  "name": "@rental-booking/shared",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  }
}
```

```typescript
// packages/shared/src/types/vehicle.ts
export interface VehicleSpecifications {
  seats?: number;
  doors?: number;
  transmission: 'AT' | 'MT';
  fuelType: 'ガソリン' | 'ハイブリッド' | 'EV';
  engineSize?: string;
}

export interface InsuranceOption {
  basic: number;
  premium?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'car' | 'bike';
  category: string;
  pricePerDay: number;
  specifications: VehicleSpecifications;
  insurance: InsuranceOption;
  available: boolean;
  image?: string;
}
```

```typescript
// packages/shared/src/types/reservation.ts
export interface CustomerInfo {
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  address: {
    zipCode: string;
    prefecture: string;
    city: string;
    street: string;
  };
}

export interface Reservation {
  id: string;
  vehicleId: string;
  memberId?: string;
  customerInfo: CustomerInfo;
  startDate: string;
  endDate: string;
  includeInsurance: boolean;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

### 2.2 Database パッケージ（Prisma）
```bash
cd packages/database
pnpm init
pnpm add @prisma/client
pnpm add -D prisma @types/node
```

```typescript
// packages/database/src/client.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
```

## 🌐 Step 3: Hono APIアプリケーション

### 3.1 APIプロジェクト初期化
```bash
cd apps/api
pnpm init
pnpm add hono @hono/node-server
pnpm add -D @types/node tsx nodemon @types/aws-lambda
pnpm add @rental-booking/shared @rental-booking/database
```

### 3.2 Hono基本構成
```typescript
// apps/api/src/app.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { vehicleRoutes } from './routes/vehicles';
import { reservationRoutes } from './routes/reservations';

const app = new Hono();

// ミドルウェア
app.use('*', cors());
app.use('*', logger());

// ヘルスチェック
app.get('/health', (c) => c.json({ status: 'ok' }));

// ルート
app.route('/api/vehicles', vehicleRoutes);
app.route('/api/reservations', reservationRoutes);

// エラーハンドリング
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
```

### 3.3 ローカル開発サーバー
```typescript
// apps/api/src/server.ts (開発用)
import { serve } from '@hono/node-server';
import app from './app';

const port = process.env.PORT || 3001;

serve({
  fetch: app.fetch,
  port: Number(port),
});

console.log(`Server running on http://localhost:${port}`);
```

### 3.4 Lambda ハンドラー
```typescript
// apps/api/src/lambda.ts
import { handle } from 'hono/aws-lambda';
import app from './app';

export const handler = handle(app);
```

## 📊 Step 4: DynamoDB + Prismaセットアップ

### 4.1 LocalStack設定
```yaml
# docker-compose.yml (プロジェクトルート)
version: '3.8'
services:
  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      - SERVICES=dynamodb
      - DEFAULT_REGION=ap-northeast-1
      - DATA_DIR=/tmp/localstack/data
    volumes:
      - "./scripts/init-localstack.sh:/etc/localstack/init/ready.d/init-localstack.sh"
      - "localstack-data:/tmp/localstack"

volumes:
  localstack-data:
```

### 4.2 初期化スクリプト
```bash
#!/bin/bash
# scripts/init-localstack.sh

# DynamoDBテーブル作成
awslocal dynamodb create-table \
  --table-name vehicles \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

awslocal dynamodb create-table \
  --table-name reservations \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

echo "DynamoDB tables created successfully"
```

### 4.3 Prismaスキーマ（簡易版）
```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb" // DynamoDBは直接サポートされていないため、MongoDBとして扱う
  url      = env("DATABASE_URL")
}

model Vehicle {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  type          String
  category      String
  pricePerDay   Float
  specifications Json
  insurance     Json
  available     Boolean  @default(true)
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Reservation {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  vehicleId    String
  memberId     String?
  customerInfo Json
  startDate    DateTime
  endDate      DateTime
  includeInsurance Boolean
  totalAmount  Float
  status       String   @default("pending")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## 🔌 Step 5: フロントエンド接続

### 5.1 API クライアント作成
```typescript
// apps/web/src/lib/api/client.ts
import type { Vehicle, Reservation } from '@rental-booking/shared';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiClient {
  private async fetcher<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  vehicles = {
    list: () => this.fetcher<Vehicle[]>('/api/vehicles'),
    get: (id: string) => this.fetcher<Vehicle>(`/api/vehicles/${id}`),
  };

  reservations = {
    create: (data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) =>
      this.fetcher<Reservation>('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () => this.fetcher<Reservation[]>('/api/reservations'),
  };
}

export const apiClient = new ApiClient();
```

### 5.2 React Hooks
```typescript
// apps/web/src/hooks/useApi.ts
import { useState, useEffect } from 'react';

export function useApi<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetcher()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

## 🚀 Step 6: デプロイ準備

### 6.1 ビルドスクリプト
```json
// package.json (ルート)
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "deploy": "turbo run deploy",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules"
  }
}
```

### 6.2 GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
          
      - run: pnpm install
      - run: pnpm build
      - run: pnpm deploy
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 📝 MVP チェックリスト

### Week 1
- [ ] モノレポ構成セットアップ
- [ ] 既存コードの移行
- [ ] TypeScript設定
- [ ] 共通パッケージ作成

### Week 2
- [ ] Hono APIサーバー構築
- [ ] 基本的なCRUD API
- [ ] LocalStackでの開発環境
- [ ] フロントエンドAPI接続

### Week 3
- [ ] CDKインフラ構築
- [ ] Lambda デプロイ
- [ ] DynamoDB設定
- [ ] 本番環境テスト

### Week 4
- [ ] エラーハンドリング
- [ ] 基本的な認証（後回しOK）
- [ ] 管理画面の最小実装
- [ ] 最終テスト・調整

---

**注意**: セキュリティは後回しでOK。まず動くものを作ることに集中。