import { APIGatewayProxyHandlerV2 } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DBClusterStorageType } from "aws-cdk-lib/aws-rds";

// Initialization
const ddbDocClient = createDDbDocClient();

// Handler
export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  console.log(`${event.requestContext.authorizer.username} ${event.path}`)
  
  try {
    console.log("[EVENT]", event);
    const parameters  = event?.pathParameters;
    const movie_id = parameters?.movie_id ? parseInt(parameters.movie_id) : undefined;

    if (!movie_id) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: "Missing movie Id",
      };
    }

    const cast = event.queryStringParameters?.cast === "true"

    const commandOutput = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { partition: `m${movie_id}`, sort: "xxxx"},
      })
    );

    console.log('GetCommand response: ', commandOutput)

    if (!commandOutput.Item) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Invalid movie Id" }),
      };
    }

    let result: any = {...commandOutput.Item}

    // if (cast) {
    //   const castCommandOutput = await ddbDocClient.send(
    //     new QueryCommand({
    //       TableName: process.env.CAST_TABLE_NAME!,
    //       KeyConditionExpression: "movie_id = :movie_id",
    //       ExpressionAttributeValues: { ":movie_id": movie_id },
    //     })
    //   )

    //   result.cast = castCommandOutput.Items || []
    // }

    // Return Response
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ result }),
    };
  } catch (error: any) {
    console.log(JSON.stringify({ error }));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}

