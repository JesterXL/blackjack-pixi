
import { createStore } from 'redux'
import _ from 'lodash';
import * as PIXI from 'pixi.js'
import './images';
import CardComponent from './CardComponent';
import Button from './Button';
import Rx from 'rx';
import Hand from './Hand';

import {
	CardValue,
	Suit,
	Card,
	Player,
	GameOver
} from './types';
import { game } from './index';
import { cardGame } from './reducers/cardgame';
const Maybe = require('folktale/maybe');

const log = console.log;

// const Provider = ReactRedux.Provider;
// const connect = ReactRedux.connect;

const store = createStore(cardGame,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
store.dispatch({type: 'cow'});

const app = new PIXI.Application();
log("app:", app);
document.body.appendChild(app.view);

const lake = new PIXI.Graphics();
lake.interactive = true;
lake.beginFill(0x01ADFB);
lake.drawRect(0, 0, app.renderer.width, app.renderer.height);
app.stage.addChild(lake);

const hitButton = new Button(app.stage, 'Hit');
hitButton.x = 20;
hitButton.y = 300;

const standButton = new Button(app.stage, 'Stand');
standButton.x = 120;
standButton.y = 300;

const doubleDownButton = new Button(app.stage, 'Double Down');
doubleDownButton.x = 220;
doubleDownButton.y = 300;

const playerActions = new Rx.Subject();
log("playerActions:", playerActions);
hitButton.on('pointerup', ()=> playerActions.onNext('hit'));
standButton.on('pointerup', ()=> playerActions.onNext('stand'));
doubleDownButton.on('pointerup', ()=> playerActions.onNext('doubledown'));

const showButtons = show => {
	hitButton.visible = standButton.visible = doubleDownButton.visible = show;
};

const playerHand = new Hand(app.stage, 20, 40);
const dealerHand = new Hand(app.stage, 320, 40);

function *pixiBlackjack()
{
	showButtons(false);
	const newGame = game();
	const initialDeck = newGame.next().value.deck;
	let player, score, dealer, value;
	value = newGame.next().value;
	player = value.player;
	score = value.score;
	playerHand.redraw(player, score);
	value = newGame.next().value;
	dealer = value.dealer;
	score = value.score;
	dealerHand.redraw(dealer, score, true);
	value = newGame.next().value;
	showButtons(true);
	while(true)
	{
		new Promise( success =>{
			let playerActionsSubscription = playerActions.subscribe(
				action => {
					value = newGame.next(action).value;
					playerActionsSubscription.dispose();
					success(value);
				}
			);
		})
		.then(value =>
		{
			player = value.player;
			score = value.score;
			playerHand.redraw(player, score);
		});
		yield 'cow'
	}
	
	
}

const newPixiBlackjackGame = pixiBlackjack();
newPixiBlackjackGame.next();
				

				

				