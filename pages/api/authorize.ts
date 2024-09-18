import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_REDIRECT_URI // Redirect URI
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Request offline access to get a refresh token
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/yt-analytics.readonly"
    ],
  });
  res.redirect(authUrl);
}
