import {Handler, Context, APIGatewayProxyResult} from "aws-lambda";
import {NoteController} from "./controller/note.controller";

let note = new NoteController();
export const add = (event: any, context : Context) => note.add_note(event, context);

export const delete_note = (event: any, context : Context) => note.delete_note(event, context)

export const get_note = (event: any, context : Context) => note.get_note(event, context)

export const get_notes = (event: any, context : Context) => note.get_notes(event, context)

export const update = (event: any, context : Context) => note.update_note(event, context)
