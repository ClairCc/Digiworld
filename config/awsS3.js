const aws = require('aws-sdk');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
    path: path.resolve(__dirname, '../development.env')
});

const spacesEndpoint = new aws.Endpoint(process.env.S3_ENDPOINT);

const s3 = new aws.S3({
    endpoint: spacesEndpoint
});

const bucket = process.env.BUCKET_NAME;

module.exports = {bucket, s3};