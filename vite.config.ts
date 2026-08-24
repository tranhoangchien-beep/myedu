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

            // Extract shorturl
            const match = targetUrl.match(/(?:terabox\.com|teraboxapp\.com|1024tera\.com|freeterabox\.com|terasharelink\.com|mirrobox\.com|nephobox\.com)\/s\/(?:1)?([a-zA-Z0-9_-]+)/i);
            const rawId = match ? match[1] : '';
            const shorturl = targetUrl.includes('/s/1') ? `1${rawId}` : rawId;

            // Prepare headers
            const cookieHeader = token 
              ? (token.startsWith('ndus=') ? token : `ndus=${token}`)
              : '';

            const apiUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(shorturl)}&root=1`;

            const fetchRes = await fetch(apiUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.terabox.com/',
                'Cookie': cookieHeader || 'lang=en',
              }
            });

            const json = await fetchRes.json();

            if (json && json.errno === 0 && json.list && json.list.length > 0) {
              const file = json.list[0];
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                dlink: file.dlink,
                filename: file.server_filename,
                size: file.size,
                thumb: file.thumbs?.url3 || file.thumbs?.url1,
              }));
            } else {
              // If standard share/list requires specific surl format
              const altShorturl = shorturl.startsWith('1') ? shorturl.substring(1) : `1${shorturl}`;
              const altApiUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(altShorturl)}&root=1`;

              const altFetchRes = await fetch(altApiUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                  'Accept': 'application/json, text/plain, */*',
                  'Referer': 'https://www.terabox.com/',
                  'Cookie': cookieHeader || 'lang=en',
                }
              });

              const altJson = await altFetchRes.json();

              if (altJson && altJson.errno === 0 && altJson.list && altJson.list.length > 0) {
                const file = altJson.list[0];
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  dlink: file.dlink,
                  filename: file.server_filename,
                  size: file.size,
                  thumb: file.thumbs?.url3 || file.thumbs?.url1,
                }));
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: json?.errmsg || altJson?.errmsg || 'Không tìm thấy tệp hoặc link TeraBox yêu cầu mã bảo vệ / đăng nhập ndus',
                  errno: json?.errno,
                }));
              }
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi xử lý bóc tách TeraBox' }));
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
