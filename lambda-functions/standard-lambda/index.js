import { Resource } from "sst";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'standard-lambda' });
const sqsClient = new SQSClient({ region: "us-east-1" });

export const handler = async (event) => {
  const queueUrl = Resource.messageQueue.url;
  logger.info('Received event', { event });
  logger.info('Queue URL', { queueUrl });

  // Check if the event is an object and stringify it if necessary
  const messageBody = typeof event === "object" ? JSON.stringify(event) : event;
  logger.info('Message Body', { messageBody });

  const params = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  };

  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
    logger.info('Message sent', { MessageId:data.MessageId });
    
    return {
      statusCode: 200,
      body: JSON.stringify(`Message sent with ID: ${data.MessageId}`),
    };
  } catch (error) {
    logger.error('Error sending message', { error });
    throw error;
  }
};
