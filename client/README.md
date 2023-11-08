# Client Pythonプログラム

このプロジェクトでは、都市OSに対してリクエストを送信し、データを取得するPythonプログラムを提供します。

このプログラムでは、以下を実行します。
1. 都市OS側から受け取った認証情報を元に Client Credentials Flow を通して認証を行い、アクセストークンを取得します。
1. アクセストークンを含めてOrionに対してリクエストを実行し、データを取得します。

## 実行手順
現在の作業ディレクトリが`smart-city-sample`直下であることを想定しています。

1. ディレクトリをclientへ移動します。
    ```sh
    cd ./client
    ```
1. Pythonプログラムを実行する前に、 Client Credentials Grant に必要なパラメータを Systems Manager Parameter Store に保存します。
このパラメータは、 API を呼び出した際に実行されるLambda関数から取得されます。

    [`put-parameter.sh`](./put-parameter.sh) を開き、必要な値を入力してください。
    ```sh
    CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX # クライアントID
    CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX # クライアントシークレット
    RESOUCE_SERVER_ID=XXXXX # リソースサーバーの識別子
    CUSTOM_SCOPE=XXXX # カスタムスコープ
    SCOPE=$RESOUCE_SERVER_ID/$CUSTOM_SCOPE
    COGNITO_ENDPOINT=https://XXXXXXXXXXXX.auth.ap-northeast-1.amazoncognito.com/oauth2/token # Cognito認証ドメイン
    API_ENDPOINT=https://XXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/ # HTTP API のエンドポイント
    .
    .
    .
    ```

    [Cognitoマネジメントコンソール](https://console.aws.amazon.com/cognito/home)を開き、名前に UserPoolCityOS とあるCognitoユーザプールを選択し、アプリケーションの統合をクリックしてください。これは先ほど [City OS のデプロイ](../city-os/README.md)でデプロイした Cognito ユーザプールです。

    ![Cognito Application Client Overview](./images/cognito-app-client-overview.png)

    次に、以下に注意して [`put-parameter.sh`](./put-parameter.sh) に必要な値を入力してください。

    - `RESOUCE_SERVER_ID`と`CUSTOM_SCOPE`は以下の赤枠の値をそのまま入力、`COGNITO_ENDPOINT` は、Cognitoドメインのうち一意の識別子の部分をXXXXX部に入力してください。
        ![Cognito Application Client](./images/cognito-app-client.png)

    - `CLIENT_ID`と`CLIENT_SECRET`は、アプリケーションクライアント名のリンクをクリックして閲覧することができます。

        ![Cognito Application Client ID and Secrets](./images/cognito-client-id-secrets.png)
    
    - `API_ENDPOINT` は、 FIWARE orion の周辺リソースをデプロイした際に出力された、 `APIGWCognitoStack.OrionHttpAPIEndpointUrl` の値を入力してください。

    その後、[`put-parameter.sh`](./put-parameter.sh) を実行してください。

    ```sh
    sh put-parameter.sh
    ```
1. Pythonプログラムの実行に必要なパッケージをインストールします。
    ```sh
    pip3 install requests==2.31.0
    ```
1. Pythonプログラムを実行します。以下は実行例になります。
    ```sh
    python3 get.py urn:ngsi-ld:Store:001
    ```
1. 以下のような出力が得られると成功です。
    ```json
    {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,Authorization'}, 'body': '{"message": {"id": "urn:ngsi-ld:Store:001", "type": "Store", "address": {"streetAddress": "Bornholmer Stra\\u00dfe 65", "addressRegion": "Berlin", "addressLocality": "Prenzlauer Berg", "postalCode": "10439"}, "conditions": {"humidity": "46", "temperature": "24.4", "timestamp": "2023-10-07T21:13:29"}, "location": {"type": "Point", "coordinates": [13.3986, 52.5547]}, "name": "B\\u00f6sebr\\u00fccke Einkauf"}}'}
    ```