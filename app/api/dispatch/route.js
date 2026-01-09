import { NextResponse } from 'next/server';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

/**
 * HYBRID DELIVERY MODE API
 * 
 * This API intelligently switches between:
 * - REAL MODE: Sends actual emails via AWS SES when credentials are present
 * - SIMULATION MODE: Logs to console when AWS credentials are missing
 * 
 * This allows seamless development → production workflow!
 */

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { secretKey, to, subject, body: emailBody, orderId } = body;

    // ============================================
    // STEP 1: SECURITY CHECK
    // ============================================
    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
    
    if (!INTERNAL_API_KEY) {
      console.error('⚠️ INTERNAL_API_KEY not configured in environment');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (secretKey !== INTERNAL_API_KEY) {
      console.warn('🚫 Unauthorized dispatch attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ============================================
    // STEP 2: CHECK FOR AWS CREDENTIALS
    // ============================================
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
    const AWS_SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || 'noreply@dialabraai.com';

    const hasAwsCredentials = Boolean(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);

    // ============================================
    // STEP 3A: REAL MODE - Send via AWS SES
    // ============================================
    if (hasAwsCredentials) {
      try {
        console.log('📧 REAL MODE: Sending email via AWS SES...');
        
        // Initialize SES Client
        const sesClient = new SESClient({
          region: AWS_REGION,
          credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
          },
        });

        // Prepare email command
        const command = new SendEmailCommand({
          Source: AWS_SES_FROM_EMAIL,
          Destination: {
            ToAddresses: [to],
          },
          Message: {
            Subject: {
              Data: subject,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: emailBody,
                Charset: 'UTF-8',
              },
            },
          },
        });

        // Send email
        const result = await sesClient.send(command);
        
        console.log('✅ Email sent successfully!', {
          messageId: result.MessageId,
          to,
          subject,
          orderId,
        });

        return NextResponse.json({
          status: 'sent',
          provider: 'aws-ses',
          id: result.MessageId,
          timestamp: new Date().toISOString(),
        });

      } catch (awsError) {
        console.error('❌ AWS SES Error:', awsError);
        return NextResponse.json(
          { 
            error: 'Email delivery failed', 
            details: awsError.message,
            provider: 'aws-ses' 
          },
          { status: 500 }
        );
      }
    }

    // ============================================
    // STEP 3B: SIMULATION MODE - Console Log
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('📮 SIMULATION MODE: Email would be sent');
    console.log('='.repeat(60));
    console.log('From:', AWS_SES_FROM_EMAIL);
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Order ID:', orderId || 'N/A');
    console.log('-'.repeat(60));
    console.log('Body Preview:');
    console.log(emailBody.substring(0, 200) + '...');
    console.log('='.repeat(60) + '\n');

    // Simulate network delay (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('✅ Simulation complete! Mock ID:', mockId);

    return NextResponse.json({
      status: 'simulated',
      provider: 'console-log',
      id: mockId,
      timestamp: new Date().toISOString(),
      note: 'Add AWS credentials to .env to enable real email delivery',
    });

  } catch (error) {
    console.error('💥 Dispatch API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
