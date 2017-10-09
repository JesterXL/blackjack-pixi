import '../node_modules/folktale/dist/umd/folktale.js';
const union = folktale.adt.union.union;
const Equality = folktale.adt.union.derivations.equality;

export const CardValue = union('CardValue', {
    RegularValue(value) { return { value } },
    AceValues() { return {value: [1, 11]} }
});
const { RegularValue, AceValues } = CardValue;

export const Suit = union('Suit', {
    Club(){ return {value: '♣ club'} },
    Diamond(){ return {value: '♦ diamond'} },
    Heart(){ return {value: '♥ heart'} },
    Spade(){ return {value: '♠ spade'} }
});
const { Club, Diamond, Heart, Spade } = Suit;

export const Card = union('Card', {
    Jack(suit){ return {value: 'Jack', suit, cardValue: RegularValue(10)} },
    Queen(suit){ return {value: 'Queen', suit, cardValue: RegularValue(10)} },
    King(suit){ return {value: 'King', suit, cardValue: RegularValue(10)} },
    Ace(suit) { return {value: 'Ace', suit, cardValue: AceValues() }},
    NoFace(suit, cardValue) { return {value: 'No Face', suit, cardValue} }
})
.derive(Equality);
const { Jack, Queen, King, Ace, NoFace } = Card;

export const Player = union('Player', {
    Dealer(cards) { return {value: cards} },
    Normal(cards) { return {value: cards} }
});

export const GameOver = union('GameOver', {
    PlayerWin(reason) { return { value: reason }},
    DealerWin(reason) { return { value: reason }},
    Tie(reason) { return {value: reason }}
});