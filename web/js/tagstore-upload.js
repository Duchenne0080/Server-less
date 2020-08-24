urlinfo = window.location.href;
len=urlinfo.length;
offset=urlinfo.indexOf("#");
newsidinfo=urlinfo.substr(offset,len)
newsids=newsidinfo.split("&");
token= newsids[0].split("#id_token=");
AWS.config.region = 'us-east-1'; // 1. Enter your region
AWS.authorization = token[1];
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:a951ff6e-2acd-4662-a4f0-7536e8e61bee', // 2. Enter your identity pool
    Logins: {
                'cognito-idp.us-east-1.amazonaws.com/us-east-1_VWnseKg3P': token[1]
            }

});

AWS.config.credentials.get(function(err) {
    if (err) alert(err);
    console.log(AWS.config.credentials);
});

var bucketName = 'tagstore-image-store'; // Enter your bucket name
var bucket = new AWS.S3({
    params: {
        Bucket: bucketName
    }
});

var fileChooser = document.getElementById('file-chooser');
var button = document.getElementById('upload-button');
var results = document.getElementById('results');
button.addEventListener('click', function() {

    var file = fileChooser.files[0];

    if (file) {

        results.innerHTML = '';
        var objKey = 'testing/' + file.name;
        var params = {
            Key: objKey,
            ContentType: file.type,
            Body: file,
            ACL: 'public-read',
        };

        bucket.putObject(params, function(err, data) {
            if (err) {
                alert('Please sign in first!!');
                window.location.href="https://fit5225-tagstore-hwan.auth.us-east-1.amazoncognito.com/login?client_id=7jdn3knu4gno98t6h21gugd744&response_type=token&scope=email+openid+profile&redirect_uri=https://kw31i9no9e.execute-api.us-east-1.amazonaws.com/prod/redirect-home";
            } else {
                alert('Uploaded successful!!');
            }
        });
    } else {
        results.innerHTML = 'Nothing to upload.';
    }
}, false);
function listObjs() {
    var prefix = 'testing';
    bucket.listObjects({
        Prefix: prefix
    }, function(err, data) {
        if (err) {
            results.innerHTML = 'ERROR: ' + err;
        } else {
            var objKeys = "";
            data.Contents.forEach(function(obj) {
                objKeys += obj.Key + "<br>";
            });
            results.innerHTML = objKeys;
        }
    });
}