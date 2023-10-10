import os
import requests
from aws_lambda_powertools import Logger

logger = Logger()

NGSI_ENDPOINT = f"http://{os.environ['NGSI_ENDPOINT']}:1026/v2/entities/"


def handler(event, context):
    """event
        {'DEVICE_NAME': 'sample-device-1', 'TIMESTAMP': '2023-10-03T05:59:02', 'TEMPERATURE': 16, 'HUMIDITY': 49}

    """

    if event["command"] == "init":
        res = delete_sample_entity()
        logger.append_keys(response=res)
        logger.info("Result DELETE Orion API")
        res = post_sample_entity()
        logger.append_keys(response=res)
        logger.info("Result POST Orion API")
    
    return res


def delete_sample_entity():
    """_summary_
        サンプルのエンティティを削除
    """
    # ヘッダー情報
    headers = {
        "Content-Type": "application/json"
    }

    # POSTリクエストを送信
    response = requests.delete(f"{NGSI_ENDPOINT}urn:ngsi-ld:Store:001", headers=headers)

    return response


def post_sample_entity():
    """_summary_
        サンプルのエンティティを登録
    """
    # ヘッダー情報
    headers = {
        "Content-Type": "application/json"
    }

    # 送信するデータ
    data = {
        "id": "urn:ngsi-ld:Store:001",
        "type": "Store",
        "address": {
            "type": "PostalAddress",
            "value": {
                "streetAddress": "Bornholmer Straße 65",
                "addressRegion": "Berlin",
                "addressLocality": "Prenzlauer Berg",
                "postalCode": "10439"
            },
            "metadata": {
                "verified": {
                    "value": True,
                    "type": "Boolean"
                }
            }
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [13.3986, 52.5547]
            }
        },
        "name": {
            "type": "Text",
            "value": "Bösebrücke Einkauf"
        },
        "conditions": {
            "type": "Condition", "value": {
                "humidity": 42,
                "temperature": 25,
                "timestamp": "2023-10-03T06:02:42"
            }
        },
    }

    # POSTリクエストを送信
    response = requests.post(NGSI_ENDPOINT, headers=headers, json=data)

    return response
