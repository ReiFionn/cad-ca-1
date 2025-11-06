#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { ApiStack } from '../lib/api-stack'

const app = new cdk.App();
const dataStack = new DataStack(app, "DataStack")

new ApiStack(app, 'ApiStack', { moviesAppTable: dataStack.moviesAppTable});