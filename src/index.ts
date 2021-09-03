import express from 'express';
import { createServer } from 'http';
import request from 'request';

import { createEventAdapter } from '@slack/events-api';
import { WebClient } from '@slack/web-api';

import SLACK_CONFIG from '../config/bot.json';
import NAVER_CONFIG from '../config/naver.json';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Slack Settings
const slackEvents = createEventAdapter(SLACK_CONFIG.SIGNING_SECRET);
const webClient = new WebClient(SLACK_CONFIG.BOT_USER_OAUTH_ACCESS_TOKEN);

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

app.post('/slack/commands', (req, res) => {
  const option = {
    query: '선릉 점심',
    display: 30,
    start: 1,
    sort: 'random',
  };

  request.get(
    {
      uri: 'https://openapi.naver.com/v1/search/local',
      qs: option,
      headers: {
        'X-Naver-Client-Id': NAVER_CONFIG.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CONFIG.NAVER_CLIENT_SECRET,
      },
    },
    (error, response, body) => {
      const json = JSON.parse(response.body);
      const items = json.items;
      const item = items[Math.floor(Math.random() * items.length)];

      const template = {
        attachments: [
          {
            pretext: '오늘의 점심 메뉴 추천입니다.',
            color: '#394dd1',
            fields: [
              {
                title: '가게명',
                value: item.title ? item.title : '없음',
              },
              {
                title: '종류',
                value: item.category ? item.category : '없음',
              },
              {
                title: '설명',
                value: item.description ? item.description : '없음',
              },
              {
                title: '전화번호',
                value: item.telephone ? item.telephone : '없음',
              },
              {
                title: '주소',
                value: item.address ? item.address : '없음',
              },
            ],
          },
        ],
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(template));
      res.end();
    }
  );
});

createServer(app).listen(3000, () => {
  console.log('run slack bot');
});
