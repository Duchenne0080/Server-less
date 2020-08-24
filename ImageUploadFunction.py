import json
import boto3
import os
import sys
import uuid
import cv2
import numpy as np
from urllib.parse import unquote_plus
from botocore.exceptions import ClientError

s3_client = boto3.client('s3')

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('image')

def downloadFromS3(strBucket,strKey,strFile):
    s3_client = boto3.client('s3')
    s3_client.download_file(strBucket, strKey, strFile)


    
def lambda_handler(event, context):
    print(event)
    strBucket = 'tagstore-image-store'
    strKey1 = 'yolov3.cfg'
    strKey2 = 'yolov3.weights'
    strKey3 = 'coco.names'
    strFile1 = '/tmp/yolov3.cfg'
    strFile2 = '/tmp/yolov3.weights'
    strFile3 = '/tmp/coco.names'
    downloadFromS3(strBucket,strKey1,strFile1)
    downloadFromS3(strBucket,strKey2,strFile2)
    downloadFromS3(strBucket,strKey3,strFile3)
    net = cv2.dnn.readNet(strFile1, strFile2)
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = unquote_plus(record['s3']['object']['key'])
        print("File {0} uploaded to {1} bucket".format(key, bucket))
        image = s3_client.get_object(Bucket=bucket, Key=key)
        imagecontent = image["Body"].read()
        np_ary = np.fromstring(imagecontent, np.uint8)
        cv_image = cv2.imdecode(np_ary, cv2.IMREAD_COLOR)
        blob = cv2.dnn.blobFromImage(cv_image, 1 / 255, (416, 416), [0, 0, 0], 1, crop=False)
        net.setInput(blob)
        outInfo = net.getUnconnectedOutLayersNames()
        outputs = net.forward(outInfo)
        confidences = []
        class_ids = []
        for output in outputs:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > 0.5:
                    class_ids.append(class_id)
                    confidences.append(float(confidence))
        with open(strFile3, 'rt') as f:
            labels = f.read().rstrip('\n').split('\n')
        results = []
        if len(class_ids) > 0:
            for i in range(len(class_ids)):
                predict_dic = dict()
                predict_dic['label'] = labels[class_ids[i]]
                results.append(predict_dic)
        url = "https://"+bucket+".s3.amazonaws.com/"+key
        print(url)
        table.put_item(
            Item={
                'url': url,
                'tags': " ".join('%s' %id for id in results)
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps('Records successfully inserted into database...')
        }