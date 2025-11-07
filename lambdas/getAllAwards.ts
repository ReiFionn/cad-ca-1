import { Handler } from "aws-lambda";
import { AwardsQueryParams } from "../shared/types";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommandInput, ScanCommand } from "@aws-sdk/lib-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json"
import { coerceAndCheckDataType } from "ajv/dist/compile/validate/dataType";

const ajv = new Ajv({coerceTypes: true}); //https://ajv.js.org/coercion.html
const isValidQueryParams = ajv.compile(schema.definitions["AwardsQueryParams"] || {});
const ddbDocClient = createDDbDocClient();

export const handler: Handler = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));

    const queryParams = event.queryStringParameters

    if (!queryParams) {
        const commandOutput = await ddbDocClient.send(new ScanCommand({
            TableName: process.env.TABLE_NAME,
            FilterExpression: "begins_with(#partition, :w)",
            ExpressionAttributeNames: {
            "#partition": "partition"
            },
            ExpressionAttributeValues: {
            ":w": "w"
            }
        })) 

      return {
        statusCode: 200,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({data: commandOutput.Items}),
      };
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

    let commandInput: QueryCommandInput = { TableName: process.env.TABLE_NAME }
    

    if ("movie_id" in queryParams) {
      commandInput = {...commandInput,
          FilterExpression: "begins_with(#partition, :wm)",
          ExpressionAttributeNames: { "#partition": "partition" },
          ExpressionAttributeValues: { ":wm": `w${queryParams.movie_id}` },
      }
    } else if ("actor_id" in queryParams) {
      commandInput = {...commandInput,
          FilterExpression: "begins_with(#partition, :wa)",
          ExpressionAttributeNames: { "#partition": "partition" },
          ExpressionAttributeValues: { ":wa": `w${queryParams.actor_id}` },
      }
    } else if ("award_body" in queryParams) {
      commandInput = {...commandInput,
          FilterExpression: "begins_with(#partition, :w AND contains(#body, :b))",
          ExpressionAttributeNames: { "#partition": "partition", "#body": "body" },
          ExpressionAttributeValues: { ":w": "w", ":b": queryParams.award_body }
      }
    } else {
      commandInput = {...commandInput,
          FilterExpression: "award_id = :w",
          ExpressionAttributeValues: {
              ":w": award_id
          }
      }
    }

    const commandOutput = await ddbDocClient.send(new ScanCommand(commandInput))

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({data: commandOutput.Items}),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error.message));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(error.message),
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