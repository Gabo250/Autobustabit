var config = {
  multiplier: { value: '', type: 'multiplier', label: 'Multiplier' },
  betAmount: { value: '', type: 'balance', label: 'Bet amount' },
  maxBet: { value: '', type: 'balance', label: 'Max Bet' },
  gameWait: { value: '', type: 'number', label: 'Waiting games without bet' },
  firstWait: { value: '', type: 'number', label: 'Waiting games between 2. and 3. multiplier' },
  secondWait: { value: '', type: 'number', label: 'Waiting games between 3. and 4. multiplier' } 
};

const MAX_BET = config.maxBet.value / 100;
const BIT_MULTIPLIER = 4;
const MAX_LOSE_IN_A_ROW = 3;
const GAMES_WAITING = config.gameWait.value;
const WAIT_BETWEEN_SEC_THIRD_MULT = config.firstWait.value;
const WAIT_BETWEEN_THIRD_FOURTH_MULT = config.secondWait.value;
let bit = config.betAmount.value;
let multiplier = config.multiplier.value;
let bitRaise = false;
let wait = false;
let actGameWait = 0;
let loseCounter = 0;
let isBetting = false;
let actMaxGameWait = 0;

engine.on('GAME_STARTING', () => {
  log('NEW GAME');
  if (wait) {    
    actGameWait++;
    log('Waited ' + actGameWait + ' game(s)');
    if (actGameWait === actMaxGameWait) {
      wait = false;
      actGameWait = 0;
      if (bitRaise) {
        log('Max lose in a row has reached! The stake has been raised.');
        bit *= BIT_MULTIPLIER;
        bitRaise = false;
      }
    }

    return;
  }
  
  log(`Betting ${ bit / 100 } bit with ${ multiplier } multplier.`);
  engine.bet(bit, multiplier);
  isBetting = true;
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
      if (loseCounter === MAX_LOSE_IN_A_ROW) {
        wait = true;
        actMaxGameWait = GAMES_WAITING;
        loseCounter = 0;
        multiplier = config.multiplier.value;
        bitRaise = true;
      } 
      else if (loseCounter === 1 && WAIT_BETWEEN_SEC_THIRD_MULT > 0) {
        wait = true;
        actMaxGameWait = WAIT_BETWEEN_SEC_THIRD_MULT;
      }
      else if (loseCounter === 2 && WAIT_BETWEEN_THIRD_FOURTH_MULT > 0) {
        wait = true;
        actMaxGameWait = WAIT_BETWEEN_THIRD_FOURTH_MULT;
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
  isBetting = false;
  log('The bet config has been restored.');
}

/*function isLastTwoRedStreakUnderMultiplier(multiplier) {
  let gamesArray = engine.history.toArray();
  log('Last game bust: ' + gamesArray[0].bust + ', Penult bust: ' + gamesArray[1].bust);
  return gamesArray[0].bust < multiplier && gamesArray[1].bust < multiplier;
}*/
