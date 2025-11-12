import { Handler } from "aws-lambda";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommandInput, ScanCommand } from "@aws-sdk/lib-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json"

const ajv = new Ajv({coerceTypes: true}); //https://ajv.js.org/coercion.html
const isValidQueryParams = ajv.compile(schema.definitions["AwardsQueryParams"] || {});
const ddbDocClient = createDDbDocClient();

export const handler: Handler = async (event, context) => {

  try {
    console.log("Event: ", JSON.stringify(event));

    const queryParams = event.queryStringParameters

    if (!queryParams) { //returns all awards if no query parameters were added
        console.log(`${event.requestContext.authorizer.username} ${event.path}`)
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

    if ("movie" in queryParams && "actor" in queryParams && "awardBody" in queryParams) { // all awards won by the movie with specified id and the actor with specified id for the specified award body
      console.log(`${event.requestContext.authorizer.username} ${event.path}?movie=${queryParams.movie}&actor=${queryParams.actor}&awardBody=${queryParams.awardBody}`)
      commandInput = {...commandInput,
          FilterExpression: "(begins_with(#partition, :wm) OR begins_with(#partition, :wa)) AND contains(#body, :b)",
          ExpressionAttributeNames: { "#partition": "partition", "#body": "body" },
          ExpressionAttributeValues: { ":wm": `w${queryParams.movie}`, ":wa": `w${queryParams.actor}`, ":b": queryParams.awardBody }
      }
    } else if ("actor" in queryParams && "awardBody" in queryParams) { // all awards won by the actor with specified id for the specified award body
      console.log(`${event.requestContext.authorizer.username} ${event.path}?actor=${queryParams.actor}&awardBody=${queryParams.awardBody}`)
      commandInput = {...commandInput,
          FilterExpression: "begins_with(#partition, :wa) AND contains(#body, :b)",
          ExpressionAttributeNames: { "#partition": "partition", "#body": "body" },
          ExpressionAttributeValues: { ":wa": `w${queryParams.actor}`, ":b": queryParams.awardBody }
      }
    } else if ("movie" in queryParams && "awardBody" in queryParams) { // all awards won by the movie with specified id for the specified award body
      console.log(`${event.requestContext.authorizer.username} ${event.path}?movie=${queryParams.movie}&awardBody=${queryParams.awardBody}`)
      commandInput = {...commandInput,
          FilterExpression: "begins_with(#partition, :wm) AND contains(#body, :b)",
          ExpressionAttributeNames: { "#partition": "partition", "#body": "body"},
          ExpressionAttributeValues: { ":wm": `w${queryParams.movie}`, ":b": queryParams.awardBody }
      }
    } else if ("movie" in queryParams && "actor" in queryParams) { // all awards won by the movie with specified id and by the actor with specified id
      console.log(`${event.requestContext.authorizer.username} ${event.path}?movie=${queryParams.movie}&actor=${queryParams.actor}`)
      commandInput = {...commandInput,
          FilterExpression: "begins_with(#partition, :wm) OR begins_with(#partition, :wa)", 
          ExpressionAttributeNames: { "#partition": "partition" },
          ExpressionAttributeValues: { ":wm": `w${queryParams.movie}`, ":wa": `w${queryParams.actor}` }
      }
    } else if ("awardBody" in queryParams) { // all awards with matching body
      console.log(`${event.requestContext.authorizer.username} ${event.path}?awardBody=${queryParams.awardBody}`)
      commandInput = {...commandInput,
          FilterExpression: "begins_with(#partition, :w) AND contains(#body, :b)",
          ExpressionAttributeNames: { "#partition": "partition", "#body": "body" },
          ExpressionAttributeValues: { ":w": "w", ":b": queryParams.awardBody }
      }
    } else if ("actor" in queryParams) { // all awards won by the actor with specified id
      console.log(`${event.requestContext.authorizer.username} ${event.path}?actor=${queryParams.actor}`)
      commandInput = {...commandInput,
          FilterExpression: "begins_with(#partition, :wa)",
          ExpressionAttributeNames: { "#partition": "partition" },
          ExpressionAttributeValues: { ":wa": `w${queryParams.actor}` },
      }
    } else if ("movie" in queryParams) { // all awards won by the movie with specified id
      console.log(`${event.requestContext.authorizer.username} ${event.path}?movie=${queryParams.movie}`)
      commandInput = {...commandInput,
          FilterExpression: "begins_with(#partition, :wm)",
          ExpressionAttributeNames: { "#partition": "partition" },
          ExpressionAttributeValues: { ":wm": `w${queryParams.movie}` },
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