import requests
import base64
import json
import boto3

def get_parameters(param_key):
    ssm = boto3.client('ssm')
    response = ssm.get_parameters(
        Names=[
            param_key,
        ],
        WithDecryption=True
    )
    # print(response['Parameters'][0]['Value'])
    return response['Parameters'][0]['Value']

CLIENT_ID = get_parameters('CLIENT_ID')
CLIENT_SECRET = get_parameters('CLIENT_SECRET')
SCOPE = get_parameters('SCOPE')
COGNITO_ENDPOINT = get_parameters('COGNITO_ENDPOINT')
API_ENDPOINT = get_parameters('API_ENDPOINT')

base64_encoded_secret = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
# print(base64_encoded_secret)

grant_type = "client_credentials"

headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": f"Basic {base64_encoded_secret}"
}

params = {
    "grant_type": grant_type,
    "scope": SCOPE
}

def handler(event, context):
    # Client Credentials Grant で アクセストークンを取得
    r = requests.post(url=f"{COGNITO_ENDPOINT}", data=params, headers=headers)

    res = r.json()
    access_token = res["access_token"]
    # print(access_token)

    # 入手したアクセストークンを利用してAPIを叩く
    store_id = 'urn:ngsi-ld:Store:001'
    r = requests.get(url=f"{API_ENDPOINT}v2/entities/{store_id}/", headers={"Authorization": access_token}, params={'options': 'keyValues'})

    response_body = { 'message': r.json() }
    response = {
        'statusCode': 200,
        'headers': {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        'body': json.dumps(response_body),
    }
    # print(response)
    return response

if __name__ == '__main__':
    handler('test','test')