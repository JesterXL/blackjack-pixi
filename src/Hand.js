
import CardComponent from './CardComponent';
import _ from 'lodash';
const log = console.log;

export default class Hand extends PIXI.Container
{
    constructor(parent, x=0, y=0) {
        super();
        const me = this;
        me.cardPool = [];
        if(parent)
        {
            parent.addChild(me);
        }

        me.titleText = new PIXI.Text(`---`, {fontFamily : 'Arial', fontSize: 24, fill : 0xFFFFFF, align : 'center'});
        me.addChild(me.titleText);

        me.scoreText = new PIXI.Text(`Total: ---`, {fontFamily : 'Arial', fontSize: 18, fill : 0xFFFFFF, align : 'center'});
        me.addChild(me.scoreText);

        me.cardContainer = new PIXI.Container();
        me.addChild(me.cardContainer);

        me.x = x;
        me.y = y;
        
        me.layout();
    }

    redraw(cards, score, isDealer=false) {
        const me = this;
        const titleTextValue = isDealer ? 'Dealer' : 'You';
        me.titleText.text = titleTextValue;
        me.scoreText.text = `Total: ${score}`;
        me.removeExistingCards();
        _.map(cards, card => me.getCardComponent(card));
        me.layout();
    }

    layout() {
        const me = this;
        me.scoreText.y = me.titleText.y + me.titleText.height;
        let startX = 0;
        let startY = me.scoreText.y + me.scoreText.height;
        _.forEach(me.cardContainer.children, cardComponent => {
            cardComponent.move(startX, startY);
            startX += cardComponent.width;
        });
    }

    removeExistingCards() {
        const me = this;
        me.cardPool = [...me.cardPool, ...me.cardContainer.removeChildren()];
    }

    getCardComponent(card) {
        const me = this;
        if(me.cardPool.length > 0)
        {
            const cardComponent = me.cardPool.pop();
            me.cardContainer.addChild(cardComponent);
            cardComponent.card = card;
            return cardComponent;
        }
        else
        {
            return new CardComponent(me.cardContainer, card);
        }
    }

    move(x, y)
    {
        const me = this;
        me.x = x;
        me.y = y;
        return me;
    }

    

}


