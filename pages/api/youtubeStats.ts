import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { accessToken } = req.query;

  if (typeof accessToken !== "string") {
    return res.status(400).json({ error: "Invalid access token" });
  }

  const youtube = google.youtube("v3");
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_REDIRECT_URI // Ensure this matches your redirect URI
  );

  oauth2Client.setCredentials({ access_token: accessToken });
  const youtubeAnalytics = google.youtubeAnalytics({
    version: "v2",
    auth: oauth2Client,
  });
  const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
  const fetchAnalyticsData = async () => {
    try {
      const response = await youtubeAnalytics.reports.query({
        ids: "channel==MINE", // Replace 'MINE' with your actual channel ID
        startDate: "2000-01-01",
        endDate: new Date().toISOString().split("T")[0],
        metrics:
          "views,estimatedMinutesWatched,averageViewDuration,likes,dislikes",
        dimensions: "day",
        sort: "day",
      });

      const analyticsData = response.data;
      console.log("YouTube Analytics Data:", analyticsData);

      // Check if the API returned rows
      if (
        analyticsData &&
        analyticsData.rows &&
        analyticsData.rows.length > 0
      ) {
        let totalViews = 0;
        let totalWatchMinutes = 0;
        let totalViewDurationSeconds = 0;
        let totalLikes = 0;
        let totalDislikes = 0;

        // Iterate over the rows to accumulate data for each metric
        analyticsData.rows.forEach((row: any[]) => {
          const views = row[1] || 0; // Views
          const watchMinutes = row[2] || 0; // Estimated minutes watched
          const viewDuration = row[3] || 0; // Average view duration (in seconds)
          const likes = row[4] || 0; // Likes
          const dislikes = row[5] || 0; // Dislikes

          totalViews += views;
          totalWatchMinutes += watchMinutes;
          totalViewDurationSeconds += viewDuration;
          totalLikes += likes;
          totalDislikes += dislikes;
        });
        console.log(totalWatchMinutes, "watchmin");
        // Convert watch minutes to hours
        const totalWatchHours = totalWatchMinutes / 60;
        // Calculate average view duration across all days
        const avgViewDuration =
          totalViewDurationSeconds / analyticsData.rows.length;

        // Log the results
        console.log("Total Views:", totalViews);
        console.log("Total Watch Hours:", totalWatchHours.toFixed(2));
        console.log(
          "Average View Duration (seconds):",
          avgViewDuration.toFixed(2)
        );
        console.log("Total Likes:", totalLikes);
        console.log("Total Dislikes:", totalDislikes);
        return {
          totalViews: totalViews,
          totalWatchHours: totalWatchHours.toFixed(2),
          avgViewDuration: avgViewDuration.toFixed(2),
          totalLikes: totalLikes,
          totalDislikes: totalDislikes,
        };
      } else {
        console.log("No data returned from YouTube Analytics.");
      }
    } catch (error) {
      console.error("Error fetching YouTube Analytics data:", error);
    }
  };

  // Function to get the list of videos
  async function getVideoList(auth: any) {
    try {
      const response = await youtube.search.list({
        part: ["snippet"],
        channelId: "UC21qxXsY0bb3jUDPoDBL7Kw", // Replace with your channel ID
        maxResults: 50, // Adjust as needed
        order: "date", // Order by date or any other criteria
        auth: auth,
      });

      return response.data.items;
    } catch (error) {
      console.error("Error fetching video list:", error);
      throw new Error("Failed to fetch video list");
    }
  }

  // Function to get likes and views for a video
  async function getVideoStats(auth: any, videoIds: string[]) {
    try {
      const response = await youtube.videos.list({
        part: ["statistics"],
        id: [videoIds.join(",")], // Join video IDs with comma
        auth: auth,
      });
      const items = response.data.items || [];

      // Aggregate views and likes
      const totalStats = items.reduce(
        (acc, item) => {
          acc.totalViews += parseInt(item.statistics?.viewCount || "0", 10);
          acc.totalLikes += parseInt(item.statistics?.likeCount || "0", 10);
          return acc;
        },
        { totalViews: 0, totalLikes: 0 }
      );

      return totalStats;
    } catch (error) {
      console.error("Error fetching video stats:", error);
      throw new Error("Failed to fetch video stats");
    }
  }

  try {
    // Fetch the list of videos
    const videoList = await getVideoList(oauth2Client);
    if (!videoList || videoList.length === 0) {
      return res.status(404).json({ error: "No videos found" });
    }

    // Extract video IDs
    const videoIds = videoList
      .map((video: any) => video.id.videoId)
      .filter((id: string) => id);

    if (videoIds.length === 0) {
      return res.status(404).json({ error: "No valid video IDs found" });
    }

    // Fetch stats for each video
    const videoStats = await fetchAnalyticsData();
    res.status(200).json(videoStats);
  } catch (error) {
    console.error("Error fetching YouTube stats:", error);
    res.status(500).json({ error: "Failed to fetch YouTube stats" });
  }
}
