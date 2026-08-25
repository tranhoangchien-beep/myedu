import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function teraboxResolverPlugin(): Plugin {
  return {
    name: 'terabox-resolver',
    configureServer(server) {
      server.middlewares.use('/api/terabox/resolve', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const targetUrl = data.url || '';
            let token = data.token || '';

            if (!targetUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Thiếu đường link TeraBox' }));
              return;
            }

            // Extract shorturl (both with and without leading 1)
            const match = targetUrl.match(/(?:terabox\.com|teraboxapp\.com|1024tera\.com|1024terabox\.com|freeterabox\.com|terasharelink\.com|mirrobox\.com|nephobox\.com)\/s\/(?:1)?([a-zA-Z0-9_-]+)/i);
            const rawId = match ? match[1] : '';
            const shorturlNo1 = rawId;
            const shorturlWith1 = `1${rawId}`;

            // Prepare headers
            const cookieHeader = token 
              ? (token.startsWith('ndus=') ? token : `ndus=${token}`)
              : '';

            // Try first without 1, then with 1
            let apiUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(shorturlNo1)}&root=1`;

            let fetchRes = await fetch(apiUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.terabox.com/',
                'Cookie': cookieHeader || 'lang=en',
              }
            });

            let json = await fetchRes.json();

            if (!json || json.errno !== 0 || !json.list || json.list.length === 0) {
              apiUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(shorturlNo1)}&root=1`;
              fetchRes = await fetch(apiUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                  'Accept': 'application/json, text/plain, */*',
                  'Referer': 'https://www.terabox.com/',
                  'Cookie': 'lang=en',
                }
              });
              json = await fetchRes.json();
            }

            if (!json || json.errno !== 0 || !json.list || json.list.length === 0) {
              apiUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(shorturlWith1)}&root=1`;
              fetchRes = await fetch(apiUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                  'Accept': 'application/json, text/plain, */*',
                  'Referer': 'https://www.terabox.com/',
                  'Cookie': 'lang=en',
                }
              });
              json = await fetchRes.json();
            }

            if (json && json.errno === 0 && json.list && json.list.length > 0) {
              const file = json.list[0];
              const shareId = json.share_id;
              const uk = json.uk;
              const fsId = file.fs_id;

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                dlink: file.dlink || targetUrl,
                filename: file.server_filename,
                size: file.size,
                duration: file.duration,
                thumb: file.thumbs?.url3 || file.thumbs?.url1,
                shareId,
                uk,
                fsId,
              }));
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: json?.errmsg || 'Không thể lấy thông tin tệp từ TeraBox (errno: ' + json?.errno + ')',
                errno: json?.errno,
              }));
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi xử lý bóc tách TeraBox' }));
          }
        });
      });

      // Stream Pipe Relay: TeraBox -> Streamtape Direct Upload
      server.middlewares.use('/api/terabox/pipe-to-streamtape', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const targetUrl = data.url || '';
            const token = data.token || '';
            const streamtapeLogin = data.streamtapeLogin || '';
            const streamtapeKey = data.streamtapeKey || '';
            let fileName = data.fileName || 'video.mp4';

            if (!streamtapeLogin || !streamtapeKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Chưa nhập Streamtape Login & Key trong phần cấu hình' }));
              return;
            }

            // Step 1: Resolve TeraBox metadata & download link
            const match = targetUrl.match(/(?:terabox\.com|teraboxapp\.com|1024tera\.com|1024terabox\.com|freeterabox\.com|terasharelink\.com|mirrobox\.com|nephobox\.com)\/s\/(?:1)?([a-zA-Z0-9_-]+)/i);
            const rawId = match ? match[1] : '';
            const shorturlNo1 = rawId;
            const shorturlWith1 = `1${rawId}`;
            const cookieHeader = token ? (token.startsWith('ndus=') ? token : `ndus=${token}`) : '';

            let apiUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(shorturlNo1)}&root=1`;
            let fetchRes = await fetch(apiUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.terabox.com/',
                'Cookie': cookieHeader || 'lang=en',
              }
            });
            let json = await fetchRes.json();

            if (!json || json.errno !== 0 || !json.list || json.list.length === 0) {
              apiUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(shorturlNo1)}&root=1`;
              fetchRes = await fetch(apiUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                  'Accept': 'application/json, text/plain, */*',
                  'Referer': 'https://www.terabox.com/',
                  'Cookie': 'lang=en',
                }
              });
              json = await fetchRes.json();
            }

            if (!json || json.errno !== 0 || !json.list || json.list.length === 0) {
              apiUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(shorturlWith1)}&root=1`;
              fetchRes = await fetch(apiUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                  'Accept': 'application/json, text/plain, */*',
                  'Referer': 'https://www.terabox.com/',
                  'Cookie': 'lang=en',
                }
              });
              json = await fetchRes.json();
            }

            if (json && json.errno === 0 && json.list && json.list.length > 0) {
              const file = json.list[0];
              fileName = file.server_filename || fileName;

              // Step 2: Get Streamtape Upload URL
              const ulRes = await fetch(`https://api.streamtape.com/file/ul?login=${encodeURIComponent(streamtapeLogin)}&key=${encodeURIComponent(streamtapeKey)}`);
              const ulJson = await ulRes.json();

              if (!ulJson || ulJson.status !== 200 || !ulJson.result?.url) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Không lấy được Upload URL từ Streamtape: ' + (ulJson?.msg || 'Lỗi API Key') }));
                return;
              }

              const uploadTargetUrl = ulJson.result.url;

              // Step 3: Stream download from TeraBox and pipe to Streamtape
              let directDownloadUrl = file.dlink;
              if (!directDownloadUrl && json.share_id && json.uk && file.fs_id) {
                const dlApi = `https://www.terabox.com/share/download?app_id=250528&shareid=${json.share_id}&uk=${json.uk}&fid_list=%5B${file.fs_id}%5D`;
                const dlFetch = await fetch(dlApi, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Referer': 'https://www.terabox.com/',
                    'Cookie': cookieHeader || 'lang=en',
                  }
                });
                const dlJson = await dlFetch.json();
                if (dlJson && dlJson.errno === 0 && dlJson.dlink) {
                  directDownloadUrl = dlJson.dlink;
                }
              }

              // Fallback to direct download URL or remote DL
              if (directDownloadUrl) {
                // Pipe stream directly
                const videoStreamRes = await fetch(directDownloadUrl, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Referer': 'https://www.terabox.com/',
                    'Cookie': cookieHeader || 'lang=en',
                  }
                });

                const arrayBuffer = await videoStreamRes.arrayBuffer();
                const blob = new Blob([arrayBuffer], { type: 'video/mp4' });
                const formData = new FormData();
                formData.append('file', blob, fileName);

                const streamtapeUploadRes = await fetch(uploadTargetUrl, {
                  method: 'POST',
                  body: formData,
                });

                const uploadResultJson = await streamtapeUploadRes.json();

                if (uploadResultJson && uploadResultJson.status === 200 && uploadResultJson.result?.id) {
                  const linkId = uploadResultJson.result.id;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: true,
                    streamtapeUrl: `https://streamtape.com/e/${linkId}?color=16,185,129`,
                    filename: fileName,
                    duration: file.duration,
                    thumb: file.thumbs?.url3 || file.thumbs?.url1,
                  }));
                  return;
                }
              }

              // If direct pipe failed or ndus required, trigger Remote DL with direct URL
              const remotedlUrl = `https://api.streamtape.com/remotedl/add?login=${encodeURIComponent(streamtapeLogin)}&key=${encodeURIComponent(streamtapeKey)}&url=${encodeURIComponent(directDownloadUrl || targetUrl)}&name=${encodeURIComponent(fileName)}`;
              const remoteRes = await fetch(remotedlUrl);
              const remoteJson = await remoteRes.json();

              if (remoteJson && remoteJson.status === 200 && remoteJson.result?.id) {
                const linkId = remoteJson.result.id;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  streamtapeUrl: `https://streamtape.com/e/${linkId}?color=16,185,129`,
                  filename: fileName,
                  duration: file.duration,
                  thumb: file.thumbs?.url3 || file.thumbs?.url1,
                }));
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: remoteJson?.msg || 'Streamtape không thể nhận tệp này',
                }));
              }
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: json?.errmsg || 'Không thể lấy thông tin tệp từ TeraBox (errno: ' + json?.errno + ')',
              }));
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi truyền luồng Stream Pipe' }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), teraboxResolverPlugin()],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore'],
          'vendor-icons': ['lucide-react'],
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noai, noimageai',
      'Referrer-Policy': 'no-referrer'
    }
  },
  preview: {
    port: 4173,
    host: true,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noai, noimageai',
      'Referrer-Policy': 'no-referrer'
    }
  }
});
