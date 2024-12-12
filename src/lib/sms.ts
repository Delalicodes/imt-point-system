type SMSParams = {
  to: string;
  message: string;
};

export async function sendSMS({ to, message }: SMSParams) {
  // You'll need to implement this with your preferred SMS provider
  // Example using Twilio:
  /*
  const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
  */
  
  // For now, we'll just log the message
  console.log('SMS would be sent to:', to);
  console.log('Message:', message);
}
