CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RESOUCE_SERVER_ID=XXXXX
CUSTOM_SCOPE=XXXX
SCOPE=$RESOUCE_SERVER_ID/$CUSTOM_SCOPE
COGNITO_ENDPOINT=https://XXXXXXXXXXXX.auth.ap-northeast-1.amazoncognito.com/oauth2/token
API_ENDPOINT=https://XXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/

aws ssm put-parameter --name "CLIENT_ID" --type "SecureString" --value $CLIENT_ID
aws ssm put-parameter --name "CLIENT_SECRET" --type "SecureString" --value $CLIENT_SECRET
aws ssm put-parameter --name "SCOPE" --type "SecureString" --value $SCOPE
aws ssm put-parameter --name "COGNITO_ENDPOINT" --type "SecureString" --value $COGNITO_ENDPOINT
aws ssm put-parameter --name "API_ENDPOINT" --type "SecureString" --value $API_ENDPOINT
