var config = {
  wait: { value: '', type: 'multiplier', label: 'Waiting between 2 bets until its under this multiplier' },
  multiplier: { value: '', type: 'multiplier', label: 'Multiplier' },
  betAmount: { value: '', type: 'balance', label: 'Bet amount' },
  gameWait: { value: '', type: 'number', label: 'Waiting games without bet' }
};

let satoshis = Math.round(config.betAmount.value * 100);
let gamesWaiting = config.gameWait.value;
let multiplier = config.multiplier.value;
let wait = false;
let actGameWait = 0;
let loseCounter = 0;
let gameActions = 0;
let isBetting = false;
let afresh = true;

engine.on('GAME_STARTING', () => {
  log('NEW GAME');
  if (wait) {    
    actGameWait++;
    log(actGameWait + ' game(s) get waited');
    if (actGameWait === gamesWaiting) {
      wait = false;
    }

    return;
  }

  if (afresh && isLastTwoRedStreakUnderMultiplier(config.wait.value)) {
    log('Last 2 game are under the given multiplier.');
    log("Betting...");
    engine.bet(satoshis, multiplier);
    isBetting = true;
    afresh = false;
    gameActions++;
  }
  else if (!afresh) {
    engine.bet(satoshis, multiplier);
    isBetting = true;
    log("Betting...");
    gameActions++;
  }
});

engine.on('GAME_ENDED', () => {
  let gameInfos = engine.history.first();
  if (isBetting) {
    if (gameInfos.cashedAt) {
      log('WIN!');
      afresh = true;
    }
    else {
      log('LOSE!');      
      if (gameActions === 21) {
        afresh = true;
        gameActions = 0;
        return;
      }
      
      loseCounter++;
      if (loseCounter === 2) {
        wait = true;
        loseCounter = 0;
      }      
    }

    isBetting = false;
  }
});

function isLastTwoRedStreakUnderMultiplier(multiplier) {
  let gamesArray = engine.history.toArray();
  log(gamesArray[0].bust + ' ' + gamesArray[1].bust);
  return gamesArray[0].bust < multiplier && gamesArray[1].bust < multiplier;
}
