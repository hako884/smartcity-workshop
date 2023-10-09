import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda as  lambda } from 'aws-cdk-lib';
import { aws_lambda_nodejs as lambdaNode } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_cognito as cognito } from 'aws-cdk-lib';
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import * as path from "path";

import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // Cognitoユーザープール
    const userPool = new cognito.UserPool(this, "UserPoolClient", {
      signInAliases: {
        username: true,
        email: false,
        phone: false
      }
    });
    // Cognitoアプリケーションクライアント
    const AccessClient = userPool.addClient("frontend-client", {
      authFlows: {
        adminUserPassword: true,
        userSrp: true,
      },
      generateSecret: false,
    });

    // ポリシー作成
    const myParameterStorePolicy = new iam.PolicyDocument({
      statements: [new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ssm:GetParameters',
          'kms:Decrypt',
        ],
        resources: ['*'],
      })],
    });
    // Lambda実行ロール作成
    const executionLambdaRole = new iam.Role(
      this,
      'OrionLambdaExecutionRole',
      {
        roleName: 'orion-lambda-execution-role',
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        inlinePolicies: {'myParameterStorePolicy': myParameterStorePolicy},
      }
    );

    // APIハンドラ作成
    const apiDefaultHandler = new lambdaNode.NodejsFunction(this, "apiDefaultHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(__dirname, "../api/default/index.ts"),
      memorySize: 1024,
    });
    const apiHelloGetHandler = new PythonFunction(this, 'apiHelloGetHandler', {
      runtime: lambda.Runtime.PYTHON_3_11,
      entry: path.join(__dirname, "../api/hello"),
      handler: 'handler',
      memorySize: 1024,
      role: executionLambdaRole,
    });
    // API 作成
    const apiGateway = new apigw.LambdaRestApi(this, "apiGateway", {
      handler: apiDefaultHandler,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
    });
    // API Authorizer作成
    const auth = new apigw.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool]
    });
    
    // /api
    const apiRoute = apiGateway.root.addResource("api")

    // /api/hello
    const apiHelloRoute = apiRoute.addResource("hello");
    // GET
    apiHelloRoute.addMethod("GET", new apigw.LambdaIntegration(apiHelloGetHandler),{
      authorizer: auth,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    new CfnOutput(this, "CognitoUserPoolId", {
      value: userPool.userPoolId,
      description: "userPoolId for frontend settings",
    });

    new CfnOutput(this, "CognitoUserPoolWebClientId", {
      value: AccessClient.userPoolClientId,
      description: "clientId for frontend settings",
    });
  }
}