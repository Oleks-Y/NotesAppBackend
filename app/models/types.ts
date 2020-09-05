import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

export interface AppResponse{
    statusCode : number,
    headers : any,
    body : string
}




