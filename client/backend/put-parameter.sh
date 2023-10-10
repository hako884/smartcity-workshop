CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX # クライアントID
CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX # クライアントシークレット
RESOUCE_SERVER_ID=XXXXX # リソースサーバーの識別子
CUSTOM_SCOPE=XXXX # カスタムスコープ
SCOPE=$RESOUCE_SERVER_ID/$CUSTOM_SCOPE
COGNITO_ENDPOINT=https://XXXXXXXXXXXX.auth.ap-northeast-1.amazoncognito.com/oauth2/token # Cognito認証ドメイン
API_ENDPOINT=https://XXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/ # HTTP API のエンドポイント

aws ssm put-parameter --name "CLIENT_ID" --type "SecureString" --value $CLIENT_ID
aws ssm put-parameter --name "CLIENT_SECRET" --type "SecureString" --value $CLIENT_SECRET
aws ssm put-parameter --name "SCOPE" --type "SecureString" --value $SCOPE
aws ssm put-parameter --name "COGNITO_ENDPOINT" --type "SecureString" --value $COGNITO_ENDPOINT
aws ssm put-parameter --name "API_ENDPOINT" --type "SecureString" --value $API_ENDPOINT
