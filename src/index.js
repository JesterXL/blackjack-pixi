import union from 'folktale/adt/union/union';
import Equality from 'folktale/adt/union/derivations/equality';
import _ from 'lodash';


// -- Types ----------------------------------------
import {
    CardValue,
    Suit,
    Card,
    Player,
    GameOver
} from './types';
const { RegularValue, AceValues } = CardValue;
const { Club, Diamond, Heart, Spade } = Suit;
const { Jack, Queen, King, Ace, NoFace } = Card;

const log = console.log;

// -- Factory Functions ----------------------------------------

const createAllSuits = () => [Club(),Diamond(),Heart(),Spade()];

const createAllNoFaceCardValues = () => _.chain(_.range(2, 11))
    .map(value => RegularValue(value))
    .value();

const createAllNoFaceCards = () => _.chain(createAllNoFaceCardValues())
    .map(value =>
        _.chain(createAllSuits())
        .map(suit => NoFace(suit, value))
        .value()
    )
    .flatten()
    .value();

const createAllFaceCards = () => _.chain([Jack, Queen, King, Ace])
    .map(face =>
        _.chain(createAllSuits())
        .map(suit => face(suit))
        .value()
    )
    .flatten()
    .value();

const sortCardBySuit = card => card.suit.matchWith({
    Club: ({value}) => value,
    Diamond: ({value}) => value,
    Spade: ({value}) => value,
    Heart: ({value}) => value
});

const createStandard52CardDeck = () =>
    _.chain([...createAllNoFaceCards(), ...createAllFaceCards()])
    .flatten()
    .sortBy(sortCardBySuit)
    .value();

const shuffleCards = cards => _.shuffle(cards);

const createNewShuffledDeck = () =>
    _.chain(createStandard52CardDeck())
    .shuffle()
    .value();




// -- Game Functions ------------------

function *drawCard(cards)
{
    while(true)
    {
        cards = yield {
            card: _.head(cards),
            cards: _.tail(cards)
        };
    }
}

const getCardRegularValueScore = cards => _.reduce(
    cards,
    (acc, card) => card.cardValue.matchWith({
        RegularValue: ({value}) => acc + value,
        AceValues: ({value}) => acc
    }),
    0
);

const getAcesCardsScore = (cards, score) => _.chain(cards)
    .filter(card => Ace.hasInstance(card))
    .reduce( (acc, ace) => acc + 11 <= 21 ? acc + 11 : acc + 1, score)
    .value();

const getCardsScore = cards => getAcesCardsScore(cards, getCardRegularValueScore(cards));

// const addCardToHand = (cards, card) => ({
//     cards: [...cards, card],
//     score: getCardsScores(cards)
// });

// -- Hand Types ------------------------------------------------------------------------------------------

const isBlackjack = cards => cards.length === 2 && getCardsScore(cards) === 21;
const playerBlackjackNoDealer = (player, dealer) => isBlackjack(player) && isBlackjack(dealer) === false;
const tie = (player, dealer) => isBlackjack(player) && isBlackjack(dealer);
const dealerBlackJack = (player, dealer) => isBlackjack(player) === false && isBlackjack(dealer);
const hasAce = cards => _.findIndex(cards, card => Ace.hasInstance(card)) > -1;
const soft17 = cards => getCardsScore(cards) === 17 && hasAce(cards);

export function *game()
{
    const deck = createNewShuffledDeck();
    yield {type: 'deck', deck};
    const shoe = drawCard(deck);
    let player = [];
    let dealer = [];

    let latest = shoe.next().value;
    player = [...player, latest.card];
    latest = shoe.next(latest.cards).value;
    player = [...player, latest.card];
    yield {type: 'playerInitialHand', player, score: getCardsScore(player)};

    latest = shoe.next(latest.cards).value;
    dealer = [...dealer, latest.card];
    latest = shoe.next(latest.cards).value;
    dealer = [...dealer, latest.card];
    yield {type: 'dealerInitialHand', dealer, score: getCardsScore(dealer)};
    
    if(playerBlackjackNoDealer(player, dealer))
    {
        return {type: 'gameOver', gameOver: GameOver.PlayerWin('blackjack')};
    }
    else if(dealerBlackJack(player, dealer))
    {
        return {type: 'gameOver', gameOver: GameOver.DealerWin('blackjack')};
    }
    else if(tie(player, dealer))
    {
        return {type: 'gameOver', gameOver: GameOver.Tie('both got natural blackjack')}
    }

    let playerAction;
    let dealerAction;
    let doubledDown = false;
    while(true)
    {
        while(true)
        {
            // player turn
            if(doubledDown === true)
            {
                break;
            }
            playerAction = yield {type: 'readyPlayerTurn'};
            switch(playerAction)
            {
                case 'hit':
                    latest = shoe.next(latest.cards).value;
                    log("before:", player);
                    player = [...player, latest.card];
                    log("after:", player);
                    if(getCardsScore(player) <= 21)
                    {
                        yield {type: 'playerHitResult', player, score: getCardsScore(player)};
                        break;
                    }
                    else
                    {
                        yield {type: 'playerHitResult', player, score: getCardsScore(player)};
                        return {type: 'gameOver', gameOver: GameOver.DealerWin(`Player busted with ${getCardsScore(player)}`)};
                    }
                
                case 'stand':
                    yield {type: 'playerStandResult', player, score: getCardsScore(player)};
                    break;
                
                case 'doubledown':
                    doubledDown = true;
                    latest = shoe.next(latest.cards).value;
                    player = [...player, latest.card];
                    if(getCardsScore(player) <= 21)
                    {
                        yield {type: 'playerDoubleDownResult', player, score: getCardsScore(player)};
                        break;
                    }
                    else
                    {
                        return {type: 'gameOver', gameOver: GameOver.DealerWin(`Player busted with ${getCardsScore(player)}`)};
                    }
                
                default:
                    throw new Error(`Really dude? you sent a playerAction of: ${playerAction}`);
            }
        }

        while(true)
        {
            // dealer's turn
            yield {type: 'readyDealerTurn'};
            // see if have to hit...
            let dealerCardsScore;
            while(true)
            {
                dealerCardsScore = getCardsScore(dealer);
                if(dealerCardsScore > 21)
                {
                    return {type: 'gameOver', gameOver: GameOver.PlayerWin("Dealer busted.")}
                }
                else if(dealerCardsScore === getCardsScore(player))
                {
                    return {type: 'gameOver', gameOver: GameOver.Tie('Dealer and player have same score.')}
                }
                else if(dealerCardsScore < 17)
                {
                    // they have to hit
                    latest = shoe.next(latest.cards).value;
                    dealer = [...dealer, latest.card];
                    yield {type: 'delearHitResult', dealer, score: getCardsScore(dealer)}
                }
                else if(dealerCardsScore === 17 && soft17(dealer) === false)
                {
                    // they have to hit
                    latest = shoe.next(latest.cards).value;
                    dealer = [...dealer, latest.card];
                    yield {type: 'delearHitResult', dealer, score: getCardsScore(dealer)}
                }
                else
                {
                    throw new Error('What am I supposed to do here?')
                }
            }
        }
    }
}

// const newGame = game();
// log(newGame.next().value.type);
// log(newGame.next().value.type);
// log(newGame.next().value.type);
// log(newGame.next().value.type);
// log(newGame.next('hit').value);
