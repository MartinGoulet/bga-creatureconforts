var BgaAnimation = (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var _e = getDeltaCoordinates(element, settings), x = _e.x, y = _e.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = (_d = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _d !== void 0 ? _d : null;
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var _e = getDeltaCoordinates(element, settings), x = _e.x, y = _e.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg) scale(").concat((_d = settings.scale) !== null && _d !== void 0 ? _d : 1, ")");
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
    return Promise.resolve(false);
}
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var AnimationManager = (function () {
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    AnimationManager.prototype.play = function (animation) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function () {
            var settings, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3, 2];
                        settings = animation.settings;
                        (_a = settings.animationStart) === null || _a === void 0 ? void 0 : _a.call(settings, animation);
                        (_b = settings.element) === null || _b === void 0 ? void 0 : _b.classList.add((_c = settings.animationClass) !== null && _c !== void 0 ? _c : 'bga-animations_animated');
                        animation.settings = __assign(__assign({}, animation.settings), { duration: (_e = (_d = this.settings) === null || _d === void 0 ? void 0 : _d.duration) !== null && _e !== void 0 ? _e : 500, scale: (_g = (_f = this.zoomManager) === null || _f === void 0 ? void 0 : _f.zoom) !== null && _g !== void 0 ? _g : undefined });
                        _m = animation;
                        return [4, animation.animationFunction(this, animation)];
                    case 1:
                        _m.result = _o.sent();
                        (_j = (_h = animation.settings).animationEnd) === null || _j === void 0 ? void 0 : _j.call(_h, animation);
                        (_k = settings.element) === null || _k === void 0 ? void 0 : _k.classList.remove((_l = settings.animationClass) !== null && _l !== void 0 ? _l : 'bga-animations_animated');
                        return [3, 3];
                    case 2: return [2, Promise.resolve(animation)];
                    case 3: return [2];
                }
            });
        });
    };
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3, 3];
                        return [4, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2, __spreadArray([result], others, true)];
                    case 3: return [2, Promise.resolve([])];
                }
            });
        });
    };
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2, promise];
            });
        });
    };
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
    };
    return AnimationManager;
}());
var CardStock = (function () {
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock');
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    CardStock.prototype.isSelected = function (card) {
        var _this = this;
        return this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    CardStock.prototype.getCardElement = function (card) {
        return this.manager.getCardElement(card);
    };
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.contains(card);
    };
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b, _c;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
            if (!updateInformations) {
                element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
            }
        }
        else if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && animation.fromStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
        }
        else {
            var element = this.manager.createCardElement(card, ((_c = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _c !== void 0 ? _c : this.manager.isCardVisible(card)));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (updateInformations) {
            this.manager.updateCardInformations(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        var fromRect = element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.addCards = function (cards, animation, settings, shift) {
        if (shift === void 0) { shift = false; }
        return __awaiter(this, void 0, void 0, function () {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3, 4];
                        if (!cards.length) return [3, 3];
                        return [4, this.addCard(cards[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4, this.addCards(cards.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2, result || others];
                    case 3: return [3, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_2 = function (i) {
                                setTimeout(function () { return promises.push(_this.addCard(cards[i], animation, settings)); }, i * shift);
                            };
                            for (i = 0; i < cards.length; i++) {
                                _loop_2(i);
                            }
                        }
                        else {
                            promises = cards.map(function (card) { return _this.addCard(card, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2, results.some(function (result) { return result; })];
                }
            });
        });
    };
    CardStock.prototype.removeCard = function (card, settings) {
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            this.manager.removeCard(card, settings);
        }
        this.cardRemoved(card, settings);
    };
    CardStock.prototype.cardRemoved = function (card, settings) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    CardStock.prototype.removeCards = function (cards, settings) {
        var _this = this;
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    CardStock.prototype.removeAll = function (settings) {
        var _this = this;
        var cards = this.getCards();
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    CardStock.prototype.setSelectionMode = function (selectionMode, selectableCards) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(function (card) { return _this.removeSelectionClasses(card); });
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element.classList.toggle(unselectableCardsClass, !selectable);
        }
        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    };
    CardStock.prototype.setSelectableCards = function (selectableCards) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(function (card) { return _this.manager.getId(card); });
        this.cards.forEach(function (card) {
            return _this.setSelectableCard(card, selectableCardsIds.includes(_this.manager.getId(card)));
        });
    };
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        if (!element.classList.contains(selectableCardsClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.remove(selectedCardsClass);
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards();
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    CardStock.prototype.animationFromElement = function (element, fromRect, settings) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            cardSides_1 = element.getElementsByClassName('card-sides')[0];
                            cardSides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                cardSides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    CardStock.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    CardStock.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    CardStock.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardStock.prototype.removeSelectionClasses = function (card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    };
    CardStock.prototype.removeSelectionClassesFromElement = function (cardElement) {
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        var selectedCardsClass = this.getSelectedCardClass();
        cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    };
    return CardStock;
}());
var SlideAndBackAnimation = (function (_super) {
    __extends(SlideAndBackAnimation, _super);
    function SlideAndBackAnimation(manager, element, tempElement) {
        var _this = this;
        var distance = (manager.getCardWidth() + manager.getCardHeight()) / 2;
        var angle = Math.random() * Math.PI * 2;
        var fromDelta = {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
        };
        _this = _super.call(this, {
            animations: [
                new BgaSlideToAnimation({ element: element, fromDelta: fromDelta, duration: 250 }),
                new BgaSlideAnimation({ element: element, fromDelta: fromDelta, duration: 250, animationEnd: tempElement ? (function () { return element.remove(); }) : undefined }),
            ]
        }) || this;
        return _this;
    }
    return SlideAndBackAnimation;
}(BgaCumulatedAnimation));
var Deck = (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        _this.thicknesses = (_a = settings.thicknesses) !== null && _a !== void 0 ? _a : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_b = settings.cardNumber) !== null && _b !== void 0 ? _b : 52);
        _this.autoUpdateCardNumber = (_c = settings.autoUpdateCardNumber) !== null && _c !== void 0 ? _c : true;
        _this.autoRemovePreviousCards = (_d = settings.autoRemovePreviousCards) !== null && _d !== void 0 ? _d : true;
        var shadowDirection = (_e = settings.shadowDirection) !== null && _e !== void 0 ? _e : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard, undefined);
        }
        else if (settings.cardNumber > 0) {
            console.warn("Deck is defined with ".concat(settings.cardNumber, " cards but no top card !"));
        }
        if (settings.counter && ((_f = settings.counter.show) !== null && _f !== void 0 ? _f : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                throw new Error("You need to set cardNumber if you want to show the counter");
            }
            else {
                _this.createCounter((_g = settings.counter.position) !== null && _g !== void 0 ? _g : 'bottom', (_h = settings.counter.extraClasses) !== null && _h !== void 0 ? _h : 'round', settings.counter.counterId);
                if ((_j = settings.counter) === null || _j === void 0 ? void 0 : _j.hideWhenEmpty) {
                    _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
                }
            }
        }
        _this.setCardNumber((_k = settings.cardNumber) !== null && _k !== void 0 ? _k : 52);
        return _this;
    }
    Deck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    Deck.prototype.getCardNumber = function () {
        return this.cardNumber;
    };
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = null; }
        if (topCard) {
            this.addCard(topCard);
        }
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', "".concat(thickness, "px"));
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1);
        }
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(function () {
                var previousCards = _this.getCards().slice(0, -1);
                _this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    };
    Deck.prototype.cardRemoved = function (card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card, settings);
    };
    Deck.prototype.getTopCard = function () {
        var cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    };
    Deck.prototype.shuffle = function (animatedCardsMax, fakeCardSetter) {
        if (animatedCardsMax === void 0) { animatedCardsMax = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var animatedCards, elements, i, newCard, newElement;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            return [2, Promise.resolve(false)];
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3, 2];
                        elements = [this.getCardElement(this.getTopCard())];
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = {};
                            if (fakeCardSetter) {
                                fakeCardSetter(newCard, i);
                            }
                            else {
                                newCard.id = -100000 + i;
                            }
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _a.sent();
                        return [2, true];
                    case 2: return [2, Promise.resolve(false)];
                }
            });
        });
    };
    return Deck;
}(CardStock));
var LineStock = (function (_super) {
    __extends(LineStock, _super);
    function LineStock(manager, element, settings) {
        var _a, _b, _c, _d;
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineStock;
}(CardStock));
var SlotStock = (function (_super) {
    __extends(SlotStock, _super);
    function SlotStock(manager, element, settings) {
        var _a, _b;
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.slotsIds = [];
        _this.slots = [];
        element.classList.add('slot-stock');
        _this.mapCardToSlot = settings.mapCardToSlot;
        _this.slotsIds = (_a = settings.slotsIds) !== null && _a !== void 0 ? _a : [];
        _this.slotClasses = (_b = settings.slotClasses) !== null && _b !== void 0 ? _b : [];
        _this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
        return _this;
    }
    SlotStock.prototype.createSlot = function (slotId) {
        var _a;
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        (_a = this.slots[slotId].classList).add.apply(_a, __spreadArray(['slot'], this.slotClasses, true));
    };
    SlotStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
        if (slotId === undefined) {
            throw new Error("Impossible to add card to slot : no SlotId. Add slotId to settings or set mapCardToSlot to SlotCard constructor.");
        }
        if (!this.slots[slotId]) {
            throw new Error("Impossible to add card to slot \"".concat(slotId, "\" : slot \"").concat(slotId, "\" doesn't exists."));
        }
        var newSettings = __assign(__assign({}, settings), { forceToElement: this.slots[slotId] });
        return _super.prototype.addCard.call(this, card, animation, newSettings);
    };
    SlotStock.prototype.setSlotsIds = function (slotsIds) {
        var _this = this;
        if (slotsIds.length == this.slotsIds.length && slotsIds.every(function (slotId, index) { return _this.slotsIds[index] === slotId; })) {
            return;
        }
        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds !== null && slotsIds !== void 0 ? slotsIds : [];
        this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    SlotStock.prototype.canAddCard = function (card, settings) {
        var _a, _b;
        if (!this.contains(card)) {
            return true;
        }
        else {
            var currentCardSlot = this.getCardElement(card).closest('.slot').dataset.slotId;
            var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
            return currentCardSlot != slotId;
        }
    };
    SlotStock.prototype.swapCards = function (cards, settings) {
        var _this = this;
        if (!this.mapCardToSlot) {
            throw new Error('You need to define SlotStock.mapCardToSlot to use SlotStock.swapCards');
        }
        var promises = [];
        var elements = cards.map(function (card) { return _this.manager.getCardElement(card); });
        var elementsRects = elements.map(function (element) { return element.getBoundingClientRect(); });
        var cssPositions = elements.map(function (element) { return element.style.position; });
        elements.forEach(function (element) { return element.style.position = 'absolute'; });
        cards.forEach(function (card, index) {
            var _a, _b;
            var cardElement = elements[index];
            var promise;
            var slotId = (_a = _this.mapCardToSlot) === null || _a === void 0 ? void 0 : _a.call(_this, card);
            _this.slots[slotId].appendChild(cardElement);
            cardElement.style.position = cssPositions[index];
            var cardIndex = _this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (cardIndex !== -1) {
                _this.cards.splice(cardIndex, 1, card);
            }
            if ((_b = settings === null || settings === void 0 ? void 0 : settings.updateInformations) !== null && _b !== void 0 ? _b : true) {
                _this.manager.updateCardInformations(card);
            }
            _this.removeSelectionClassesFromElement(cardElement);
            promise = _this.animationFromElement(cardElement, elementsRects[index], {});
            if (!promise) {
                console.warn("CardStock.animationFromElement didn't return a Promise");
                promise = Promise.resolve(false);
            }
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settings === null || settings === void 0 ? void 0 : settings.selectable) !== null && _a !== void 0 ? _a : true); });
            promises.push(promise);
        });
        return Promise.all(promises);
    };
    return SlotStock;
}(LineStock));
var HandStock = (function (_super) {
    __extends(HandStock, _super);
    function HandStock(manager, element, settings) {
        var _a, _b, _c, _d;
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('hand-stock');
        element.style.setProperty('--card-overlap', (_a = settings.cardOverlap) !== null && _a !== void 0 ? _a : '60px');
        element.style.setProperty('--card-shift', (_b = settings.cardShift) !== null && _b !== void 0 ? _b : '15px');
        element.style.setProperty('--card-inclination', "".concat((_c = settings.inclination) !== null && _c !== void 0 ? _c : 12, "deg"));
        _this.inclination = (_d = settings.inclination) !== null && _d !== void 0 ? _d : 4;
        return _this;
    }
    HandStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateAngles();
        return promise;
    };
    HandStock.prototype.cardRemoved = function (card) {
        _super.prototype.cardRemoved.call(this, card);
        this.updateAngles();
    };
    HandStock.prototype.updateAngles = function () {
        var _this = this;
        var middle = (this.cards.length - 1) / 2;
        this.cards.forEach(function (card, index) {
            var middleIndex = index - middle;
            var cardElement = _this.getCardElement(card);
            cardElement.style.setProperty('--hand-stock-middle-index', "".concat(middleIndex));
            cardElement.style.setProperty('--hand-stock-middle-index-abs', "".concat(Math.abs(middleIndex)));
        });
    };
    return HandStock;
}(CardStock));
var CardManager = (function () {
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    CardManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div id=\"".concat(id, "-front\" class=\"card-side front\">\n                </div>\n                <div id=\"").concat(id, "-back\" class=\"card-side back\">\n                </div>\n            </div>\n        ");
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    CardManager.prototype.removeCard = function (card, settings) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return false;
        }
        div.id = "deleted".concat(id);
        div.remove();
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return true;
    };
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    CardManager.prototype.isCardVisible = function (card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    };
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _a !== void 0 ? _a : true) {
            var updateFrontDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _b !== void 0 ? _b : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _e !== void 0 ? _e : false) {
            var updateBackDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _f !== void 0 ? _f : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_h = (_g = this.settings).setupBackDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _j !== void 0 ? _j : true) {
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    CardManager.prototype.updateCardInformations = function (card, settings) {
        var newSettings = __assign(__assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
        this.setCardVisible(card, undefined, newSettings);
    };
    CardManager.prototype.getCardWidth = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    };
    CardManager.prototype.getCardHeight = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    };
    CardManager.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    CardManager.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    CardManager.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    return CardManager;
}());
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]) * direction;
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
var BgaDie6 = (function () {
    function BgaDie6(settings) {
        var _a;
        this.settings = settings;
        this.facesCount = 6;
        this.borderRadius = (_a = settings === null || settings === void 0 ? void 0 : settings.borderRadius) !== null && _a !== void 0 ? _a : 0;
    }
    BgaDie6.prototype.setupDieDiv = function (die, element) {
        element.classList.add('bga-dice_die6');
        element.style.setProperty('--bga-dice_border-radius', "".concat(this.borderRadius, "%"));
    };
    return BgaDie6;
}());
var DiceStock = (function () {
    function DiceStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.dice = [];
        this.selectedDice = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('bga-dice_die-stock');
        var perspective = this.getPerspective();
        element.style.setProperty('--perspective', perspective ? "".concat(perspective, "px") : 'unset');
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    DiceStock.prototype.getDice = function () {
        return this.dice.slice();
    };
    DiceStock.prototype.isEmpty = function () {
        return !this.dice.length;
    };
    DiceStock.prototype.getSelection = function () {
        return this.selectedDice.slice();
    };
    DiceStock.prototype.isSelected = function (die) {
        var _this = this;
        return this.selectedDice.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(die); });
    };
    DiceStock.prototype.contains = function (die) {
        var _this = this;
        return this.dice.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(die); });
    };
    DiceStock.prototype.getDieElement = function (die) {
        return this.manager.getDieElement(die);
    };
    DiceStock.prototype.canAddDie = function (die, settings) {
        return !this.contains(die);
    };
    DiceStock.prototype.addDie = function (die, animation, settings) {
        var _this = this;
        var _a;
        if (!this.canAddDie(die, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        var originStock = this.manager.getDieStock(die);
        var index = this.getNewDieIndex(die);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(die)) {
            var element = this.getDieElement(die);
            promise = this.moveFromOtherStock(die, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
        }
        else if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && animation.fromStock.contains(die)) {
            var element = this.getDieElement(die);
            promise = this.moveFromOtherStock(die, element, animation, settingsWithIndex);
        }
        else {
            var element = this.manager.createDieElement(die);
            promise = this.moveFromElement(die, element, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.dice.splice(index, 0, die);
        }
        else {
            this.dice.push(die);
        }
        if (updateInformations) {
            this.manager.updateDieInformations(die);
        }
        if (!promise) {
            console.warn("Dicetock.addDie didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            promise.then(function () { var _a; return _this.setSelectableDie(die, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        return promise;
    };
    DiceStock.prototype.getNewDieIndex = function (die) {
        if (this.sort) {
            var otherDice = this.getDice();
            for (var i = 0; i < otherDice.length; i++) {
                var otherDie = otherDice[i];
                if (this.sort(die, otherDie) < 0) {
                    return i;
                }
            }
            return otherDice.length;
        }
        else {
            return undefined;
        }
    };
    DiceStock.prototype.addDieElementToParent = function (dieElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(dieElement);
        }
        else {
            parent.insertBefore(dieElement, parent.children[settings.index]);
        }
    };
    DiceStock.prototype.moveFromOtherStock = function (die, dieElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(die) ? this.manager.getDieElement(die) : animation.fromStock.element;
        var fromRect = element.getBoundingClientRect();
        this.addDieElementToParent(dieElement, settings);
        this.removeSelectionClassesFromElement(dieElement);
        promise = this.animationFromElement(dieElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeDie(die);
        }
        if (!promise) {
            console.warn("Dicetock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    DiceStock.prototype.moveFromElement = function (die, dieElement, animation, settings) {
        var promise;
        this.addDieElementToParent(dieElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(dieElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeDie(die);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(dieElement, animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("Dicetock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    DiceStock.prototype.addDice = function (dice, animation, settings, shift) {
        if (shift === void 0) { shift = false; }
        return __awaiter(this, void 0, void 0, function () {
            var promises, result, others, _loop_3, i, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3, 4];
                        if (!dice.length) return [3, 3];
                        return [4, this.addDie(dice[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4, this.addDice(dice.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2, result || others];
                    case 3: return [3, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_3 = function (i) {
                                setTimeout(function () { return promises.push(_this.addDie(dice[i], animation, settings)); }, i * shift);
                            };
                            for (i = 0; i < dice.length; i++) {
                                _loop_3(i);
                            }
                        }
                        else {
                            promises = dice.map(function (die) { return _this.addDie(die, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2, results.some(function (result) { return result; })];
                }
            });
        });
    };
    DiceStock.prototype.removeDie = function (die) {
        if (this.contains(die) && this.element.contains(this.getDieElement(die))) {
            this.manager.removeDie(die);
        }
        this.dieRemoved(die);
    };
    DiceStock.prototype.dieRemoved = function (die) {
        var _this = this;
        var index = this.dice.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(die); });
        if (index !== -1) {
            this.dice.splice(index, 1);
        }
        if (this.selectedDice.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(die); })) {
            this.unselectDie(die);
        }
    };
    DiceStock.prototype.removeDice = function (dice) {
        var _this = this;
        dice.forEach(function (die) { return _this.removeDie(die); });
    };
    DiceStock.prototype.removeAll = function () {
        var _this = this;
        var dice = this.getDice();
        dice.forEach(function (die) { return _this.removeDie(die); });
    };
    DiceStock.prototype.setSelectionMode = function (selectionMode, selectableDice) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.dice.forEach(function (die) { return _this.setSelectableDie(die, selectionMode != 'none'); });
        this.element.classList.toggle('bga-dice_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getDice().forEach(function (die) { return _this.removeSelectionClasses(die); });
        }
        else {
            this.setSelectableDice(selectableDice !== null && selectableDice !== void 0 ? selectableDice : this.getDice());
        }
    };
    DiceStock.prototype.setSelectableDie = function (die, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getDieElement(die);
        var selectableDiceClass = this.getSelectableDieClass();
        var unselectableDiceClass = this.getUnselectableDieClass();
        if (selectableDiceClass) {
            element.classList.toggle(selectableDiceClass, selectable);
        }
        if (unselectableDiceClass) {
            element.classList.toggle(unselectableDiceClass, !selectable);
        }
        if (!selectable && this.isSelected(die)) {
            this.unselectDie(die, true);
        }
    };
    DiceStock.prototype.setSelectableDice = function (selectableDice) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableDiceIds = (selectableDice !== null && selectableDice !== void 0 ? selectableDice : this.getDice()).map(function (die) { return _this.manager.getId(die); });
        this.dice.forEach(function (die) {
            return _this.setSelectableDie(die, selectableDiceIds.includes(_this.manager.getId(die)));
        });
    };
    DiceStock.prototype.selectDie = function (die, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        var element = this.getDieElement(die);
        var selectableDiceClass = this.getSelectableDieClass();
        if (!element.classList.contains(selectableDiceClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.dice.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(die); }).forEach(function (c) { return _this.unselectDie(c, true); });
        }
        var selectedDiceClass = this.getSelectedDieClass();
        element.classList.add(selectedDiceClass);
        this.selectedDice.push(die);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedDice.slice(), die);
        }
    };
    DiceStock.prototype.unselectDie = function (die, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getDieElement(die);
        var selectedDiceClass = this.getSelectedDieClass();
        element.classList.remove(selectedDiceClass);
        var index = this.selectedDice.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(die); });
        if (index !== -1) {
            this.selectedDice.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedDice.slice(), die);
        }
    };
    DiceStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.dice.forEach(function (c) { return _this.selectDie(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedDice.slice(), null);
        }
    };
    DiceStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var dice = this.getDice();
        dice.forEach(function (c) { return _this.unselectDie(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedDice.slice(), null);
        }
    };
    DiceStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var dieDiv = event.target.closest('.bga-dice_die');
            if (!dieDiv) {
                return;
            }
            var die = _this.dice.find(function (c) { return _this.manager.getId(c) == dieDiv.id; });
            if (!die) {
                return;
            }
            _this.dieClick(die);
        });
    };
    DiceStock.prototype.dieClick = function (die) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedDice.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(die); });
            if (alreadySelected) {
                this.unselectDie(die);
            }
            else {
                this.selectDie(die);
            }
        }
        (_a = this.onDieClick) === null || _a === void 0 ? void 0 : _a.call(this, die);
    };
    DiceStock.prototype.animationFromElement = function (element, fromRect, settings) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var side, diceides_1, animation, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            diceides_1 = element.getElementsByClassName('die-sides')[0];
                            diceides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                diceides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    DiceStock.prototype.getPerspective = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.perspective) === undefined ? this.manager.getPerspective() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.perspective;
    };
    DiceStock.prototype.getSelectableDieClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableDieClass) === undefined ? this.manager.getSelectableDieClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableDieClass;
    };
    DiceStock.prototype.getUnselectableDieClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableDieClass) === undefined ? this.manager.getUnselectableDieClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableDieClass;
    };
    DiceStock.prototype.getSelectedDieClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedDieClass) === undefined ? this.manager.getSelectedDieClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedDieClass;
    };
    DiceStock.prototype.removeSelectionClasses = function (die) {
        this.removeSelectionClassesFromElement(this.getDieElement(die));
    };
    DiceStock.prototype.removeSelectionClassesFromElement = function (dieElement) {
        var selectableDiceClass = this.getSelectableDieClass();
        var unselectableDiceClass = this.getUnselectableDieClass();
        var selectedDiceClass = this.getSelectedDieClass();
        dieElement.classList.remove(selectableDiceClass, unselectableDiceClass, selectedDiceClass);
    };
    DiceStock.prototype.addRollEffectToDieElement = function (die, element, effect, duration) {
        var _a, _b;
        switch (effect) {
            case 'rollIn':
                this.manager.animationManager.play(new BgaSlideAnimation({
                    element: element,
                    duration: duration,
                    transitionTimingFunction: 'ease-out',
                    fromDelta: {
                        x: 0,
                        y: ((_a = this.manager.getDieType(die).size) !== null && _a !== void 0 ? _a : 50) * 5,
                    }
                }));
                break;
            case 'rollOutPauseAndBack':
                this.manager.animationManager.play(new BgaCumulatedAnimation({ animations: [
                        new BgaSlideToAnimation({
                            element: element,
                            duration: duration,
                            transitionTimingFunction: 'ease-out',
                            fromDelta: {
                                x: 0,
                                y: ((_b = this.manager.getDieType(die).size) !== null && _b !== void 0 ? _b : 50) * -5,
                            }
                        }),
                        new BgaPauseAnimation({}),
                        new BgaSlideToAnimation({
                            duration: 250,
                            transitionTimingFunction: 'ease-out',
                            element: element,
                            fromDelta: {
                                x: 0,
                                y: 0,
                            }
                        }),
                    ] }));
                break;
            case 'turn':
                this.manager.animationManager.play(new BgaPauseAnimation({ duration: duration }));
                break;
        }
    };
    DiceStock.prototype.rollDice = function (dice, settings) {
        var _this = this;
        dice.forEach(function (die) { return _this.rollDie(die, settings); });
    };
    DiceStock.prototype.rollDie = function (die, settings) {
        var _a, _b;
        var div = this.getDieElement(die);
        var faces = div.querySelector('.bga-dice_die-faces');
        faces.style.setProperty('--roll-duration', "0");
        faces.clientWidth;
        faces.dataset.visibleFace = "";
        faces.clientWidth;
        var rollEffect = (_a = settings === null || settings === void 0 ? void 0 : settings.effect) !== null && _a !== void 0 ? _a : 'rollIn';
        var animate = this.manager.animationManager.animationsActive() && rollEffect !== 'none';
        var duration = (_b = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _b !== void 0 ? _b : 1000;
        if (animate) {
            if (Array.isArray(duration)) {
                var diff = Math.abs(duration[1] - duration[0]);
                duration = Math.min.apply(Math, duration) + Math.floor(Math.random() * diff);
            }
            this.addRollEffectToDieElement(die, div, rollEffect, duration);
        }
        faces.style.setProperty('--roll-duration', "".concat(animate ? duration : 0, "ms"));
        faces.clientWidth;
        faces.dataset.visibleFace = "".concat(Math.floor(Math.random() * 6) + 1);
    };
    return DiceStock;
}());
var LineDiceStock = (function (_super) {
    __extends(LineDiceStock, _super);
    function LineDiceStock(manager, element, settings) {
        var _a, _b, _c, _d;
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('bga-dice_line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineDiceStock;
}(DiceStock));
var SlotDiceStock = (function (_super) {
    __extends(SlotDiceStock, _super);
    function SlotDiceStock(manager, element, settings) {
        var _a, _b;
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.slotsIds = [];
        _this.slots = [];
        element.classList.add('bga-dice_slot-stock');
        _this.mapDieToSlot = settings.mapDieToSlot;
        _this.slotsIds = (_a = settings.slotsIds) !== null && _a !== void 0 ? _a : [];
        _this.slotClasses = (_b = settings.slotClasses) !== null && _b !== void 0 ? _b : [];
        _this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
        return _this;
    }
    SlotDiceStock.prototype.createSlot = function (slotId) {
        var _a;
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        (_a = this.slots[slotId].classList).add.apply(_a, __spreadArray(['slot'], this.slotClasses, true));
    };
    SlotDiceStock.prototype.addDie = function (die, animation, settings) {
        var _a, _b;
        var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapDieToSlot) === null || _b === void 0 ? void 0 : _b.call(this, die);
        if (slotId === undefined) {
            throw new Error("Impossible to add die to slot : no SlotId. Add slotId to settings or set mapDieToSlot to SlotDie constructor.");
        }
        if (!this.slots[slotId]) {
            throw new Error("Impossible to add die to slot \"".concat(slotId, "\" : slot \"").concat(slotId, "\" doesn't exists."));
        }
        var newSettings = __assign(__assign({}, settings), { forceToElement: this.slots[slotId] });
        return _super.prototype.addDie.call(this, die, animation, newSettings);
    };
    SlotDiceStock.prototype.setSlotsIds = function (slotsIds) {
        var _this = this;
        if (slotsIds.length == this.slotsIds.length && slotsIds.every(function (slotId, index) { return _this.slotsIds[index] === slotId; })) {
            return;
        }
        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds !== null && slotsIds !== void 0 ? slotsIds : [];
        this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    SlotDiceStock.prototype.canAddDie = function (die, settings) {
        var _a, _b;
        if (!this.contains(die)) {
            return true;
        }
        else {
            var currentDicelot = this.getDieElement(die).closest('.slot').dataset.slotId;
            var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapDieToSlot) === null || _b === void 0 ? void 0 : _b.call(this, die);
            return currentDicelot != slotId;
        }
    };
    SlotDiceStock.prototype.swapDice = function (dice, settings) {
        var _this = this;
        if (!this.mapDieToSlot) {
            throw new Error('You need to define SlotStock.mapDieToSlot to use SlotStock.swapDice');
        }
        var promises = [];
        var elements = dice.map(function (die) { return _this.manager.getDieElement(die); });
        var elementsRects = elements.map(function (element) { return element.getBoundingClientRect(); });
        var cssPositions = elements.map(function (element) { return element.style.position; });
        elements.forEach(function (element) { return element.style.position = 'absolute'; });
        dice.forEach(function (die, index) {
            var _a, _b;
            var dieElement = elements[index];
            var promise;
            var slotId = (_a = _this.mapDieToSlot) === null || _a === void 0 ? void 0 : _a.call(_this, die);
            _this.slots[slotId].appendChild(dieElement);
            dieElement.style.position = cssPositions[index];
            var dieIndex = _this.dice.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(die); });
            if (dieIndex !== -1) {
                _this.dice.splice(dieIndex, 1, die);
            }
            if ((_b = settings === null || settings === void 0 ? void 0 : settings.updateInformations) !== null && _b !== void 0 ? _b : true) {
                _this.manager.updateDieInformations(die);
            }
            _this.removeSelectionClassesFromElement(dieElement);
            promise = _this.animationFromElement(dieElement, elementsRects[index], {});
            if (!promise) {
                console.warn("Dicetock.animationFromElement didn't return a Promise");
                promise = Promise.resolve(false);
            }
            promise.then(function () { var _a; return _this.setSelectableDie(die, (_a = settings === null || settings === void 0 ? void 0 : settings.selectable) !== null && _a !== void 0 ? _a : true); });
            promises.push(promise);
        });
        return Promise.all(promises);
    };
    return SlotDiceStock;
}(LineDiceStock));
var DiceManager = (function () {
    function DiceManager(game, settings) {
        var _this = this;
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.registeredDieTypes = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
        if (settings.dieTypes) {
            Object.entries(settings.dieTypes).forEach(function (entry) { return _this.setDieType(entry[0], entry[1]); });
        }
    }
    DiceManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
    DiceManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    DiceManager.prototype.setDieType = function (type, dieType) {
        this.registeredDieTypes[type] = dieType;
    };
    DiceManager.prototype.getDieType = function (die) {
        return this.registeredDieTypes[die.type];
    };
    DiceManager.prototype.getId = function (die) {
        return "bga-die-".concat(die.type, "-").concat(die.id);
    };
    DiceManager.prototype.createDieElement = function (die) {
        var _a, _b, _c;
        var id = this.getId(die);
        if (this.getDieElement(die)) {
            throw new Error("This die already exists ".concat(JSON.stringify(die)));
        }
        var dieType = this.registeredDieTypes[die.type];
        if (!dieType) {
            throw new Error("This die type doesn't exists ".concat(die.type));
        }
        var element = document.createElement("div");
        element.id = id;
        element.classList.add('bga-dice_die');
        element.style.setProperty('--size', "".concat((_a = dieType.size) !== null && _a !== void 0 ? _a : 50, "px"));
        var dieFaces = document.createElement("div");
        dieFaces.classList.add('bga-dice_die-faces');
        dieFaces.dataset.visibleFace = '' + die.face;
        element.appendChild(dieFaces);
        var facesElements = [];
        for (var i = 1; i <= dieType.facesCount; i++) {
            facesElements[i] = document.createElement("div");
            facesElements[i].id = "".concat(id, "-face-").concat(i);
            facesElements[i].classList.add('bga-dice_die-face');
            facesElements[i].dataset.face = '' + i;
            dieFaces.appendChild(facesElements[i]);
            element.dataset.face = '' + i;
        }
        document.body.appendChild(element);
        (_b = dieType.setupDieDiv) === null || _b === void 0 ? void 0 : _b.call(dieType, die, element);
        if (dieType.setupFaceDiv) {
            for (var i = 1; i <= dieType.facesCount; i++) {
                (_c = dieType.setupFaceDiv) === null || _c === void 0 ? void 0 : _c.call(dieType, die, facesElements[i], i);
            }
        }
        document.body.removeChild(element);
        return element;
    };
    DiceManager.prototype.getDieElement = function (die) {
        return document.getElementById(this.getId(die));
    };
    DiceManager.prototype.removeDie = function (die) {
        var _a;
        var id = this.getId(die);
        var div = document.getElementById(id);
        if (!div) {
            return false;
        }
        div.id = "deleted".concat(id);
        div.remove();
        (_a = this.getDieStock(die)) === null || _a === void 0 ? void 0 : _a.dieRemoved(die);
        return true;
    };
    DiceManager.prototype.getDieStock = function (die) {
        return this.stocks.find(function (stock) { return stock.contains(die); });
    };
    DiceManager.prototype.updateDieInformations = function (die, updateData) {
        var _this = this;
        var div = this.getDieElement(die);
        div.dataset.visibleFace = '' + die.face;
        if (updateData !== null && updateData !== void 0 ? updateData : true) {
            var stock = this.getDieStock(die);
            var dice = stock.getDice();
            var dieIndex = dice.findIndex(function (c) { return _this.getId(c) === _this.getId(die); });
            if (dieIndex !== -1) {
                stock.dice.splice(dieIndex, 1, die);
            }
        }
    };
    DiceManager.prototype.getPerspective = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.perspective) === undefined ? 1000 : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.perspective;
    };
    DiceManager.prototype.getSelectableDieClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableDieClass) === undefined ? 'bga-dice_selectable-die' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableDieClass;
    };
    DiceManager.prototype.getUnselectableDieClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableDieClass) === undefined ? 'bga-dice_disabled-die' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableDieClass;
    };
    DiceManager.prototype.getSelectedDieClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedDieClass) === undefined ? 'bga-dice_selected-die' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedDieClass;
    };
    return DiceManager;
}());
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]) * direction;
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var debug = isDebug ? console.log.bind(window.console) : function () { };
var arrayRange = function (start, end) { return Array.from(Array(end - start + 1).keys()).map(function (x) { return x + start; }); };
var GOODS = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain'];
var ICONS = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain', 'lesson', 'story', 'coin'];
var CreatureConforts = (function () {
    function CreatureConforts() {
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
    }
    CreatureConforts.prototype.setup = function (gamedatas) {
        var _this = this;
        debug(gamedatas);
        this.confortManager = new ConfortManager(this);
        this.improvementManager = new ImprovementManager(this);
        this.travelerManager = new TravelerManager(this);
        this.valleyManager = new ValleyManager(this);
        this.diceManager = new MyDiceManager(this);
        this.cottageManager = new CottageManager(this);
        this.workerManager = new WorkerManager(this);
        this.notifManager = new NotificationManager(this);
        this.stateManager = new StateManager(this);
        this.tableCenter = new TableCenter(this);
        ['red', 'yellow', 'green', 'gray', 'purple'].forEach(function (color) {
            _this.dontPreloadImage("board_".concat(color, ".jpg"));
            _this.dontPreloadImage("dice_".concat(color, ".jpg"));
        });
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        this.setupNotifications();
    };
    CreatureConforts.prototype.onEnteringState = function (stateName, args) {
        this.stateManager.onEnteringState(stateName, args);
    };
    CreatureConforts.prototype.onLeavingState = function (stateName) {
        this.stateManager.onLeavingState(stateName);
    };
    CreatureConforts.prototype.onUpdateActionButtons = function (stateName, args) {
        this.stateManager.onUpdateActionButtons(stateName, args);
    };
    CreatureConforts.prototype.addActionButtonDisabled = function (id, label, action) {
        this.addActionButton(id, label, action);
        this.disableButton(id);
    };
    CreatureConforts.prototype.addActionButtonClientCancel = function () {
        var _this = this;
        var handleCancel = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            _this.restoreGameState();
        };
        this.addActionButtonGray('btnCancelAction', _('Cancel'), handleCancel);
    };
    CreatureConforts.prototype.addActionButtonPass = function () {
        var _this = this;
        var handlePass = function () {
            _this.takeAction('pass');
        };
        this.addActionButtonRed('btn_pass', _('Pass'), handlePass);
    };
    CreatureConforts.prototype.addActionButtonUndo = function () {
        var _this = this;
        var handleUndo = function () {
            _this.takeAction('undo');
        };
        this.addActionButtonGray('btn_undo', _('Undo'), handleUndo);
    };
    CreatureConforts.prototype.addActionButtonGray = function (id, label, action) {
        this.addActionButton(id, label, action, null, null, 'gray');
    };
    CreatureConforts.prototype.addActionButtonRed = function (id, label, action) {
        this.addActionButton(id, label, action, null, null, 'red');
    };
    CreatureConforts.prototype.addActionButtonReset = function (parent, handle) {
        this.addActionButton('btn_reset', _('Reset'), handle, parent, false, 'gray');
    };
    CreatureConforts.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        this.playersPanels = [];
        gamedatas.playerorder.forEach(function (player_id) {
            var player = gamedatas.players[Number(player_id)];
            var panel = new PlayerPanel(_this, player);
            _this.playersPanels.push(panel);
        });
    };
    CreatureConforts.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        this.playersTables = [];
        gamedatas.playerorder.forEach(function (player_id) {
            var player = gamedatas.players[Number(player_id)];
            var table = new PlayerTable(_this, player);
            _this.playersTables.push(table);
        });
    };
    CreatureConforts.prototype.toggleButtonEnable = function (id, enabled, color) {
        if (color === void 0) { color = 'blue'; }
        if (enabled) {
            this.enableButton(id, color);
        }
        else {
            this.disableButton(id);
        }
    };
    CreatureConforts.prototype.disableButton = function (id) {
        var el = document.getElementById(id);
        if (el) {
            el.classList.remove('bgabutton_blue');
            el.classList.remove('bgabutton_red');
            el.classList.add('bgabutton_disabled');
        }
    };
    CreatureConforts.prototype.enableButton = function (id, color) {
        if (color === void 0) { color = 'blue'; }
        var el = document.getElementById(id);
        if (el) {
            el.classList.add("bgabutton_".concat(color));
            el.classList.remove('bgabutton_disabled');
        }
    };
    CreatureConforts.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    CreatureConforts.prototype.getPlayerPanel = function (playerId) {
        return this.playersPanels.find(function (playerPanel) { return playerPanel.player_id === playerId; });
    };
    CreatureConforts.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.player_id === playerId; });
    };
    CreatureConforts.prototype.getCurrentPlayerTable = function () {
        return this.getPlayerTable(this.getPlayerId());
    };
    CreatureConforts.prototype.restoreGameState = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug('restoreGameState');
                        return [4, this.stateManager.restoreGameState()];
                    case 1:
                        _a.sent();
                        this.clearSelection();
                        this.restoreServerGameState();
                        return [2];
                }
            });
        });
    };
    CreatureConforts.prototype.clearSelection = function () {
        debug('clearSelection');
    };
    CreatureConforts.prototype.takeAction = function (action, data, onSuccess, onComplete) {
        data = data || {};
        data.lock = true;
        onSuccess = onSuccess !== null && onSuccess !== void 0 ? onSuccess : function (result) { };
        onComplete = onComplete !== null && onComplete !== void 0 ? onComplete : function (is_error) { };
        this.ajaxcall("/creatureconforts/creatureconforts/".concat(action, ".html"), data, this, onSuccess, onComplete);
    };
    CreatureConforts.prototype.setupNotifications = function () {
        debug('notifications subscriptions setup');
        this.notifManager.setup();
    };
    CreatureConforts.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                args.processed = true;
                if (args.card_name !== undefined) {
                    args.card_name = '<b>' + _(args.card_name) + '</b>';
                }
                if (args.rolledDice !== undefined) {
                    args.rolledDice = this.formatTextDice(args.player_id, args.rolledDice);
                }
                if (args.resources_from !== undefined) {
                    args.resources_from = this.formatResourceIcons(args.resources_from);
                }
                if (args.resources_to !== undefined) {
                    args.resources_to = this.formatResourceIcons(args.resources_to);
                }
                if (args.nbr_cards !== undefined) {
                    args.nbr_cards = "<div class=\"cc-icon i-cards\"><span>".concat(args.nbr_cards, "</span></div>");
                }
            }
        }
        catch (e) {
            console.error(log, args, 'Exception thrown', e.stack);
        }
        try {
            return this.inherited(arguments);
        }
        catch (_a) {
            debugger;
        }
    };
    CreatureConforts.prototype.formatTextDice = function (player_id, rawText) {
        if (!rawText)
            return '';
        var dice = rawText.split(',');
        var values = [];
        var color = dice.length == 2 ? this.getPlayerTable(player_id).player_color : 'white';
        dice.forEach(function (value) {
            values.push("<div class=\"dice-icon-log bga-dice_die colored-die bga-dice_die-face\" data-face=\"".concat(value, "\" data-color=\"").concat(color, "\"><span>").concat(value, "<span></div>"));
        });
        return values.join('');
    };
    CreatureConforts.prototype.formatResourceIcons = function (group) {
        var values = [];
        Object.keys(group).forEach(function (icon) {
            for (var index = 0; index < group[icon]; index++) {
                values.push("<div class=\"resource-icon\" data-type=\"".concat(icon, "\"></div>"));
            }
        });
        return values.join('');
    };
    return CreatureConforts;
}());
var ResourceCounter = (function () {
    function ResourceCounter(id, parent, icon, settings) {
        var _this = this;
        this.id = id;
        this.icon = icon;
        this.settings = settings;
        var initialValue = settings.initialValue, disabled = settings.disabled;
        var html = "<div id=\"".concat(id, "-").concat(icon, "\" class=\"wrapper\" data-type=\"").concat(icon, "\">\n         <span id=\"").concat(id, "-").concat(icon, "-counter\" class=\"counter\">-</span>\n         <div class=\"resource-icon\" data-type=\"").concat(icon, "\"></div>\n      </div>");
        parent.insertAdjacentHTML('beforeend', html);
        this.counter = new ebg.counter();
        this.counter.create("".concat(id, "-").concat(icon, "-counter"));
        this.counter.setValue(initialValue !== null && initialValue !== void 0 ? initialValue : 0);
        document.getElementById("".concat(id, "-").concat(icon)).addEventListener('click', function () {
            if (_this.onClick &&
                _this.counter.getValue() > 0 &&
                !document.getElementById("".concat(_this.id, "-").concat(_this.icon)).classList.contains('disabled')) {
                _this.onClick();
                _this.counter.incValue(-1);
                if (_this.counter.getValue() == 0) {
                    _this.disabled(true);
                }
            }
        });
        if (disabled)
            this.disabled(true);
    }
    ResourceCounter.prototype.disabled = function (value) {
        document.getElementById("".concat(this.id, "-").concat(this.icon)).classList.toggle('disabled', value == true);
    };
    ResourceCounter.prototype.getValue = function () {
        return this.counter.getValue();
    };
    ResourceCounter.prototype.incValue = function (value) {
        this.counter.incValue(value);
        if (this.counter.getValue() == 0)
            this.disabled(true);
    };
    ResourceCounter.prototype.setValue = function (value) {
        this.counter.setValue(value);
        if (this.counter.getValue() == 0)
            this.disabled(true);
    };
    ResourceCounter.prototype.reset = function () {
        var _a = this.settings, initialValue = _a.initialValue, enabled = _a.disabled;
        this.counter.setValue(initialValue !== null && initialValue !== void 0 ? initialValue : 0);
        this.disabled(enabled);
    };
    return ResourceCounter;
}());
var PlayerResourceCounter = (function () {
    function PlayerResourceCounter(game, element, id, settings) {
        var _this = this;
        if (settings === void 0) { settings = {}; }
        var _a, _b;
        this.counters = {};
        var player_id = (_a = settings.player_id) !== null && _a !== void 0 ? _a : game.getPlayerId();
        var player_counters = game.getPlayerPanel(player_id).counters;
        var handleResourceClick = function (type, counter) {
            if (_this.onResourceClick)
                _this.onResourceClick(type);
        };
        var icons = (_b = settings.icons) !== null && _b !== void 0 ? _b : ICONS;
        icons.forEach(function (icon) {
            var _a;
            var value = (_a = settings.initialValue) !== null && _a !== void 0 ? _a : player_counters[icon].getValue();
            _this.counters[icon] = new ResourceCounter(id, element, icon, {
                initialValue: value,
                disabled: value == 0 || icons.indexOf(icon) < 0,
            });
            _this.counters[icon].onClick = function () { return handleResourceClick(icon, _this.counters[icon]); };
        });
    }
    PlayerResourceCounter.prototype.reset = function () {
        var _this = this;
        Object.keys(this.counters).forEach(function (type) {
            _this.counters[type].reset();
        });
    };
    PlayerResourceCounter.prototype.disabled = function () {
        var _this = this;
        Object.keys(this.counters).forEach(function (type) {
            _this.counters[type].disabled(true);
        });
    };
    return PlayerResourceCounter;
}());
var ResourceLineStock = (function () {
    function ResourceLineStock(element, settings) {
        if (settings === void 0) { settings = {}; }
        this.element = element;
        this.settings = settings;
        this.resources = [];
    }
    ResourceLineStock.prototype.add = function (resource) {
        this.resources.push(resource);
        this.element.insertAdjacentHTML('beforeend', ResourceHelper.getElement(resource));
    };
    ResourceLineStock.prototype.getResources = function () {
        return __spreadArray([], this.resources, true);
    };
    ResourceLineStock.prototype.isFull = function () {
        return false;
    };
    ResourceLineStock.prototype.reset = function () {
        this.resources = [];
        while (this.element.children.length > 0) {
            this.element.removeChild(this.element.childNodes[0]);
        }
    };
    return ResourceLineStock;
}());
var ResourcePlaceholder = (function () {
    function ResourcePlaceholder(parent) {
        this.resource = null;
        this.element = document.createElement('div');
        this.element.classList.add('placeholder');
        parent.insertAdjacentElement('beforeend', this.element);
    }
    ResourcePlaceholder.prototype.getResource = function () {
        return this.resource;
    };
    ResourcePlaceholder.prototype.destroy = function () {
        this.element.remove();
    };
    ResourcePlaceholder.prototype.reset = function () {
        this.resource = null;
        while (this.element.children.length > 0) {
            this.element.removeChild(this.element.childNodes[0]);
        }
    };
    ResourcePlaceholder.prototype.add = function (type) {
        this.resource = type;
        this.element.insertAdjacentHTML('beforeend', ResourceHelper.getElement(type));
    };
    return ResourcePlaceholder;
}());
var ResourcePlaceholderLineStock = (function () {
    function ResourcePlaceholderLineStock(element, count, settings) {
        var _a, _b;
        this.element = element;
        this.count = count;
        this.settings = settings;
        this.placeholders = [];
        var restriction = (_a = settings === null || settings === void 0 ? void 0 : settings.restriction) !== null && _a !== void 0 ? _a : 'none';
        if ((_b = settings.expandable) !== null && _b !== void 0 ? _b : false) {
        }
        else {
            for (var index = 0; index < count; index++) {
                this.placeholders.push(new ResourcePlaceholder(element));
                if (restriction == 'same') {
                    element.insertAdjacentHTML('beforeend', ResourceHelper.getIconSame());
                }
                else if (restriction == 'different') {
                    element.insertAdjacentHTML('beforeend', ResourceHelper.getIconDifferent());
                }
            }
        }
    }
    ResourcePlaceholderLineStock.prototype.addPlaceholder = function () {
        this.placeholders.push(new ResourcePlaceholder(this.element));
    };
    ResourcePlaceholderLineStock.prototype.countPlaceholder = function () {
        return this.placeholders.length;
    };
    ResourcePlaceholderLineStock.prototype.isExpandable = function () {
        var _a, _b;
        return (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.expandable) !== null && _b !== void 0 ? _b : false;
    };
    ResourcePlaceholderLineStock.prototype.add = function (resource) {
        var count = this.getResources().length;
        this.placeholders[count].add(resource);
    };
    ResourcePlaceholderLineStock.prototype.isFull = function () {
        return this.placeholders.every(function (p) { return p.getResource() != null; });
    };
    ResourcePlaceholderLineStock.prototype.getResources = function () {
        return this.placeholders.map(function (p) { return p.getResource(); }).filter(function (r) { return r !== null; });
    };
    ResourcePlaceholderLineStock.prototype.reset = function () {
        var _a, _b;
        if ((_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.expandable) !== null && _b !== void 0 ? _b : false) {
            this.placeholders.forEach(function (p) { return p.destroy(); });
            this.placeholders = [];
        }
        else {
            this.placeholders.forEach(function (p) { return p.reset(); });
        }
    };
    return ResourcePlaceholderLineStock;
}());
var ResourceHelper = (function () {
    function ResourceHelper() {
    }
    ResourceHelper.getElement = function (type) {
        return "<div class=\"resource-icon\" data-type=\"".concat(type, "\"></div>");
    };
    ResourceHelper.getIconSame = function () {
        return '<div class="resource-icon same"></div>';
    };
    ResourceHelper.getIconDifferent = function () {
        return '<div class="resource-icon different"></div>';
    };
    ResourceHelper.convertToInt = function (icons) {
        return icons.map(function (type) { return ICONS.indexOf(type) + 1; });
    };
    ResourceHelper.isRequirementMet = function (game, cost) {
        var counters = game.getPlayerPanel(game.getPlayerId()).counters;
        for (var _i = 0, _a = Object.keys(cost); _i < _a.length; _i++) {
            var type = _a[_i];
            if (type !== '*' && counters[type].getValue() < cost[type]) {
                return false;
            }
        }
        if ('*' in cost) {
            var total_goods = GOODS.map(function (type) { return counters[type].getValue(); }).reduce(function (prev, curr) { return prev + curr; }, 0);
            var total_cost = Object.keys(cost)
                .filter(function (type) { return GOODS.indexOf(type) >= 0; })
                .map(function (type) { return cost[type]; })
                .reduce(function (prev, curr) { return prev + curr; }, 0);
            return total_goods >= total_cost;
        }
        return true;
    };
    return ResourceHelper;
}());
var HiddenDeck = (function (_super) {
    __extends(HiddenDeck, _super);
    function HiddenDeck(manager, element) {
        var _this = _super.call(this, manager, element, {
            cardNumber: 0,
            counter: {
                hideWhenEmpty: false,
            },
            autoRemovePreviousCards: false,
        }) || this;
        _this.manager = manager;
        _this.element = element;
        return _this;
    }
    HiddenDeck.prototype.addCard = function (card, animation, settings) {
        var _a;
        settings = settings !== null && settings !== void 0 ? settings : {};
        settings.index = (_a = settings.index) !== null && _a !== void 0 ? _a : 0;
        return _super.prototype.addCard.call(this, card, animation, settings);
    };
    return HiddenDeck;
}(Deck));
var VisibleDeck = (function (_super) {
    __extends(VisibleDeck, _super);
    function VisibleDeck(manager, element) {
        var _this = _super.call(this, manager, element, {
            cardNumber: 0,
            counter: {
                hideWhenEmpty: false,
            },
            autoRemovePreviousCards: false,
        }) || this;
        _this.manager = manager;
        _this.element = element;
        return _this;
    }
    return VisibleDeck;
}(Deck));
var Hand = (function (_super) {
    __extends(Hand, _super);
    function Hand(manager, element, current_player) {
        var _this = _super.call(this, manager, element, {
            cardOverlap: '30px',
            cardShift: '6px',
            inclination: 6,
            sort: sortFunction('type_arg'),
        }) || this;
        _this.current_player = current_player;
        return _this;
    }
    Hand.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var copy = __assign({}, card);
        if (!this.current_player) {
            copy.type = null;
            copy.type_arg = null;
        }
        return new Promise(function (resolve) {
            _super.prototype.addCard.call(_this, copy, animation, settings)
                .then(function () { return resolve(true); });
        });
    };
    Hand.prototype.removeCard = function (card, settings) {
        _super.prototype.removeCard.call(this, card, settings);
    };
    return Hand;
}(HandStock));
var HiddenLineStock = (function (_super) {
    __extends(HiddenLineStock, _super);
    function HiddenLineStock(manager, element) {
        return _super.call(this, manager, element) || this;
    }
    HiddenLineStock.prototype.addCard = function (card, animation, settings) {
        var copy = __assign(__assign({}, card), { type: '', type_arg: '' });
        return _super.prototype.addCard.call(this, copy);
    };
    return HiddenLineStock;
}(LineStock));
var DiscardStock = (function (_super) {
    __extends(DiscardStock, _super);
    function DiscardStock(manager, element) {
        return _super.call(this, manager, element) || this;
    }
    DiscardStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.onAddCard(__assign({}, card));
        return promise;
    };
    DiscardStock.prototype.removeCard = function (card, settings) {
        var copy = __assign({}, card);
        _super.prototype.removeCard.call(this, card, settings);
        this.onRemoveCard(copy);
    };
    return DiscardStock;
}(VisibleDeck));
var LocationStock = (function (_super) {
    __extends(LocationStock, _super);
    function LocationStock(manager, element, settings) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.selectedLocations = [];
        var handleMeepleClick = function (meeple) {
            if (_this.OnLocationClick && _this.slots[meeple.location_arg].classList.contains('selectable')) {
                _this.OnLocationClick(meeple.location_arg);
            }
        };
        _this.onCardClick = handleMeepleClick;
        return _this;
    }
    LocationStock.prototype.createSlot = function (slotId) {
        var _this = this;
        _super.prototype.createSlot.call(this, slotId);
        var handleClick = function (ev) {
            if (_this.OnLocationClick && ev.target.classList.contains('selectable')) {
                _this.OnLocationClick(slotId);
            }
        };
        this.slots[slotId].addEventListener('click', handleClick);
    };
    LocationStock.prototype.getSelectedLocation = function () {
        return this.selectedLocations;
    };
    LocationStock.prototype.isSelectedLocation = function (slotId) {
        return this.slots[Number(slotId)].classList.contains('selected');
    };
    LocationStock.prototype.setSelectableLocation = function (locations) {
        var _this = this;
        if (locations === void 0) { locations = []; }
        this.slots.forEach(function (slot) {
            slot.classList.toggle('selectable', false);
        });
        locations.forEach(function (sel) { return _this.slots[sel].classList.toggle('selectable', true); });
    };
    LocationStock.prototype.setSelectedLocation = function (locations) {
        var _this = this;
        if (locations === void 0) { locations = []; }
        this.selectedLocations = locations;
        this.slots.forEach(function (slot) {
            slot.classList.toggle('selected', false);
        });
        locations.forEach(function (sel) { return _this.slots[sel].classList.toggle('selected', true); });
        this.element.classList.toggle('has-selected-location', locations.length > 0);
    };
    return LocationStock;
}(SlotStock));
var ColoredDie6 = (function (_super) {
    __extends(ColoredDie6, _super);
    function ColoredDie6(color, size) {
        if (size === void 0) { size = 40; }
        var _this = _super.call(this, { borderRadius: 12 }) || this;
        _this.color = color;
        _this.size = size;
        return _this;
    }
    ColoredDie6.prototype.setupDieDiv = function (die, element) {
        _super.prototype.setupDieDiv.call(this, die, element);
        element.classList.add('colored-die');
        element.dataset.color = '' + this.color;
    };
    ColoredDie6.prototype.setupFaceDiv = function (die, element, face) { };
    return ColoredDie6;
}(BgaDie6));
var MyDiceManager = (function (_super) {
    __extends(MyDiceManager, _super);
    function MyDiceManager(game) {
        return _super.call(this, game, {
            dieTypes: {
                gray: new ColoredDie6('gray'),
                green: new ColoredDie6('green'),
                purple: new ColoredDie6('purple'),
                red: new ColoredDie6('red'),
                yellow: new ColoredDie6('yellow'),
                white: new ColoredDie6('white'),
                '7e797b': new ColoredDie6('gray'),
                '13586b': new ColoredDie6('green'),
                '650e41': new ColoredDie6('purple'),
                b7313e: new ColoredDie6('red'),
                dcac28: new ColoredDie6('yellow'),
            },
        }) || this;
    }
    return MyDiceManager;
}(DiceManager));
var PlayerDiceStock = (function (_super) {
    __extends(PlayerDiceStock, _super);
    function PlayerDiceStock(manager, element) {
        var _this = _super.call(this, manager, element, {
            gap: '10px',
            sort: sortFunction('id'),
        }) || this;
        _this.manager = manager;
        _this.element = element;
        return _this;
    }
    PlayerDiceStock.prototype.rollDie = function (die, settings) {
        _super.prototype.rollDie.call(this, die, settings);
        var div = this.getDieElement(die);
        var faces = div.querySelector('.bga-dice_die-faces');
        faces.dataset.visibleFace = "".concat(die.face);
    };
    return PlayerDiceStock;
}(LineDiceStock));
var VillageDiceStock = (function (_super) {
    __extends(VillageDiceStock, _super);
    function VillageDiceStock(manager, element) {
        var _this = _super.call(this, manager, element, {
            gap: '5px',
            sort: sortFunction('id'),
        }) || this;
        _this.manager = manager;
        _this.element = element;
        return _this;
    }
    VillageDiceStock.prototype.rollDie = function (die, settings) {
        _super.prototype.rollDie.call(this, die, settings);
        var div = this.getDieElement(die);
        var faces = div.querySelector('.bga-dice_die-faces');
        faces.dataset.visibleFace = "".concat(die.face);
    };
    return VillageDiceStock;
}(LineDiceStock));
var DiceHelper = (function () {
    function DiceHelper(game) {
        this.game = game;
    }
    DiceHelper.prototype.getTotalDiceSlot = function (location_id) {
        if (location_id > 4) {
            return 1;
        }
        return this.getValleyLocationInfo(location_id).count;
    };
    DiceHelper.prototype.isRequirementMet = function (location_id, dice) {
        if (dice.length == 0)
            return true;
        var requirement = null;
        if (location_id >= 1 && location_id <= 4) {
            var info = this.getValleyLocationInfo(location_id);
            if (info.count > 0 && info.count !== dice.length)
                return false;
            requirement = this.getValleyRequirement(info);
        }
        else if (location_id >= 5 && location_id <= 7) {
            requirement = new DialRequirement(this.game.gamedatas.river_dial, location_id);
        }
        return requirement.isRequirementMet(dice.map(function (d) { return Number(d.face); }).sort(function (a, b) { return a - b; }));
    };
    DiceHelper.prototype.getValleyLocationInfo = function (location_id) {
        var location = location_id <= 2 ? 'forest' : 'meadow';
        var card = this.game.tableCenter.valley.getCards().filter(function (card) { return card.location == location; })[0];
        return this.game.gamedatas.valley_types[Number(card.type_arg)].position[location_id];
    };
    DiceHelper.prototype.getValleyRequirement = function (_a) {
        var count = _a.count, values = _a.values, rule = _a.rule;
        if (values) {
            return new ValuesRequirement(values);
        }
        switch (rule) {
            case '3_OR_UNDER':
                return new ValueTotalLowerRequirement(3);
            case '4_OR_HIGHER':
                return new ValueTotalHigherRequirement(4);
            case 'TOTAL_5_OR_LOWER':
                return new ValueTotalLowerRequirement(7);
            case 'TOTAL_6_OR_LOWER':
                return new ValueTotalLowerRequirement(7);
            case 'TOTAL_7_OR_HIGHER':
                return new ValueTotalHigherRequirement(7);
            case 'TOTAL_10_OR_HIGHER':
                return new ValueTotalHigherRequirement(10);
            case 'TOTAL_11_OR_HIGHER':
                return new ValueTotalHigherRequirement(11);
            case 'TOTAL_7':
                return new ValueTotalExactRequirement(7);
            case 'TOTAL_8':
                return new ValueTotalExactRequirement(8);
            case 'SAME_VALUE':
                return new SameValueRequirement();
            case 'ALL_EVEN':
                return new AllEvenRequirement();
            case 'ALL_ODD':
                return new AllOddRequirement();
            case 'STRAIGHT':
                return new StraightRequirement();
            default:
                this.game.showMessage('Rule not implemented', 'error');
        }
    };
    return DiceHelper;
}());
var ValuesRequirement = (function () {
    function ValuesRequirement(values) {
        this.values = values;
    }
    ValuesRequirement.prototype.isRequirementMet = function (values) {
        var _this = this;
        return values.every(function (val, index) { return val == _this.values[index]; });
    };
    return ValuesRequirement;
}());
var ValueTotalExactRequirement = (function () {
    function ValueTotalExactRequirement(total) {
        this.total = total;
    }
    ValueTotalExactRequirement.prototype.isRequirementMet = function (values) {
        var sum = values.reduce(function (total, value) { return (total += value); }, 0);
        return sum == this.total;
    };
    return ValueTotalExactRequirement;
}());
var ValueTotalLowerRequirement = (function () {
    function ValueTotalLowerRequirement(total) {
        this.total = total;
    }
    ValueTotalLowerRequirement.prototype.isRequirementMet = function (values) {
        var sum = values.reduce(function (total, value) { return (total += value); }, 0);
        return sum <= this.total;
    };
    return ValueTotalLowerRequirement;
}());
var ValueTotalHigherRequirement = (function () {
    function ValueTotalHigherRequirement(total) {
        this.total = total;
    }
    ValueTotalHigherRequirement.prototype.isRequirementMet = function (values) {
        var sum = values.reduce(function (total, value) { return (total += value); }, 0);
        return sum >= this.total;
    };
    return ValueTotalHigherRequirement;
}());
var SameValueRequirement = (function () {
    function SameValueRequirement() {
    }
    SameValueRequirement.prototype.isRequirementMet = function (values) {
        var firstNumber = values[0];
        return values.every(function (val) { return val == firstNumber; });
    };
    return SameValueRequirement;
}());
var AllEvenRequirement = (function () {
    function AllEvenRequirement() {
    }
    AllEvenRequirement.prototype.isRequirementMet = function (values) {
        return values.every(function (val) { return val % 2 == 0; });
    };
    return AllEvenRequirement;
}());
var AllOddRequirement = (function () {
    function AllOddRequirement() {
    }
    AllOddRequirement.prototype.isRequirementMet = function (values) {
        return values.every(function (val) { return val % 2 == 1; });
    };
    return AllOddRequirement;
}());
var StraightRequirement = (function () {
    function StraightRequirement() {
    }
    StraightRequirement.prototype.isRequirementMet = function (values) {
        var firstNumber = values[0];
        return values.every(function (v, index) { return firstNumber + index == v; });
    };
    return StraightRequirement;
}());
var DialRequirement = (function () {
    function DialRequirement(dial, location_id) {
        this.dial = dial;
        this.location_id = location_id;
    }
    DialRequirement.prototype.isRequirementMet = function (values) {
        var dieValue = values[0];
        switch (this.location_id) {
            case 5:
                return dieValue == this.dial;
            case 6: {
                var baseValue = (this.dial + 1) % 6;
                return dieValue == baseValue || dieValue == baseValue + 1;
            }
            case 7: {
                var baseValue = (this.dial + 3) % 6;
                return dieValue == baseValue || dieValue == baseValue + 1 || dieValue == baseValue + 2;
            }
            default:
                return false;
        }
    };
    return DialRequirement;
}());
var SelectResources = (function () {
    function SelectResources(game, player_id) {
        var _this = this;
        this.game = game;
        this.player_id = player_id;
        this.counters = {};
        this.placeholder = [];
        this.isHandleSet = false;
        var root = document.getElementById('select-resources');
        if (root)
            root.remove();
        var templateIcon = "<div class=\"wrapper\">\n         <span id=\"icons-{icon-value}-counter\" class=\"counter\">1</span>\n         <div class=\"resource-icon\" data-type=\"{icon-value}\"></div>\n      </div>";
        var html = "<div id=\"select-resources\">\n         <div id=\"select-resources-player\">\n            ".concat(GOODS.map(function (icon) { return templateIcon.replaceAll('{icon-value}', icon); }).join(' '), "\n         </div>\n         <div id=\"select-resources-placeholder\"></div>\n         <div id=\"select-resources-buttons\"></div>\n      </div>");
        document.getElementById("maintitlebar_content").insertAdjacentHTML('beforeend', html);
        for (var _i = 0, GOODS_1 = GOODS; _i < GOODS_1.length; _i++) {
            var icon = GOODS_1[_i];
            this.counters[icon] = new ebg.counter();
            this.counters[icon].create("icons-".concat(icon, "-counter"));
            this.counters[icon].setValue(0);
        }
        var handleReset = function () {
            var _a;
            _this.placeholder = [];
            _this.displayPlaceholder();
            _this.displayResource();
            (_a = _this.OnResourceChanged) === null || _a === void 0 ? void 0 : _a.call(_this, _this.placeholder);
        };
        this.game.addActionButton('select-resources-button-reset', _('Reset'), handleReset, 'select-resources-buttons', false, 'gray');
    }
    SelectResources.prototype.getResources = function () {
        return this.placeholder.map(function (type) { return GOODS.indexOf(type) + 1; });
    };
    SelectResources.prototype.display = function (cost) {
        var _this = this;
        this.cost = cost;
        var handleResourceClick = function (type, counter, wrapper) {
            var _a;
            if (counter.getValue() <= 0)
                return;
            if (_this.placeholder.length >= cost['*'])
                return;
            counter.incValue(-1);
            wrapper.classList.toggle('disabled', counter.getValue() == 0);
            _this.placeholder.push(type);
            _this.displayPlaceholder();
            (_a = _this.OnResourceChanged) === null || _a === void 0 ? void 0 : _a.call(_this, _this.placeholder.slice());
        };
        this.placeholder = [];
        var player_resource = this.game.getPlayerPanel(this.player_id).counters;
        var _loop_4 = function (type) {
            var counter = player_resource[type];
            if (type in cost) {
                this_1.counters[type].setValue(counter.getValue() - cost[type]);
            }
            else {
                this_1.counters[type].setValue(counter.getValue());
            }
            var wrapper = document.getElementById("icons-".concat(type, "-counter")).parentElement;
            wrapper.classList.toggle('disabled', this_1.counters[type].getValue() == 0);
            if (!this_1.isHandleSet) {
                wrapper.addEventListener('click', function () { return handleResourceClick(type, _this.counters[type], wrapper); });
            }
        };
        var this_1 = this;
        for (var _i = 0, GOODS_2 = GOODS; _i < GOODS_2.length; _i++) {
            var type = GOODS_2[_i];
            _loop_4(type);
        }
        this.isHandleSet = true;
        var html = [];
        for (var index = 0; index < cost['*']; index++) {
            html.push("<div id=\"placeholder-".concat(index, "\" class=\"placeholder\"></div>"));
        }
        var placeholder = document.getElementById('select-resources-placeholder');
        placeholder.innerHTML = '';
        placeholder.insertAdjacentHTML('beforeend', html.join(''));
        document.getElementById('select-resources').classList.toggle('show', true);
    };
    SelectResources.prototype.hide = function () {
        document.getElementById('select-resources').classList.toggle('show', false);
    };
    SelectResources.prototype.displayResource = function () {
        var player_resource = this.game.getPlayerPanel(this.player_id).counters;
        for (var _i = 0, GOODS_3 = GOODS; _i < GOODS_3.length; _i++) {
            var type = GOODS_3[_i];
            var counter = player_resource[type];
            if (type in this.cost) {
                this.counters[type].setValue(counter.getValue() - this.cost[type]);
            }
            else {
                this.counters[type].setValue(counter.getValue());
            }
            var wrapper = document.getElementById("icons-".concat(type, "-counter")).parentElement;
            wrapper.classList.toggle('disabled', this.counters[type].getValue() == 0);
        }
    };
    SelectResources.prototype.displayPlaceholder = function () {
        document.querySelectorAll("#select-resources-placeholder .placeholder").forEach(function (placeholder) {
            placeholder.innerHTML = "";
        });
        for (var index = 0; index < this.placeholder.length; index++) {
            var type = this.placeholder[index];
            var placeholder = document.getElementById("placeholder-".concat(index));
            placeholder.insertAdjacentHTML("beforeend", "<div class=\"resource-icon\" data-type=\"".concat(type, "\"></div>"));
        }
    };
    return SelectResources;
}());
var ResourceConverter = (function () {
    function ResourceConverter(game, from, to, times, settings) {
        this.game = game;
        this.from = from;
        this.to = to;
        this.times = times;
        this.settings = settings;
    }
    ResourceConverter.prototype.show = function () {
        this.removeControl();
        var count_any_ressource_to = this.to.filter(function (r) { return r == '*'; }).length;
        this.addBanner(count_any_ressource_to);
        this.addControlResourcesPlayer();
        this.addControlResourceGive();
        this.addControlResourceBoard(count_any_ressource_to);
        this.addControlResourceGet(count_any_ressource_to);
        this.addResetButton();
    };
    ResourceConverter.prototype.hide = function () {
        this.removeControl();
    };
    ResourceConverter.prototype.getResourcesGive = function () {
        return this.resources_give.getResources();
    };
    ResourceConverter.prototype.getResourcesGet = function () {
        var _this = this;
        if (this.counter_reward && this.counter_reward.getValue() > 0) {
            return arrayRange(1, this.counter_reward.getValue())
                .map(function () { return _this.to; })
                .flat();
        }
        else {
            return this.resource_get.getResources();
        }
    };
    ResourceConverter.prototype.addBanner = function (count_any_ressource_to) {
        var arrow = count_any_ressource_to > 0
            ? "<div class=\"wrapper no-border arrow\">\n                  <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"36\" height=\"36\" viewBox=\"0 0 16 16\"><path fill=\"lime\" d=\"M15.5 8L8 .5V5H0v6h8v4.5z\"/></svg>\n               </div>"
            : '';
        var html = "<div id=\"resource-converter\">\n         <div class=\"line\">\n            <div id=\"resource-converter-player\"></div>\n            ".concat(arrow, "\n            <div id=\"resource-converter-board-resources\"></div>\n         </div>\n         <div class=\"line\">\n            <div id=\"resource-converter-placeholder-from\"></div>\n            <div class=\"wrapper no-border from\"></div>\n            <div class=\"wrapper no-border arrow\">\n               <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"36\" height=\"36\" viewBox=\"0 0 16 16\"><path fill=\"lime\" d=\"M15.5 8L8 .5V5H0v6h8v4.5z\"/></svg>\n               ").concat(this.times > 1 ? "x".concat(this.times) : '', "\n            </div>\n            <div class=\"wrapper no-border to\">\n               <span id=\"tc-icons-reward-counter\" class=\"counter\">1</span>\n               ").concat(this.to.map(function (icon) { return ResourceHelper.getElement(icon); }), "\n            </div>\n            <div id=\"resource-converter-placeholder\"></div>\n            <div id=\"resource-converter-buttons\"></div>\n         </div>\n      </div>");
        document.getElementById("maintitlebar_content").insertAdjacentHTML('beforeend', html);
    };
    ResourceConverter.prototype.addControlResourcesPlayer = function () {
        var _this = this;
        var handleResourceClick = function (type) {
            var _a, _b, _c, _d;
            _this.resources_give.add(type);
            debugger;
            if (_this.counter_reward) {
                if (_this.from.length == 1) {
                    _this.counter_reward.incValue(1);
                }
                else if (_this.from.length > 1 && _this.from.every(function (icon) { return icon == '*'; })) {
                    _this.counter_reward.setValue(Math.floor(_this.resources_give.getResources().length / _this.from.length));
                }
                else {
                    var values_1 = [];
                    _this.from.forEach(function (icon) {
                        values_1.push(_this.resources_give.getResources().filter(function (type) { return type == icon; }).length);
                    });
                    _this.counter_reward.setValue(Math.min.apply(null, values_1));
                }
            }
            else {
                if (_this.resource_get.isExpandable() &&
                    _this.resource_get.countPlaceholder() < _this.resources_give.getResources().length) {
                    _this.resource_get.addPlaceholder();
                    _this.resources_board.reset();
                }
            }
            if (((_a = _this.counter_reward) === null || _a === void 0 ? void 0 : _a.getValue()) >= _this.times || _this.resources_give.isFull()) {
                _this.resources_player.disabled();
            }
            if ((_d = (_c = (_b = _this.settings) === null || _b === void 0 ? void 0 : _b.from) === null || _c === void 0 ? void 0 : _c.max) !== null && _d !== void 0 ? _d : 0 == _this.resources_give.getResources().length) {
                _this.resources_player.disabled();
            }
        };
        var element = document.getElementById('resource-converter-player');
        this.resources_player = new PlayerResourceCounter(this.game, element, 'player-counter', {
            icons: this.getAllowedResources(),
        });
        this.resources_player.onResourceClick = function (type) { return handleResourceClick(type); };
    };
    ResourceConverter.prototype.addControlResourceGive = function () {
        var _a, _b, _c, _d;
        if ((this.from && this.from.every(function (r) { return r == '*'; }) && this.times == 1) || ((_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.from) === null || _b === void 0 ? void 0 : _b.max)) {
            var element = document.getElementById('resource-converter-placeholder-from');
            this.resources_give = new ResourcePlaceholderLineStock(element, this.from.length, {
                restriction: (_d = (_c = this.settings) === null || _c === void 0 ? void 0 : _c.from) === null || _d === void 0 ? void 0 : _d.restriction,
            });
        }
        else {
            this.resources_give = new ResourceLineStock(document.querySelector('#resource-converter .from'));
        }
    };
    ResourceConverter.prototype.addControlResourceBoard = function (count_any_ressource_to) {
        var _this = this;
        if (count_any_ressource_to == 0) {
            document.getElementById('resource-converter-placeholder').remove();
        }
        else {
            var element = document.getElementById('resource-converter-board-resources');
            this.resources_board = new PlayerResourceCounter(this.game, element, 'board-resources', {
                icons: GOODS,
                initialValue: 20,
            });
            this.resources_board.onResourceClick = function (type) { return _this.handleBoardResourceClick(type); };
            document.querySelector('#resource-converter .wrapper.to').remove();
        }
    };
    ResourceConverter.prototype.addControlResourceGet = function (count_any_ressource_to) {
        if (document.getElementById('tc-icons-reward-counter')) {
            this.counter_reward = createCounter('tc-icons-reward-counter');
        }
        var element = document.getElementById('resource-converter-placeholder');
        var expandable = this.to[0] == '*' && this.to.length == 1 && this.times > 1;
        debugger;
        this.resource_get = new ResourcePlaceholderLineStock(element, count_any_ressource_to, {
            expandable: expandable,
        });
    };
    ResourceConverter.prototype.addResetButton = function () {
        var _this = this;
        var handleReset = function () {
            var _a, _b;
            _this.resources_give.reset();
            (_a = _this.counter_reward) === null || _a === void 0 ? void 0 : _a.setValue(0);
            _this.resources_player.reset();
            _this.resource_get.reset();
            (_b = _this.resources_board) === null || _b === void 0 ? void 0 : _b.reset();
        };
        this.game.addActionButtonReset('resource-converter-buttons', handleReset);
    };
    ResourceConverter.prototype.getAllowedResources = function () {
        var _a, _b, _c;
        if ((_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.from) === null || _b === void 0 ? void 0 : _b.allowed_resources) {
            return this.settings.from.allowed_resources;
        }
        else {
            return this.from.indexOf('*') >= 0 ? GOODS : (_c = this.from) !== null && _c !== void 0 ? _c : ICONS;
        }
    };
    ResourceConverter.prototype.handleBoardResourceClick = function (type) {
        this.resource_get.add(type);
        if (this.resource_get.isFull()) {
            this.resources_board.disabled();
        }
    };
    ResourceConverter.prototype.removeControl = function () {
        var root = document.getElementById('resource-converter');
        if (root)
            root.remove();
        this.resources_player = null;
    };
    return ResourceConverter;
}());
var NotificationManager = (function () {
    function NotificationManager(game) {
        this.game = game;
    }
    NotificationManager.prototype.setup = function () {
        var _this = this;
        var notifs = [
            ['onDiscardStartHand'],
            ['onNewTraveler', 1000],
            ['onFamilyDice', undefined],
            ['onRevealPlacement', 1000],
            ['onVillageDice', 1200],
            ['onMoveDiceToHill', 1000],
            ['onMoveDiceToLocation', 1000],
            ['onReturnWorkerToPlayerBoard'],
            ['onGetResourcesFromLocation', 1200],
            ['onCraftConfort', 1000],
            ['onReturnDice', 1200],
            ['onNewSeason', 1000],
            ['onRiverDialRotate', 500],
            ['onRefillOwlNest', undefined],
            ['onDiscardTraveler', 100],
            ['onNewFirstPlayer', 100],
            ['onTravelerExchangeResources', 100],
            ['onMarketExchangeResources', 100],
            ['onDrawConfort', undefined],
            ['onAddConfortToHand', undefined],
        ];
        this.setupNotifications(notifs);
        ['message', 'onDrawConfort'].forEach(function (eventName) {
            _this.game.notifqueue.setIgnoreNotificationCheck(eventName, function (notif) { return notif.args.excluded_player_id && notif.args.excluded_player_id == _this.game.player_id; });
        });
    };
    NotificationManager.prototype.notif_onDiscardStartHand = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.game.tableCenter.confort_discard.addCard(args.card)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_onNewTraveler = function (args) {
        var card = args.card, count = args.count;
        var _a = this.game.tableCenter, deck = _a.traveler_deck, hidden_traveler = _a.hidden_traveler;
        if (count < 15) {
            deck.removeCard(deck.getTopCard());
        }
        deck.setCardNumber(count, { id: card.id });
        setTimeout(function () { return deck.flipCard(card); }, 500);
    };
    NotificationManager.prototype.notif_onFamilyDice = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var stack;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stack = this.game.getPlayerTable(Number(args.player_id)).dice;
                        stack.removeAll();
                        return [4, stack.addDice(args.dice)];
                    case 1:
                        _a.sent();
                        stack.rollDice(args.dice, { duration: [500, 900], effect: 'rollIn' });
                        return [4, new Promise(function (resolve) { return setTimeout(function () { return resolve(true); }, 1000); })];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_onRevealPlacement = function (_a) {
        var workers = _a.workers;
        this.game.tableCenter.worker_locations.addCards(workers.board);
    };
    NotificationManager.prototype.notif_onVillageDice = function (_a) {
        var dice = _a.dice;
        var white_dice = dice.filter(function (die) { return die.type == 'white'; });
        var stack = this.game.tableCenter.hill;
        stack.addDice(white_dice);
        stack.rollDice(dice, { effect: 'rollIn', duration: [500, 900] });
    };
    NotificationManager.prototype.notif_onMoveDiceToHill = function (_a) {
        var dice = _a.dice;
        this.game.tableCenter.hill.addDice(dice);
    };
    NotificationManager.prototype.notif_onMoveDiceToLocation = function (_a) {
        var dice = _a.dice;
        this.game.tableCenter.dice_locations.addDice(dice);
    };
    NotificationManager.prototype.notif_onReturnWorkerToPlayerBoard = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.game.getPlayerTable(args.player_id).workers.addCard(args.worker)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_onGetResourcesFromLocation = function (_a) {
        var location_id = _a.location_id, resources = _a.resources, player_id = _a.player_id;
        var fromElement = document.querySelectorAll("#worker-locations *[data-slot-id=\"".concat(location_id, "\"]"))[0];
        this.animationMoveResource(player_id, resources, fromElement);
    };
    NotificationManager.prototype.notif_onCraftConfort = function (_a) {
        var player_id = _a.player_id, card = _a.card, cost = _a.cost;
        var counters = this.game.getPlayerPanel(player_id).counters;
        var conforts = this.game.getPlayerTable(player_id).conforts;
        conforts.addCard(card);
        Object.keys(cost).forEach(function (type) {
            var value = -cost[type];
            counters[type].incValue(value);
        });
    };
    NotificationManager.prototype.notif_onReturnDice = function (_a) {
        var player_id = _a.player_id, dice = _a.dice;
        var white_dice = dice.filter(function (die) { return die.type == 'white'; });
        var player_dice = dice.filter(function (die) { return Number(die.owner_id) == player_id; });
        this.game.tableCenter.hill.addDice(white_dice);
        this.game.getPlayerTable(player_id).dice.addDice(player_dice);
    };
    NotificationManager.prototype.notif_onNewSeason = function (args) {
        var _a = args.info, forest = _a.forest, meadow = _a.meadow;
        this.game.tableCenter.valley.removeAll();
        this.game.tableCenter.valley.addCards([forest.topCard, meadow.topCard]);
    };
    NotificationManager.prototype.notif_onRiverDialRotate = function (_a) {
        var value = _a.value;
        this.game.tableCenter.setRiverDial(value);
    };
    NotificationManager.prototype.notif_onRefillOwlNest = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var owl_nest, discard, _a, deck, market, _i, _b, card;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        owl_nest = args.owl_nest, discard = args.discard;
                        if (!discard) return [3, 2];
                        return [4, this.game.tableCenter.confort_discard.addCard(discard)];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2:
                        _a = this.game.tableCenter, deck = _a.confort_deck, market = _a.confort_market;
                        _i = 0, _b = owl_nest.slice(0, 3);
                        _c.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3, 6];
                        card = _b[_i];
                        return [4, market.swapCards([__assign({}, card)])];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3, 3];
                    case 6: return [4, market.addCard(owl_nest[3], { fromStock: deck })];
                    case 7:
                        _c.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_onRefillLadder = function (args) {
        var ladder = args.ladder, discard = args.discard;
        if (discard) {
            this.game.tableCenter.confort_discard.addCard(discard);
        }
        var _a = this.game.tableCenter, deck = _a.improvement_deck, market = _a.confort_market, hidden_improvement = _a.hidden_improvement;
        deck.setCardNumber(deck.getCardNumber(), { id: ladder[5].id });
        market.addCards(ladder);
        deck.setCardNumber(deck.getCardNumber(), __assign({}, hidden_improvement));
    };
    NotificationManager.prototype.notif_onDiscardTraveler = function (args) {
        var _a = this.game.tableCenter, deck = _a.traveler_deck, hidden_traveler = _a.hidden_traveler;
        deck.setCardNumber(deck.getCardNumber() - 1, __assign({}, hidden_traveler));
    };
    NotificationManager.prototype.notif_onNewFirstPlayer = function (_a) {
        var player_id = _a.player_id;
        this.game.getPlayerPanel(player_id).addFirstTokenPlayer();
    };
    NotificationManager.prototype.notif_onTravelerExchangeResources = function (_a) {
        var from = _a.from, to = _a.to, player_id = _a.player_id;
        var counters = this.game.getPlayerPanel(player_id).counters;
        Object.keys(from).forEach(function (type) { return counters[type].incValue(-from[type]); });
        var fromElement = document.querySelectorAll("#worker-locations *[data-slot-id=\"9\"]")[0];
        this.animationMoveResource(player_id, to, fromElement);
    };
    NotificationManager.prototype.notif_onMarketExchangeResources = function (_a) {
        var from = _a.from, to = _a.to, player_id = _a.player_id;
        var counters = this.game.getPlayerPanel(player_id).counters;
        Object.keys(from).forEach(function (type) { return counters[type].incValue(-from[type]); });
        var fromElement = document.querySelectorAll("#worker-locations *[data-slot-id=\"8\"]")[0];
        this.animationMoveResource(player_id, to, fromElement);
    };
    NotificationManager.prototype.notif_onDrawConfort = function (_a) {
        var player_id = _a.player_id, card = _a.card;
        return __awaiter(this, void 0, void 0, function () {
            var _b, deck, hidden_confort;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = this.game.tableCenter, deck = _b.confort_deck, hidden_confort = _b.hidden_confort;
                        deck.setCardNumber(deck.getCardNumber(), __assign({}, card));
                        return [4, this.game.getPlayerTable(player_id).hand.addCard(card)];
                    case 1:
                        _c.sent();
                        deck.setCardNumber(deck.getCardNumber(), __assign({}, hidden_confort));
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_onAddConfortToHand = function (_a) {
        var player_id = _a.player_id, card = _a.card;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (player_id !== this.game.getPlayerId()) {
                            card = { id: card.id };
                        }
                        return [4, this.game.getPlayerTable(player_id).hand.addCard(card)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.animationMoveResource = function (player_id, resources, fromElement) {
        var _this = this;
        var index = 0;
        Object.keys(resources).forEach(function (type) {
            var count = resources[type];
            for (var i = 0; i < count; i++) {
                _this.game.slideTemporaryObject("<div class=\"resource-icon\" data-type=\"".concat(type, "\"></div>"), 'overall-content', fromElement, "player-panel-".concat(player_id, "-icons-").concat(type, "-counter"), 1000, 250 * index++);
            }
            _this.game.getPlayerPanel(player_id).counters[type].incValue(count);
        });
    };
    NotificationManager.prototype.setupNotifications = function (notifs) {
        var _this = this;
        notifs.forEach(function (_a) {
            var eventName = _a[0], duration = _a[1];
            dojo.subscribe(eventName, _this, function (notifDetails) {
                debug("notif_".concat(eventName), notifDetails.args);
                var promise = _this["notif_".concat(eventName)](notifDetails.args);
                promise === null || promise === void 0 ? void 0 : promise.then(function () { return _this.game.notifqueue.onSynchronousNotificationEnd(); });
            });
            _this.game.notifqueue.setSynchronous(eventName, duration);
        });
        if (isDebug) {
            notifs.forEach(function (notif) {
                if (!_this["notif_".concat(notif[0])]) {
                    console.warn("notif_".concat(notif[0], " function is not declared, but listed in setupNotifications"));
                }
            });
            Object.getOwnPropertyNames(CreatureConforts.prototype)
                .filter(function (item) { return item.startsWith('notif_'); })
                .map(function (item) { return item.slice(6); })
                .forEach(function (item) {
                if (!notifs.some(function (notif) { return notif[0] == item; })) {
                    console.warn("notif_".concat(item, " function is declared, but not listed in setupNotifications"));
                }
            });
        }
    };
    return NotificationManager;
}());
var StateManager = (function () {
    function StateManager(game) {
        this.game = game;
        this.client_states = [];
        this.states = {
            startHand: new StartHandState(game),
            placement: new PlacementState(game),
            playerTurnDice: new PlayerTurnDiceState(game),
            playerTurnResolve: new PlayerTurnResolveState(game),
            playerTurnCraftConfort: new PlayerTurnCraftState(game),
            resolveTraveler: new ResolveTravelerState(game),
            resolveMarket: new ResolveMarketState(game),
            resolveOwnNest: new ResolveOwlNestState(game),
            resolveWorkshop: new ResolveWorkshopState(game),
            playerTurnDiscard: new PlayerTurnDiscardState(game),
        };
    }
    StateManager.prototype.onEnteringState = function (stateName, args) {
        debug('Entering state: ' + stateName);
        if (this.states[stateName] !== undefined) {
            this.states[stateName].onEnteringState(args.args);
            if (stateName.startsWith('resolve')) {
                this.client_states.push(this.states[stateName]);
            }
            else {
                this.client_states.splice(0);
            }
        }
        else {
            this.client_states.splice(0);
            if (isDebug) {
                console.warn('State not handled', stateName);
            }
        }
        console.log('client states', this.client_states);
    };
    StateManager.prototype.onLeavingState = function (stateName) {
        debug('Leaving state: ' + stateName);
        if (this.states[stateName] !== undefined) {
            if (this.game.isCurrentPlayerActive()) {
                this.states[stateName].onLeavingState();
            }
        }
    };
    StateManager.prototype.onUpdateActionButtons = function (stateName, args) {
        debug('onUpdateActionButtons: ' + stateName);
        if (this.states[stateName] !== undefined) {
            if (this.game.isCurrentPlayerActive()) {
                this.states[stateName].onUpdateActionButtons(args);
            }
            else if ('isMultipleActivePlayer' in this.states[stateName]) {
                this.states[stateName].onUpdateActionButtons(args);
            }
        }
    };
    StateManager.prototype.restoreGameState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                        var state;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(this.client_states.length > 0)) return [3, 3];
                                    state = this.client_states.pop();
                                    if (!state.restoreGameState) return [3, 2];
                                    return [4, state.restoreGameState()];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2: return [3, 0];
                                case 3:
                                    resolve(true);
                                    return [2];
                            }
                        });
                    }); })];
            });
        });
    };
    return StateManager;
}());
var StartHandState = (function () {
    function StartHandState(game) {
        this.game = game;
        this.isMultipleActivePlayer = true;
    }
    StartHandState.prototype.onEnteringState = function (args) {
        var _this = this;
        var _a, _b;
        var hand = this.game.getCurrentPlayerTable().hand;
        this.game.confortManager.markAsSelected((_b = (_a = args._private) === null || _a === void 0 ? void 0 : _a.card_id) !== null && _b !== void 0 ? _b : 0);
        if (!this.game.isCurrentPlayerActive())
            return;
        var handleSelection = function (selection) {
            _this.game.toggleButtonEnable('btn_discard', selection.length == 1);
        };
        hand.setSelectionMode('single');
        hand.onSelectionChange = handleSelection;
    };
    StartHandState.prototype.onLeavingState = function () {
        var hand = this.game.getCurrentPlayerTable().hand;
        hand.setSelectionMode('none');
        hand.onSelectionChange = null;
    };
    StartHandState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleDiscardComplete = function () {
            var hand = _this.game.getCurrentPlayerTable().hand;
            var selection = hand.getSelection();
            hand.setSelectionMode('none');
            hand.onSelectionChange = null;
            if (selection.length == 1) {
                _this.game.confortManager.markAsSelected(Number(selection[0].id));
            }
        };
        var handleDiscard = function () {
            var selection = _this.game.getCurrentPlayerTable().hand.getSelection();
            if (selection.length !== 1)
                return;
            _this.game.takeAction('discardStartHand', { card_id: selection[0].id }, handleDiscardComplete);
        };
        var handleCancel = function () {
            _this.game.takeAction('cancelStartHand', {}, null, function () {
                _this.game.restoreGameState();
            });
        };
        if (!this.game.isSpectator) {
            this.game.addActionButtonDisabled('btn_discard', _('Discard'), handleDiscard);
            this.game.addActionButtonGray('btn_cancel', _('Cancel'), handleCancel);
        }
    };
    return StartHandState;
}());
var PlacementState = (function () {
    function PlacementState(game) {
        this.game = game;
        this.isMultipleActivePlayer = true;
        this.locations = [];
        this.original_workers = [];
    }
    PlacementState.prototype.onEnteringState = function (args) {
        var _this = this;
        var _a, _b, _c;
        this.original_workers = [];
        this.locations = (_c = (_b = (_a = args._private) === null || _a === void 0 ? void 0 : _a.locations) === null || _b === void 0 ? void 0 : _b.map(function (loc) { return Number(loc); })) !== null && _c !== void 0 ? _c : [];
        if (this.locations.length > 0) {
            this.locations.forEach(function (slotId) { return _this.moveWorker(slotId); });
        }
        this.showSelection();
        if (!this.game.isCurrentPlayerActive)
            return;
        this.game.tableCenter.worker_locations.OnLocationClick = function (slotId) {
            _this.moveWorker(slotId);
        };
    };
    PlacementState.prototype.onLeavingState = function () {
        var deck = this.game.tableCenter.worker_locations;
        deck.setSelectableLocation([]);
        deck.setSelectedLocation([]);
        deck.OnLocationClick = null;
    };
    PlacementState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleCancelLocal = function () {
            _this.resetState();
        };
        var handleConfirmPlacement = function () {
            if (_this.locations.length !== 4) {
                _this.game.showMessage('You must place all your workers', 'error');
                return;
            }
            _this.game.takeAction('confirmPlacement', { locations: _this.locations.join(';') });
        };
        var handleRestartPlacement = function () {
            _this.game.takeAction('cancelPlacement', {}, null, function () {
                _this.resetState();
            });
        };
        if (!this.game.isSpectator) {
            if (this.game.isCurrentPlayerActive()) {
                this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirmPlacement);
                this.game.addActionButtonGray('btn_cancel', _('Cancel'), handleCancelLocal);
            }
            else {
                this.game.addActionButtonGray('btn_restart', _('Cancel'), handleRestartPlacement);
            }
        }
    };
    PlacementState.prototype.moveWorker = function (slotId) {
        var worker = this.game.getCurrentPlayerTable().workers.getCards()[0];
        var copy = __assign(__assign({}, worker), { location: 'board', location_arg: slotId.toString() });
        this.original_workers.push(__assign({}, worker));
        this.game.tableCenter.worker_locations.addCard(copy);
        this.locations.push(Number(slotId));
        this.showSelection();
        this.game.toggleButtonEnable('btn_confirm', this.locations.length == 4);
    };
    PlacementState.prototype.resetState = function () {
        this.game.getCurrentPlayerTable().workers.addCards(this.original_workers);
        this.locations = [];
        this.original_workers = [];
        this.showSelection();
        this.game.disableButton('btn_confirm');
    };
    PlacementState.prototype.showSelection = function () {
        var _this = this;
        var locations = this.game.tableCenter.worker_locations;
        if (this.locations.length < 4) {
            var selectable = arrayRange(1, 12).filter(function (num) { return _this.locations.indexOf(num) < 0; });
            locations.setSelectableLocation(selectable);
        }
        else {
            locations.setSelectableLocation([]);
        }
        locations.setSelectedLocation(this.locations);
    };
    return PlacementState;
}());
var PlayerTurnDiceState = (function () {
    function PlayerTurnDiceState(game) {
        this.game = game;
        this.diceHelper = new DiceHelper(game);
    }
    PlayerTurnDiceState.prototype.onEnteringState = function (args) {
        var _this = this;
        if (!this.game.isCurrentPlayerActive())
            return;
        var _a = this.game.tableCenter, hill = _a.hill, worker_locations = _a.worker_locations, dice_locations = _a.dice_locations;
        var handleHillClick = function (selection) {
            if (selection.length == 1) {
                var locations = _this.game.tableCenter.getWorkerLocations().filter(function (location_id) {
                    var count = _this.getDiceFromLocation(location_id).length;
                    return count < _this.diceHelper.getTotalDiceSlot(location_id);
                });
                worker_locations.setSelectableLocation(locations);
            }
            else {
                worker_locations.setSelectableLocation([]);
            }
        };
        var handleWorkerLocationClick = function (slotId) {
            var _a = hill.getSelection(), die = _a[0], others = _a.slice(1);
            if (!die)
                return;
            var copy = __assign(__assign({}, die), { location: slotId });
            dice_locations.addDie(copy);
        };
        var handleDiceLocationClick = function (die) {
            hill.unselectAll();
            hill.addDie(die);
        };
        hill.setSelectionMode('single');
        hill.onSelectionChange = handleHillClick;
        worker_locations.OnLocationClick = handleWorkerLocationClick;
        dice_locations.onDieClick = handleDiceLocationClick;
    };
    PlayerTurnDiceState.prototype.onLeavingState = function () {
        var _a = this.game.tableCenter, hill = _a.hill, worker_locations = _a.worker_locations, dice_locations = _a.dice_locations;
        hill.setSelectionMode('none');
        hill.onSelectionChange = null;
        worker_locations.OnLocationClick = null;
        dice_locations.onDieClick = null;
    };
    PlayerTurnDiceState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleCancel = function () {
            var _a = _this.game.tableCenter, hill = _a.hill, dice_locations = _a.dice_locations;
            hill.addDice(dice_locations.getDice());
        };
        var handleConfirm = function () {
            var dice = _this.game.tableCenter.dice_locations.getDice();
            var args = {
                dice_ids: dice.map(function (die) { return die.id; }).join(';'),
                location_ids: dice.map(function (die) { return Number(die.location); }).join(';'),
            };
            console.log(args);
            _this.game.takeAction('confirmPlayerDice', args);
        };
        this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonGray('btn_cancel', _('Cancel'), handleCancel);
    };
    PlayerTurnDiceState.prototype.validate = function () {
        var locations = this.game.tableCenter.getWorkerLocations();
        var error = [];
        for (var _i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
            var location_id = locations_1[_i];
            var dice = this.getDiceFromLocation(location_id);
            if (!this.diceHelper.isRequirementMet(location_id, dice)) {
                error.push(location_id);
            }
        }
        if (error.length > 0) {
            this.game.showMessage("Requirement not met for location ".concat(error.join(', ')), 'error');
        }
        else {
            this.game.showMessage("Requirement met", 'info');
        }
    };
    PlayerTurnDiceState.prototype.getDiceFromLocation = function (location_id) {
        return this.game.tableCenter.dice_locations
            .getDice()
            .filter(function (die) { return die.location == location_id; });
    };
    return PlayerTurnDiceState;
}());
var PlayerTurnResolveState = (function () {
    function PlayerTurnResolveState(game) {
        this.game = game;
    }
    PlayerTurnResolveState.prototype.onEnteringState = function (args) {
        var _this = this;
        if (!this.game.isCurrentPlayerActive())
            return;
        var worker_locations = this.game.tableCenter.worker_locations;
        var locations = this.game.tableCenter.getWorkerLocations();
        var handleWorkerLocationClick = function (slotId) {
            if (worker_locations.isSelectedLocation(slotId)) {
                worker_locations.setSelectedLocation([]);
                _this.game.disableButton('btn_resolve');
            }
            else {
                worker_locations.setSelectedLocation([slotId]);
                _this.game.enableButton('btn_resolve');
            }
        };
        worker_locations.setSelectableLocation(locations);
        worker_locations.OnLocationClick = handleWorkerLocationClick;
    };
    PlayerTurnResolveState.prototype.onLeavingState = function () {
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectableLocation([]);
        worker_locations.setSelectedLocation([]);
        worker_locations.OnLocationClick = null;
    };
    PlayerTurnResolveState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleResolve = function () {
            if (_this.game.tableCenter.worker_locations.getSelectedLocation().length == 0) {
                _this.game.showMessage(_('You must select a location with one of your worker'), 'error');
                return;
            }
            var location_id = Number(_this.game.tableCenter.worker_locations.getSelectedLocation()[0]);
            if (location_id == 8) {
                _this.game.setClientState('resolveMarket', {
                    descriptionmyturn: _('You must resolve the effect of the market'),
                });
            }
            else if (location_id == 9) {
                _this.game.setClientState('resolveTraveler', {
                    descriptionmyturn: _('You must resolve the effect of the traveler'),
                });
            }
            else if (location_id == 10) {
                _this.game.setClientState('resolveWorkshop', {
                    descriptionmyturn: _("You must select one card in the Workshop"),
                });
            }
            else if (location_id == 11) {
                _this.game.setClientState('resolveOwnNest', {
                    descriptionmyturn: _("You must select one card in the Owl's Nest"),
                });
            }
            else {
                _this.game.takeAction('resolveWorker', { location_id: location_id });
            }
        };
        var handleEnd = function () {
            _this.game.takeAction('confirmResolveWorker');
        };
        if (this.game.tableCenter.getWorkerLocations().length > 0) {
            this.game.addActionButtonDisabled('btn_resolve', _('Resolve'), handleResolve);
        }
        else {
            this.game.addActionButton('btn_end', _('End'), handleEnd);
        }
        this.game.addActionButtonUndo();
    };
    return PlayerTurnResolveState;
}());
var PlayerTurnCraftState = (function () {
    function PlayerTurnCraftState(game) {
        this.game = game;
    }
    PlayerTurnCraftState.prototype.onEnteringState = function (args) {
        var _this = this;
        if (!this.game.isCurrentPlayerActive())
            return;
        var resourceManager = new SelectResources(this.game, this.game.getPlayerId());
        this.resourceManager = resourceManager;
        var hand = this.game.getCurrentPlayerTable().hand;
        var handleResourceChanged = function (resources) {
            var card = hand.getSelection()[0];
            if (!card || resources.length == 0) {
                _this.game.disableButton('btn_craft');
                return;
            }
            var card_type = _this.game.confortManager.getCardType(card);
            if ('*' in card_type.cost) {
                _this.game.toggleButtonEnable('btn_craft', card_type.cost['*'] == resources.length);
            }
        };
        var handleSelectionChange = function (selection) {
            _this.game.toggleButtonEnable('btn_craft', selection.length == 1);
            if (selection.length == 0)
                return;
            var card_type = _this.game.confortManager.getCardType(selection[0]);
            if ('*' in card_type.cost) {
                resourceManager.display(card_type.cost);
                _this.game.toggleButtonEnable('btn_craft', false);
            }
            else {
                resourceManager.hide();
            }
        };
        var selection = hand.getCards().filter(function (card) {
            var card_type = _this.game.confortManager.getCardType(card);
            if (!card_type.cost) {
                console.warn('No cost for', card_type);
                return false;
            }
            return ResourceHelper.isRequirementMet(_this.game, card_type.cost);
        });
        this.game.enableButton('btn_pass', selection.length > 0 ? 'red' : 'blue');
        hand.setSelectionMode('single');
        hand.setSelectableCards(selection);
        hand.onSelectionChange = handleSelectionChange;
        resourceManager.OnResourceChanged = handleResourceChanged;
    };
    PlayerTurnCraftState.prototype.onLeavingState = function () { };
    PlayerTurnCraftState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var hand = this.game.getCurrentPlayerTable().hand;
        var handleCraft = function () {
            var card = hand.getSelection()[0];
            if (!card)
                return;
            var card_type = _this.game.confortManager.getCardType(card);
            if (!ResourceHelper.isRequirementMet(_this.game, card_type.cost)) {
                _this.game.showMessage('Requirement not met', 'error');
            }
            var resources = [];
            if ('*' in card_type.cost) {
                resources = _this.resourceManager.getResources();
            }
            _this.game.takeAction('craftConfort', { card_id: card.id, resources: resources.join(';') });
        };
        var handlePass = function () {
            _this.game.takeAction('passCraftConfort');
        };
        this.game.addActionButtonDisabled('btn_craft', _('Craft confort'), handleCraft);
        this.game.addActionButtonDisabled('btn_pass', _('Pass'), handlePass);
        this.game.addActionButtonUndo();
    };
    return PlayerTurnCraftState;
}());
var PlayerTurnDiscardState = (function () {
    function PlayerTurnDiscardState(game) {
        this.game = game;
    }
    PlayerTurnDiscardState.prototype.onEnteringState = function (args) {
        var _this = this;
        if (!this.game.isCurrentPlayerActive())
            return;
        this.cards = [];
        var hand = this.game.getCurrentPlayerTable().hand;
        var handleSelection = function (selection, lastChanged) {
            _this.game.toggleButtonEnable('btn_discard', selection.length == args.nbr);
            if (selection.length > args.nbr) {
                hand.unselectCard(lastChanged);
            }
        };
        hand.setSelectionMode('multiple');
        hand.onSelectionChange = handleSelection;
    };
    PlayerTurnDiscardState.prototype.onLeavingState = function () {
        var hand = this.game.getCurrentPlayerTable().hand;
        hand.setSelectionMode('none');
        hand.onSelectionChange = null;
    };
    PlayerTurnDiscardState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleDiscard = function () {
            var hand = _this.game.getCurrentPlayerTable().hand;
            if (hand.getSelection().length !== args.nbr)
                return;
            var card_ids = hand
                .getSelection()
                .map(function (card) { return card.id; })
                .join(';');
            _this.game.takeAction('discardConfort', { card_ids: card_ids });
        };
        this.game.addActionButtonDisabled('btn_discard', _('Discard'), handleDiscard);
    };
    return PlayerTurnDiscardState;
}());
var ResolveMarketState = (function () {
    function ResolveMarketState(game) {
        this.game = game;
        this.isModeResource = false;
    }
    ResolveMarketState.prototype.onEnteringState = function (args) {
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectableLocation([8]);
        worker_locations.setSelectedLocation([8]);
    };
    ResolveMarketState.prototype.onLeavingState = function () {
        this.convert.hide();
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectedLocation([]);
        this.isModeResource = false;
    };
    ResolveMarketState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            var resources = ResourceHelper.convertToInt(_this.convert.getResourcesGive()).join(';');
            var resources2 = ResourceHelper.convertToInt(_this.convert.getResourcesGet()).join(';');
            _this.game.takeAction('resolveWorker', { location_id: 8, resources: resources, resources2: resources2 }, function () {
                _this.game.restoreGameState();
            });
        };
        var handleChoice1 = function () {
            _this.convert = new ResourceConverter(_this.game, ['coin'], ['*'], 1, {
                from: { allowed_resources: ['coin'], max: 1 },
            });
            handleChoice();
        };
        var handleChoice2 = function () {
            _this.convert = new ResourceConverter(_this.game, ['*', '*'], ['*'], 1, {
                from: { restriction: 'same', allowed_resources: GOODS },
            });
            handleChoice();
        };
        var handleChoice3 = function () {
            _this.convert = new ResourceConverter(_this.game, ['*', '*', '*'], ['coin'], 1, {
                from: { allowed_resources: GOODS },
            });
            handleChoice();
        };
        var handleChoice = function () {
            _this.convert.show();
            _this.isModeResource = true;
            _this.game.updatePageTitle();
        };
        if (this.isModeResource) {
            this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
            this.game.addActionButtonClientCancel();
        }
        else {
            this.game.addActionButton('btn_confirm1', _('Convert Coin to any good'), handleChoice1);
            this.game.addActionButton('btn_confirm2', _('Convert 2 identical goods to any good'), handleChoice2);
            this.game.addActionButton('btn_confirm3', _('Convert 3 goods to a Coin'), handleChoice3);
            this.game.addActionButtonClientCancel();
        }
    };
    return ResolveMarketState;
}());
var ResolveTravelerState = (function () {
    function ResolveTravelerState(game) {
        this.game = game;
    }
    ResolveTravelerState.prototype.onEnteringState = function (args) {
        var _this = this;
        var _a;
        var _b = this.game.tableCenter, worker_locations = _b.worker_locations, dice_locations = _b.dice_locations;
        worker_locations.setSelectableLocation([9]);
        worker_locations.setSelectedLocation([9]);
        var die = dice_locations.getDice().find(function (die) { return die.location == 9; });
        var traveler_type = Number(this.game.tableCenter.traveler_deck.getTopCard().type);
        var reward = this.game.gamedatas.travelers.types[traveler_type].reward[die.face];
        if (reward.from == null || reward.from.length == 0) {
            this.convert = undefined;
            this.game.takeAction('resolveWorker', { location_id: 9, resources: [], resource2: [] }, null, function () {
                _this.game.restoreGameState();
            });
        }
        else {
            this.convert = new ResourceConverter(this.game, (_a = reward.from) !== null && _a !== void 0 ? _a : GOODS, reward.to, reward.times);
            this.convert.show();
        }
    };
    ResolveTravelerState.prototype.onLeavingState = function () {
        var _a;
        (_a = this.convert) === null || _a === void 0 ? void 0 : _a.hide();
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectedLocation([]);
    };
    ResolveTravelerState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            var resources_give = ResourceHelper.convertToInt(_this.convert.getResourcesGive()).join(';');
            _this.game.takeAction('resolveWorker', { location_id: 9, resources: resources_give });
        };
        this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonClientCancel();
    };
    return ResolveTravelerState;
}());
var ResolveOwlNestState = (function () {
    function ResolveOwlNestState(game) {
        this.game = game;
    }
    ResolveOwlNestState.prototype.onEnteringState = function (args) {
        var _this = this;
        var _a = this.game.tableCenter, worker_locations = _a.worker_locations, market = _a.confort_market;
        worker_locations.setSelectableLocation([11]);
        worker_locations.setSelectedLocation([11]);
        market.setSelectionMode('single');
        market.setSelectableCards(market.getCards());
        market.onSelectionChange = function (selection) {
            _this.game.toggleButtonEnable('btn_confirm', selection.length == 1);
        };
    };
    ResolveOwlNestState.prototype.onLeavingState = function () {
        var market = this.game.tableCenter.confort_market;
        market.setSelectionMode('none');
        market.onSelectionChange = null;
    };
    ResolveOwlNestState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            var market = _this.game.tableCenter.confort_market;
            if (market.getSelection().length == 0)
                return;
            _this.game.takeAction('resolveWorker', {
                location_id: 11,
                resources: market.getSelection()[0].location_arg,
            });
        };
        this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonClientCancel();
    };
    return ResolveOwlNestState;
}());
var ResolveWorkshopState = (function () {
    function ResolveWorkshopState(game) {
        this.game = game;
    }
    ResolveWorkshopState.prototype.onEnteringState = function (args) {
        var _this = this;
        var _a = this.game.tableCenter, worker_locations = _a.worker_locations, dice_locations = _a.dice_locations, market = _a.improvement_market;
        worker_locations.setSelectableLocation([10]);
        worker_locations.setSelectedLocation([10]);
        var die = dice_locations.getDice().find(function (die) { return die.location == 9; });
        market.setSelectionMode('single');
        market.setSelectableCards(market.getCards().filter(function (card) {
            if (Number(card.location_arg) > die.face)
                return false;
            var type = _this.game.improvementManager.getCardType(card);
            return ResourceHelper.isRequirementMet(_this.game, type.cost);
        }));
        market.onSelectionChange = function (selection) {
            _this.game.toggleButtonEnable('btn_confirm', selection.length == 1);
        };
    };
    ResolveWorkshopState.prototype.onLeavingState = function () {
        var market = this.game.tableCenter.improvement_market;
        market.setSelectionMode('none');
        market.onSelectionChange = null;
    };
    ResolveWorkshopState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            var market = _this.game.tableCenter.improvement_market;
            if (market.getSelection().length == 0)
                return;
            _this.game.takeAction('resolveWorker', {
                location_id: 10,
                resources: market.getSelection()[0].location_arg,
            });
        };
        this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonClientCancel();
    };
    return ResolveWorkshopState;
}());
var ConfortManager = (function (_super) {
    __extends(ConfortManager, _super);
    function ConfortManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "conforts-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('confort');
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: function (card, div) {
                div.dataset.type = card.type;
                div.dataset.pos = card.type_arg;
                div.classList.toggle('background_1', Number(card.type) <= 12);
                div.classList.toggle('background_2', Number(card.type) > 12 && Number(card.type) <= 24);
                if (card.type_arg) {
                }
            },
            isCardVisible: function (card) { return 'type' in card; },
            cardWidth: 110,
            cardHeight: 154,
        }) || this;
        _this.game = game;
        return _this;
    }
    ConfortManager.prototype.markAsSelected = function (card_id) {
        if (card_id > 0) {
            this.getCardElement({ id: card_id.toString() }).classList.add('bga-cards_selected-card');
        }
    };
    ConfortManager.prototype.getCardType = function (card) {
        return this.game.gamedatas.confort_types[card.type];
    };
    return ConfortManager;
}(CardManager));
var ImprovementManager = (function (_super) {
    __extends(ImprovementManager, _super);
    function ImprovementManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "improvement-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('improvement');
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: function (card, div) {
                div.dataset.type = card.type;
                div.dataset.pos = card.type_arg;
                if (card.type_arg) {
                }
            },
            isCardVisible: function (card) { return 'type' in card; },
            cardWidth: 125,
            cardHeight: 125,
        }) || this;
        _this.game = game;
        return _this;
    }
    ImprovementManager.prototype.getCardType = function (card) {
        return this.game.gamedatas.improvement_types[card.type];
    };
    return ImprovementManager;
}(CardManager));
var TravelerManager = (function (_super) {
    __extends(TravelerManager, _super);
    function TravelerManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "traveler-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('traveler');
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: function (card, div) {
                div.dataset.type = card.type;
                div.dataset.pos = card.type_arg;
                if (card.type_arg) {
                }
            },
            isCardVisible: function (card) { return 'type' in card; },
            cardWidth: 212,
            cardHeight: 142,
        }) || this;
        _this.game = game;
        return _this;
    }
    return TravelerManager;
}(CardManager));
var ValleyManager = (function (_super) {
    __extends(ValleyManager, _super);
    function ValleyManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "valley-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('valley');
                div.dataset.cardId = '' + card.id;
                div.classList.add(card.location);
            },
            setupFrontDiv: function (card, div) {
                div.dataset.type = card.type;
                div.dataset.image_pos = '' + game.gamedatas.valley_types[Number(card.type_arg)].image_pos;
                if (card.type_arg) {
                }
            },
            isCardVisible: function () { return true; },
            cardWidth: 250,
            cardHeight: 150,
        }) || this;
        _this.game = game;
        return _this;
    }
    return ValleyManager;
}(CardManager));
var CottageManager = (function (_super) {
    __extends(CottageManager, _super);
    function CottageManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "cottage-".concat(card.player_id, "-").concat(card.token_id); },
            setupDiv: function (card, div) {
                div.classList.add('cottage');
                div.classList.add();
                div.dataset.cardId = '' + card.token_id;
            },
            setupFrontDiv: function (card, div) {
                var color = getColorName(game.gamedatas.players[card.player_id].color);
                div.dataset.type = color;
            },
            isCardVisible: function () { return true; },
            cardWidth: 60,
            cardHeight: 60,
        }) || this;
        _this.game = game;
        return _this;
    }
    return CottageManager;
}(CardManager));
var WorkerManager = (function (_super) {
    __extends(WorkerManager, _super);
    function WorkerManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "worker-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('worker');
                div.classList.add();
                div.dataset.cardId = '' + card.id;
                var color = getColorName(card.type);
                div.dataset.type = color;
            },
            setupFrontDiv: function (card, div) {
                var color = getColorName(card.type);
                div.dataset.type = color;
            },
            isCardVisible: function () { return true; },
            cardWidth: 50,
            cardHeight: 50,
        }) || this;
        _this.game = game;
        return _this;
    }
    return WorkerManager;
}(CardManager));
var PlayerPanel = (function () {
    function PlayerPanel(game, player) {
        var _this = this;
        this.game = game;
        this.counters = {};
        this.player_id = Number(player.id);
        var icons = __spreadArray(__spreadArray([], GOODS, true), ['lesson', 'story', 'coin'], false);
        var templateIcon = "<div class=\"wrapper\">\n         <span id=\"player-panel-".concat(player.id, "-icons-{icon-value}-counter\" class=\"counter\">1</span>\n         <div class=\"resource-icon\" data-type=\"{icon-value}\"></div>\n      </div>");
        var html = "<div id=\"player-panel-".concat(player.id, "-icons\" class=\"icons counters\">\n        ").concat(icons.map(function (icon) { return templateIcon.replaceAll('{icon-value}', icon); }).join(' '), "\n        <div class=\"row\"></div>\n      </div>");
        document.getElementById("player_board_".concat(player.id)).insertAdjacentHTML('beforeend', html);
        icons.forEach(function (icon) {
            var counter = new ebg.counter();
            counter.create("player-panel-".concat(player.id, "-icons-").concat(icon, "-counter"));
            counter.setValue(Number(player[icon]));
            _this.counters[icon] = counter;
        });
        if (this.player_id == game.gamedatas.first_player_id) {
            this.addFirstTokenPlayer();
        }
    }
    PlayerPanel.prototype.addFirstTokenPlayer = function () {
        document.querySelectorAll(".first-player-marker").forEach(function (div) { return div.remove(); });
        var container = document.querySelectorAll("#player-panel-".concat(this.player_id, "-icons .row"))[0];
        container.insertAdjacentHTML('afterbegin', '<div class="first-player-marker"></div>');
    };
    return PlayerPanel;
}());
var PlayerTable = (function () {
    function PlayerTable(game, player) {
        this.game = game;
        this.player_id = Number(player.id);
        this.player_color = getColorName(player.color);
        this.setupBoard(game, player);
        this.setupDice(game);
        this.setupHand(game);
        this.setupCottage(game, player);
        this.setupWorker(game, player);
        this.setupConfort(game, player);
    }
    PlayerTable.prototype.setupBoard = function (game, player) {
        var dataset = ["data-color=\"".concat(player.color, "\"")].join(' ');
        var resourceManager = this.game.getPlayerId() === Number(player.id)
            ? "<div id=\"player-table-".concat(this.player_id, "-resources\" class=\"icons counters\"></div>")
            : '';
        var html = "\n         <div id=\"player-table-".concat(this.player_id, "\" class=\"player-table player-color-").concat(this.player_color, "\" style=\"--player-color: #").concat(player.color, "\" ").concat(dataset, ">\n            <div id=\"player-table-").concat(this.player_id, "-name\" class=\"name-wrapper\">").concat(player.name, "</div>\n            <div class=\"cols\">\n               <div class=\"col\">\n                  <div id=\"player-table-").concat(this.player_id, "-board\" class=\"player-table-board\">\n                     <div id=\"player-table-").concat(this.player_id, "-dice\" class=\"player-table-dice\"></div>\n                     <div id=\"player-table-").concat(this.player_id, "-cottage\" class=\"player-table-cottage\"></div>\n                     <div id=\"player-table-").concat(this.player_id, "-worker\" class=\"player-table-worker\"></div>\n                  </div>\n                  ").concat(resourceManager, "\n                  <div id=\"player-table-").concat(this.player_id, "-hand\"></div>\n               </div>\n               <div class=\"col\">\n                  <div id=\"player-table-").concat(this.player_id, "-improvement\" class=\"player-table-improvement\"></div>\n                  <div id=\"player-table-").concat(this.player_id, "-confort\" class=\"player-table-confort\"></div>\n               </div>\n            </div>\n         </div>");
        document.getElementById('tables').insertAdjacentHTML('beforeend', html);
    };
    PlayerTable.prototype.setupConfort = function (game, player) {
        this.conforts = new LineStock(game.confortManager, document.getElementById("player-table-".concat(this.player_id, "-confort")), {
            direction: 'column',
            gap: '2px',
        });
        this.conforts.addCards(game.gamedatas.conforts.players[this.player_id].board);
    };
    PlayerTable.prototype.setupCottage = function (game, player) {
        this.cottages = new LineStock(game.cottageManager, document.getElementById("player-table-".concat(this.player_id, "-cottage")), {
            direction: 'column',
            gap: '2px',
        });
        this.cottages.addCards([
            { token_id: 1, player_id: Number(player.id), location: 0 },
            { token_id: 2, player_id: Number(player.id), location: 0 },
            { token_id: 3, player_id: Number(player.id), location: 0 },
            { token_id: 4, player_id: Number(player.id), location: 0 },
        ]);
    };
    PlayerTable.prototype.setupDice = function (game) {
        var _this = this;
        this.dice = new PlayerDiceStock(game.diceManager, document.getElementById("player-table-".concat(this.player_id, "-dice")));
        var dice = game.gamedatas.dice.filter(function (die) { return die.owner_id == _this.player_id.toString() && die.location == null; });
        this.dice.addDice(dice);
    };
    PlayerTable.prototype.setupHand = function (game) {
        this.hand = new HandStock(game.confortManager, document.getElementById("player-table-".concat(this.player_id, "-hand")), {
            cardOverlap: '10px',
            cardShift: '5px',
            inclination: 6,
            sort: sortFunction('id'),
        });
        this.hand.addCards(game.gamedatas.conforts.players[this.player_id].hand);
    };
    PlayerTable.prototype.setupWorker = function (game, player) {
        var workers = game.gamedatas.workers.player.filter(function (w) { return w.type_arg == player.id; });
        this.workers = new LineStock(game.workerManager, document.getElementById("player-table-".concat(this.player_id, "-worker")), { gap: '0' });
        this.workers.addCards(workers);
    };
    return PlayerTable;
}());
var TableCenter = (function () {
    function TableCenter(game) {
        this.game = game;
        this.hidden_confort = { id: '1000' };
        this.hidden_traveler = { id: '1001' };
        this.hidden_improvement = { id: '1002' };
        this.setupConfortCards(game);
        this.setupImprovementCards(game);
        this.setupTravelerCards(game);
        this.setupValleyCards(game);
        this.setupWorkerLocations(game);
        this.setupDiceLocations(game);
        this.setupHillDice(game);
        this.setRiverDial(game.gamedatas.river_dial);
    }
    TableCenter.prototype.getWorkerLocations = function () {
        var player_id = this.game.getPlayerId().toString();
        return this.game.tableCenter.worker_locations
            .getCards()
            .filter(function (meeple) { return meeple.type_arg == player_id; })
            .map(function (meeple) { return Number(meeple.location_arg); });
    };
    TableCenter.prototype.setRiverDial = function (value) {
        document.getElementById('river-dial').dataset.position = value.toString();
    };
    TableCenter.prototype.setupConfortCards = function (game) {
        var _a = game.gamedatas.conforts, market = _a.market, discard = _a.discard, deckCount = _a.deckCount;
        this.confort_market = new SlotStock(game.confortManager, document.getElementById("table-conforts"), {
            slotsIds: [1, 2, 3, 4],
            mapCardToSlot: function (card) { return Number(card.location_arg); },
            gap: '12px',
        });
        this.confort_deck = new Deck(game.confortManager, document.getElementById("deck-conforts"), {
            cardNumber: Number(deckCount),
            topCard: this.hidden_confort,
            counter: {},
        });
        this.confort_discard = new Deck(game.confortManager, document.getElementById("discard-conforts"), {
            cardNumber: Number(discard.count),
            topCard: discard.topCard,
            counter: {},
        });
        this.confort_market.addCards(market);
    };
    TableCenter.prototype.setupDiceLocations = function (game) {
        this.dice_locations = new SlotDiceStock(game.diceManager, document.getElementById("dice-locations"), {
            slotsIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            mapDieToSlot: function (die) { return die.location; },
            gap: '0',
        });
        var dice = game.gamedatas.dice.filter(function (die) { return die.location > 0; });
        this.dice_locations.addDice(dice);
    };
    TableCenter.prototype.setupHillDice = function (game) {
        this.hill = new VillageDiceStock(game.diceManager, document.getElementById("hill-dice"));
        var dice = game.gamedatas.dice.filter(function (die) { return die.location == 0; });
        this.hill.addDice(dice);
    };
    TableCenter.prototype.setupImprovementCards = function (game) {
        var _a = game.gamedatas.improvements, market = _a.market, discard = _a.discard, deckCount = _a.deckCount;
        this.improvement_market = new SlotStock(game.improvementManager, document.getElementById("table-improvements"), {
            slotsIds: [6, 5, 4, 3, 2, 1],
            mapCardToSlot: function (card) { return Number(card.location_arg); },
            direction: 'column',
            gap: '7px',
        });
        this.improvement_deck = new Deck(game.improvementManager, document.getElementById("deck-improvements"), {
            cardNumber: deckCount,
            topCard: this.hidden_confort,
            counter: {},
        });
        this.improvement_discard = new Deck(game.improvementManager, document.getElementById("discard-improvements"), {
            cardNumber: discard.count,
            topCard: discard.topCard,
            counter: {},
        });
        this.improvement_market.addCards(market);
    };
    TableCenter.prototype.setupTravelerCards = function (game) {
        var _a = game.gamedatas.travelers, count = _a.count, topCard = _a.topCard;
        this.traveler_deck = new Deck(game.travelerManager, document.getElementById("table-travelers"), {
            cardNumber: count,
            topCard: topCard !== null && topCard !== void 0 ? topCard : this.hidden_traveler,
        });
    };
    TableCenter.prototype.setupValleyCards = function (game) {
        var _a = game.gamedatas.valleys, forest = _a.forest, meadow = _a.meadow;
        this.valley = new SlotStock(game.valleyManager, document.getElementById("table-valleys"), {
            slotsIds: ['forest', 'meadow'],
            mapCardToSlot: function (card) { return card.location; },
            gap: '30px',
        });
        this.valley.addCards([forest.topCard, meadow.topCard]);
    };
    TableCenter.prototype.setupWorkerLocations = function (game) {
        this.worker_locations = new LocationStock(game.workerManager, document.getElementById("worker-locations"), {
            slotsIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            mapCardToSlot: function (meeple) { return meeple.location_arg; },
            gap: '0',
        });
        this.worker_locations.addCards(game.gamedatas.workers.board);
    };
    return TableCenter;
}());
var colors = {
    dcac28: 'yellow',
    '13586b': 'green',
    '7e797b': 'gray',
    b7313e: 'red',
    '650e41': 'purple',
};
function getColorName(code) {
    return colors[code];
}
function createCounter(id, value) {
    if (value === void 0) { value = 0; }
    var counter = new ebg.counter();
    counter.create(id);
    counter.setValue(value);
    return counter;
}
define(["dojo", "dojo/_base/declare", "ebg/core/gamegui", "ebg/counter", "ebg/stock"], function (dojo, declare) {
    return declare("bgagame.creatureconforts", [ebg.core.gamegui], new CreatureConforts());
});
