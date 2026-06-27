import { Color } from "../math/Color.js";
import { Rect } from "../math/Rect.js";
import { Vec2 } from "../math/Vec2.js";
import { Drawable2D } from "./Drawable2D copy.js";

export class Rectangle2D extends Drawable2D {
    setupDraw() {
        this.drawRectangle(new Rect({start: new Vec2(0,0), end: new Vec2(100,100)}), new Color(1, 1, 1, 1));
    }
}