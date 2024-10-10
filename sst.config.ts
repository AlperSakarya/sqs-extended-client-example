/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sqs-extended-client-example",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {

    // Setting up SQS
    const messageQueue = new sst.aws.Queue("messageQueue");

    // Setting up Message Bucket for large payloads
    const largeMessageBucket = new sst.aws.Bucket("largeMessageBucket", {
      public: false,
    });

    // Setting up APIGW
    const api = await setupAPIGW(messageQueue, largeMessageBucket);

    // Print out the URLs and ARNs
    return {
      api: api.url,
      messageQueue: messageQueue.url,
      largeMessageBucket: largeMessageBucket.domain,
    };
  },
});

function setupAPIGW (messageQueue, largeMessageBucket) {
    
    const api = new sst.aws.ApiGatewayV2("sqs-extended-client-example-API");
  
    api.route("POST /standard", {
      handler: "lambda-functions/standard-lambda/index.handler",
      link: [messageQueue],
      NodeJS: {
        install: [
          "aws-sdk/client-sqs", 
          "@aws-lambda-powertools/logger"],
      }
    });
    
    api.route("POST /extended-client", {
      handler: "lambda-functions/extended-client-lambda/index.handler",
      link: [messageQueue,largeMessageBucket],
      NodeJS: {
        install: [
          "aws-sdk/client-sqs",
          "sqs-extended-client",
          "@aws-lambda-powertools/logger"],
      }
    });

    return api;
};

