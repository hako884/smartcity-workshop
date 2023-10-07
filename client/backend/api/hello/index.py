import requests
import base64
import json

CLIENT_ID = "2u23u99dp2kp1q5fnths7r16ol"
CLIENT_SECRET = "189u3dtt7sdodmsjdj03a88mos5pb3de3v4ca981es8rpl9mh1g9"
DOMAIN_NAME="client-credentials"

grant_type = "client_credentials"
scope = "test_resource/test"

# Client Credentials Grant で アクセストークンを取得
COGNITO_ENDPOINT = f"https://client-credentials.auth.ap-northeast-1.amazoncognito.com/oauth2/token"
base64_encoded_secret = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
# print(base64_encoded_secret)

headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": f"Basic {base64_encoded_secret}"
}

params = {
    "grant_type": grant_type,
    "scope": scope
}

def handler(event, context):
    r = requests.post(url=COGNITO_ENDPOINT, data=params, headers=headers)

    res = r.json()
    access_token = res["access_token"]
    # print(access_token)

    # 入手したアクセストークンを利用してAPIを叩く
    API_ENDPOINT = "https://w63e5x5xlf.execute-api.ap-northeast-1.amazonaws.com"
    storeId = 'urn:ngsi-ld:Store:001'
    r = requests.get(url=f"{API_ENDPOINT}/v2/entities/"+storeId+"/", headers={"Authorization": access_token}, params={'options': 'keyValues'})

    responseBody = { 'message': r.json() }
    response = {
        'statusCode': 200,
        'headers': {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        'body': json.dumps(responseBody),
    }
    print(response)
    return response

if __name__ == '__main__':
    handler('test','test')