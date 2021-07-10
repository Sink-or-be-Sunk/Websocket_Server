# Sink or be Sunk Websocket Server

[![TypeScript version][ts-badge]][typescript-4-3]
[![Node.js version][nodejs-badge]][nodejs]
[![APLv2][license-badge]][license]

Tools and Configurations:

- [TypeScript][typescript] [4.3][typescript-4-3]
- Type definitions for Node.js
- [Prettier][prettier] to enforce consistent code style
- NPM [scripts](#available-scripts) for common operations
- Reproducible environments thanks to [Volta][volta]

## Getting Started

This project is intended to be used with the latest Active LTS release of [Node.js][nodejs].

### Clone repository

To clone the repository, use the following commands:

```sh
git clone https://github.com/marndt26/SobS_Web
cd SobS_Web
npm install
```

### Setup

- `npm i`
  - `npm audit` or `npm audit fix` if needed
- `npm run dev` --> for starting server in development mode
- `npm run start` --> for starting server in production mode

### Configure Prettier Formatter

- Select `VS Code` -> `View` -> `Command Palette`, and type: Format Document With
- Then `Configure Default Formatter`... and then choose `Prettier - Code formatter`.

### Setting up Typescript

- `npm i -g typescript`

## Available Scripts

- `start` - deploy application,
- `build` - build application,
- `dev` - start application in development mode with live server reload

## References

- [Heroku Typescript Getting Started][heroku-getting-started]
- [Fireship.io TS Tutorial](https://www.youtube.com/watch?v=ahCwqrYpIuM)
- [Boilerplate Code][jsynowiec]

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