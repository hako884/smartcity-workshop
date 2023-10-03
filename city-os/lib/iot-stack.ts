import { CfnOutput, Stack, StackProps, aws_iam, aws_iot, Duration, custom_resources, aws_ec2, aws_ssm, aws_elasticloadbalancingv2 as elbv2 } from "aws-cdk-lib";
import * as iot_alpha from "@aws-cdk/aws-iot-alpha";
import * as iot_actions_alpha from "@aws-cdk/aws-iot-actions-alpha";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { ThingWithCert } from "cdk-iot-core-certificates";
import { Construct } from "constructs";

export interface IoTStackProps extends StackProps {
  vpc: aws_ec2.Vpc;
  iotLambdaSg: aws_ec2.SecurityGroup;
}

export class IoTStack extends Stack {
  constructor(scope: Construct, id: string, props: IoTStackProps) {
    super(scope, id, props);

    const iotLogPolicyStatement = new aws_iam.PolicyStatement({
      resources: [`arn:aws:logs:${props.env!.region}:${props.env!.account}:log-group:AWSIotLogsV2:*`],
      actions: [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:PutMetricFilter",
        "logs:PutRetentionPolicy",
        "iot:GetLoggingOptions",
        "iot:SetLoggingOptions",
        "iot:SetV2LoggingOptions",
        "iot:GetV2LoggingOptions",
        "iot:SetV2LoggingLevel",
        "iot:ListV2LoggingLevels",
        "iot:DeleteV2LoggingLevel",
      ],
    });

    const iotLogPolicy = new aws_iam.Policy(this, "IotLogPolicy", {
      statements: [iotLogPolicyStatement],
    });

    const iotLogRole = new aws_iam.Role(this, "IotLogRole", {
      assumedBy: new aws_iam.ServicePrincipal("iot.amazonaws.com"),
    });

    iotLogRole.attachInlinePolicy(iotLogPolicy);

    const cfnLogging = new aws_iot.CfnLogging(this, "MyCfnLogging", {
      accountId: props.env!.account!,
      defaultLogLevel: "DEBUG",
      roleArn: iotLogRole.roleArn,
    });

    const rootTopicName = "data";
    const sampleThingName = "sample-device-1";

    const { thingArn, certId, certPem, privKey } = new ThingWithCert(this, "ThingWithCert", {
      thingName: sampleThingName,
      saveToParamStore: true,
      paramPrefix: "devices",
    });

    const iotPolicy = new aws_iot.CfnPolicy(this, "IotPolicy", {
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["iot:Connect"],
            Resource: [`arn:aws:iot:${props.env!.region}:${props.env!.account}:client/*`],
          },
          {
            Effect: "Allow",
            Action: ["iot:Publish", "iot:Receive"],
            Resource: [`arn:aws:iot:${props.env!.region}:${props.env!.account}:topic/${rootTopicName}`],
          },
        ],
      },
      policyName: "iot-policy",
    });

    const policyPrincipalAttatchment = new aws_iot.CfnPolicyPrincipalAttachment(this, "AttatchPolicy", {
      policyName: iotPolicy.policyName!,
      principal: `arn:aws:iot:${props.env!.region}:${props.env!.account}:cert/${certId}`,
    });

    const topicRule = new iot_alpha.TopicRule(this, "TopicRule", {
      sql: iot_alpha.IotSql.fromStringAsVer20160323(`SELECT * FROM 'data/#'`),
    });

    const orionAlbId = aws_ssm.StringParameter.valueFromLookup(this, "orion-alb-id");

    const orionAlb = elbv2.ApplicationLoadBalancer.fromLookup(this, "OrionAlb", {
      loadBalancerArn: orionAlbId,
    });

    const putDeviceDataFunction = new PythonFunction(this, "PutRecordHandler", {
      vpc: props.vpc,
      securityGroups: [props.iotLambdaSg],
      runtime: Runtime.PYTHON_3_10,
      entry: "lambda/put-device-data",
      index: "index.py",
      memorySize: 256,
      timeout: Duration.seconds(3),
      environment: {
        NGSI_ENDPOINT: orionAlb.loadBalancerDnsName,
      },
    });

    topicRule.addAction(new iot_actions_alpha.LambdaFunctionAction(putDeviceDataFunction));

    const getIoTEndpoint = new custom_resources.AwsCustomResource(this, "IoTEndpoint", {
      onCreate: {
        service: "Iot",
        action: "describeEndpoint",
        physicalResourceId: custom_resources.PhysicalResourceId.fromResponse("endpointAddress"),
        parameters: {
          endpointType: "iot:Data-ATS",
        },
      },
      policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({ resources: custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE }),
    });

    const iotEndpoint = getIoTEndpoint.getResponseField("endpointAddress");

    new CfnOutput(this, "IoTDevicePrivateKey", {
      value: `https://${props.env!.region}.console.aws.amazon.com/systems-manager/parameters/`,
    });

    new CfnOutput(this, "SampleDeviceName", {
      value: sampleThingName,
    });

    new CfnOutput(this, "IoTEndpointUrl", {
      value: iotEndpoint,
    });
  }
}
