import { endTiming } from "../constants/timings.js";
import { AASystemData } from "./getdata-by-system.js";

export default class flagHandler {
    constructor(msg, isChat, external) {
        this.debug = game.settings.get("autoanimations", "debug");
        this._log("Getting System Data")
        //const data = getSystemData(msg, isChat);
        const systemID = game.system.id.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "");
        const data = external ? external : AASystemData[systemID](msg, isChat)
        if (!data) { this._log("Retrieval Failed"); return; }
        this._log("Data Retrieved", data)
        //const item = data.item;
        //const token = data.token;
        //const targets = data.targets;
        //const hitTargets = data.hitTargets;
        const midiActive = game.modules.get('midi-qol')?.active;
        this._reach = data.reach || 0;

        this._item = data.item;
        this._actorToken = data.token;
        this._actor = data.token.actor;
        this._allTargets = data.targets;
        this._hitTargets = data.hitTargets;
        this._hitTargetsId = data.hitTargets ? Array.from(this._hitTargets.filter(actor => actor.id).map(actor => actor.id)) : undefined;
        this._targetsId = Array.from(this._allTargets.filter(actor => actor.id).map(actor => actor.id));

        //midi-qol specific settings
        this._playOnMiss = midiActive ? game.settings.get("autoanimations", "playonmiss") : false;
        const midiSettings = midiActive ? game.settings.get("midi-qol", "ConfigSettings") : false
        this._gmAD = midiActive ? midiSettings?.gmAutoDamage : "";
        this._userAD = midiActive ? midiSettings?.autoRollDamage : "";

        this._itemName = this._item.name?.toLowerCase() ?? "";
        this._itemMacro = this._item.data?.flags?.itemacro?.macro?.data?.name ?? "";
        this._flags = this._item.data?.flags?.autoanimations ?? "";

        this._animLevel = this._flags.animLevel ?? false;
        this._animColor = this._flags?.color?.toLowerCase() ?? "";
        this._animName = this._flags.animName?.toLowerCase() ?? "";
        this._explodeColor = this._flags.explodeColor?.toLowerCase() ?? "";
        this._explodeDelay = this._flags.explodeDelay ?? 0;
        this._exAnimLevel = this._flags.exAnimLevel ?? false;
        this._impactVar = this._flags.impactVar ?? "";
        this._explodeRadius = this._flags.explodeRadius ?? 10;
        this._explodeVariant = this._flags.explodeVariant?.toLowerCase() ?? "";
        this._animExLoop = this._flags.explodeLoop ?? "";
        this._animType = this._flags.animType?.toLowerCase() ?? "";
        this._animKill = this._flags.killAnim;
        this._animOverride = this._flags.override;
        this._explosion = this._flags.explosion;
        this._dtvar = this._flags.dtvar?.toLowerCase() ?? "";
        this._selfRadius = this._flags.selfRadius ?? "";
        this._animTint = this._flags.animTint ?? "";
        this._auraOpacity = this._flags.auraOpacity ?? "";
        this._ctaOption = this._flags.ctaOption ?? "";
        this._hmAnim = this._flags.hmAnim ?? "";
        this._uaStrikeType = this._flags.uaStrikeType ?? "";
        this._teleDist = this._flags.teleDist ?? "";
        this._spellVar = this._flags.spellVar ?? "";
        this._bardTarget = this._flags.bards?.bardTarget ?? true;
        this._bardSelf = this._flags.bards?.bardSelf ?? true;
        this._bardAnim = this._flags.bards?.bardAnim ?? "";
        this._bards = this._flags.bards ?? "";
        this._allSounds = this._flags.allSounds ?? "";
        this._itemSound = this._flags.allSounds?.item?.enableAudio ?? false;
        this._explodeSound = this._flags.allSounds?.explosion?.audioExplodeEnabled ?? false;
        this._spellLoops = this._flags.spellOptions?.spellLoops ?? 1;
        this._rangedOptions = this._flags.rangedOptions ?? "";
        this._animLoops = this._flags.options?.loops ?? 1;
        this._loopDelay = this._flags.options?.loopDelay ?? 250;
        this._scale = this._flags.options?.scale ?? 1;
        this._custom01 = this._flags.options?.customPath01 ?? "";
        this._options = this._flags.options ?? "";
        this._enableCustom01 = this._flags.options?.enableCustom01 ?? false;
        this._templates = this._flags.templates ?? "";
        this._templatePersist = this._flags.templates?.persistent ?? false;
        this._templateOpacity = this._flags.templates?.opacity ?? 0.75;
        this._variant = this._flags.options?.variant ?? "";
        this._enableCustomExplosion = this._flags.options?.enableCustomExplosion ?? false;
        this._customExplode = this._flags.options?.customExplosion ?? "";

