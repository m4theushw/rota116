# Rota 116

Do you find yourself having to restart frequently your bundler (webpack, parcel, etc) to change the proxy settings of your development server to use another backend? This little command-line utility abstracts this for you allowing to change in realtime which one is used.

## Installation

```bash
npm install -g rota116
# or
yarn global add rota116
```

## Quick Start

Create a `.rota116.js` file in the root of your project following the example below:

```js
module.exports = {
  backends: {
    local: 'http://localhost:8080',
    dev: 'http://api-dev.example.com',
    staging: 'http://api-staging.example.com',
  },
}
```

> You can use above any option of [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#options).

In a terminal run:

```bash
rota116 3000
```

This will start a proxy server on port 3000. You can point any request to http://localhost:3000 and it will be redirected to the selected backend. You can change which backend to use accessing the [admin page](http://localhost:3000/_admin).

## Advanced Usage

You can prefix your npm scripts with `rota116` to start the proxy before the command.

```
{
  "scripts": {
    "start": "rota116 3000 webpack-dev-server --config webpack.dev.js"
  }
}
```

## Webpack Example

```js
// webpack.config.js
module.exports = {
  devServer: {
    inline: true,
    contentBase: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Change here
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
}
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
