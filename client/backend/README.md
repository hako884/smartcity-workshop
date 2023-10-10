# Client バックエンド

## デプロイ手順

### デプロイ実行環境の準備

デプロイを実行する端末には、下記のソフトウェアが必要です。

* AWS CLI
* Node.js 14以上

次に、必要な依存関係をインストールします。以下のコマンドを実行してください。

なお、以下全て、シェルコマンドの初期カレントディレクトリはこの `README.md` が配置されたディレクトリと仮定します。

```sh
# IaCの依存関係をインストール
npm ci

# CDKを ap-northeast-1 リージョンで使えるように初期化する
AWS_REGION=ap-northeast-1 npx cdk bootstrap
```

### バックエンドリソースのデプロイ

1. バックエンドのリソースをデプロイする前に、 Client Credentials Grant に必要なパラメータを Systems Manager Parameter Store に保存します。
このパラメータは、 API を呼び出した際に実行されるLambda関数から取得されます。

    [`put-parameter.sh`](./put-parameter.sh) を開き、必要な値を入力してください。

    ```sh
    CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
    CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    SCOPE=XXXXX/XXXXXX
    COGNITO_ENDPOINT=https://XXXXXXXXXXXX.auth.ap-northeast-1.amazoncognito.com/oauth2/token
    API_ENDPOINT=https://XXXXXXXX.execute-api.ap-northeast-1.amazonaws.com
    .
    .
    .
    ```

    その後、[`put-parameter.sh`](./put-parameter.sh) を実行してください。

    ```sh
    ./put-parameter.sh
    ```

1. バックエンドのリソースを新規にデプロイするためには、下記コマンドを実行します。

    ```sh
    npx cdk deploy BackendStack --require-approval never
    ```

    デプロイ完了後に表示されるStack Outputをメモしておいてください。

    ```shell
    Outputs:
    BackendStack.CognitoUserPoolId = ap-northeast-1_XXXXXXXXX
    BackendStack.CognitoUserPoolWebClientId = XXXXXXXXXXXXXXXXX
    BackendStack.apiGatewayEndpoint8F3C8843 = https://XXXXXXX.execute-api.ap-northeast-1.amazonaws.com/
    ```

1. Cognitoユーザの作成

    - ユーザー名: `demo-user`、パスワード: `cam4PTF.wdg1znw8vnk`のユーザーを作成します。
    - ユーザーの作成をするために、以下のコマンドを実行します。`<user-pool-id>`の箇所は手順1のアウトプットのCognitoのユーザープールIDに置き換えてください。

        ```shell
        aws cognito-idp admin-create-user \
        --user-pool-id "<user-pool-id>" \
        --username "demo-user" \
        --user-attributes Name=email,Value="demo@example.com" Name=email_verified,Value=true \
        --message-action SUPPRESS
        ```

    - ユーザーのパスワードを設定します。

        ```shell
        aws cognito-idp admin-set-user-password \
        --user-pool-id "<user-pool-id>" \
        --username "demo-user" \
        --password 'cam4PTF.wdg1znw8vnk' \
        --permanent
        ```

これでバックエンドのデプロイは完了です。
ここまでできたら[フロントエンドのデプロイ](../frontend/README.md)へ進んでください。
