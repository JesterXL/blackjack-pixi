const log = console.log;

const union = require('folktale/adt/union/union');
const Equality = require('folktale/adt/union/derivations/equality');
const _ = require('lodash');

// -- Types ----------------------------------------

const CardValue = union('CardValue', {
    RegularValue(value) { return { value } },
    AceValues() { return {value: [1, 11]} }
});
const { RegularValue, AceValues } = CardValue;

const Suit = union('Suit', {
    Club(){ return {value: '♣ club'} },
    Diamond(){ return {value: '♦ diamond'} },
    Heart(){ return {value: '♥ heart'} },
    Spade(){ return {value: '♠ spade'} }
});
const { Club, Diamond, Heart, Spade } = Suit;

const Card = union('Card', {
    Jack(suit){ return {value: 'Jack', suit, cardValue: RegularValue(10)} },
    Queen(suit){ return {value: 'Queen', suit, cardValue: RegularValue(10)} },
    King(suit){ return {value: 'King', suit, cardValue: RegularValue(10)} },
    Ace(suit) { return {value: 'Ace', suit, cardValue: AceValues() }},
    NoFace(suit, cardValue) { return {value: 'No Face', suit, cardValue} }
})
.derive(Equality);
const { Jack, Queen, King, Ace, NoFace } = Card;

const Player = union('Player', {
    Dealer(cards) { return {value: cards} },
    Normal(cards) { return {value: cards} }
});

const GameOver = union('GameOver', {
    PlayerWin(reason) { return { value: reason }},
    DealerWin(reason) { return { value: reason }},
    Tie(reason) { return {value: reason }}
});


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

function *game()
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
                    player = [...player, latest.card];
                    if(getCardsScore(player) <= 21)
                    {
                        yield {type: 'playerHitResult', player, score: getCardsScore(player)};
                        break;
                    }
                    else
                    {
                        return {type: 'gameOver', gameOver: GameOver.DealerWin(`Player busted with ${getCardsScore(player)}`)};
                    }
                
                case 'stand':
                    yield {type: 'playerStandResult', player, score: getCardsScore(player)};
                    break;
                
                case 'double down':
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

module.exports = {
};