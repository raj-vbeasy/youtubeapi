'use client';

import React, { useState, useEffect } from 'react';
import { FaYoutube, FaGoogle } from 'react-icons/fa';
import { BsClockHistory, BsHandThumbsDown, BsHandThumbsUp, BsHourglass } from 'react-icons/bs';

const YouTubeToSheets = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [googleSheetsId, setGoogleSheetsId] = useState('');
  const [channelId, setChannelId] = useState('');

  // Redirect to Google OAuth authorization endpoint
  const handleAuthorize = () => {
    localStorage.setItem('clientId', clientId);
    localStorage.setItem('clientSecret', clientSecret);
    localStorage.setItem('googleSheetsId', googleSheetsId);
    localStorage.setItem('channelId', channelId);
    window.location.href = '/api/authorize'; // Redirect to authorize route
    setLoading(true);
  };

  // Fetch YouTube stats using the access token
  const fetchStats = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/youtubeStats?accessToken=${accessToken}`);
      const data = await res.json();
      setStats(data);
      await updateSheet(data);
      setStats(data);
      setSuccess(true);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateSheet = async (stats: any) => {
    try {
      const res = await fetch('/api/googleSheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, stats }),
      });

      if (!res.ok) {
        throw new Error('Failed to update sheet');
      }
      setLoading(false);
      console.log('Sheet updated successfully');
    } catch (error) {
      console.error('Error updating sheet:', error);
    }
  };

  // Extract the access token from URL on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  // Fetch stats when access token is available
  useEffect(() => {
    if (accessToken) {
      fetchStats();
    }
  }, [accessToken]);


  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <FaYoutube className="h-14 w-14 text-red-500" />
              <h1 className="text-2xl text-black font-semibold mb-5">YouTube Statistics</h1>
            </div>
            {!success ? (
        <>
          <div className="flex items-center space-x-5">
            <h2 className="text-2xl text-black font-semibold mb-4">Get Channel Statistics and Save in Google Sheets</h2>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Client ID</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 block w-full border-gray-300 text-black rounded-md shadow-sm focus:border-indigo-500 focus:ring-0 focus:outline-none sm:text-sm"
              placeholder="Enter your Google Client ID"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Client Secret</label>
            <input
              type="text"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md text-black shadow-sm focus:border-indigo-500 focus:ring-0 focus:outline-none sm:text-sm"
              placeholder="Enter your Google Client Secret"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Google Sheets ID</label>
            <input
              type="text"
              value={googleSheetsId}
              onChange={(e) => setGoogleSheetsId(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-black focus:border-indigo-500 focus:ring-0 focus:outline-none sm:text-sm"
              placeholder="Enter your Google Sheets ID"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">YouTube Channel ID</label>
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-black focus:border-indigo-500 focus:ring-0 focus:outline-none sm:text-sm"
              placeholder="Enter your YouTube Channel ID"
            />
          </div>
          <button
            onClick={handleAuthorize}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? (
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : (
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaGoogle className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
              </span>
            )}
            {loading ? 'Processing...' : 'Fetch and Push Data'}
          </button>
        </>
      ) : (
              <div className="mt-8">
                <h2 className="text-2xl text-black font-semibold mb-4">Channel Statistics</h2>
                <div className="bg-gray-100 rounded-lg p-6 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <BsClockHistory className="h-8 w-8 text-indigo-600 mr-3" />
                      <div>
                        <p className="text-sm text-black">Watch Hours</p>
                        <p className="text-2xl text-black font-bold">{stats.totalWatchHours}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <BsHourglass className="h-8 w-8 text-indigo-600 mr-3" />
                      <div>
                        <p className="text-sm text-black">Avg View Duration</p>
                        <p className="text-2xl text-black font-bold">{stats.avgViewDuration}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <BsHandThumbsUp className="h-8 w-8 text-indigo-600 mr-3" />
                      <div>
                        <p className="text-sm text-black">Total Likes</p>
                        <p className="text-2xl text-black font-bold">{stats.totalLikes}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <BsHandThumbsDown className="h-8 w-8 text-indigo-600 mr-3" />
                      <div>
                        <p className="text-sm text-black">Total Dislikes</p>
                        <p className="text-2xl text-black font-bold">{stats.totalDislikes}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-green-600 font-semibold">
                    Data successfully fetched and pushed to Google Sheets!
                  </p>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Fetch New Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeToSheets;