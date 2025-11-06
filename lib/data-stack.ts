import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as custom from "aws-cdk-lib/custom-resources";
import { generateBatch } from "../shared/utils";
import {movies, actors, cast, awards} from "../seed/movies";

import { Construct } from 'constructs';

//https://docs.aws.amazon.com/cdk/v2/guide/stack-how-to-create-multiple-stacks.html

export class DataStack extends cdk.Stack {
    public readonly moviesAppTable: dynamodb.Table

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.moviesAppTable = new dynamodb.Table(this, "MoviesAppTable", {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            partitionKey: { name: "partition", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "sort", type: dynamodb.AttributeType.STRING},
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            tableName: "MoviesApp",
        });

        const batchData = [
            ...movies.map(m => ({ //https://www.slingacademy.com/article/using-array-map-method-in-typescript/ 
                partition: `m${m.movie_id}`, //https://www.geeksforgeeks.org/typescript/how-to-format-strings-in-typescript/
                sort: "xxxx",
                ...m
            })),
            ...actors.map(a => ({
                partition: `a${a.actor_id}`,
                sort: "xxxx",
                ...a
            })),
            ...cast.map(c => ({
                partition: `c${c.movie_id}`,
                sort: `${c.actor_id}`,
                ...c
            })),
            ...awards.map(w => ({
                partition: `w${w.award_id}`,
                sort: w.body,
                ...w
            }))
        ]

        new custom.AwsCustomResource(this, "moviesddbInitData", {
            onCreate: {
            service: "DynamoDB",
            action: "batchWriteItem",
            parameters: {
                RequestItems: {
                    [this.moviesAppTable.tableName]: generateBatch(batchData),
                },
            },
            physicalResourceId: custom.PhysicalResourceId.of(`moviesInit-${Date.now()}`),
            },
            policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
            resources: [this.moviesAppTable.tableArn],
            }),
        });
    }
}