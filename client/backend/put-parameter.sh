CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SCOPE=XXXXX/XXXXXX
COGNITO_ENDPOINT=https://XXXXXXXXXXXX.auth.ap-northeast-1.amazoncognito.com/oauth2/token
API_ENDPOINT=https://XXXXXXXX.execute-api.ap-northeast-1.amazonaws.com

aws ssm put-parameter --name "CLIENT_ID" --type "SecureString" --value $CLIENT_ID
aws ssm put-parameter --name "CLIENT_SECRET" --type "SecureString" --value $CLIENT_SECRET
aws ssm put-parameter --name "SCOPE" --type "SecureString" --value $SCOPE
aws ssm put-parameter --name "COGNITO_ENDPOINT" --type "SecureString" --value $COGNITO_ENDPOINT
aws ssm put-parameter --name "API_ENDPOINT" --type "SecureString" --value $API_ENDPOINT

# aws ssm get-parameters --name "CLIENT_ID" --with-decryption
# aws ssm get-parameters --name "CLIENT_SECRET" --with-decryption
# aws ssm get-parameters --name "SCOPE" --with-decryption
# aws ssm get-parameters --name "COGNITO_ENDPOINT" --with-decryption
# aws ssm get-parameters --name "API_ENDPOINT" --with-decryption