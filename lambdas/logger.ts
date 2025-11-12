import { DynamoDBStreamEvent, } from "aws-lambda";
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const stateChangeLogger = async (event: DynamoDBStreamEvent) => {
    for (const record of event.Records) {
        const eventName = record.eventName
        const image = record.dynamodb?.NewImage ?? record.dynamodb?.OldImage

        if (image) {
            const item = unmarshall(image)

            let log = ""

            if (eventName === "INSERT") {
                log = `POST + ${item.partition} | ${item.sort} | ${item.title} | ${item.release_date} | ${item.overview}`
            } else if (eventName === "REMOVE") {
                log = `DELETE + ${item.partition} | ${item.sort} | ${item.title} | ${item.release_date} | ${item.overview}`
            }

            console.log(log)
        }

    }
    
    return { statusCode: 200 };
}