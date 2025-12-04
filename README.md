# Neuro API Web Server

This is a kinda simple out-of-the-box web server for web-based Neuro integrations, such as WebGL games or games utilising HTML, CSS, JS via the JS SDK. It uses Express for the framework.

This package provides a CLI that is installed with the package. Platform-specific binaries can also be downloaded from GitHub Releases to avoid having to install Node.js or any JS runtime, if you so wish.

## Usage

### CLI

A CLI is ready to use, as `napi-ws`.

Help menu:

```txt
Neuro API Web Server CLI

Usage: napi-ws [options] [game-directory]

Options:
  -p, --port <port>                               Server port (default: 4000)
  -u, --ws-url, --websocket-url <url>             WebSocket URL for Neuro SDK
  -q, --query-param, --use-query-param            Allow WebSocketURL query parameter
  -w, --watch, --watch-mode, --hot-reload         Enable watch mode for development
  -v, --version                                   Show version number
  -h, --help                                      Show this help message

Environment Variables:
  NEURO_SDK_WS_URL              WebSocket URL (can be overridden by --ws-url)

Examples:
  napi-ws
  napi-ws -p 3000
  napi-ws --game-dir ./dist --ws-url ws://localhost:8000
  napi-ws ./my-game -p 8080
```

### API

A proper API/plugin system for the server will be made later. For now, the package exports the `createServer` and `startServer` functions, and you can interact with the Express server directly.
