import { CfnOutput, Stack, StackProps, CfnResource } from "aws-cdk-lib";
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from "constructs";
import * as ssm from 'aws-cdk-lib/aws-ssm';

// 別途インストール必要
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha'
import * as apigwv2Inte from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import * as apigwv2Auth from '@aws-cdk/aws-apigatewayv2-authorizers-alpha'

export interface APIGWCognitoStackProps extends StackProps {
  apiGatewayCongitoVpc: ec2.Vpc,
  vpcLinkSg: ec2.SecurityGroup
}

export class APIGWCognitoStack extends Stack {
  constructor(scope: Construct, id: string, props: APIGWCognitoStackProps) {
    super(scope, id, props);

    // orion-albのパラメータ取得
    const orionAlbArn = ssm.StringParameter.valueFromLookup(this, 'orion-alb-id');

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

    // VPCリンク作成
    const vpcLink = new apigwv2.VpcLink(this, 'VpcLink', {
      vpcLinkName: 'VpcLink',
      vpc: props.apiGatewayCongitoVpc,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [props.vpcLinkSg]
    });

    // API Gateway (HTTP API)作成
    const httpApi = new apigwv2.HttpApi(this, 'HttpApi');
    // 認証: Cognitoユーザプール
    const authorizer = new apigwv2Auth.HttpUserPoolAuthorizer('Authorizer', pool);
    // ALBのリスナー取得
    const listener = elbv2.ApplicationListener.fromLookup(this, 'ALBListener', {
      // loadBalancerArn: 'arn:aws:elasticloadbalancing:us-east-1:128876387380:loadbalancer/app/orion-alb-private/35c822b3d326de1d',
      loadBalancerArn: orionAlbArn,
      listenerProtocol: elbv2.ApplicationProtocol.HTTP,
      listenerPort: 1026,
    });
    // 統合: VPCリンク(ALB: Internal ALB)
    const albIntegration = new apigwv2Inte.HttpAlbIntegration('AlbIntegration', listener, {
      vpcLink: vpcLink
    })
    // ルート追加
    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [ apigwv2.HttpMethod.ANY ],
      integration: albIntegration,
      authorizer
    });
    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [ apigwv2.HttpMethod.OPTIONS ],
      integration: albIntegration,
    });
  }
}
