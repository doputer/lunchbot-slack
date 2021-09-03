import express from 'express';
import { createServer } from 'http';

import { createEventAdapter } from '@slack/events-api';
import { WebClient } from '@slack/web-api';

import CONFIG from '../config/bot.json';

const app = express();

const slackEvents = createEventAdapter(CONFIG.SIGNING_SECRET);
const webClient = new WebClient(CONFIG.BOT_USER_OAUTH_ACCESS_TOKEN);

slackEvents.on('message', async (event) => {
  console.log(event);

  if (event.text == '안녕') {
    webClient.chat.postMessage({
      text: '안녕하세요!',
      channel: event.channel,
    });
  }
});

app.use('/slack/events', slackEvents.requestListener());

app.use('/slack/slash-command', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write('asd');
  res.end();
});

createServer(app).listen(3000, () => {
  console.log('run slack bot');
});
