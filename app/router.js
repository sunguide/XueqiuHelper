'use strict';

module.exports = app => {
  app.get('/', 'home.index');
  app.get('/messages', 'home.index');
  app.get('/messages/schedule', 'home.index');
  app.get('/test', 'home.test');

  app.get('/api', 'api.index');
  app.get('/api/cookie', 'api.setCookie');
  app.get('/api/test', 'api.test');
  app.post('/api/messages', 'api.messages');

  app.get('/test/test', 'test.index');
  app.get('/login', 'home.login');
  app.post('/login', 'home.loginDo');
  app.get('/logout', 'home.logout');
  app.get('/bonus', 'bonus.index');
  app.get('/cubes', 'cube.index');
  app.get('/schedule', 'schedule.index');
  app.get('/schedule/dispatch', 'schedule.dispatch');
  app.get('/test/redisPub', 'test.redisPub');
  app.get('/test/notifyLHB', 'test.notifyLHB');

  app.get('/v2/api/register','api.user.register');
  app.get('/v2/api/login','api.user.login');
  app.get('/v2/api/app/register','api.app.register');
  app.get('/v2/api/app/update','api.app.update');



  // app.get('/api/idCard', 'api.idCard');
  // app.get('/api/ip', 'api.ip');
  // app.get('/api/tinyurl', 'api.tinyURL');
  // app.get('/news', app.controller.news.list);
  // app.get('/news/item/:id', app.controller.news.detail);
  // app.get('/news/user/:id', app.controller.news.user);
};
