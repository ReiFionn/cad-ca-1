import { Handler } from "aws-lambda";
import { AwardsQueryParams } from "../shared/types";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommandInput, ScanCommand } from "@aws-sdk/lib-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json"

const ajv = new Ajv();
const isValidQueryParams = ajv.compile(schema.definitions["AwardsQueryParams"] || {});
const ddbDocClient = createDDbDocClient();

export const handler: Handler = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));

    const queryParams = event.queryStringParameters;

    if (!queryParams) {
        return {
            statusCode: 500,
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ message: "Missing query parameters" })
        }
    }

    if (!isValidQueryParams(queryParams)) {
        return {
            statusCode: 500,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                message: `Incorrect type. Must match Query parameters schema`,
                schema: schema.definitions["AwardsQueryParams"],
            })
        }
    }

    const award_id = parseInt(queryParams.award_id)
    
    let commandInput: QueryCommandInput = { TableName: process.env.TABLE_NAME }

    if ("movie" in queryParams) {
        commandInput = {...commandInput,
            IndexName: "movieIx",
            KeyConditionExpression: "award_id = :w and begins_with(movie_id, :m)",
            ExpressionAttributeValues: {
                ":w": award_id,
                ":m": queryParams.movie
            }
        }
    } else if ("actor" in queryParams) {
        commandInput = {...commandInput,
            KeyConditionExpression: "award_id = :w and begins_with(actor_id, :a)",
            ExpressionAttributeValues: {
                ":w": award_id,
                ":a": queryParams.actor
            }
        }
    } else if ("awardBody" in queryParams) {
        commandInput = {...commandInput,
            KeyConditionExpression: "award_id = :w and begins_with(awardBody, :b)",
            ExpressionAttributeValues: {
                ":w": award_id,
                ":b": queryParams.awardBody
            }
        }
    } else {
        commandInput = {...commandInput,
            KeyConditionExpression: "award_id = :w",
            ExpressionAttributeValues: {
                ":w": award_id
            }
        }
    }

    const commandOutput = await ddbDocClient.send(new QueryCommand(commandInput))

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({data: commandOutput.Items}),
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