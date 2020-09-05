// import {DynamoDB, config} from 'aws-sdk';
import AWS from 'aws-sdk';
import {APIGatewayProxyEvent, Context} from "aws-lambda";
import {AppResponse} from "../models/types";
import {getResponseHeaders, getUserId, getUserName} from "../utils/util"
import {Note} from "../models/items";
import {uuid} from 'uuidv4';
import moment from 'moment';
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';


export class NoteController {
    tableName: string;
    private dynamodb: DocumentClient

    constructor() {
        AWS.config.update({region: "eu-north-1"})
        this.tableName = process.env.NOTES_TABLE!;
        console.debug("Debug: ", "here")
        this.dynamodb = new AWS.DynamoDB.DocumentClient()
    }

    async add_note(event: APIGatewayProxyEvent, context: Context): Promise<AppResponse> {
        try {
            let item: Note = JSON.parse(event.body!).Item;
            item.user_id = getUserId(event.headers);
            item.user_name = getUserName(event.headers);
            item.note_id = item.user_id + ":" + uuid()
            item.timestamp = moment().unix();
            item.expires = moment().add(90, "days").unix();


            let data = await this.dynamodb.put({
                TableName: this.tableName,
                Item: item
            }).promise()

            return {
                statusCode: 200,
                headers: getResponseHeaders(),
                body: JSON.stringify(item)
            }
        } catch (err) {
            console.log("Error", err)
            return {
                statusCode: err.statusCode ? err.statusCode : 500,
                headers: "",
                body: JSON.stringify({
                    error: err.name ? err.name : "Exception",
                    message: err.message ? err.message : "Unknown error",
                }),
            };
        }
    }

    async delete_note(event: APIGatewayProxyEvent, context: Context): Promise<AppResponse> {
        try {
            let timestamp = parseInt(event.pathParameters!.timestamp)

            let data = await this.dynamodb.delete({
                TableName: this.tableName,
                Key: {
                    user_id: getUserId(event.headers),
                    timestamp: timestamp
                }
            }).promise()

            return {
                statusCode: 200,
                headers: getResponseHeaders(),
                body: ''
            }
        } catch (err) {
            console.log("Error", err)
            return {
                statusCode: err.statusCode ? err.statusCode : 500,
                headers: "",
                body: JSON.stringify({
                    error: err.name ? err.name : "Exception",
                    message: err.message ? err.message : "Unknown error",
                }),
            };
        }
    }

    async get_note(event: APIGatewayProxyEvent, context: Context): Promise<AppResponse> {
        try {
            let note_id = decodeURIComponent(event.pathParameters!.note_id);

            let data = await this.dynamodb.query({
                TableName: this.tableName,
                IndexName: "note_id-index",
                KeyConditionExpression: "note_id = :note_id",
                ExpressionAttributeValues: {
                    ":note_id": note_id,
                },
                Limit: 1
            }).promise()
            return {
                statusCode: 200,
                headers: getResponseHeaders(),
                body: JSON.stringify(data)
            }
        } catch (err) {
            console.log("Error", err)
            return {
                statusCode: err.statusCode ? err.statusCode : 500,
                headers: "",
                body: JSON.stringify({
                    error: err.name ? err.name : "Exception",
                    message: err.message ? err.message : "Unknown error",
                }),
            };
        }
    }

        async get_notes(event: APIGatewayProxyEvent, context: Context): Promise<AppResponse> {
            try {

                let query  = event.queryStringParameters
                let limit = query && query.limit ? parseInt(query.limit) : 5
                let user_id = getUserId(event.headers);
                let startTimeStamp = query && query.start ? parseInt(query.start) :0;
                let params : any = {
                    TableName: this.tableName,
                    KeyConditionExpression : "user_id = :user_id",
                    ExpressionAttributeValues:{
                        ":user_id": user_id
                    },
                    Limit: limit,
                    ScanIndexForward: false
                }

                if(startTimeStamp > 0){
                    params.ExclusiveStartKey = {
                        user_id: user_id,
                        timestamp : startTimeStamp
                    }

                }
                let data = await this.dynamodb.query(params).promise()
                return {
                    statusCode: 200,
                    headers: getResponseHeaders(),
                    body: JSON.stringify(data)
                }
            } catch (err) {
                console.log("Error", err)
                return {
                    statusCode: err.statusCode ? err.statusCode : 500,
                    headers: "",
                    body: JSON.stringify({
                        error: err.name ? err.name : "Exception",
                        message: err.message ? err.message : "Unknown error",
                    }),
                };
            }
        }

        async update_note(event: APIGatewayProxyEvent, context: Context): Promise<AppResponse>{
            try {
                let item = JSON.parse(event.body!).Item;
                item.user_id = getUserId(event.headers);
                item.user_name = getUserName(event.headers);
                item.expires = moment().add(90, "days").unix();

                let data = await this.dynamodb.put({
                    TableName : this.tableName,
                    Item : item,
                    ConditionExpression : '#t = :t',
                    ExpressionAttributeNames: {
                        '#t': 'timestamp'
                    },
                    ExpressionAttributeValues: {
                        ':t': item.timestamp
                    }
                }).promise()
                return {
                    statusCode: 200,
                    headers: getResponseHeaders(),
                    body: JSON.stringify(item)
                };


            } catch (err) {
                console.log("Error", err)
                return {
                    statusCode: err.statusCode ? err.statusCode : 500,
                    headers: "",
                    body: JSON.stringify({
                        error: err.name ? err.name : "Exception",
                        message: err.message ? err.message : "Unknown error",
                    }),
                };
            }
        }


}
