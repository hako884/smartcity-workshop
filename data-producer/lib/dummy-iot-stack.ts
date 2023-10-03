import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";

import { Construct } from "constructs";
import { readFileSync } from "fs";

export class DummyIoTStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "DummyIoTVPC", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const cloud9 = ec2.MachineImage.genericLinux({
      "ap-northeast-1": "ami-018bcdd4ad4a0f8c0",
    });

    const userDataScript = readFileSync("./lib/resources/user-data.sh", "utf8");

    const dummyIoTInstance = new ec2.Instance(this, "DummyIoTInstance", {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.XLARGE2),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      machineImage: cloud9,
    });

    dummyIoTInstance.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"));
    dummyIoTInstance.addUserData(userDataScript);

    new CfnOutput(this, "DummyIoTInstanceConsole", {
      value: `https://${props!.env!.region}.console.aws.amazon.com/ec2/home?region=${props!.env!.region}#ConnectToInstance:instanceId=${
        dummyIoTInstance.instanceId
      }`,
    });
  }
}
