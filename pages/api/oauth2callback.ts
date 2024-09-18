import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_REDIRECT_URI
);

export default async function oauth2callback(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request:', req.url);
  
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    console.log('Exchanging code for access token...');
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    console.log('Tokens received:', tokens);
    res.redirect(`/?access_token=${tokens.access_token}`);
  } catch (error) {
    console.error('Error exchanging code for access token:', error);
    res.status(500).json({ error: 'Error during authentication' });
  }
}
