import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function teraboxResolverPlugin(): Plugin {
  // Server-side secure credentials (never exposed in client bundle)
  let cloudConfig = {
    streamtapeLogin: process.env.STREAMTAPE_API_LOGIN || 'b594c70e5a75cdfaa252',
    streamtapeKey: process.env.STREAMTAPE_API_KEY || 'Ore0rexG6gSk2Q',
    abyssApiKey: process.env.ABYSS_API_KEY || 'ba8dac0020fbdbe8b3b931285e5acb42',
    teraboxToken: process.env.TERABOX_NDUS_TOKEN || 'YyBEzQx5eHui1iqLnLGobVhdjc_6HrAdN3ni2iD5',
  };

  return {
    name: 'terabox-resolver',
    configureServer(server) {
      // Helper function to resolve TeraBox share link metadata & list files (single file or folder)
      async function resolveTeraBoxData(targetUrl: string, customToken?: string) {
        const token = customToken || cloudConfig.teraboxToken;
        const cookieHeader = token ? (token.startsWith('ndus=') ? token : `ndus=${token}`) : '';

        let extractedPath = '';
        if (targetUrl.includes('path=')) {
          try {
            const u = new URL(targetUrl.startsWith('http') ? targetUrl : `https://www.terabox.com${targetUrl}`);
            extractedPath = u.searchParams.get('path') || '';
          } catch {}
        } else if (targetUrl.startsWith('/')) {
          extractedPath = targetUrl;
        }

        // Branch A: Direct internal drive path / folder (play/video?path=... or folder path)
        if (extractedPath) {
          const isFile = extractedPath.includes('.') && /\.(mp4|mkv|avi|mov|flv|webm|ts|m4v)$/i.test(extractedPath);
          const parentDir = isFile ? extractedPath.substring(0, extractedPath.lastIndexOf('/')) : extractedPath;

          const listUrl = `https://www.terabox.com/api/list?app_id=250528&web=1&channel=dubox&clienttype=0&dir=${encodeURIComponent(parentDir || '/')}&order=name&desc=0&num=100&page=1`;
          const listRes = await fetch(listUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Cookie': `${cookieHeader || 'lang=en'}`,
              'Referer': 'https://www.terabox.com/'
            }
          });
          const listJson = await listRes.json();

          if (listJson && listJson.errno === 0 && listJson.list && listJson.list.length > 0) {
            const rawFiles = listJson.list.filter((f: any) => (f.isdir === 0 || f.isdir === '0') && /\.(mp4|mkv|avi|mov|flv|webm|ts|m4v)$/i.test(f.server_filename || ''));
            const files = (rawFiles.length > 0 ? rawFiles : listJson.list).map((f: any) => ({
              fs_id: f.fs_id,
              filename: f.server_filename,
              size: f.size,
              duration: f.duration || 0,
              thumb: f.thumbs?.url3 || f.thumbs?.url1 || f.thumbs?.url2 || '',
              path: f.path,
              dlink: f.dlink || '',
              teraboxUrl: `https://www.terabox.com/vietnamese/play/video?path=${encodeURIComponent(f.path)}`,
              cookieHeader: cookieHeader || 'lang=en'
            }));

            const primary = files.find((f: any) => f.path === extractedPath) || files[0];

            return {
              success: true,
              fileCount: files.length,
              files: files,
              file: primary,
              dlink: primary?.dlink,
              filename: primary?.filename,
              size: primary?.size,
              duration: primary?.duration,
              thumb: primary?.thumb,
              path: primary?.path,
              cookieHeader: cookieHeader || 'lang=en'
            };
          }
        }

        // Branch B: Public / Share Link
        const match = targetUrl.match(/(?:terabox\.com|teraboxapp\.com|1024tera\.com|1024terabox\.com|freeterabox\.com|terasharelink\.com|mirrobox\.com|nephobox\.com)\/s\/(?:1)?([a-zA-Z0-9_-]+)/i);
        const shorturl = match ? match[1] : '';

        // 1. Fetch share page with Cookie to extract jsToken and title
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

        // 2. Fetch root file list with jsToken
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
          const rawItems = listJson.list;
          const files: any[] = [];

          for (const item of rawItems) {
            // Check if item is a directory or file
            if (item.isdir === '1' || item.isdir === 1) {
              // Fetch sub-directory contents if needed
              try {
                const subListUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(shorturl)}&dir=${encodeURIComponent(item.path)}&root=0${jsToken ? `&jsToken=${encodeURIComponent(jsToken)}` : ''}`;
                const subRes = await fetch(subListUrl, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Referer': `https://www.terabox.com/sharing/link?surl=${encodeURIComponent(shorturl)}`,
                    'Cookie': `${cookieHeader || 'lang=en'}`
                  }
                });
                const subJson = await subRes.json();
                if (subJson && subJson.errno === 0 && subJson.list) {
                  for (const subItem of subJson.list) {
                    if (subItem.isdir !== '1' && subItem.isdir !== 1) {
                      files.push({
                        fs_id: subItem.fs_id,
                        filename: subItem.server_filename,
                        size: subItem.size,
                        duration: subItem.duration || 0,
                        thumb: subItem.thumbs?.url3 || subItem.thumbs?.url1 || subItem.thumbs?.url2 || '',
                        dlink: subItem.dlink,
                        shareId: listJson.share_id,
                        uk: listJson.uk,
                        cookieHeader: cookieHeader || 'lang=en'
                      });
                    }
                  }
                }
              } catch (subErr) {
                console.error('Subdir fetch error:', subErr);
              }
            } else {
              files.push({
                fs_id: item.fs_id,
                filename: item.server_filename,
                size: item.size,
                duration: item.duration || 0,
                thumb: item.thumbs?.url3 || item.thumbs?.url1 || item.thumbs?.url2 || '',
                dlink: item.dlink,
                shareId: listJson.share_id,
                uk: listJson.uk,
                cookieHeader: cookieHeader || 'lang=en'
              });
            }
          }

          const primaryFile = files[0] || rawItems[0];

          return {
            success: true,
            fileCount: files.length,
            files: files,
            // Backwards compatibility for single file
            file: primaryFile,
            dlink: primaryFile?.dlink,
            filename: primaryFile?.filename || primaryFile?.server_filename,
            size: primaryFile?.size,
            duration: primaryFile?.duration,
            thumb: primaryFile?.thumb,
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

      // Endpoint 0: Cấu hình an toàn Cloud API
      server.middlewares.use('/api/cloud/config', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'GET') {
          res.end(JSON.stringify({
            success: true,
            config: {
              streamtapeLogin: cloudConfig.streamtapeLogin,
              streamtapeKey: cloudConfig.streamtapeKey ? `${cloudConfig.streamtapeKey.slice(0, 4)}••••${cloudConfig.streamtapeKey.slice(-4)}` : '',
              hasStreamtapeKey: Boolean(cloudConfig.streamtapeKey),
              abyssApiKey: cloudConfig.abyssApiKey ? `${cloudConfig.abyssApiKey.slice(0, 4)}••••${cloudConfig.abyssApiKey.slice(-4)}` : '',
              hasAbyssKey: Boolean(cloudConfig.abyssApiKey),
              hasTeraboxToken: Boolean(cloudConfig.teraboxToken),
            }
          }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              if (data.streamtapeLogin) cloudConfig.streamtapeLogin = data.streamtapeLogin;
              if (data.streamtapeKey && !data.streamtapeKey.includes('••••')) cloudConfig.streamtapeKey = data.streamtapeKey;
              if (data.abyssApiKey && !data.abyssApiKey.includes('••••')) cloudConfig.abyssApiKey = data.abyssApiKey;
              if (data.teraboxToken && !data.teraboxToken.includes('••••')) cloudConfig.teraboxToken = data.teraboxToken;

              res.end(JSON.stringify({ success: true, message: 'Đã lưu cấu hình an toàn' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
      });

      // Endpoint: Quản lý Thư mục Streamtape (Danh sách Cây thư mục Đa cấp & Tạo mới)
      server.middlewares.use('/api/streamtape/folders', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'GET') {
          try {
            const login = cloudConfig.streamtapeLogin;
            const key = cloudConfig.streamtapeKey;

            async function getFolderTree(folderId = '', prefix = ''): Promise<any[]> {
              try {
                const url = `https://api.streamtape.com/file/listfolder?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}${folderId ? `&folder=${encodeURIComponent(folderId)}` : ''}`;
                const fRes = await fetch(url);
                const fJson = await fRes.json();
                const list: any[] = [];
                if (fJson && fJson.status === 200 && fJson.result?.folders) {
                  for (const f of fJson.result.folders) {
                    const fullPath = prefix ? `${prefix} / ${f.name}` : f.name;
                    list.push({ id: f.id, name: f.name, path: fullPath, parentId: folderId });
                    // Fetch subfolders recursively
                    const sub = await getFolderTree(f.id, fullPath);
                    list.push(...sub);
                  }
                }
                return list;
              } catch {
                return [];
              }
            }

            const allFolders = await getFolderTree();
            res.end(JSON.stringify({
              success: true,
              folders: allFolders,
            }));
          } catch (err: any) {
            res.end(JSON.stringify({ success: false, error: err.message, folders: [] }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const name = data.name || 'Khóa Học MyEdu';
              const pid = data.pid || '';
              const login = (data.login && !data.login.includes('••••')) ? data.login : cloudConfig.streamtapeLogin;
              const key = (data.key && !data.key.includes('••••')) ? data.key : cloudConfig.streamtapeKey;

              const createUrl = `https://api.streamtape.com/file/createfolder?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}&name=${encodeURIComponent(name)}${pid ? `&pid=${encodeURIComponent(pid)}` : ''}`;
              const createRes = await fetch(createUrl);
              const createJson = await createRes.json();

              if (createJson && createJson.status === 200 && (createJson.result?.folderid || createJson.result?.id)) {
                const folderId = createJson.result.folderid || createJson.result.id;
                res.end(JSON.stringify({
                  success: true,
                  folderId,
                  name,
                  parentId: pid,
                }));
              } else {
                res.end(JSON.stringify({
                  success: false,
                  error: createJson?.msg || 'Không thể tạo thư mục trên Streamtape',
                }));
              }
            } catch (err: any) {
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }
      });

      // In-memory / persistent Abyss folders storage


      // Endpoint 1: Bóc tách thông tin & Dlink từ Link hoặc Folder TeraBox
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
            const token = (data.token && !data.token.includes('••••')) ? data.token : cloudConfig.teraboxToken;
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

      // Endpoint 2: Truyền luồng Stream Pipe hoặc Remote DL đa đám mây (Streamtape & Abyss)
      server.middlewares.use('/api/cloud/dispatch', async (req, res) => {
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
            const destination = data.destination || 'both'; // 'streamtape' | 'abyss' | 'both'
            const customTitle = data.title || '';
            const streamtapeFolderId = data.streamtapeFolderId || data.folderId || '';
            const abyssFolderId = data.abyssFolderId || '';
            const token = (data.token && !data.token.includes('••••')) ? data.token : cloudConfig.teraboxToken;
            const cookieHeader = data.cookieHeader || (token ? `ndus=${token}` : 'lang=en');

            const streamtapeLogin = (data.streamtapeLogin && !data.streamtapeLogin.includes('••••')) ? data.streamtapeLogin : cloudConfig.streamtapeLogin;
            const streamtapeKey = (data.streamtapeKey && !data.streamtapeKey.includes('••••')) ? data.streamtapeKey : cloudConfig.streamtapeKey;
            const abyssApiKey = (data.abyssApiKey && !data.abyssApiKey.includes('••••')) ? data.abyssApiKey : cloudConfig.abyssApiKey;

            const providedDlink = data.dlink || '';
            let filePath = data.path || '';
            if (!filePath && targetUrl.includes('path=')) {
              try {
                const u = new URL(targetUrl.startsWith('http') ? targetUrl : `https://www.terabox.com${targetUrl}`);
                filePath = u.searchParams.get('path') || '';
              } catch {}
            }

            let resolvedFilename = customTitle;
            let resolvedDuration = 0;
            let resolvedThumb = '';
            let dlink = providedDlink;

            // If dlink and filePath are not provided, resolve from targetUrl
            if (!dlink && !filePath && targetUrl) {
              const tbResult = await resolveTeraBoxData(targetUrl, token);
              if (!tbResult.success || (!tbResult.dlink && !tbResult.path)) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: tbResult.error || 'Không lấy được thông tin từ TeraBox' }));
                return;
              }
              dlink = tbResult.dlink || '';
              filePath = tbResult.path || filePath;
              resolvedFilename = resolvedFilename || tbResult.filename;
              resolvedDuration = tbResult.duration || 0;
              resolvedThumb = tbResult.thumb || '';
            }

            if (!resolvedFilename && filePath) {
              resolvedFilename = filePath.split('/').pop() || 'Lesson_Video';
            }
            if (!resolvedFilename) {
              resolvedFilename = 'Lesson_Video';
            }
            if (!resolvedFilename.includes('.')) {
              resolvedFilename += '.mp4';
            }

            const responsePayload: {
              success: boolean;
              streamtapeUrl?: string;
              abyssUrl?: string;
              filename: string;
              duration?: number;
              thumb?: string;
              errors?: string[];
            } = {
              success: false,
              filename: resolvedFilename.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, ''),
              duration: resolvedDuration,
              thumb: resolvedThumb,
              errors: []
            };

            const safeName = resolvedFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
            const tmpMp4 = path.join('/tmp', `tb_cloud_${Date.now()}_${safeName}`);
            const tmpTs = path.join('/tmp', `tb_raw_${Date.now()}.ts`);

            console.log(`[Cloud Pipeline] Preparing ${resolvedFilename} -> Destination: ${destination}...`);

            let downloadSuccess = false;

            // Step 1: 100% Original Full-Quality Multi-Threaded Range Download (16 Workers, ~5-10s)
            try {
              let activeDlink = dlink;
              let totalSize = 0;

              if (filePath && (!activeDlink || activeDlink.length < 10)) {
                const metaUrl = `https://www.terabox.com/api/filemetas?app_id=250528&channel=dubox&clienttype=0&web=1&target=[${encodeURIComponent(JSON.stringify(filePath))}]&dlink=1`;
                const metaRes = await fetch(metaUrl, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Cookie': cookieHeader,
                    'Referer': 'https://www.terabox.com/'
                  }
                });
                const metaJson = await metaRes.json();
                const fileInfo = metaJson?.info?.[0];
                if (fileInfo?.dlink) {
                  activeDlink = fileInfo.dlink;
                  totalSize = fileInfo.size || 0;
                }
              }

              if (activeDlink) {
                if (!totalSize) {
                  try {
                    const headRes = await fetch(activeDlink, {
                      headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Cookie': cookieHeader,
                        'Referer': 'https://www.terabox.com/',
                        'Range': 'bytes=0-0'
                      }
                    });
                    const contentRange = headRes.headers.get('content-range');
                    if (contentRange) {
                      const m = contentRange.match(/\/(\d+)/);
                      if (m) totalSize = parseInt(m[1], 10);
                    }
                  } catch {}
                }

                if (totalSize > 500 * 1024) {
                  console.log(`[TeraBox Stream] Downloading 100% original full file: ${(totalSize / 1024 / 1024).toFixed(2)} MB in 16 parallel threads...`);
                  const concurrency = 16;
                  const chunkSize = Math.ceil(totalSize / concurrency);
                  const chunks = new Array(concurrency);

                  await Promise.all(Array.from({ length: concurrency }, async (_, i) => {
                    const start = i * chunkSize;
                    const end = Math.min(start + chunkSize - 1, totalSize - 1);
                    for (let attempt = 0; attempt < 3; attempt++) {
                      try {
                        const res = await fetch(activeDlink, {
                          headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                            'Cookie': cookieHeader,
                            'Referer': 'https://www.terabox.com/',
                            'Range': `bytes=${start}-${end}`
                          }
                        });
                        if (res.status === 200 || res.status === 206) {
                          chunks[i] = Buffer.from(await res.arrayBuffer());
                          break;
                        }
                      } catch {}
                    }
                  }));

                  const validChunks = chunks.filter(Boolean);
                  if (validChunks.length === concurrency) {
                    fs.writeFileSync(tmpMp4, Buffer.concat(chunks));
                    downloadSuccess = fs.existsSync(tmpMp4) && fs.statSync(tmpMp4).size > 1024;
                    console.log(`[TeraBox Stream] SUCCESS! Saved original HD video: ${(fs.statSync(tmpMp4).size / 1024 / 1024).toFixed(2)} MB`);
                  }
                } else if (activeDlink) {
                  // Direct fetch for small/medium file
                  try {
                    const res = await fetch(activeDlink, {
                      headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        'Cookie': cookieHeader,
                        'Referer': 'https://www.terabox.com/'
                      }
                    });
                    if (res.ok) {
                      const buf = Buffer.from(await res.arrayBuffer());
                      if (buf.length > 1024) {
                        fs.writeFileSync(tmpMp4, buf);
                        downloadSuccess = true;
                      }
                    }
                  } catch {}
                }
              }
            } catch (origErr: any) {
              console.log('[TeraBox Stream Fallback]', origErr.message);
            }

            // Step 1 Fallback: Fast HLS Pipeline Fallback
            if (!downloadSuccess) {
              try {
                let jsToken = '';
                const match = targetUrl.match(/(?:terabox\.com|teraboxapp\.com|1024tera\.com|1024terabox\.com|freeterabox\.com|terasharelink\.com|mirrobox\.com|nephobox\.com)\/s\/(?:1)?([a-zA-Z0-9_-]+)/i);
                const shorturl = match ? match[1] : '';
                
                if (shorturl) {
                  const pageRes = await fetch(`https://www.terabox.com/sharing/link?surl=${encodeURIComponent(shorturl)}`, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0',
                      'Cookie': cookieHeader,
                    }
                  });
                  const html = await pageRes.text();
                  const tokenMatch = html.match(/fn%28%22([A-F0-9]+)%22%29/i) || html.match(/jsToken%20%3D%20a%7D%3Bfn%28%22([A-F0-9]+)%22%29/i);
                  if (tokenMatch) jsToken = tokenMatch[1];
                }

                if (!filePath && shorturl) {
                  const listUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${encodeURIComponent(shorturl)}&root=1${jsToken ? `&jsToken=${encodeURIComponent(jsToken)}` : ''}`;
                  const listRes = await fetch(listUrl, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0',
                      'Referer': `https://www.terabox.com/sharing/link?surl=${encodeURIComponent(shorturl)}`,
                      'Cookie': cookieHeader
                    }
                  });
                  const listJson = await listRes.json();
                  const fileItem = listJson?.list?.[0];
                  if (fileItem && fileItem.path) filePath = fileItem.path;
                }

                if (filePath) {
                  const streamUrl = `https://www.terabox.com/api/streaming?app_id=250528&channel=dubox&clienttype=0&web=1&type=M3U8_AUTO_480&path=${encodeURIComponent(filePath)}&jsToken=${jsToken}`;
                  const streamRes = await fetch(streamUrl, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0',
                      'Referer': 'https://www.terabox.com/',
                      'Cookie': cookieHeader
                    }
                  });
                  const m3u8 = await streamRes.text();
                  const segmentUrls = m3u8.split('\n').filter(l => l.startsWith('http'));

                  if (segmentUrls.length > 0) {
                    const buffers = new Array(segmentUrls.length);
                    let cursor = 0;
                    const concurrency = 10;
                    const worker = async () => {
                      while (cursor < segmentUrls.length) {
                        const idx = cursor++;
                        try {
                          const segRes = await fetch(segmentUrls[idx], {
                            headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': cookieHeader }
                          });
                          buffers[idx] = Buffer.from(await segRes.arrayBuffer());
                        } catch {}
                      }
                    };
                    await Promise.all(Array.from({ length: concurrency }, () => worker()));
                    const tsStream = fs.createWriteStream(tmpTs);
                    for (const buf of buffers) if (buf) tsStream.write(buf);
                    tsStream.end();
                    await new Promise(r => tsStream.on('finish', r));

                    const { execSync } = await import('child_process');
                    execSync(`ffmpeg -i "${tmpTs}" -c copy -bsf:a aac_adtstoasc "${tmpMp4}" -y`);
                    downloadSuccess = fs.existsSync(tmpMp4) && fs.statSync(tmpMp4).size > 1024;
                  }
                }
              } catch (hlsErr: any) {
                console.log('[HLS Fallback Error]', hlsErr.message);
              }
            }

            // Direct curl download fallback
            if (!downloadSuccess && dlink) {
              console.log('[Dispatch] Falling back to direct stream download...');
              const { execSync } = await import('child_process');
              const dlCmd = `curl -s -L --location-trusted "${dlink}" -H "User-Agent: Mozilla/5.0" -H "Referer: https://www.terabox.com/" -H "Cookie: ${cookieHeader}" -o "${tmpMp4}" --max-time 180`;
              try {
                execSync(dlCmd);
                downloadSuccess = fs.existsSync(tmpMp4) && fs.statSync(tmpMp4).size > 1024;
              } catch {}
            }

            // Tính toán Dynamic Timeout dựa trên dung lượng thực tế (Hỗ trợ file nặng 1GB - 3GB+)
            const actualSizeBytes = (downloadSuccess && fs.existsSync(tmpMp4)) ? fs.statSync(tmpMp4).size : 50 * 1024 * 1024;
            const actualSizeMB = actualSizeBytes / (1024 * 1024);
            // Ước tính thời gian với tốc độ tối thiểu 250KB/s + 300s buffer khởi tạo
            const dynamicTimeoutMs = Math.max(360000, Math.ceil((actualSizeMB / 0.25) + 300) * 1000);
            console.log(`[Cloud Pipeline] File Size: ${actualSizeMB.toFixed(2)} MB -> Dynamic Timeout: ${(dynamicTimeoutMs / 1000 / 60).toFixed(1)} phút`);

            // Step 2: Upload to Streamtape if requested
            const shouldStreamtape = destination === 'streamtape' || destination === 'both';
            if (shouldStreamtape) {
              try {
                if (!streamtapeLogin || !streamtapeKey) {
                  responsePayload.errors?.push('Chưa cấu hình API Streamtape');
                } else if (downloadSuccess && fs.existsSync(tmpMp4)) {
                  const ulEndpoint = `https://api.streamtape.com/file/ul?login=${encodeURIComponent(streamtapeLogin)}&key=${encodeURIComponent(streamtapeKey)}${streamtapeFolderId ? `&folder=${encodeURIComponent(streamtapeFolderId)}` : ''}`;
                  const ulRes = await fetch(ulEndpoint);
                  const ulJson = await ulRes.json();

                  if (ulJson && ulJson.status === 200 && ulJson.result?.url) {
                    const uploadTargetUrl = ulJson.result.url;
                    console.log(`[Streamtape Dispatch] Uploading ${actualSizeMB.toFixed(2)} MB to Streamtape (Folder: ${streamtapeFolderId || 'Root'})...`);
                    const { execFileSync } = await import('child_process');
                    const sanitizedUploadName = resolvedFilename.replace(/["\\]/g, '').replace(/,/g, ' -');
                    const curlArgs = ['-s', '-L', '--connect-timeout', '30', '--speed-limit', '1000', '--speed-time', '60', '-F', `file=@${tmpMp4};filename=${sanitizedUploadName}`];
                    const upOut = execFileSync('curl', [...curlArgs, uploadTargetUrl], { timeout: dynamicTimeoutMs, maxBuffer: 100 * 1024 * 1024 }).toString();
                    const uploadResult = JSON.parse(upOut || '{}');

                    if (uploadResult && uploadResult.status === 200 && uploadResult.result?.id) {
                      const videoId = uploadResult.result.id;
                      console.log(`[Streamtape Dispatch] SUCCESS! Video ID: ${videoId}`);
                      responsePayload.streamtapeUrl = `https://streamtape.com/e/${videoId}?color=16,185,129`;
                      responsePayload.success = true;
                    } else {
                      responsePayload.errors?.push(uploadResult?.msg || 'Streamtape từ chối tải lên');
                    }
                  } else {
                    responsePayload.errors?.push('Không lấy được Upload URL từ Streamtape: ' + (ulJson?.msg || 'Lỗi API Key'));
                  }
                } else {
                  responsePayload.errors?.push('Không thể kéo dữ liệu video từ TeraBox');
                }
              } catch (stErr: any) {
                responsePayload.errors?.push('Lỗi Streamtape: ' + (stErr.message || String(stErr)));
              }
            }

            // Step 3: Upload to Abyss if requested
            const shouldAbyss = destination === 'abyss' || destination === 'both';
            if (shouldAbyss && abyssApiKey) {
              try {
                console.log(`[Abyss Dispatch] Uploading ${actualSizeMB.toFixed(2)} MB to Abyss (Root Ingestion)...`);
                if (downloadSuccess && fs.existsSync(tmpMp4)) {
                  const { execFileSync } = await import('child_process');
                  const sanitizedUploadName = resolvedFilename.replace(/["\\]/g, '').replace(/,/g, ' -');
                  const curlArgs = ['-s', '-L', '--connect-timeout', '30', '--speed-limit', '1000', '--speed-time', '60', '-F', `file=@${tmpMp4};filename=${sanitizedUploadName}`];
                  const abyssTargetUrl = `https://up.abyss.to/${abyssApiKey}`;
                  let abOut = '';
                  try {
                    abOut = execFileSync('curl', [...curlArgs, abyssTargetUrl], { timeout: dynamicTimeoutMs, maxBuffer: 100 * 1024 * 1024 }).toString();
                  } catch (sslErr) {
                    // Fallback to HTTP if HTTPS fails
                    const httpUrl = `http://up.abyss.to/${abyssApiKey}`;
                    abOut = execFileSync('curl', [...curlArgs, httpUrl], { timeout: dynamicTimeoutMs, maxBuffer: 100 * 1024 * 1024 }).toString();
                  }
                  console.log('[Abyss Upload Output]:', abOut);
                  const abJson = JSON.parse(abOut || '{}');
                  if (abJson && abJson.status === true && abJson.slug) {
                    const slug = abJson.slug;
                    responsePayload.abyssUrl = `https://player.abyssplayer.com/${slug}`;
                    responsePayload.success = true;
                    console.log(`[Abyss Dispatch] SUCCESS! Abyss URL: https://player.abyssplayer.com/${slug}`);
                  } else {
                    responsePayload.errors?.push(abJson?.message || abJson?.error || 'Máy chủ Abyss không trả về link video');
                  }
                } else if (!downloadSuccess) {
                  responsePayload.errors?.push('Không thể kéo dữ liệu video từ TeraBox cho Abyss');
                }
              } catch (abErr: any) {
                console.log('[Abyss Dispatch Error]:', abErr.message);
                const errMsg = abErr.message?.includes('ETIMEDOUT') 
                  ? `Quá thời gian chờ máy chủ Abyss (Timeout > ${(dynamicTimeoutMs / 1000 / 60).toFixed(0)} phút / nghẽn mạng)`
                  : abErr.message || String(abErr);
                responsePayload.errors?.push('Lỗi Abyss: ' + errMsg);
              }
            }

            // Cleanup temp files after all cloud targets are processed
            try { if (fs.existsSync(tmpTs)) fs.unlinkSync(tmpTs); } catch {}
            try { if (fs.existsSync(tmpMp4)) fs.unlinkSync(tmpMp4); } catch {}

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responsePayload));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi điều phối đám mây' }));
          }
        });
      });

      // Legacy endpoint compatibility for /api/terabox/pipe-to-streamtape
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
            const token = data.token || cloudConfig.teraboxToken;
            const streamtapeLogin = data.streamtapeLogin || cloudConfig.streamtapeLogin;
            const streamtapeKey = data.streamtapeKey || cloudConfig.streamtapeKey;

            const tbResult = await resolveTeraBoxData(targetUrl, token);
            if (!tbResult.success || !tbResult.dlink) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: tbResult.error || 'Không lấy được Direct Link từ TeraBox' }));
              return;
            }

            const ulRes = await fetch(`https://api.streamtape.com/file/ul?login=${encodeURIComponent(streamtapeLogin)}&key=${encodeURIComponent(streamtapeKey)}`);
            const ulJson = await ulRes.json();

            if (!ulJson || ulJson.status !== 200 || !ulJson.result?.url) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Không lấy được Upload URL từ Streamtape' }));
              return;
            }

            const uploadTargetUrl = ulJson.result.url;
            const { exec } = await import('child_process');
            const cmd = `curl -s -L "${tbResult.dlink}" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" -H "Referer: https://www.terabox.com/" -H "Cookie: ${tbResult.cookieHeader}" | curl -s -F "file=@-;filename=${tbResult.filename}" "${uploadTargetUrl}"`;

            exec(cmd, { maxBuffer: 20 * 1024 * 1024 }, (error, stdout) => {
              if (error) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Lỗi truyền dữ liệu sang Streamtape: ' + error.message }));
                return;
              }
              try {
                const uploadResult = JSON.parse(stdout || '{}');
                if (uploadResult && uploadResult.status === 200 && uploadResult.result?.id) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: true,
                    streamtapeUrl: `https://streamtape.com/e/${uploadResult.result.id}?color=16,185,129`,
                    filename: tbResult.filename,
                    duration: tbResult.duration,
                    thumb: tbResult.thumb,
                  }));
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: uploadResult?.msg || 'Streamtape từ chối tải lên' }));
                }
              } catch (parseErr: any) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Không đọc được phản hồi từ Streamtape: ' + stdout }));
              }
            });
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
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
