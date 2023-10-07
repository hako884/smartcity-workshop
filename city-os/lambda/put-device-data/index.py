import os
import requests
from aws_lambda_powertools import Logger

logger = Logger()

NGSI_ENDPOINT = f"http://{os.environ['NGSI_ENDPOINT']}:1026/v2/entities/"


def handler(event, context):
    """event
        {'DEVICE_NAME': 'sample-device-1', 'TIMESTAMP': '2023-10-03T05:59:02', 'TEMPERATURE': 16, 'HUMIDITY': 49}

    """

    res = post_sample_entity()
    logger.append_keys(response=res)
    logger.info("Result PUT Orion API")

    # 情報の更新
    # ヘッダー情報
    headers = {
        "Content-Type": "application/json"
    }

    # 送信するデータ
    data = {
        "conditions": {
            "type": "Condition", "value": {
                "humidity": event["HUMIDITY"],
                "temperature": event["TEMPERATURE"],
                "timestamp": event["TIMESTAMP"]
            }
        },
    }

    response = requests.patch(f"{NGSI_ENDPOINT}/urn:ngsi-ld:Store:001", headers=headers, json=data)

    return response.json()


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
        }
    }

    # POSTリクエストを送信
    response = requests.post(NGSI_ENDPOINT, headers=headers, json=data)

    return response.json()
