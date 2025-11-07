import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("[EVENT]", event);
    const movieId = event.pathParameters?.movie_id
    
    if (!movieId) {
        return {
            statusCode: 400,
            body: "Missing movie_id"
        }
    }

    const queryParams = event.queryStringParameters || {}

    let commandInput: QueryCommandInput = {
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "movie_id = :m",
      ExpressionAttributeValues: {
        ":m": movieId,
      },
    };

    if (queryParams.role_name) {
      commandInput = {
        ...commandInput,
        IndexName: "roleIx",
        KeyConditionExpression: "movie_id = :m and begins_with(role_name, :r)",
        ExpressionAttributeValues: {
          ":m": movieId,
          ":r": queryParams.role_name,
        },
      };
    } else if (queryParams.actor_name) {
      commandInput = {
        ...commandInput,
        KeyConditionExpression: "movie_id = :m and begins_with(actor_name, :a)",
        ExpressionAttributeValues: {
          ":m": movieId,
          ":a": queryParams.actor_name,
        },
      };
    }

    const commandOutput = await ddbDocClient.send(new QueryCommand(commandInput));

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({data: commandOutput.Items}),
    };

  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({error}),
    };
  }
 };
  
function createDocumentClient() {
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
