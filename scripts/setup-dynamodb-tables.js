/**
 * DynamoDB Table Setup Script
 * 
 * This script creates the necessary DynamoDB tables for the Dialabraai food ordering app.
 * Run this script once to initialize your DynamoDB tables in AWS.
 * 
 * Prerequisites:
 * 1. AWS CLI configured with proper credentials
 * 2. AWS SDK installed: npm install
 * 3. Set AWS_REGION environment variable
 * 
 * Usage:
 * node scripts/setup-dynamodb-tables.js
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  CreateTableCommand, 
  DescribeTableCommand,
  waitUntilTableExists 
} from '@aws-sdk/client-dynamodb';

const region = process.env.AWS_REGION || 'us-east-1';

const client = new DynamoDBClient({ region });

// Table definitions
const tables = [
  {
    TableName: process.env.DYNAMODB_ORDERS_TABLE || 'dialabraai-orders',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'created_at', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'created_at-index',
        KeySchema: [
          { AttributeName: 'created_at', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST', // On-demand pricing
  },
  {
    TableName: process.env.DYNAMODB_MENU_TABLE || 'dialabraai-menu',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'category', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'category-index',
        KeySchema: [
          { AttributeName: 'category', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.DYNAMODB_USERS_TABLE || 'dialabraai-users',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Partition key (user ID)
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'email-index',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.DYNAMODB_PACKS_TABLE || 'dialabraai-packs',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function tableExists(tableName) {
  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    await client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createTable(tableConfig) {
  const { TableName } = tableConfig;
  
  try {
    console.log(`📋 Checking if table "${TableName}" exists...`);
    
    if (await tableExists(TableName)) {
      console.log(`✅ Table "${TableName}" already exists. Skipping.`);
      return;
    }

    console.log(`🔨 Creating table "${TableName}"...`);
    const command = new CreateTableCommand(tableConfig);
    const response = await client.send(command);
    
    console.log(`⏳ Waiting for table "${TableName}" to be active...`);
    await waitUntilTableExists(
      { client, maxWaitTime: 300 },
      { TableName }
    );
    
    console.log(`✅ Table "${TableName}" created successfully!`);
  } catch (error) {
    console.error(`❌ Error creating table "${TableName}":`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting DynamoDB table setup...\n');
  console.log(`📍 Region: ${region}\n`);

  try {
    for (const tableConfig of tables) {
      await createTable(tableConfig);
      console.log('');
    }

    console.log('🎉 All tables setup complete!\n');
    console.log('📝 Created tables:');
    tables.forEach(t => console.log(`   - ${t.TableName}`));
    console.log('\n💡 Next steps:');
    console.log('   1. Set these environment variables:');
    console.log(`      - AWS_REGION=${region}`);
    console.log('      - AWS_ACCESS_KEY_ID=<your-access-key>');
    console.log('      - AWS_SECRET_ACCESS_KEY=<your-secret-key>');
    tables.forEach(t => {
      const envVarName = t.TableName.replace('dialabraai-', 'DYNAMODB_').replace(/-/g, '_').toUpperCase() + '_TABLE';
      console.log(`      - ${envVarName}=${t.TableName}`);
    });
    console.log('   2. Optionally migrate data from Firestore');
    console.log('   3. Deploy your application\n');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
