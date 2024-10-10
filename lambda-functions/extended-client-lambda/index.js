import { Resource } from "sst";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import SqsExtendedClient from "sqs-extended-client"; // Import the extended SQS client
import { Logger } from '@aws-lambda-powertools/logger';

const sqsClient = new SQSClient({ region: "us-east-1" });
const logger = new Logger({ serviceName: 'SQS-Extended-Client' });

// Initialize the SQS Extended Client with support for large payloads
const sqsExtendedClient = new SqsExtendedClient({
    bucketName: Resource.largeMessageBucket.name,
    useLegacyAttributeName: false,
  });

export const handler = async (event) => {
  const queueUrl = Resource.messageQueue.url;
  logger.info('Received event', { event });
  logger.info('Queue URL', { queueUrl });
  logger.info('Bucket Name', { bucketName: Resource.largeMessageBucket.name });

  // Check if the event is an object and stringify it if necessary
  const messageBody = typeof event === "object" ? JSON.stringify(event) : event;
  logger.info('Message Body', { messageBody });

  const params = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  };

  try {
    // Send the message using the SQS extended client for large payload support
    const data = await sqsExtendedClient.sendMessage(params);
    logger.info('Message sent', { MessageId: data.MessageId });

    return {
      statusCode: 200,
      body: JSON.stringify(`Message sent with ID: ${data.MessageId}`),
    };
  } catch (error) {
    console.error(`Error sending message to SQS queue: ${error}`);
    throw error;
  }
};
