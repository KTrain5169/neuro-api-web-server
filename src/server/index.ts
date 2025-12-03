import express, { type Express } from 'express'
import { resolve } from 'path'
import { watch } from 'chokidar'
import type { FSWatcher } from 'chokidar'

export interface ServerOptions {
    port?: number
    gameDir?: string
    wsUrl?: string
    useQueryParam?: boolean
    watch?: boolean
}

export function createServer(options: ServerOptions = {}): Express {
    const app = express()
    const gameDir = options.gameDir || resolve(process.cwd(), 'game')
    const clients: Set<any> = new Set()
    let watcher: FSWatcher | null = null

    // Live reload endpoint for hot-reload mode
    if (options.watch) {
        app.get('/__livereload', (req, res) => {
            res.setHeader('Content-Type', 'text/event-stream')
            res.setHeader('Cache-Control', 'no-cache')
            res.setHeader('Connection', 'keep-alive')
            res.flushHeaders()

            clients.add(res)

            req.on('close', () => {
                clients.delete(res)
            })
        })

        // Watch game directory for changes
        watcher = watch(gameDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
            ignoreInitial: true
        })

        watcher.on('change', (path) => {
            console.log(`File changed: ${path}`)
            clients.forEach((client) => {
                client.write(`data: reload\n\n`)
            })
        })

        watcher.on('add', (path) => {
            console.log(`File added: ${path}`)
            clients.forEach((client) => {
                client.write(`data: reload\n\n`)
            })
        })
    }

    // Inject live reload script into HTML files
    if (options.watch) {
        app.use((req, res, next) => {
            const originalSend = res.send
            const originalEnd = res.end
            let chunks: Buffer[] = []

            res.write = function (chunk: any, ...args: any[]): any {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
                return true
            }

            res.end = function (chunk?: any, encoding?: any, callback?: any): any {
                if (chunk) {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
                }

                const contentType = res.getHeader('Content-Type')?.toString() || ''
                if (contentType.includes('text/html') || contentType.includes('html')) {
                    let html = Buffer.concat(chunks).toString('utf8')

                    if (html.includes('</body>')) {
                        const liveReloadScript = `
<script>
(function() {
    const eventSource = new EventSource('/__livereload');
    eventSource.onmessage = (e) => {
        if (e.data === 'reload') {
            console.log('[Hot Reload] Reloading page...');
            location.reload();
        }
    };
    eventSource.onerror = () => {
        console.log('[Hot Reload] Connection lost, retrying...');
        eventSource.close();
        setTimeout(() => location.reload(), 1000);
    };
    console.log('[Hot Reload] Connected');
})();
</script>
</body>`
                        html = html.replace('</body>', liveReloadScript)
                        res.setHeader('Content-Length', Buffer.byteLength(html))
                        return originalEnd.call(res, html, encoding, callback)
                    }
                }

                return originalEnd.call(res, Buffer.concat(chunks), encoding, callback)
            }

            res.send = function (data: any): any {
                const contentType = res.getHeader('Content-Type')?.toString() || ''
                if ((contentType.includes('text/html') || contentType.includes('html')) &&
                    typeof data === 'string' && data.includes('</body>')) {
                    const liveReloadScript = `
<script>
(function() {
    const eventSource = new EventSource('/__livereload');
    eventSource.onmessage = (e) => {
        if (e.data === 'reload') {
            console.log('[Hot Reload] Reloading page...');
            location.reload();
        }
    };
    eventSource.onerror = () => {
        console.log('[Hot Reload] Connection lost, retrying...');
        eventSource.close();
        setTimeout(() => location.reload(), 1000);
    };
    console.log('[Hot Reload] Connected');
})();
</script>
</body>`
                    data = data.replace('</body>', liveReloadScript)
                }
                return originalSend.call(this, data)
            }

            next()
        })
    }

    // Serve static game files
    app.use(express.static(gameDir))

    // Environment variable endpoint for NEURO_SDK_WS_URL (only when query params NOT allowed)
    if (!options.useQueryParam) {
        app.get('/$env/NEURO_SDK_WS_URL', (_req, res) => {
            const wsUrl = options.wsUrl || process.env.NEURO_SDK_WS_URL
            if (wsUrl) {
                res.type('text/plain').send(wsUrl)
            } else {
                res.status(404).send('NEURO_SDK_WS_URL not configured')
            }
        })
    }

    return app
}

export function startServer(options: ServerOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const app = createServer(options)
        const port = options.port || 8080

        const server = app.listen(port, () => {
            console.log(`Web server running on http://localhost:${port}`)
            console.log(options.gameDir ? `Serving game files from: ${options.gameDir}` : 'No directory provided, serving from default (game/)...')
            if (options.wsUrl || process.env.NEURO_SDK_WS_URL) {
                console.log(`WebSocket URL: ${options.wsUrl || process.env.NEURO_SDK_WS_URL}`)
            }
            if (options.watch) {
                console.log('Hot reload enabled - watching directory for changes')
            }
            resolve()
        })

        server.on('error', (error) => {
            reject(error)
        })
    })
}
