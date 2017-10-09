import './node_modules/pixi.js/dist/pixi.js';
import {
    CardValue,
    Suit,
    Card,
    Player,
    GameOver
} from './types.js';
import CardBackground from './CardBackground.js';
const log = console.log;

export default class CardComponent extends PIXI.Container
{
    constructor(parent=null, card, x=0, y=0)
    {
        const suitName = card.suit.matchWith({
            Club: ({value}) => 'clubs',
            Diamond: ({value}) => 'diamonds',
            Heart: ({value}) => 'hearts',
            Spade: ({value}) => 'spades'
        });
        const valueName = card.cardValue.matchWith({
            RegularValue: ({value}) => value,
            AceValues: ({value}) => 'ace'
        });
        const imageNameFromCard = card.matchWith({
            Jack: ({value}) => `jack_of_${suitName}`,
            Queen: ({value}) => `queen_of_${suitName}`,
            King: ({value}) => `king_of_${suitName}`,
            Ace: ({value}) => `ace_of_${suitName}`,
            NoFace: ({value}) => `${valueName}_of_${suitName}`,
        });
        super();
        const me = this;
        
        const scaleValue = 0.25;
        const background = new CardBackground(me);
        background.scale.x = scaleValue;
        background.scale.y = scaleValue;
        const sprite = PIXI.Sprite.fromImage(`./images/cards/${imageNameFromCard}.png`);
        me.addChild(sprite);
        sprite.scale.x = scaleValue;
        sprite.scale.y = scaleValue;
        
        if(parent)
        {
            parent.addChild(me);
        }

        me.x = x;
        me.y = y;
    }

    move(x, y)
    {
        const me = this;
        me.x = x;
        me.y = y;
        return me;
    }


}


