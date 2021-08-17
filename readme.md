# Sink or be Sunk Websocket Server

[![TypeScript version][ts-badge]][typescript-4-3]
[![Node.js version][nodejs-badge]][nodejs]
[![APLv2][license-badge]][license]

Tools and Configurations:

-   [TypeScript][typescript] [4.3][typescript-4-3]
-   Type definitions for Node.js
-   [Prettier][prettier] to enforce consistent code style
-   NPM [scripts](#available-scripts) for common operations
-   Reproducible environments thanks to [Volta][volta]

## Getting Started

This project is intended to be used with the latest Active LTS release of [Node.js][nodejs].

### Clone repository

To clone the repository, use the following commands:

```sh
git clone https://github.com/marndt26/SobS_Web
cd SobS_Web
npm install
```

### Download Volta

Volta is used to ensure that all team members are using the same javascript tooling and environments.

-   For more info see [Volta][volta]

for Unix environment, Install with one command:

```bash
curl https://get.volta.sh | bash
```

### Project Setup

-   `npm i`
    -   `npm audit` or `npm audit fix` if needed
-   `npm run dev` --> for starting server in development mode
-   `npm run start` --> for starting server in production mode

### Configure Prettier Formatter

-   Select `VS Code` -> `View` -> `Command Palette`, and type: Format Document With
-   Then `Configure Default Formatter`... and then choose `Prettier - Code formatter`.

### Setting up Typescript

-   `npm i -g typescript`

### Tools

-   [Smart Web Socket Chrome Extension][smart-web-socket]

## Available Scripts

-   `start` - deploy application,
-   `build` - build application,
-   `dev` - start application in development mode with live server reload

## References

-   [Heroku Typescript Getting Started][heroku-getting-started]
-   [Fireship.io TS Tutorial](https://www.youtube.com/watch?v=ahCwqrYpIuM)
-   [Boilerplate Code][jsynowiec]
-   [Websocket Typescript Example][websocket-ts-example]
-   [Plant UML][plant-uml]
-   3D Models:
    -   [Battleship][battleship-model]
    -   [Submarine][submarine-model]
    -   [Destroyer][destroyer-model]
    -   [Carrier][carrier-model]
    -   [PT Boat][pt-model]

## Running Node Locally

-   Install Node Binaries
-   create powershell alias for node
    -   `echo $profile` to find where powershell profile is located
    -   create/modify file to include the following:
        -   Set-Alias -Name node -Value C:\path\to\node.exe
        -   Set-Alias -Name npm -Value C:\path\to\npm.cmd
        -   Set-Alias -Name npx -Value C:\path\to\npx.cmd
    -   Add `.npmrc` file to root of project folder with the following line
        -   `scripts-prepend-node-path=true`

## License

Licensed under the APLv2. See the [LICENSE](https://github.com/marndt26/SobS_Web/blob/main/LICENSE) file for details.

[ts-badge]: https://img.shields.io/badge/TypeScript-4.3-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2014.16-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v14.x/docs/api/
[typescript]: https://www.typescriptlang.org/
[typescript-4-3]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html
[license-badge]: https://img.shields.io/badge/license-APLv2-blue.svg
[license]: https://github.com/marndt26/SobS_Web/blob/main/LICENSE
[prettier]: https://prettier.io
[volta]: https://volta.sh
[volta-getting-started]: https://docs.volta.sh/guide/getting-started
[volta-tomdale]: https://twitter.com/tomdale/status/1162017336699838467?s=20
[jsynowiec]: https://github.com/jsynowiec/node-typescript-boilerplate
[heroku-getting-started]: https://github.com/heroku/typescript-getting-started
[smart-web-socket]: https://chrome.google.com/webstore/detail/smart-websocket-client/omalebghpgejjiaoknljcfmglgbpocdp
[websocket-ts-example]: https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate
[plant-uml]: https://www.freecodecamp.org/news/inserting-uml-in-markdown-using-vscode/
[volta]: https://docs.volta.sh/guide/getting-started
[battleship-model]: https://sketchfab.com/3d-models/scharnhorst-0144f06264304b68a684d79cc13f1c62
[submarine-model]: https://sketchfab.com/3d-models/u-557-ae10491added470c88e4e21bc8672cd1
[destroyer-model]: https://sketchfab.com/3d-models/z-39-4bf9941a596b4b8b8a12302946d51181
[carrier-model]: https://sketchfab.com/3d-models/enterprise-303b76d3efdf472d8a105702c44ff571#download
[pt-model]: https://sketchfab.com/3d-models/elco-80ft-pt-e759cb35865c480f8db77c91020e8f6c#download
