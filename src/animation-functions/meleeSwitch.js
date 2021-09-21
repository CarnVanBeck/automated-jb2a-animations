import { buildFile } from "./file-builder/build-filepath.js"
import { aaDebugger } from "../constants/constants.js"
import { AAanimationData } from "../aa-classes/animation-data.js";
//import { AAITEMCHECK } from "./item-arrays.js";

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

export async function meleeSwitch(handler, target, autoObject) {
    const aaDebug = game.settings.get("autoanimations", "debug")
    function moduleIncludes(test) {
        return !!game.modules.get(test);
    }

    //Builds Primary File Path and Pulls from flags if already set
    const data = AAanimationData._switchData(handler, autoObject);
    if (aaDebug) { aaDebugger("Switch Animation Start", data) }
    const attack = await buildFile(false, data.switchAnimation, "range", data.switchVariant, data.switchColor);//need to finish
    
    const sourceToken = handler.actorToken;

    const explosion = handler.flags.explosion ? await AAanimationData._explosionData(handler) : {};
    const explosionSound = AAanimationData._explosionSound(handler);
    const sourceFX = await AAanimationData._sourceFX(handler, sourceToken);
    const targetFX = await AAanimationData._targetFX(handler);

    //logging explosion Scale
    const scale = ((200 * handler.explosionRadius) / explosion?.data?.metadata?.width) ?? 1;

    const returnWeapons = ['dagger', 'hammer', 'greatsword', 'chakram']
    const switchReturn = returnWeapons.some(el => data.switchAnimation.includes(el)) ? data.return : false;
    let returnDelay;
    switch (true) {
        case data.switchAnimation.includes('dagger'):
        case data.switchAnimation.includes('hammer'):
            returnDelay = 1000;
            break;
        default:
            returnDelay = 1500;
    }
    async function cast() {
        //let arrayLength = handler.allTargets.length;
        //for (var i = 0; i < arrayLength; i++) {

        //let target = handler.allTargets[i];
        if (targetFX.enabled) {
            targetFX.tFXScale = 2 * target.w / targetFX.data.metadata.width;
        }

        //Checks Range and sends it to Range Builder if true
        let hit;
        if (handler.playOnMiss) {
            hit = handler.hitTargetsId.includes(target.id) ? false : true;
        } else {
            hit = false;
        }

        await new Sequence("Automated Animations")
            .addSequence(sourceFX.sourceSeq)
            .thenDo(function () {
                Hooks.callAll("aaAnimationStart", sourceToken, target)
            })
            .effect()
                .file(attack.file)
                .atLocation(sourceToken)
                .reachTowards(target)
                .JB2A()
                .randomizeMirrorY()
                .repeats(data.repeat, data.delay)
                .missed(hit)
                .name("animation")
                .belowTokens(data.below)
            //.waitUntilFinished(-700/* + handler.explosionDelay*/)
            .effect()
                .file(attack.returnFile)
                .delay(returnDelay)
                .atLocation(sourceToken)
                .repeats(data.repeat, data.delay)
                .reachTowards("animation")
                .playIf(switchReturn)
                .JB2A()
            .effect()
                .atLocation("animation")
                .file(explosion.data?.file)
                .scale({ x: scale, y: scale })
                .delay(500 + explosion.delay)
                .repeats(data.repeat, data.delay)
                .belowTokens(explosion.below)
                .playIf(handler.explosion)
            .sound()
                .file(explosionSound.file)
                .playIf(() => { return handler.explosion && handler.explodeSound })
                .delay(explosionSound.delay)
                .volume(explosionSound.volume)
                .repeats(data.repeat, data.delay)
            .effect()
                .delay(targetFX.startDelay)
                .file(targetFX.data?.file)
                .atLocation(target)
                .gridSize(canvas.grid.size)
                .scale(targetFX.tFXScale * targetFX.scale)
                .repeats(targetFX.repeat, targetFX.delay)
                .belowTokens(targetFX.below)
                .playIf(targetFX.enabled)
            .play()
        await wait(handler.animEnd)
        Hooks.callAll("aa.animationEnd", sourceToken, target)
        //}
    }
    cast()
}
