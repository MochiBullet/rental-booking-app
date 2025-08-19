#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from './lib/frontend-stack';

const app = new cdk.App();

// フロントエンドスタック
new FrontendStack(app, 'RentalBookingFrontendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-southeast-2',
  },
  description: 'Rental Booking App Frontend Infrastructure',
});

app.synth();