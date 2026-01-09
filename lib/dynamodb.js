import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Table names
export const TABLES = {
  ORDERS: process.env.DYNAMODB_ORDERS_TABLE || 'dialabraai-orders',
  MENU: process.env.DYNAMODB_MENU_TABLE || 'dialabraai-menu',
  USERS: process.env.DYNAMODB_USERS_TABLE || 'dialabraai-users',
  PACKS: process.env.DYNAMODB_PACKS_TABLE || 'dialabraai-packs',
};

// Initialize DynamoDB client
let dynamoClient = null;
let docClient = null;

const isConfigured = 
  process.env.AWS_REGION && 
  (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_EXECUTION_ENV); // AWS_EXECUTION_ENV exists in Lambda

if (isConfigured) {
  try {
    dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
      // Credentials are automatically picked up from:
      // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
      // 2. IAM role (if running in Lambda/EC2/ECS)
      // 3. AWS credentials file
      ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      })
    });

    docClient = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true, // Remove undefined values
        convertEmptyValues: false,
      },
      unmarshallOptions: {
        wrapNumbers: false, // Return numbers as native JS numbers
      },
    });

    console.log('✅ DynamoDB client initialized');
  } catch (error) {
    console.error('❌ DynamoDB initialization failed:', error.message);
  }
} else {
  console.warn('⚠️  DynamoDB not configured. Set AWS_REGION and credentials.');
}

export { docClient };

// Helper functions for common operations

/**
 * Create a new item in a table
 */
export async function createItem(tableName, item) {
  if (!docClient) throw new Error('DynamoDB not configured');
  
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });
  
  await docClient.send(command);
  return item;
}

/**
 * Get an item by primary key
 */
export async function getItem(tableName, key) {
  if (!docClient) throw new Error('DynamoDB not configured');
  
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });
  
  const response = await docClient.send(command);
  return response.Item || null;
}

/**
 * Update an item
 */
export async function updateItem(tableName, key, updates) {
  if (!docClient) throw new Error('DynamoDB not configured');
  
  // Build update expression dynamically
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  
  Object.keys(updates).forEach((field, index) => {
    const placeholder = `#field${index}`;
    const valuePlaceholder = `:value${index}`;
    updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
    expressionAttributeNames[placeholder] = field;
    expressionAttributeValues[valuePlaceholder] = updates[field];
  });
  
  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });
  
  const response = await docClient.send(command);
  return response.Attributes;
}

/**
 * Delete an item
 */
export async function deleteItem(tableName, key) {
  if (!docClient) throw new Error('DynamoDB not configured');
  
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  });
  
  await docClient.send(command);
}

/**
 * Scan entire table (use with caution for large tables)
 */
export async function scanTable(tableName, filterExpression = null, expressionAttributeValues = null) {
  if (!docClient) throw new Error('DynamoDB not configured');
  
  const params = {
    TableName: tableName,
  };
  
  if (filterExpression) {
    params.FilterExpression = filterExpression;
    params.ExpressionAttributeValues = expressionAttributeValues;
  }
  
  const command = new ScanCommand(params);
  const response = await docClient.send(command);
  return response.Items || [];
}

/**
 * Query items with a specific partition key
 */
export async function queryItems(tableName, keyConditionExpression, expressionAttributeValues, indexName = null) {
  if (!docClient) throw new Error('DynamoDB not configured');
  
  const params = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  
  if (indexName) {
    params.IndexName = indexName;
  }
  
  const command = new QueryCommand(params);
  const response = await docClient.send(command);
  return response.Items || [];
}

/**
 * Generate a unique ID (similar to Firestore's auto-generated IDs)
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current ISO timestamp
 */
export function getTimestamp() {
  return new Date().toISOString();
}
