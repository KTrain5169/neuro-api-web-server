# Instructions

This is a web server written in TypeScript for the Neuro Game SDK. Though not necessary to know, info about the Neuro Game SDK can be found [here](https://github.com/VedalAI/neuro-sdk)

The main requirements for the server are the following:

```md
[...]
Do one of the following:
    - Bundle your build along with a web server that can query the `NEURO_SDK_WS_URL` environment variable via a GET request to `/$env/NEURO_SDK_WS_URL`. 
    - Specify the `WebSocketURL` URL parameter (ex. `http://localhost:8080?WebSocketURL=ws://localhost:8000`)
```

This web server uses Express for its backend server, and Bun for building to an EXE file for distribution onto GitHub Releases.

At a minimum, the CLI (`src/cli`) and server (`src/server`) itself needs to work, with the API hooks coming later. The server, in addition to the above, should also serve static assets in the `game/` directory. With that being said, the API should be prepared for ahead of time to reduce migration pain, so the CLI should depend on the API folder's modules.

Lastly, this package will also be published to npm as an executable binary (via the CLI) as well as being bundled by the Bun bundler for Single-File Executable.

You may also ignore the `web` folder for now, that is for something I would like to experiment with.
