export function getResponseHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
    };
}

export function getUserId(headers : any){
    return headers.app_user_id;
};

export function getUserName(headers : any){
    return headers.app_user_name;
};
