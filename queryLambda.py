import json
import boto3
from functools import reduce
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import And, Key, Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('image')

def lambda_handler(event, context):
    
    record = event["tags"]
    checklist = []
    for i in record:
        element = {'label':i}
        checklist.append(element)
        
    try:

        response = table.scan(
            FilterExpression=reduce(And, ([Attr('tags').contains(str(v)) for v in checklist]))
        )
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        list = []
        for item in response['Items']:
            imageUrl = item['url']
            list.append(imageUrl)
            
    received = {"links":list}
    
    return {
        'statusCode': 200,
        'body': json.dumps(received)
    }