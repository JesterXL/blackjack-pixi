
export default class Button extends PIXI.Container
{
    constructor(parent=undefined, text, width=100, height=60)
    {
        super();
        const me = this;
        me.buttonMode = true;
        me.interactive = true;
        const background = new PIXI.Graphics();
        background.lineStyle(2, 0x000000)
        .beginFill(0xFFFFFF)
        .drawRoundedRect(0, 0, width, height, 12)
        .endFill();
        me.addChild(background);

        const label = new PIXI.Text(text, {fontFamily : 'Arial', fontSize: 14, fill : 0x000000, align : 'center'});
        me.addChild(label);
        label.x = width / 2 - label.width / 2;
        label.y = height / 2 - label.height / 2;
        if(parent)
        {
            parent.addChild(me);
        }
    }
}
