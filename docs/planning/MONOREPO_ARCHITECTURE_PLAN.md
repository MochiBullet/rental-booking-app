# RentalEasy モノレポアーキテクチャ実装計画

## 技術スタック

### コア技術
- **モノレポ管理**: Turborepo
- **パッケージマネージャー**: pnpm
- **言語**: TypeScript (全パッケージ)
- **フロントエンド**: React 18 (既存) → Next.js (将来)
- **バックエンド**: Hono + AWS Lambda
- **データベース**: DynamoDB + Prisma
- **インフラ**: AWS CDK v2

## モノレポ構成

```
rental-booking/
├── apps/
│   ├── web/                    # 既存のReactフロントエンド
│   ├── api/                    # Hono + Lambda バックエンド
│   └── admin/                  # 管理画面（将来的に分離）
├── packages/
│   ├── database/               # Prisma スキーマ・クライアント
│   ├── shared/                 # 共通型定義・ユーティリティ
│   ├── ui/                     # 共通UIコンポーネント
│   └── config/                 # 共通設定（ESLint, TypeScript等）
├── infrastructure/
│   ├── cdk/                    # AWS CDKスタック
│   └── scripts/                # デプロイ・ビルドスクリプト
├── turbo.json                  # Turborepo設定
├── pnpm-workspace.yaml         # pnpmワークスペース設定
└── package.json                # ルートパッケージ

```

## 段階的実装計画

### Phase 1: モノレポ基盤構築（2-3日）

#### 1.1 Turborepoセットアップ
```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {},
    "deploy": {
      "dependsOn": ["build", "test"]
    }
  }
}
```

#### 1.2 共通パッケージ作成
```typescript
// packages/shared/src/types/index.ts
export interface Vehicle {
  id: string;
  name: string;
  type: 'car' | 'bike';
  category: string;
  pricePerDay: number;
  specifications: VehicleSpecifications;
  insurance: InsuranceOption;
  available: boolean;
}

export interface Reservation {
  id: string;
  vehicleId: string;
  memberId?: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
```

### Phase 2: Lambda + Hono バックエンド（1週間）

#### 2.1 Honoアプリケーション構造
```typescript
// apps/api/src/index.ts
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { cors } from 'hono/cors';
import { vehicleRoutes } from './routes/vehicles';
import { reservationRoutes } from './routes/reservations';

const app = new Hono();

app.use('/*', cors());
app.route('/api/vehicles', vehicleRoutes);
app.route('/api/reservations', reservationRoutes);

export const handler = handle(app);
```

#### 2.2 DynamoDB + Prisma設定
```prisma
// packages/database/prisma/schema.prisma
datasource db {
  provider = "dynamodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Vehicle {
  id            String   @id @default(uuid())
  name          String
  type          String   // 'car' | 'bike'
  category      String
  pricePerDay   Float
  specifications Json
  insurance     Json
  available     Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Reservation {
  id          String   @id @default(uuid())
  vehicleId   String
  memberId    String?
  customerInfo Json
  startDate   DateTime
  endDate     DateTime
  totalAmount Float
  status      String   @default("pending")
  createdAt   DateTime @default(now())
}
```

### Phase 3: CDK インフラストラクチャ（3-4日）

#### 3.1 Lambda + API Gateway
```typescript
// infrastructure/cdk/lib/api-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDBテーブル
    const vehiclesTable = new dynamodb.Table(this, 'VehiclesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Lambda関数
    const apiFunction = new lambda.Function(this, 'ApiFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../../apps/api/dist'),
      environment: {
        VEHICLES_TABLE_NAME: vehiclesTable.tableName,
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'RentalEasyApi', {
      restApiName: 'RentalEasy API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const integration = new apigateway.LambdaIntegration(apiFunction);
    api.root.addProxy({
      defaultIntegration: integration,
    });
  }
}
```

### Phase 4: フロントエンド統合（3-4日）

#### 4.1 API クライアント（型安全）
```typescript
// apps/web/src/lib/api-client.ts
import type { Vehicle, Reservation } from '@rental-booking/shared';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const apiClient = {
  vehicles: {
    list: async (): Promise<Vehicle[]> => {
      const res = await fetch(`${API_URL}/api/vehicles`);
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      return res.json();
    },
  },
  
  reservations: {
    create: async (data: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> => {
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create reservation');
      return res.json();
    },
  },
};
```

## ローカル開発環境

### 開発コマンド
```bash
# 全パッケージの依存関係インストール
pnpm install

# 開発サーバー起動（フロント + API）
pnpm dev

# ビルド
pnpm build

# 型チェック
pnpm type-check

# テスト
pnpm test

# デプロイ（CDK）
pnpm deploy
```

### LocalStack活用（DynamoDB）
```yaml
# docker-compose.yml
version: '3.8'
services:
  localstack:
    image: localstack/localstack
    ports:
      - "4566:4566"
    environment:
      - SERVICES=dynamodb
      - DEFAULT_REGION=ap-northeast-1
    volumes:
      - "./init-aws.sh:/etc/localstack/init/ready.d/init-aws.sh"
```

## MVP実装優先順位

### 必須機能（Phase 1-2）
1. ✅ 車両一覧API（GET /api/vehicles）
2. ✅ 予約作成API（POST /api/reservations）
3. ✅ 予約一覧API（GET /api/reservations）
4. ✅ フロントエンドのAPI接続
5. ✅ 基本的なエラーハンドリング

### 次フェーズ（Phase 3-4）
1. 🔄 会員登録・ログイン（Cognito連携）
2. 🔄 管理者機能
3. 🔄 予約ステータス管理
4. 🔄 メール通知（SES）

### 後回し（本番向け）
- ❌ 決済システム（Stripe）
- ❌ 高度なセキュリティ（WAF、レート制限）
- ❌ 詳細なログ・監視（CloudWatch）
- ❌ A/Bテスト基盤

## 技術選定理由

### Turborepo
- ビルドキャッシュで開発効率向上
- 依存関係の自動解決
- 並列ビルド・テスト

### Hono + Lambda
- 軽量・高速なフレームワーク
- TypeScript完全サポート
- Lambda最適化済み

### DynamoDB + Prisma
- サーバーレスに最適
- Prismaで型安全なDB操作
- スケーラビリティ確保

### pnpm
- 高速なパッケージインストール
- ディスク容量効率
- モノレポに最適

## 成功指標

### 技術的成功
- [ ] 型安全性：エンドツーエンドの型定義
- [ ] ビルド時間：3分以内
- [ ] デプロイ時間：5分以内
- [ ] ローカル開発：1コマンドで起動

### ビジネス的成功
- [ ] 車両予約が完了できる
- [ ] データが永続化される
- [ ] 管理者が予約を確認できる
- [ ] エラー時も適切に動作

---

次のステップ：モノレポの初期セットアップから開始