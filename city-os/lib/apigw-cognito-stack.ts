import { CfnOutput, Stack, StackProps, CfnResource } from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";

// 別途インストール必要
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigwv2Inte from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apigwv2Auth from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";

export interface APIGWCognitoStackProps extends StackProps {
  apiGatewayCongitoVpc: ec2.Vpc; // VPCのオブジェクトを取得
  vpcLinkSg: ec2.SecurityGroup; // VPCリンクのSecurity Gruopを取得
}

export class APIGWCognitoStack extends Stack {
  constructor(scope: Construct, id: string, props: APIGWCognitoStackProps) {
    super(scope, id, props);

    // orion-albのARNを取得
    const orionAlbArn = ssm.StringParameter.valueFromLookup(this, "orion-alb-id");

    // Cognitoユーザープール
    const userPool = new cognito.UserPool(this, "UserPoolCityOS", {
      signInAliases: {
        username: true,
        email: false,
        phone: false,
      },
    });
    // Adminアクセススコープ作成
    const scopeName = "*";
    const fullAccessScope = new cognito.ResourceServerScope({
      scopeName: scopeName,
      scopeDescription: "Full access",
    });
    // リソースサーバー追加(識別子とスコープの設定)
    const resourceServerId = "users";
    userPool.addResourceServer("ResourceServer", {
      identifier: resourceServerId,
      scopes: [fullAccessScope],
    });
    // ドメイン作成
    userPool.addDomain("CognitoDomain", {
      cognitoDomain: {
        domainPrefix: "client-credentials-orion",
      },
    });
    // Cognitoアプリケーションクライアント作成
    const scopeId = `${resourceServerId}/${scopeName}`;
    const AccessClient = userPool.addClient("full-access-client", {
      authFlows: {
        adminUserPassword: true,
        userSrp: true,
      },
      generateSecret: true,
      oAuth: {
        flows: {
          clientCredentials: true,
        },
        scopes: [
          {
            scopeName: scopeId,
          },
        ],
      },
    });

    // VPCリンク作成
    const vpcLink = new apigwv2.VpcLink(this, "VpcLink", {
      vpcLinkName: "VpcLink",
      vpc: props.apiGatewayCongitoVpc,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [props.vpcLinkSg],
    });

    // API Gateway (HTTP API)作成
    const httpApi = new apigwv2.HttpApi(this, "HttpApi");
    // 認証: Cognitoユーザプール
    const authorizer = new apigwv2Auth.HttpUserPoolAuthorizer("Authorizer", userPool, {
      userPoolClients: [AccessClient],
    });
    // ALBのリスナー取得
    const listener = elbv2.ApplicationListener.fromLookup(this, "ALBListener", {
      loadBalancerArn: orionAlbArn,
      listenerProtocol: elbv2.ApplicationProtocol.HTTP,
      listenerPort: 1026,
    });
    // 統合: VPCリンク(ALB: Internal ALB)
    const albIntegration = new apigwv2Inte.HttpAlbIntegration("AlbIntegration", listener, {
      vpcLink: vpcLink,
    });
    // ルート追加
    httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [apigwv2.HttpMethod.ANY],
      integration: albIntegration,
      authorizer,
    });
    httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [apigwv2.HttpMethod.OPTIONS],
      integration: albIntegration,
    });

    new CfnOutput(this, "OrionHttpAPIEndpointUrl", {
      value: httpApi.url!,
    });
  }
}
