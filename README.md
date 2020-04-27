# intellihistory-extension

# development
```
npm i -D @types/chrome @types/node awesome-typescript-loader css-loader mini-css-extract-plugin node-sass sass-loader ts-node tslint typescript webpack webpack-cli npm-run-all cpy-cli cra-build-watch
npm install --dev
npm run watch
```
load `dist/` folder from root dir in chrome://extensions

1. content scripts and background scripts are stored in outer directory
2. popup resides in a react app inside the outer/root directory
