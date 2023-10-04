import boto3
import os
import requests

NGSI_ENDPOINT = f"http://{os.environ['NGSI_ENDPOINT']}/v2/entities/urn:ngsi-ld:Store"

def handler(event, context):
    print(event)
    pass
    # fiware on awsのAPIを叩くロジックを書く
