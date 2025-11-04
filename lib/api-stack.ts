import * as cdk from 'aws-cdk-lib';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as apig from "aws-cdk-lib/aws-apigateway";

import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
    moviesTable: dynamodb.ITable
    movieCastsTable: dynamodb.ITable
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props)

        const { moviesTable, movieCastsTable } = props

        const getMovieByIdFn = new lambdanode.NodejsFunction(this, "GetMovieByIdFn",{
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_18_X,
                entry: `${__dirname}/../lambdas/getMovieById.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                    TABLE_NAME: moviesTable.tableName,
                    CAST_TABLE_NAME: movieCastsTable.tableName,
                    REGION: cdk.Aws.REGION,
                },
            }
        );

        const getAllMoviesFn = new lambdanode.NodejsFunction(this, "GetAllMoviesFn", {
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_18_X,
                entry: `${__dirname}/../lambdas/getAllMovies.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                    TABLE_NAME: moviesTable.tableName,
                    REGION: cdk.Aws.REGION,
                },
            }
        );

        const getMovieCastMembersFn = new lambdanode.NodejsFunction(this, "GetCastMemberFn", {
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_16_X,
                entry: `${__dirname}/../lambdas/getMovieCastMembers.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                    TABLE_NAME: movieCastsTable.tableName,
                    REGION: cdk.Aws.REGION,
                },
            }
        );
        
        const addMovieFn = new lambdanode.NodejsFunction(this, "AddMovieFn", {
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_16_X,
                entry: `${__dirname}/../lambdas/addMovie.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                    TABLE_NAME: moviesTable.tableName,
                    REGION: cdk.Aws.REGION,
                },
            }
        );
    
        const deleteMovieFn = new lambdanode.NodejsFunction(this, "DeleteMovieFn", {
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_16_X,
                entry: `${__dirname}/../lambdas/deleteMovieById.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                    TABLE_NAME: moviesTable.tableName,
                    REGION: cdk.Aws.REGION,
                },
            }
        );

        moviesTable.grantReadData(getMovieByIdFn)
        moviesTable.grantReadData(getAllMoviesFn)
        moviesTable.grantReadWriteData(addMovieFn)
        moviesTable.grantWriteData(deleteMovieFn)
        movieCastsTable.grantReadData(getMovieCastMembersFn)

        // REST API 
        const api = new apig.RestApi(this, "MoviesAPI", {
                description: "Cloud App Dev CA 1 Movies API",
                deployOptions: {
                    stageName: "dev",
                },
                defaultCorsPreflightOptions: {
                    allowHeaders: ["Content-Type", "X-Amz-Date"],
                    allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
                    allowCredentials: true,
                    allowOrigins: ["*"],
                },
            }
        );

        const moviesEndpoint = api.root.addResource("movies");
        moviesEndpoint.addMethod("GET", new apig.LambdaIntegration(getAllMoviesFn, { proxy: true }))
        moviesEndpoint.addMethod("POST", new apig.LambdaIntegration(addMovieFn, { proxy: true }))
    
        const movieEndpoint = moviesEndpoint.addResource("{movieId}");
        movieEndpoint.addMethod("GET", new apig.LambdaIntegration(getMovieByIdFn, { proxy: true }))
        movieEndpoint.addMethod("DELETE", new apig.LambdaIntegration(deleteMovieFn, { proxy: true }))
    
        const movieCastEndpoint = moviesEndpoint.addResource("cast");
        movieCastEndpoint.addMethod("GET", new apig.LambdaIntegration(getMovieCastMembersFn, { proxy: true }))
    }
}