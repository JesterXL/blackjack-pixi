
import {
    CardValue,
    Suit,
    Card,
    Player,
    GameOver
} from './types';
import CardBackground from './CardBackground';
import { cardImages } from './images';
const log = console.log;

export default class CardComponent extends PIXI.Container
{
    get card() {
        return this._card;
    }
    set card(value) {
        const me = this;
        me._card = value;
        me.redraw();
    }

    static get SCALE_VALUE() { return 0.25 };

    constructor(parent=null, card, x=0, y=0)
    {
        super();
        const me = this;
        
        const background = new CardBackground(me);
        background.scale.x = CardComponent.SCALE_VALUE;
        background.scale.y = CardComponent.SCALE_VALUE;

        if(parent)
        {
            parent.addChild(me);
        }

        me.x = x;
        me.y = y;

        me.card = card;
    }

    redraw() {
        const me = this;

        if(me.cardSprite)
        {
            me.removeChild(me.cardSprite);
        }

        if(me.card === undefined)
        {
            return;
        }

        const suitName = me.card.suit.matchWith({
            Club: ({value}) => 'clubs',
            Diamond: ({value}) => 'diamonds',
            Heart: ({value}) => 'hearts',
            Spade: ({value}) => 'spades'
        });
        const valueName = me.card.cardValue.matchWith({
            RegularValue: ({value}) => value,
            AceValues: ({value}) => 'ace'
        });
        const imageNameFromCard = me.card.matchWith({
            Jack: ({value}) => `jack_of_${suitName}`,
            Queen: ({value}) => `queen_of_${suitName}`,
            King: ({value}) => `king_of_${suitName}`,
            Ace: ({value}) => `ace_of_${suitName}`,
            NoFace: ({value}) => `${valueName}_of_${suitName}`,
        });
        
        const url = cardImages[imageNameFromCard];
        me.cardSprite = PIXI.Sprite.fromImage(url);
        me.addChild(me.cardSprite);
        me.cardSprite.scale.x = CardComponent.SCALE_VALUE;
        me.cardSprite.scale.y = CardComponent.SCALE_VALUE;
    }

    move(x, y)
    {
        const me = this;
        me.x = x;
        me.y = y;
        return me;
    }


}


