import twilio from 'twilio';

export const twilioClient = twilio(
  process.env.TWILIO_API_KEY!,
  process.env.TWILIO_API_SECRET!,
  {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
  }
);

const AccessToken = twilio.jwt.AccessToken; //access token is used to authenticate the user
const VideoGrant = AccessToken.VideoGrant; //video grant is used to grant access to the video
export { AccessToken, VideoGrant }; //export the access token and video grant
