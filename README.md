# demo-migratory-redux-app

Use [React Redux](https://react-redux.js.org/) to preserve application's UI state.

- Frontend - [Next.js](https://nextjs.org/) + [React.js](https://reactjs.org/) + [Material-UI](https://material-ui.com/)

## Usage
``` bash
$ git clone https://github.com/teamellipsis/demo-migratory-redux-app
$ cd demo-migratory-redux-app
```
Run development
``` bash
$ npm install
$ npm run dev-server
```
Run production
``` bash
$ npm install --production
$ npm run build
# On UNIX
$ npm run server
# On Windows
$ npm run server_win
```

## Build
```bash
# Without specifing app name. This will use package.json -> name as the app name.
$ npm run release
# Or specify app name as first argument.
$ npm run release -- "Simple Todo"
```
Build file will put into `build` directory.
