CLIENT_ID=4h7eiosjait8k8kt225q5jfglm # クライアントID
CLIENT_SECRET=9meitp75fr64acnum5kg8snlljclecj796nsimiuubpkhhqljqc # クライアントシークレット
RESOUCE_SERVER_ID=users # リソースサーバーの識別子
CUSTOM_SCOPE=* # カスタムスコープ
SCOPE=$RESOUCE_SERVER_ID/$CUSTOM_SCOPE
COGNITO_ENDPOINT=https://client-credentials-orion-95pe1b2imeo.auth.ap-northeast-1.amazoncognito.com/oauth2/token # Cognito認証ドメイン
API_ENDPOINT=https://r7vdusmled.execute-api.ap-northeast-1.amazonaws.com/ # HTTP API のエンドポイント

aws ssm put-parameter --name "CLIENT_ID" --type "SecureString" --value $CLIENT_ID
aws ssm put-parameter --name "CLIENT_SECRET" --type "SecureString" --value $CLIENT_SECRET
aws ssm put-parameter --name "SCOPE" --type "SecureString" --value $SCOPE
aws ssm put-parameter --name "COGNITO_ENDPOINT" --type "SecureString" --value $COGNITO_ENDPOINT
aws ssm put-parameter --name "API_ENDPOINT" --type "SecureString" --value $API_ENDPOINT
