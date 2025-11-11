import * as cdk from 'aws-cdk-lib';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  userPoolId: string;
  userPoolClientId: string;
  moviesAppTable: dynamodb.ITable;
};

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props)

        const appCommonFnProps = {
            architecture: lambda.Architecture.ARM_64,
            timeout: cdk.Duration.seconds(10),
            memorySize: 128,
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: "handler",
            environment: {
                USER_POOL_ID: props.userPoolId,
                CLIENT_ID: props.userPoolClientId,
                REGION: cdk.Aws.REGION,
            },
        };

        const { moviesAppTable } = props

        const getMovieByIdFn = new lambdanode.NodejsFunction(this, "GetMovieByIdFn",{
            ...appCommonFnProps,
            entry: `${__dirname}/../lambdas/getMovieById.ts`,
        })

        const getAllMoviesFn = new lambdanode.NodejsFunction(this, "GetAllMoviesFn", {
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_18_X,
                entry: `${__dirname}/../lambdas/getAllMovies.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                    TABLE_NAME: moviesAppTable.tableName,
                    REGION: cdk.Aws.REGION,
                },
            }
        );

        const getAllActorsFn = new lambdanode.NodejsFunction(this, "GetAllActorsFn", {
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_16_X,
                entry: `${__dirname}/../lambdas/getAllActors.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                    TABLE_NAME: moviesAppTable.tableName,
                    REGION: cdk.Aws.REGION,
                },
            }
        );

        const getActorByIdFn = new lambdanode.NodejsFunction(this, "GetActorByIdFn",{
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_18_X,
                entry: `${__dirname}/../lambdas/getActorById.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                    TABLE_NAME: moviesAppTable.tableName,
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
                    TABLE_NAME: moviesAppTable.tableName,
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
                    TABLE_NAME: moviesAppTable.tableName,
                    REGION: cdk.Aws.REGION,
                },
            }
        );

        // const getMovieCastFn = new lambdanode.NodejsFunction(this, "GetMovieCastFn", {
        //     architecture: lambda.Architecture.ARM_64,
        //         runtime: lambda.Runtime.NODEJS_16_X,
        //         entry: `${__dirname}/../lambdas/getMovieCast.ts`,
        //         timeout: cdk.Duration.seconds(10),
        //         memorySize: 128,
        //         environment: {
        //             TABLE_NAME: castTable.tableName,
        //             REGION: cdk.Aws.REGION,
        //         },
        //     }
        // )

        const getAllAwardsFn = new lambdanode.NodejsFunction(this, "GetAllAwardsFn", {
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_18_X,
                entry: `${__dirname}/../lambdas/getAllAwards.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                    TABLE_NAME: moviesAppTable.tableName,
                    REGION: cdk.Aws.REGION,
                },
            }
        );

        const authorizerFn = new lambdanode.NodejsFunction(this, "AuthorizerFn", {
            ...appCommonFnProps,
            entry: `${__dirname}/../lambdas/auth/authorizer.ts`,
        });

        const requestAuthorizer = new apig.RequestAuthorizer(
            this,
            "RequestAuthorizer",
            {
            identitySources: [apig.IdentitySource.header("cookie")],
            handler: authorizerFn,
            resultsCacheTtl: cdk.Duration.minutes(0),
            }
        );

        moviesAppTable.grantReadData(getMovieByIdFn)
        moviesAppTable.grantReadData(getAllMoviesFn)
        moviesAppTable.grantReadWriteData(addMovieFn)
        moviesAppTable.grantWriteData(deleteMovieFn)
        moviesAppTable.grantReadData(getAllActorsFn)
        moviesAppTable.grantReadData(getActorByIdFn)
        //castTable.grantReadData(getMovieCast)
        moviesAppTable.grantReadData(getAllAwardsFn)

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

        const adminKey = new apig.ApiKey(this, "AdminKey", { // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.ApiKey.html
            apiKeyName: "AdminKey",
            description: "Admin API key"
        });

        const adminUsagePlan = api.addUsagePlan("AdminUsagePlan", { name: "AdminUsagePlan" }) // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.UsagePlan.html

        adminUsagePlan.addApiStage({ stage: api.deploymentStage }); 
        adminUsagePlan.addApiKey(adminKey);

        const moviesEndpoint = api.root.addResource("movies");
        moviesEndpoint.addMethod("GET", new apig.LambdaIntegration(getAllMoviesFn), {authorizer: requestAuthorizer, authorizationType: apig.AuthorizationType.CUSTOM})
        moviesEndpoint.addMethod("POST", new apig.LambdaIntegration(addMovieFn), {apiKeyRequired: true})
        const movieEndpoint = moviesEndpoint.addResource("{movie_id}");
        movieEndpoint.addMethod("GET", new apig.LambdaIntegration(getMovieByIdFn), {authorizer: requestAuthorizer, authorizationType: apig.AuthorizationType.CUSTOM})
        movieEndpoint.addMethod("DELETE", new apig.LambdaIntegration(deleteMovieFn), {apiKeyRequired: true})
    
        const actorsEndpoint = movieEndpoint.addResource("actors");
        actorsEndpoint.addMethod("GET", new apig.LambdaIntegration(getAllActorsFn), {authorizer: requestAuthorizer, authorizationType: apig.AuthorizationType.CUSTOM})
        const actorEndpoint = actorsEndpoint.addResource("{actor_id}");
        actorEndpoint.addMethod("GET", new apig.LambdaIntegration(getActorByIdFn), {authorizer: requestAuthorizer, authorizationType: apig.AuthorizationType.CUSTOM})
        const awardsEndpoint = api.root.addResource("awards");
        awardsEndpoint.addMethod("GET", new apig.LambdaIntegration(getAllAwardsFn), {authorizer: requestAuthorizer, authorizationType: apig.AuthorizationType.CUSTOM})
    }
}