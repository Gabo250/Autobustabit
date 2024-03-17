var config = {
  wait: { value: '', type: 'multiplier', label: 'Waiting between 2 bets until its under this multiplier' },
  multiplier: { value: '', type: 'multiplier', label: 'Multiplier' },
  betAmount: { value: '', type: 'balance', label: 'Bet amount' },
  gameWait: { value: '', type: 'number', label: 'Waiting games without bet' }
};

let bit = config.betAmount.value / 100;
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
    log('Waited ' + actGameWait + ' game(s)');
    if (actGameWait === gamesWaiting) {
      wait = false;
      actGameWait = 0;
      bit *= 3;
    }

    return;
  }

  if (afresh && isLastTwoRedStreakUnderMultiplier(config.wait.value)) {
    log('Last 2 game are under the given multiplier.');
    log(`Betting ${ bit } bit with ${ multiplier } multplier.`);
    engine.bet(bit, multiplier);
    isBetting = true;
    afresh = false;
    gameActions++;
  }
  else if (!afresh) {
    engine.bet(bit, multiplier);
    isBetting = true;
    log(`Betting ${ bit } bit with ${ multiplier } multplier.`);
    gameActions++;
  }
});

engine.on('GAME_ENDED', () => {
  let gameInfos = engine.history.first();
  if (isBetting) {
    if (!gameInfos.cashedAt) {
      log('LOSE!');      
      if (gameActions === 15) {
        afresh = true;
        isBetting = false
        gameActions = 0;
        multiplier = config.multiplier.value;
        bit = config.betAmount.value / 100;
        return;
      }
      
      loseCounter++;
      multiplier++;
      if (loseCounter === 2) {
        wait = true;
        loseCounter = 0;
        multiplier = config.multiplier.value;
      } 
    }
    else {
      log('WIN!');
      gameActions = 0;
      multiplier = config.multiplier.value;
      bit = config.betAmount.value / 100;
      afresh = true;
    }

    isBetting = false;
  }
});

function isLastTwoRedStreakUnderMultiplier(multiplier) {
  let gamesArray = engine.history.toArray();
  log('Last game bust: ' + gamesArray[0].bust + ', Penult bust: ' + gamesArray[1].bust);
  return gamesArray[0].bust < multiplier && gamesArray[1].bust < multiplier;
}
