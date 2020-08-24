'use strict';
 
exports.handler = function(event, context, callback) {
    var response = {
        statusCode: 301,
        headers: {
            "Location" : "http://fit5225-web.s3-website-us-east-1.amazonaws.com/"
        },
        body: null
    };
    callback(null, response);
};
