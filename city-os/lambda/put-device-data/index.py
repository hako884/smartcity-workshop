import boto3
import os
import requests

NGSI_ENDPOINT = os.environ['NGSI_ENDPOINT']

def handler(event, context):
    print(event)
    pass
    # fiware on awsのAPIを叩くロジックを書く
