import AWS from 'aws-sdk';
import dotenv from 'dotenv';

require('aws-sdk/lib/maintenance_mode_message').suppress = true;

dotenv.config();

const config: AWS.Config = new AWS.Config({
  accessKeyId: process.env.ACCESS_KEY as string,
  secretAccessKey: process.env.SECRET_KEY as string,
  region: process.env.REGION as string,
});

AWS.config = config;

const s3: AWS.S3 = new AWS.S3();

export { s3 };
