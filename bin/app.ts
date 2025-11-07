#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { ApiStack } from '../lib/api-stack'
import { CognitoStack } from '../lib/cognito-stack';

const app = new cdk.App();
const dataStack = new DataStack(app, "DataStack")
const cognitoStack = new CognitoStack(app, "CognitoStack")

new ApiStack(app, 'ApiStack', { moviesAppTable: dataStack.moviesAppTable});