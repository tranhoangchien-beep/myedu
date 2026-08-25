import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function teraboxResolverPlugin(): Plugin {
  return {
    name: 'terabox-resolver',
    configureServer(server) {
      // Helper function to resolve TeraBox share link metadata & dlink
      async function resolveTeraBoxData(targetUrl: string, token: string) {
        const match = targetUrl.match(/(?:terabox\.com|teraboxapp\.com|1024tera\.com|1024terabox\.com|freeterabox\.com|terasharelink\.com|mirrobox\.com|nephobox\.com)\/s\/(?:1)?([a-zA-Z0-9_-]+)/i);
        const rawId = match ? match[1] : '';
        const shorturl = rawId;
        const cookieHeader = token ? (token.startsWith('ndus=') ? token : `ndus=${token}`) : '';

        // 1. Fetch share page with Cookie to extract jsToken
        let jsToken = '';
        try {
          const pageRes = await fetch(`https://www.terabox.com/sharing/link?surl=${encodeURIComponent(shorturl)}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Cookie': `${cookieHeader || 'lang=en'}`,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          });
          const html = await pageRes.text();
          const tokenMatch = html.match(/fn%28%22([A-F0-9]+)%22%29/i) || html.match(/jsToken%20%3D%20a%7D%3Bfn%28%22([A-F0-9]+)%22%29/i);
          if (tokenMatch) jsToken = tokenMatch[1];
        } catch (e) {
          console.error('jsToken fetch error:', e);
        }

        // 2. Fetch file list with jsToken
        const listUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(shorturl)}&root=1${jsToken ? `&jsToken=${encodeURIComponent(jsToken)}` : ''}`;
        const listRes = await fetch(listUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': `https://www.terabox.com/sharing/link?surl=${encodeURIComponent(shorturl)}`,
            'Cookie': `${cookieHeader || 'lang=en'}`
          }
        });
        const listJson = await listRes.json();

        if (listJson && listJson.errno === 0 && listJson.list && listJson.list.length > 0) {
          const file = listJson.list[0];
          return {
            success: true,
            file,
            dlink: file.dlink,
            filename: file.server_filename,
            size: file.size,
            duration: file.duration,
            thumb: file.thumbs?.url3 || file.thumbs?.url1,
            shareId: listJson.share_id,
            uk: listJson.uk,
            cookieHeader: cookieHeader || 'lang=en'
          };
        }

        return {
          success: false,
          error: listJson?.errmsg || `Lỗi lấy dữ liệu tệp TeraBox (errno: ${listJson?.errno})`
        };
      }

      // Endpoint 1: Bóc tách thông tin & Dlink
      server.middlewares.use('/api/terabox/resolve', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const targetUrl = data.url || '';
            const token = data.token || '';
            if (!targetUrl) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'Thiếu link TeraBox' }));
              return;
            }

            const result = await resolveTeraBoxData(targetUrl, token);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi bóc tách TeraBox' }));
          }
        });
      });

      // Endpoint 2: Truyền luồng Stream Pipe trực tiếp sang Streamtape
      server.middlewares.use('/api/terabox/pipe-to-streamtape', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const targetUrl = data.url || '';
            const token = data.token || '';
            const streamtapeLogin = data.streamtapeLogin || '';
            const streamtapeKey = data.streamtapeKey || '';

            if (!streamtapeLogin || !streamtapeKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Chưa cấu hình API Login & Key của Streamtape' }));
              return;
            }

            // Step 1: Resolve metadata & dlink from TeraBox
            const tbResult = await resolveTeraBoxData(targetUrl, token);
            if (!tbResult.success || !tbResult.dlink) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: tbResult.error || 'Không lấy được Direct Link từ TeraBox' }));
              return;
            }

            // Step 2: Get Streamtape Upload URL
            const ulRes = await fetch(`https://api.streamtape.com/file/ul?login=${encodeURIComponent(streamtapeLogin)}&key=${encodeURIComponent(streamtapeKey)}`);
            const ulJson = await ulRes.json();

            if (!ulJson || ulJson.status !== 200 || !ulJson.result?.url) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Không lấy được Upload URL từ Streamtape: ' + (ulJson?.msg || 'Lỗi API Key') }));
              return;
            }

            const uploadTargetUrl = ulJson.result.url;

            // Step 3: Execute Stream Pipe via curl
            const { exec } = await import('child_process');
            const cmd = `curl -s -L "${tbResult.dlink}" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" -H "Referer: https://www.terabox.com/" -H "Cookie: ${tbResult.cookieHeader}" | curl -s -F "file=@-;filename=${tbResult.filename}" "${uploadTargetUrl}"`;

            exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
              if (error) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Lỗi truyền dữ liệu sang Streamtape: ' + error.message }));
                return;
              }

              try {
                const uploadResult = JSON.parse(stdout || '{}');
                if (uploadResult && uploadResult.status === 200 && uploadResult.result?.id) {
                  const linkId = uploadResult.result.id;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: true,
                    streamtapeUrl: `https://streamtape.com/e/${linkId}?color=16,185,129`,
                    filename: tbResult.filename,
                    duration: tbResult.duration,
                    thumb: tbResult.thumb,
                  }));
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: uploadResult?.msg || 'Streamtape từ chối file tải lên',
                  }));
                }
              } catch (parseErr: any) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Không đọc được phản hồi từ Streamtape: ' + stdout }));
              }
            });
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
