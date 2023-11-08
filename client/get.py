import requests
import base64
import boto3
import sys

args = sys.argv
if len(args) < 2:
    print('usage: python3 get.py <entity id>')
    sys.exit(1)

def get_parameters(param_key):
    ssm = boto3.client('ssm')
    response = ssm.get_parameters(
        Names=[
            param_key,
        ],
        WithDecryption=True
    )
    return response['Parameters'][0]['Value']

CLIENT_ID = get_parameters('CLIENT_ID')
CLIENT_SECRET = get_parameters('CLIENT_SECRET')
SCOPE = get_parameters('SCOPE')
COGNITO_ENDPOINT = get_parameters('COGNITO_ENDPOINT')
API_ENDPOINT = get_parameters('API_ENDPOINT')

base64_encoded_secret = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()

grant_type = "client_credentials"

headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": f"Basic {base64_encoded_secret}"
}

params = {
    "grant_type": grant_type,
    "scope": SCOPE
}

r = requests.post(url=f"{COGNITO_ENDPOINT}", data=params, headers=headers)

res_auth = r.json()
access_token = res_auth["access_token"]

store_id = args[1]
r = requests.get(url=f"{API_ENDPOINT}v2/entities/{store_id}/", headers={"Authorization": access_token}, params={'options': 'keyValues'})

res_req = r.json()

print(' store name: ' + str(res_req['name']))
print('   humidity: ' + str(res_req['conditions']['humidity']))
print('temperature: ' + str(res_req['conditions']['temperature']))