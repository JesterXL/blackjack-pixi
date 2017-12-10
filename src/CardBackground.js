
export default class CardBackground extends PIXI.Graphics
{
    constructor(parent=undefined, width=222, height=323)
    {
        super();
        const me = this;
        me.lineStyle(2, 0x000000)
        .beginFill(0xFFFFFF)
        .drawRoundedRect(0, 0, width, height, 6)
        .endFill();
        if(parent)
        {
            parent.addChild(me);
        }
    }
}
