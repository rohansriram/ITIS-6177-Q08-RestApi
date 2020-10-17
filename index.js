'use strict';
console.log('Loading hello function');

 
exports.handler = async (event) => {
    
    
    let key;
    let responseCode = 200;
    console.log("request: " + JSON.stringify(event));
    
    
    if (event.queryStringParameters && event.queryStringParameters.keyword) {
        key = event.queryStringParameters.keyword;
        
    }
    
    else
    
    {
        
        return 502;
    }
    
    let greeting = `Rohan Sriram says ${key}.`;
    

    let responseBody = {
        message: greeting,
        input: event
    };
    
    
    let response = {
        statusCode: responseCode,
        headers: {
            "x-custom-header" : "my custom header value"
        },
        body: JSON.stringify(responseBody)
    };
    console.log("response: " + JSON.stringify(response))
    return response;
};