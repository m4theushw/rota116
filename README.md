# Rota 116

Do you find yourself having to restart frequently your bundler (webpack, parcel, etc) to change the proxy settings of your development server? This little command-line utility abstracts this for you allowing to change in realtime which one is used.

## Installation

```bash
npm install -g rota116
# or
yarn global add rota116
```

## Quick Start

Create a `rota116.js` file in the root of your project with all backends you want to use. For example:

```js
module.exports = {
  backends: {
    dev: 'http://localhost:8080',
    staging: 'http://api.example.com'
  },
}
```

You can add to the object above any option of [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#options).

In a terminal run:

```bash
rota116 3000 npm start
# or
rota116 3000 yarn start
```

This will start a proxy server on port 3000 and run the command passed. All requests sent to the proxy will be redirected to the selected backend. Don't forget to point to it on your bundler. In Webpack change the `webpack.js` file like below:

```js
module.exports = {
  ...
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
  ...
}
```

Navigate to http://localhost:3000/_admin to change the selected backend.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
