import { APIGatewayProxyHandlerV2 } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoStack } from "../lib/cognito-stack";

// Initialization
const ddbDocClient = createDDbDocClient();

// Handler
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log(`${event.requestContext.authorizer.username} ${event.path}`) // https://stackoverflow.com/questions/66010442/get-cognito-user-attributes-in-lambda-function
  
  try {
    const parameters  = event?.pathParameters;
    const movie_id = parameters?.movie_id ? parseInt(parameters.movie_id) : undefined;
    const actor_id = parameters?.actor_id ? parseInt(parameters.actor_id) : undefined;

    if (!movie_id || !actor_id) {
        return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: "Missing parameters",
      };
    }

    const commandOutput = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { partition: `a${actor_id}`, sort: "xxxx"},
      })
    );

    console.log('GetCommand response: ', commandOutput)

    if (!commandOutput.Item) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: { Message: "Invalid parameters" },
      };
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(commandOutput.Item),
    };
  } catch (error: any) {
    console.log(error);
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(error),
    };
  }
}

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