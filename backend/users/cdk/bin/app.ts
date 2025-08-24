#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { UserDatabaseStack } from '../lib/user-database-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-2',
};

new UserDatabaseStack(app, 'RentalUserDatabaseStack', {
  env,
  description: 'User management infrastructure for Rental Booking App',
  tags: {
    Application: 'RentalBookingApp',
    Environment: 'development',
    ManagedBy: 'CDK'
  }
});

app.synth();