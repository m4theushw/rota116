#!/usr/bin/env node

const path = require('path');
const meow = require('meow');
const express = require('express');
const spawn = require('cross-spawn');
const { createProxyMiddleware } = require('http-proxy-middleware');

const cli = meow('Usage: $ rota116 <port> [<command>]');
const [ port ] = cli.input;
const commands = process.argv.slice(3);

if (!cli.input.length) {
  console.error('Missing port');
  process.exit(1);
}

if (commands.length) {
  const proc = spawn(commands[0], commands.slice(1), { stdio: 'inherit' });
  proc.on('SIGTERM', () => proc.kill('SIGTERM'));
  proc.on('SIGINT', () => proc.kill('SIGINT'));
  proc.on('SIGBREAK', () => proc.kill('SIGBREAK'));
  proc.on('SIGHUP', () => proc.kill('SIGHUP'));
  proc.on('exit', (code, signal) => {
    let crossEnvExitCode = code;
    if (crossEnvExitCode === null) {
      crossEnvExitCode = signal === 'SIGINT' ? 0 : 1;
    }
    process.exit(crossEnvExitCode);
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
