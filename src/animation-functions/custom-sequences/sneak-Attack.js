import { buildFile } from "../file-builder/build-filepath.js";
import { AAanimationData } from "../../aa-classes/animation-data.js";
const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

export async function sneakAttack(handler, autoObject) {

    const data = {}
    if (autoObject) {
        const autoOverridden = handler.options?.overrideAuto
        Object.assign(data, autoObject[0]);
        data.itemName = data.animation || "";
        data.color = autoOverridden ? handler.options?.autoColor : data.color;
        data.repeat = autoOverridden ? handler.options?.autoRepeat : data.repeat;
        data.delay = autoOverridden ? handler.options?.autoDelay : data.delay;
        data.variant = autoOverridden ? handler.options?.autoVariant : data.variant;
    } else {
        data.itemName = handler.convertedName;
        data.color = handler.color;
        data.scale = 1;
        data.below = false;
        data.anchorX = handler.options?.anchorX || 0.5;
        data.anchorY = handler.options?.anchorY || 0.7;
    }
    const sneak = await buildFile(true, data.itemName, "static", "01", data.color)
    const sourceToken = handler.actorToken;

    const sourceFX = await AAanimationData._sourceFX(handler, sourceToken);

    async function cast() {
        new Sequence("Automated Animations")
            .addSequence(sourceFX.sourceSeq)
            .effect()
                .file(sneak.file)
                .atLocation(sourceToken)
                .scale((2 * sourceToken.w / sneak.metadata.width) * data.scale)
                .gridSize(canvas.grid.size)
                .belowTokens(data.below)
                .anchor({ x: data.anchorX, y: data.anchorY })
            .play()
    }
    cast();

}