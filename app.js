'use strict';

const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const querystring = require('querystring');
const process = require('process');
const { count } = require('console');

const luoguPaintBoardUrl = 'https://segonoj.site/paintboard';

let config;
let pic = [];
let board = [], lastGetBoardTime, reqPaintPos = [];
let paints = 0;
let delta, lcorrect, speed, eTime;

main();

async function main() {
  console.log('PaintTool Being loaded...');
  getConfig();
  getPic();
  await getBoard();

  while (true) {
    if (Date.now() - lastGetBoardTime >= config.fetchTime) {
      await getBoard();
    }
    for (let user of config.users) {
      if (Date.now() - user.lastPaintTime < config.paintTime) {
        continue;
      }
      if (reqPaintPos.length) {
        user.lastPaintTime = Date.now();
        let data = reqPaintPos.shift();
        if (!await paintBoard(user, data)) {
          reqPaintPos.push(data);
        }
        break;
      }
    }
  }
}

function getConfig() {
  try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
    for (let user of config.users) {
      user.lastPaintTime = Date.now() - config.lastPaintTime;
    }
  } catch (err) {
    console.error('Get config.json Failed.');
    process.exit(1);
  }
}

function getPic() {
  try {
    for (let p of config.picFile) {
      pic.push({
        x: p.x,
        y: p.y,
        map: JSON.parse(fs.readFileSync(path.join(__dirname, 'pictures', p.name), 'utf-8'))
      });
    }
  } catch (err) {
    console.error('Get Pictures Failed.');
    process.exit(1);
  }
}

async function getBoard() {
  lastGetBoardTime = Date.now();
  try {
    let str = await fetch(luoguPaintBoardUrl + '/board');
    board = (await str.text()).split('\n');
    if (!board[board.length - 1]) {
      board.pop();
    }
    console.log(new Date().toLocaleString(), 'Get PaintBoard Succeeded.');
    getReqPaintPos();
  } catch (err) {
    console.warn(new Date().toLocaleString(), 'Get PaintBoard Failed:', err);
  }
}

function getReqPaintPos() {
  try {
    reqPaintPos = [];
    for (let p of pic) {
      for (let pix of p.map) {
        if (parseInt(board[pix.x + p.x][pix.y + p.y], 36) != pix.color) {
          reqPaintPos.push({
            x: pix.x + p.x,
            y: pix.y + p.y,
            color: pix.color
          });
        }
      }
    }
    if (config.random) {
      reqPaintPos.sort((a, b) => { return Math.random() - 0.5; });
    }
    console.log(new Date().toLocaleString(), `Load reqPaintPos Succeeded: Size = ${reqPaintPos.length}.`);
  } catch (err) {
    console.warn(new Date().toLocaleString(), 'Load reqPaintPos Failed:', err);
  }
}

async function paintBoard(user, data) {
  try {
    let res = await fetch(`${luoguPaintBoardUrl}/paint`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'referer': luoguPaintBoardUrl
      },
      body: querystring.stringify({x: data.x, y: data.y, color: data.color, uid: user.uid, token: user.token,})
    });
    if (res.status == 200) {
      console.log(new Date().toLocaleString(), 'Paint PaintBoard Succeeded:', user.token, data);
      paints++;
    } else {
      throw new Error(JSON.stringify(await res.json()));
    }
  } catch (err) {
    console.warn(new Date().toLocaleString(), 'Paint PaintBoard Failed:', user.token, err.message);
    return false;
  }
  return true;
}

async function countDelta() {
  let correct = 0;
  let wrong = 0;
  let boardt = [];
  try {
    let str = await fetch(luoguPaintBoardUrl + '/board');
    boardt = (await str.text()).split('\n');
    if (!boardt[boardt.length - 1]) {
      boardt.pop();
    }
    console.log(new Date().toLocaleString(), 'Get PaintBoard While Counting Delta Succeeded.');
  } catch (err) {
    console.warn(new Date().toLocaleString(), 'Get PaintBoard While Counting Delta Failed:', err);
  }
  for (let p of pic) {
    for (let pix of p.map) {
      if (parseInt(boardt[pix.x + p.x][pix.y + p.y], 36) == pix.color) {
        correct++;
      }
      else wrong++;
    }
  }
  delta = -correct + lcorrect - paints;
  speed = correct - lcorrect;
  lcorrect = correct;
  eTime = wrong / speed * config.fetchTime;
  if(eTime < 0) eTime = Never;
  else eTime = `${eTime}s`;
  console.log(new Date.toLocaleString(), `Delta: ${delta}, Speed: ${speed}, ETime: `+eTime);
}

setInterval(countDelta, config.fetchTime);