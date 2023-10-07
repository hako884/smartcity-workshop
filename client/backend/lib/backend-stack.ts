import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda as  lambda } from 'aws-cdk-lib';
import { aws_lambda_nodejs as lambdaNode } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_cloudfront as cloudfront } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_cognito as cognito } from 'aws-cdk-lib';
import { aws_s3_deployment as s3Deployment } from 'aws-cdk-lib';
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import * as path from "path";

import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // Cognitoユーザープール
    const pool = new cognito.UserPool(this, "UserPool", {
      signInAliases: {
        username: true,
        email: false,
        phone: false
      }
    });
    const AccessClient = pool.addClient("full-access-client", {
      authFlows: {
        adminUserPassword: true,
        userSrp: true,
      },
      generateSecret: false,
      oAuth: {
        flows: {
          authorizationCodeGrant: true
        }
      }
    });
  
    // APIハンドラ作成
    const apiDefaultHandler = new lambdaNode.NodejsFunction(
      this,
      "apiDefaultHandler",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "handler",
        entry: path.join(__dirname, "../api/default/index.ts"),
        memorySize: 1024,
      }
    );
    // const apiHelloGetHandler = new lambdaNode.NodejsFunction(
    //   this,
    //   "apiHelloGetHandler",
    //   {
    //     runtime: lambda.Runtime.NODEJS_18_X,
    //     handler: "handler",
    //     entry: path.join(__dirname, "../api/hello/index.ts"),
    //     memorySize: 1024,
    //   }
    // );
    const apiHelloGetHandler = new PythonFunction(this, 'apiHelloGetHandler', {
      runtime: lambda.Runtime.PYTHON_3_11,
      entry: path.join(__dirname, "../api/hello"),
      handler: 'handler',
      memorySize: 1024,
    });
    const apiGateway = new apigw.LambdaRestApi(this, "apiGateway", {
      handler: apiDefaultHandler,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
    });
    

    const auth = new apigw.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [pool]
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

  }
}