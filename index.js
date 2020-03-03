#!/usr/bin/env node

const path = require('path');
const meow = require('meow');
const express = require('express');
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const cli = meow('Usage: $ rota116 <port> [<command>]');
const [ port, ...commands ] = cli.input

if (!cli.input.length) {
  console.error('Missing port');
  process.exit(1);
}

if (commands.length) {
  const command = spawn(commands[0], commands.slice(1))

  command.stdout.on('data', function(data) {
    console.log(`${data}`);
  });

  command.stderr.on('data', function(data) {
    console.error(`${data}`);
  });

  command.on('close', function(code) {
    console.log(`The command passed exited with code ${code}`)
  });
}

const app = express();
const configPath = path.join(process.cwd(), '.rota116.js');
const { backends, ...otherOptions } = require(configPath);
app.set('backend', Object.keys(backends)[0]);

const proxy = createProxyMiddleware({
  target: backends[app.get('backend')],
  router: () => backends[app.get('backend')],
  ...otherOptions
});

app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/_admin', function(req, res) {
  res.render('index', {
    backends: Object.keys(backends),
    currentUrl: req.protocol + '://' + req.get('host'),
    backendUrl: backends[app.get('backend')],
    selectedBackend: app.get('backend')
  });
});

app.post('/_admin', function(req, res) {
  app.set('backend', req.body.backend);
  res.redirect('/_admin');
});

app.use(proxy);
app.listen(port);
