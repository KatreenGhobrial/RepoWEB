import http from 'http';
import https from 'https';

/**
 * Starts a background interval to ping the server itself, keeping it awake on platforms like Render.
 * @param port The port the server is listening on, used as a fallback if RENDER_EXTERNAL_URL is not set.
 */
export const startKeepAlive = (port: number | string) => {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
  const healthUrl = `${url}/api/health`;

  console.log(`[Keep-Alive] Initializing self-ping service to: ${healthUrl}`);

  // Ping every 14 minutes (14 * 60 * 1000 ms)
  const intervalMs = 14 * 60 * 1000;

  const ping = () => {
    console.log(`[Keep-Alive] Sending self-ping to keep server awake: ${healthUrl}...`);

    try {
      const client = healthUrl.startsWith('https') ? https : http;

      client.get(healthUrl, (res) => {
        console.log(`[Keep-Alive] Self-ping response status code: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error(`[Keep-Alive] Self-ping error during request:`, err.message);
      });
    } catch (error: any) {
      console.error(`[Keep-Alive] Failed to execute self-ping:`, error?.message || error);
    }
  };

  // Perform the first ping after 5 seconds to allow the server to complete its startup
  setTimeout(ping, 5000);

  // Set the interval for every 14 minutes
  const intervalId = setInterval(ping, intervalMs);

  return intervalId;
};
