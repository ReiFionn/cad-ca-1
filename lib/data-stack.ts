import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as custom from "aws-cdk-lib/custom-resources";
import { generateBatch } from "../shared/utils";
import {movies, actors} from "../seed/movies";

import { Construct } from 'constructs';

//https://docs.aws.amazon.com/cdk/v2/guide/stack-how-to-create-multiple-stacks.html

export class DataStack extends cdk.Stack {
    public readonly moviesTable: dynamodb.Table
    public readonly actorsTable: dynamodb.Table

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.moviesTable = new dynamodb.Table(this, "MoviesTable", {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: { name: "movie_id", type: dynamodb.AttributeType.NUMBER },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            tableName: "Movies",
        });

        this.actorsTable = new dynamodb.Table(this, "ActorsTable", {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: { name: "actor_id", type: dynamodb.AttributeType.NUMBER },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            tableName: "Actors",
        });

        // this.actorsTable.addLocalSecondaryIndex({
        //     indexName: "roleIx",
        //     sortKey: { name: "role_name", type: dynamodb.AttributeType.STRING },
        // });
        
        new custom.AwsCustomResource(this, "moviesddbInitData", {
            onCreate: {
            service: "DynamoDB",
            action: "batchWriteItem",
            parameters: {
                RequestItems: {
                [this.moviesTable.tableName]: generateBatch(movies),
                [this.actorsTable.tableName]: generateBatch(actors),
                },
            },
            physicalResourceId: custom.PhysicalResourceId.of(`moviesInit-${Date.now()}`),
            },
            policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
            resources: [this.moviesTable.tableArn, this.actorsTable.tableArn],
            }),
        });
    }
}