#!/usr/bin/env node

import { startServer, type ServerOptions } from '../server/index.js'
import { resolve } from 'path'

// @rollup-plugin-replace
const VERSION = 'in-dev'

interface CliArgs {
    port?: number
    gameDir?: string
    wsUrl?: string
    watch?: boolean
    useQueryParam?: boolean
}

function parseArgs(): CliArgs {
    const args = process.argv.slice(2)
    const parsed: CliArgs = {}

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (!arg) continue

        switch (arg) {
            case '-p':
            case '--port': {
                const portStr = args[++i]
                if (portStr) {
                    parsed.port = parseInt(portStr, 10)
                }
                break
            }
            case '-u':
            case '--ws-url':
            case '--websocket-url': {
                const url = args[++i]
                if (url) {
                    parsed.wsUrl = url
                }
                break
            }
            case '-w':
            case '--watch':
            case '--watch-mode':
            case '--hot-reload':
                parsed.watch = true
                break
            case '-q':
            case '--query-param':
            case '--use-query-param':
                parsed.useQueryParam = true
                break
            case '-v':
            case '--version':
                console.log(`v${VERSION}`)
                process.exit(0)
            case '-h':
            case '--help':
                showHelp()
                process.exit(0)
            default:
                if (!arg.startsWith('-')) {
                    // Treat as game directory if no flag
                    parsed.gameDir = resolve(process.cwd(), arg)
                }
                break
        }
    }

    return parsed
}

function showHelp(): void {
    console.log(`
Neuro API Web Server version ${VERSION}

Usage: napi-ws [options] [game-directory]

Options:
  -p, --port <port>                               Server port (default: 8080)
  -u, --ws-url, --websocket-url <url>             WebSocket URL for Neuro SDK
  -q, --query-param, --use-query-param            Allow WebSocketURL query parameter
  -w, --watch, --watch-mode, --hot-reload         Watch mode flag (for development)
  -v, --version                                   Show version number
  -h, --help                                      Show this help message

Environment Variables:
  NEURO_SDK_WS_URL              WebSocket URL (can be overridden by --ws-url)

Examples:
  napi-ws
  napi-ws -p 3000
  napi-ws ./dist --ws-url ws://localhost:8000
  napi-ws ./my-game -p 8080
  `)
}

async function main(): Promise<void> {
    const args = parseArgs()

    console.log(`Neuro API Web Server v${VERSION}`)

    try {
        const options: ServerOptions = {}

        if (args.port !== undefined) options.port = args.port
        if (args.gameDir !== undefined) options.gameDir = args.gameDir
        if (args.wsUrl !== undefined) options.wsUrl = args.wsUrl
        if (args.useQueryParam !== undefined) options.useQueryParam = args.useQueryParam
        if (args.watch !== undefined) options.watch = args.watch

        await startServer(options)
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

main()
