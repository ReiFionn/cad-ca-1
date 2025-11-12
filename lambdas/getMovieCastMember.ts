import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  console.log(`${event.requestContext.authorizer.username} ${event.path}`)
  
  try {
    console.log("[EVENT]", event);
    const movieId = event.pathParameters?.movie_id
    const actorId = event.pathParameters?.actor_id
    
    if (!movieId) {
      return {
          statusCode: 400,
          body: "Missing movie_id"
      }
    } else if (!actorId) {
      return {
          statusCode: 400,
          body: "Missing actor_id"
      }
    }

    const commandOutput = await ddbDocClient.send(new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: {partition: `c${movieId}`, sort: `${actorId}`}
    }));

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({data: commandOutput.Item}),
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
