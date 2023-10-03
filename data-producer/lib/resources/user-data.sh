#!/bin/bash

# 参考: https://catalog.us-east-1.prod.workshops.aws/workshops/b3e0b830-79b8-4c1d-8a4c-e10406600035/ja-JP/phase2/step1
# AWS IoT Device SDK Python v2 をインストール
pip3 install --user awsiotsdk

# フォルダの作成と移動
mkdir -p /home/ec2-user/environment/dummy_client/certs/
cd /home/ec2-user/environment/dummy_client/

# ダミーデバイスとなるソースコードをダウンロード
wget https://awsj-iot-handson.s3-ap-northeast-1.amazonaws.com/aws-iot-core-workshop/dummy_client/device_main.py -O device_main.py

# ルートCA証明書のダウンロード
cd /home/ec2-user/environment/dummy_client
wget https://www.amazontrust.com/repository/AmazonRootCA1.pem -O certs/AmazonRootCA1.pem

# ec2-user へ権限付与
chown -R ec2-user home/ec2-user/environment/dummy_client/