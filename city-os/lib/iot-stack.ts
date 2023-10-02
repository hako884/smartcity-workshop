import { CfnOutput, SecretValue, Stack, StackProps, aws_ec2, aws_rds, aws_iot, Duration } from "aws-cdk-lib";
import * as iot_alpha from "@aws-cdk/aws-iot-alpha";
import * as iot_actions_alpha from "@aws-cdk/aws-iot-actions-alpha";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export interface IoTStackProps extends StackProps {}

export class IoTStack extends Stack {
  constructor(scope: Construct, id: string, props: IoTStackProps) {
    super(scope, id, props);

    const rootTopicName = "data/device";

    const cfnThing = new aws_iot.CfnThing(this, "Thing", {
      thingName: "thing",
    });

    const attatchCertificate = new aws_iot.CfnThingPrincipalAttachment(this, "ThingCertificate", {
      principal: "",
      thingName: "thing",
    });

    const iotPolicy = new aws_iot.CfnPolicy(this, "IotPolicy", {
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["iot:Connect"],
            Resource: [`"arn:aws:iot:${props.env!.region}:${props.env!.account}:client/*"`],
          },
          {
            Effect: "Allow",
            Action: ["iot:Publish", "iot:Receive"],
            Resource: [`"arn:aws:iot:${props.env!.region}:${props.env!.account}:topic/${rootTopicName}"`],
          },
        ],
      },
      policyName: "iot-policy",
    });

    const topicRule = new iot_alpha.TopicRule(this, "TopicRule", {
      sql: iot_alpha.IotSql.fromStringAsVer20160323(`SELECT * FROM "${rootTopicName}/*"`),
    });

    const putDeviceDataFunction = new PythonFunction(this, "PutRecordHandler", {
      runtime: Runtime.PYTHON_3_10,
      entry: "lambda/put-device-data",
      index: "index.py",
      memorySize: 256,
      timeout: Duration.seconds(3),
    });

    topicRule.addAction(new iot_actions_alpha.LambdaFunctionAction(putDeviceDataFunction));
  }
}
