import os
import requests
from aws_lambda_powertools import Logger

logger = Logger()

NGSI_ENDPOINT = f"http://{os.environ['NGSI_ENDPOINT']}:1026/v2/entities/"


def handler(event, context):
    """event
        {'DEVICE_NAME': 'sample-device-1', 'TIMESTAMP': '2023-10-03T05:59:02', 'TEMPERATURE': 16, 'HUMIDITY': 49}

    """

    # 情報の更新
    # ヘッダー情報
    headers = {
        "Content-Type": "application/json"
    }

    # 送信するデータ
    data = {
        "conditions": {
            "type": "Condition", 
            "value": {
                "humidity": event["HUMIDITY"],
                "temperature": event["TEMPERATURE"],
                "timestamp": event["TIMESTAMP"]
            }
        },
    }

    res = requests.patch(f"{NGSI_ENDPOINT}urn:ngsi-ld:Store:001/attrs?type=Store", headers=headers, json=data)
    logger.append_keys(response=res)
    logger.info("Result PATCH Orion API")
    return res
