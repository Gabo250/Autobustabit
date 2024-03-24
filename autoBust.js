var config = {
  wait: { value: '', type: 'multiplier', label: 'Waiting between 2 bets until its under this multiplier' },
  multiplier: { value: '', type: 'multiplier', label: 'Multiplier' },
  betAmount: { value: '', type: 'balance', label: 'Bet amount' },
  gameWait: { value: '', type: 'number', label: 'Waiting games without bet' },
  maxBet: { value: '', type: 'balance', label: 'Max Bet' }
};

let bit = config.betAmount.value;
let gamesWaiting = config.gameWait.value;
let multiplier = config.multiplier.value;
let wait = false;
let actGameWait = 0;
const MAX_BET = config.maxBet.value / 100;
let loseCounter = 0;
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
    log(`Betting ${ bit / 100 } bit with ${ multiplier } multplier.`);
    engine.bet(bit, multiplier);
    isBetting = true;
    afresh = false;
  }
  else if (!afresh) {
    engine.bet(bit, multiplier);
    isBetting = true;
    log(`Betting ${ bit / 100 } bit with ${ multiplier } multplier.`);
  }
});

engine.on('GAME_ENDED', () => {
  let gameInfos = engine.history.first();
  if (isBetting) {
    if (!gameInfos.cashedAt) {
      log('LOSE!');      
      if ((bit / 100) >= MAX_BET) {
        log('Max bet is reached. Initialize...');
        initialize();
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
      initialize();
    }

    isBetting = false;
  }
});

function initialize() {
  multiplier = config.multiplier.value;
  loseCounter = 0;
  bit = config.betAmount.value;
  afresh = true;
}

function isLastTwoRedStreakUnderMultiplier(multiplier) {
  let gamesArray = engine.history.toArray();
  log('Last game bust: ' + gamesArray[0].bust + ', Penult bust: ' + gamesArray[1].bust);
  return gamesArray[0].bust < multiplier && gamesArray[1].bust < multiplier;
}
