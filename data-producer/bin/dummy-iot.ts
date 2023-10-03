#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DummyIoTStack } from "../lib/dummy-iot-stack";

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION,
};
new DummyIoTStack(app, "DummyIoTStack", { env });
