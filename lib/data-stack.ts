import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as custom from "aws-cdk-lib/custom-resources";
import { generateBatch } from "../shared/utils";
import {movies, movieCasts} from "../seed/movies";

import { Construct } from 'constructs';

//https://docs.aws.amazon.com/cdk/v2/guide/stack-how-to-create-multiple-stacks.html

export class DataStack extends cdk.Stack {
    public readonly moviesTable: dynamodb.Table
    public readonly movieCastsTable: dynamodb.Table

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.moviesTable = new dynamodb.Table(this, "MoviesTable", {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            tableName: "Movies",
        });

        this.movieCastsTable = new dynamodb.Table(this, "MovieCastTable", {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: { name: "movieId", type: dynamodb.AttributeType.NUMBER },
            sortKey: { name: "actorName", type: dynamodb.AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            tableName: "MovieCast",
        });

        this.movieCastsTable.addLocalSecondaryIndex({
            indexName: "roleIx",
            sortKey: { name: "roleName", type: dynamodb.AttributeType.STRING },
        });
        
        new custom.AwsCustomResource(this, "moviesddbInitData", {
            onCreate: {
            service: "DynamoDB",
            action: "batchWriteItem",
            parameters: {
                RequestItems: {
                [this.moviesTable.tableName]: generateBatch(movies),
                [this.movieCastsTable.tableName]: generateBatch(movieCasts),
                },
            },
            physicalResourceId: custom.PhysicalResourceId.of(`moviesInit-${Date.now()}`),
            },
            policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
            resources: [this.moviesTable.tableArn, this.movieCastsTable.tableArn],
            }),
        });
    }
}