        this._meleeSwitch = this._flags.meleeSwitch;
        this._switchType = this._meleeSwitch?.switchType ?? "on";
        this._switchName = this._meleeSwitch?.animName ?? "";
        this._switchDmgType = this._meleeSwitch?.rangeDmgType ?? "physical";
        this._switchVariant = this._meleeSwitch?.rangeVar ?? "01";
        this._switchColor = this._meleeSwitch?.color ?? "white";
        this._switchDetect = this._meleeSwitch?.detect ?? "auto";
        this._switchRange = this._meleeSwitch?.range ?? "1";
        this._returning = this._meleeSwitch?.returning ?? false;

        this._animNameFinal;
        switch (true) {
            case ((!this._animOverride) || ((this._animOverride) && (this._animName === ``))):
                this._animNameFinal = this._itemName;
                break;
            default:
                this._animNameFinal = this._animName;
                break;
        }
        this._convertName = this._animName.replace(/\s+/g, '').toLowerCase();
        this._delay = endTiming(this._animNameFinal);
    }

    get convertedName() { return this._convertName; }
    get animEnd() { return this._delay }
    get itemMacro() { return this._itemMacro; }

    get playOnMiss() { return this._playOnMiss }

    get actor() { return this._actor; }

    get reachCheck() { return this._reach; }

    get itemName() { return this._itemName }
    get item() { return this._item }
    get actorToken() { return this._actorToken; }
    get allTargets() { return this._allTargets; }
    get hitTargetsId() { return this._hitTargetsId; }
    get targetsId() { return this._targetsId; }

    get isValid() { return !!(this._item && this._actor); }
    get itemType() { return this._item.data.type.toLowerCase(); }

    get animKill() { return this._animKill; }
    get animOverride() { return this._animOverride; }
    get animType() { return this._animType; }
    get color() { return this._animColor; }

    get animName() { return this._animNameFinal; }
    get variant() { return this._variant; }
    get explosion() { return this._explosion; }
    get impactVar() { return this._impactVar; }
    get explosionColor() { return this._explodeColor; }
    get explosionRadius() { return this._explodeRadius; }
    get explosionVariant() { return this._explodeVariant; }
    get explosionDelay() { return this._explodeDelay; }
    get explosionLevel() { return this._exAnimLevel; }
    get explosionLoops() { return this._animExLoop; }

    get dtvar() { return this._dtvar; }
    get selfRadius() { return this._selfRadius; }

    get animTint() { return this._animTint; }
    get auraOpacity() { return this._auraOpacity; }
    get ctaOption() { return this._ctaOption; }

    get hmAnim() { return this._hmAnim; }
    get uaStrikeType() { return this._uaStrikeType; }
    get teleRange() { return this._teleDist; }
    get spellVariant() { return this._spellVar; }

    get bardTarget() { return this._bardTarget; }
    get bardSelf() { return this._bardSelf; }
    get bardAnim() { return this._bardAnim; }
    get bards() { return this._bards; }

    get allSounds() { return this._allSounds; }
    get itemSound() { return this._itemSound; }
    get explodeSound() { return this._explodeSound }

    get spellLoops() { return this._spellLoops; }
    get autoDamage() { return game.user.isGM ? this._gmAD : this._userAD; }
    get flags() { return this._flags; }

    get rangedOptions() { return this._rangedOptions; }

    get animationLoops() { return this._animLoops; }
    get loopDelay() { return this._loopDelay; }
    get scale() { return this._scale; }
    get animLevel() { return this._animLevel; }
    get custom01() { return this._custom01 }
    get enableCustom01() { return this._enableCustom01 }
    get options() { return this._options }
    get customExplode() { return this._enableCustomExplosion }
    get customExplosionPath() { return this._customExplode }

    get templates() { return this._templates; }
    get templatePersist() { return this._templatePersist }
    get templateOpacity() { return this._templateOpacity }

    get switchType() { return this._switchType }
    get switchName() { return this._switchName }
    get switchDmgType() { return this._switchDmgType }
    get switchVariant() { return this._switchVariant }
    get switchColor() { return this._switchColor }
    get switchDetect() { return this._switchDetect }
    get switchRange() { return this._switchRange }
    get switchReturn() { return this._returning }

    get hasAttack() { return this._item?.hasAttack ?? false; }
    get hasDamage() { return this._item?.hasDamage ?? false; }


    getDistanceTo(target) {
        if (game.system.id === 'pf1') {
            const scene = game.scenes.active;
            const gridSize = scene.data.grid;

            const left = (token) => token.data.x;
            const right = (token) => token.data.x + token.w;
            const top = (token) => token.data.y;
            const bottom = (token) => token.data.y + token.h;

            const isLeftOf = right(this._actorToken) <= left(target);
            const isRightOf = left(this._actorToken) >= right(target);
            const isAbove = bottom(this._actorToken) <= top(target);
            const isBelow = top(this._actorToken) >= bottom(target);

            let x1 = left(this._actorToken);
            let x2 = left(target);
            let y1 = top(this._actorToken);
            let y2 = top(target);

            if (isLeftOf) {
                x1 += (this._actorToken.data.width - 1) * gridSize;
            }
            else if (isRightOf) {
                x2 += (target.data.width - 1) * gridSize;
            }

            if (isAbove) {
                y1 += (this._actorToken.data.height - 1) * gridSize;
            }
            else if (isBelow) {
                y2 += (target.data.height - 1) * gridSize;
            }

            const ray = new Ray({ x: x1, y: y1 }, { x: x2, y: y2 });
            const distance = canvas.grid.grid.measureDistances([{ ray }], { gridSpaces: true })[0];
            return distance;
        } else {
            var x, x1, y, y1, d, r, segments = [], rdistance, distance;
            for (x = 0; x < this._actorToken.data.width; x++) {
                for (y = 0; y < this._actorToken.data.height; y++) {
                    const origin = new PIXI.Point(...canvas.grid.getCenter(this._actorToken.data.x + (canvas.dimensions.size * x), this._actorToken.data.y + (canvas.dimensions.size * y)));
                    for (x1 = 0; x1 < target.data.width; x1++) {
                        for (y1 = 0; y1 < target.data.height; y1++) {
                            const dest = new PIXI.Point(...canvas.grid.getCenter(target.data.x + (canvas.dimensions.size * x1), target.data.y + (canvas.dimensions.size * y1)));
                            const r = new Ray(origin, dest);
                            segments.push({ ray: r });
                        }
                    }
                }
            }
            if (segments.length === 0) {
                return -1;
            }
            rdistance = canvas.grid.measureDistances(segments, { gridSpaces: true });
            distance = rdistance[0];
            rdistance.forEach(d => {
                if (d < distance)
                    distance = d;
            });
            return distance;
        }
    }

    _log(...args){
        if(this.debug) console.log(`DEBUG | Automated Animations |`, ...args);
    }

    _untangleVariants() {
        let variant;

        switch (true) {
            
        }
    }
}



