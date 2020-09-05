export interface Note {
    title: string,
    content: string,
    cat : string

    user_id : string | null,
    user_name : string | null,
    note_id : string | null,
    timestamp : number | null,
    expires : number | null,
}
