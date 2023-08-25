var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
var ZoomManager = (function () {
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        this.settings = settings;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this._zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
        this._zoom = this.settings.defaultZoom || 1;
        if (this.settings.localStorageZoomKey) {
            var zoomStr = localStorage.getItem(this.settings.localStorageZoomKey);
            if (zoomStr) {
                this._zoom = Number(zoomStr);
            }
        }
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'bga-zoom-wrapper';
        this.wrapElement(this.wrapper, settings.element);
        this.wrapper.appendChild(settings.element);
        settings.element.classList.add('bga-zoom-inner');
        if ((_b = settings.smooth) !== null && _b !== void 0 ? _b : true) {
            settings.element.dataset.smooth = 'true';
            settings.element.addEventListener('transitionend', function () { return _this.zoomOrDimensionChanged(); });
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        window.addEventListener('resize', function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        });
        if (window.ResizeObserver) {
            new ResizeObserver(function () { return _this.zoomOrDimensionChanged(); }).observe(settings.element);
        }
        if ((_e = this.settings.autoZoom) === null || _e === void 0 ? void 0 : _e.expectedWidth) {
            this.setAutoZoom();
        }
    }
    Object.defineProperty(ZoomManager.prototype, "zoom", {
        get: function () {
            return this._zoom;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZoomManager.prototype, "zoomLevels", {
        get: function () {
            return this._zoomLevels;
        },
        enumerable: false,
        configurable: true
    });
    ZoomManager.prototype.setAutoZoom = function () {
        var _this = this;
        var _a, _b, _c;
        var zoomWrapperWidth = document.getElementById('bga-zoom-wrapper').clientWidth;
        if (!zoomWrapperWidth) {
            setTimeout(function () { return _this.setAutoZoom(); }, 200);
            return;
        }
        var expectedWidth = (_a = this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth;
        var newZoom = this.zoom;
        while (newZoom > this._zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this._zoomLevels[this._zoomLevels.indexOf(newZoom) - 1];
        }
        if (this._zoom == newZoom) {
            if (this.settings.localStorageZoomKey) {
                localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
            }
        }
        else {
            this.setZoom(newZoom);
        }
    };
    ZoomManager.prototype.setZoomLevels = function (zoomLevels, newZoom) {
        if (!zoomLevels || zoomLevels.length <= 0) {
            return;
        }
        this._zoomLevels = zoomLevels;
        var zoomIndex = newZoom && zoomLevels.includes(newZoom) ? this._zoomLevels.indexOf(newZoom) : this._zoomLevels.length - 1;
        this.setZoom(this._zoomLevels[zoomIndex]);
    };
    ZoomManager.prototype.setZoom = function (zoom) {
        var _a, _b, _c, _d;
        if (zoom === void 0) { zoom = 1; }
        this._zoom = zoom;
        if (this.settings.localStorageZoomKey) {
            localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this._zoomLevels.length - 1);
        (_b = this.zoomOutButton) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', newIndex === 0);
        this.settings.element.style.transform = zoom === 1 ? '' : "scale(".concat(zoom, ")");
        (_d = (_c = this.settings).onZoomChange) === null || _d === void 0 ? void 0 : _d.call(_c, this._zoom);
        this.zoomOrDimensionChanged();
    };
    ZoomManager.prototype.manualHeightUpdate = function () {
        if (!window.ResizeObserver) {
            this.zoomOrDimensionChanged();
        }
    };
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        this.settings.element.style.width = "".concat(this.wrapper.getBoundingClientRect().width / this._zoom, "px");
        this.wrapper.style.height = "".concat(this.settings.element.getBoundingClientRect().height, "px");
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._zoom);
    };
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this._zoomLevels[this._zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this._zoomLevels[0]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    ZoomManager.prototype.setZoomControlsColor = function (color) {
        if (this.zoomControls) {
            this.zoomControls.dataset.color = color;
        }
    };
    ZoomManager.prototype.initZoomControls = function (settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.zoomControls = document.createElement('div');
        this.zoomControls.id = 'bga-zoom-controls';
        this.zoomControls.dataset.position = (_b = (_a = settings.zoomControls) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : 'top-right';
        this.zoomOutButton = document.createElement('button');
        this.zoomOutButton.type = 'button';
        this.zoomOutButton.addEventListener('click', function () { return _this.zoomOut(); });
        if ((_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.customZoomOutElement) {
            settings.zoomControls.customZoomOutElement(this.zoomOutButton);
        }
        else {
            this.zoomOutButton.classList.add("bga-zoom-out-icon");
        }
        this.zoomInButton = document.createElement('button');
        this.zoomInButton.type = 'button';
        this.zoomInButton.addEventListener('click', function () { return _this.zoomIn(); });
        if ((_d = settings.zoomControls) === null || _d === void 0 ? void 0 : _d.customZoomInElement) {
            settings.zoomControls.customZoomInElement(this.zoomInButton);
        }
        else {
            this.zoomInButton.classList.add("bga-zoom-in-icon");
        }
        this.zoomControls.appendChild(this.zoomOutButton);
        this.zoomControls.appendChild(this.zoomInButton);
        this.wrapper.appendChild(this.zoomControls);
        this.setZoomControlsColor((_f = (_e = settings.zoomControls) === null || _e === void 0 ? void 0 : _e.color) !== null && _f !== void 0 ? _f : 'black');
    };
    ZoomManager.prototype.wrapElement = function (wrapper, element) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    };
    return ZoomManager;
}());
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
var LOCAL_STORAGE_ZOOM_KEY = 'creature-conforts-zoom';
var arrayRange = function (start, end) { return Array.from(Array(end - start + 1).keys()).map(function (x) { return x + start; }); };
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
        this.notifManager = new NotificationManager(this);
        this.stateManager = new StateManager(this);
        this.tableCenter = new TableCenter(this);
        ['red', 'yellow', 'green', 'gray', 'purple'].forEach(function (color) {
            _this.dontPreloadImage("board_".concat(color, ".jpg"));
            _this.dontPreloadImage("dice_".concat(color, ".jpg"));
        });
        this.createPlayerTables(gamedatas);
        this.zoomManager = new ZoomManager({
            element: document.getElementById('table'),
            smooth: false,
            zoomControls: {
                color: 'white',
            },
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
            onDimensionsChange: function () {
                var tablesAndCenter = document.getElementById('tables-and-center');
                var clientWidth = document.getElementById('table').clientWidth;
                var tablesWidth = Math.max(640);
                tablesAndCenter.classList.toggle('double-column', clientWidth > 971 + tablesWidth);
            },
        });
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
    CreatureConforts.prototype.addActionButtonGray = function (id, label, action) {
        this.addActionButton(id, label, action, null, null, 'gray');
    };
    CreatureConforts.prototype.addActionButtonRed = function (id, label, action) {
        this.addActionButton(id, label, action, null, null, 'red');
    };
    CreatureConforts.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        this.playersTables = [];
        gamedatas.players_order.forEach(function (player_id) {
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
    return CreatureConforts;
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
            cardOverlap: "30px",
            cardShift: "6px",
            inclination: 6,
            sort: sortFunction("type_arg"),
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
        var copy = __assign(__assign({}, card), { type: "", type_arg: "" });
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
var ColoredDie6 = (function (_super) {
    __extends(ColoredDie6, _super);
    function ColoredDie6(color, size) {
        if (size === void 0) { size = 60; }
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
            },
        }) || this;
    }
    return MyDiceManager;
}(DiceManager));
var NotificationManager = (function () {
    function NotificationManager(game) {
        this.game = game;
    }
    NotificationManager.prototype.setup = function () {
        var _this = this;
        this.game.notifqueue.setIgnoreNotificationCheck("message", function (notif) { return notif.args.excluded_player_id && notif.args.excluded_player_id == _this.game.player_id; });
    };
    NotificationManager.prototype.subscribeEvent = function (eventName, time, setIgnore) {
        var _this = this;
        if (setIgnore === void 0) { setIgnore = false; }
        try {
            dojo.subscribe(eventName, this, "notif_" + eventName);
            if (time) {
                this.game.notifqueue.setSynchronous(eventName, time);
            }
            if (setIgnore) {
                this.game.notifqueue.setIgnoreNotificationCheck(eventName, function (notif) {
                    return notif.args.excluded_player_id && notif.args.excluded_player_id == _this.game.player_id;
                });
            }
        }
        catch (_a) {
            console.error("NotificationManager::subscribeEvent", eventName);
        }
    };
    return NotificationManager;
}());
var states = {
    client: {},
    server: {},
};
var StateManager = (function () {
    function StateManager(game) {
        this.game = game;
        this.client_states = [];
        this.states = {};
    }
    StateManager.prototype.onEnteringState = function (stateName, args) {
        debug("Entering state: " + stateName);
        if (this.states[stateName] !== undefined) {
            this.states[stateName].onEnteringState(args.args);
            if (stateName.startsWith("client_")) {
                this.client_states.push(this.states[stateName]);
            }
            else {
                this.client_states.splice(0);
            }
        }
        else {
            this.client_states.splice(0);
            if (isDebug) {
                console.warn("State not handled", stateName);
            }
        }
        console.log("client states", this.client_states);
    };
    StateManager.prototype.onLeavingState = function (stateName) {
        debug("Leaving state: " + stateName);
        if (this.states[stateName] !== undefined) {
            if (this.game.isCurrentPlayerActive()) {
                this.states[stateName].onLeavingState();
            }
        }
    };
    StateManager.prototype.onUpdateActionButtons = function (stateName, args) {
        debug("onUpdateActionButtons: " + stateName);
        if (this.states[stateName] !== undefined) {
            if (this.game.isCurrentPlayerActive()) {
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
var ConfortManager = (function (_super) {
    __extends(ConfortManager, _super);
    function ConfortManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "conforts-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('confort');
                div.dataset.cardId = '' + card.id;
                div.classList.add(Number(card.type) <= 12 ? 'background_1' : 'background_2');
            },
            setupFrontDiv: function (card, div) {
                div.dataset.type = card.type;
                div.dataset.pos = card.type_arg;
                if (card.type_arg) {
                }
            },
            isCardVisible: function () { return true; },
            cardWidth: 110,
            cardHeight: 154,
        }) || this;
        _this.game = game;
        return _this;
    }
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
            isCardVisible: function () { return true; },
            cardWidth: 125,
            cardHeight: 125,
        }) || this;
        _this.game = game;
        return _this;
    }
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
            isCardVisible: function () { return true; },
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
                div.dataset.pos = card.type_arg;
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
var HouseManager = (function (_super) {
    __extends(HouseManager, _super);
    function HouseManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "house-".concat(card.player_id, "-").concat(card.token_id); },
            setupDiv: function (card, div) {
                div.classList.add('house');
                div.classList.add();
                div.dataset.cardId = '' + card.token_id;
            },
            setupFrontDiv: function (card, div) {
                div.dataset.type = game.getPlayerTable(card.player_id).player_color;
            },
            isCardVisible: function () { return true; },
            cardWidth: 60,
            cardHeight: 60,
        }) || this;
        _this.game = game;
        return _this;
    }
    return HouseManager;
}(CardManager));
var diceId = 1;
function getDiceId() {
    return diceId++;
}
var PlayerTable = (function () {
    function PlayerTable(game, player) {
        var _this = this;
        this.game = game;
        this.player_id = Number(player.id);
        this.current_player = this.player_id == this.game.getPlayerId();
        var colors = {
            dcac28: 'yellow',
            '13586b': 'green',
            '7e797b': 'gray',
            b7313e: 'red',
            '650e41': 'purple',
        };
        this.player_color = colors[player.color];
        var dataset = ["data-color=\"".concat(player.color, "\"")].join(' ');
        var html = "\n         <div id=\"player-table-".concat(this.player_id, "\" class=\"player-table whiteblock player-color-").concat(this.player_color, "\" style=\"--player-color: #").concat(player.color, "\" ").concat(dataset, ">\n            <div id=\"player-table-").concat(this.player_id, "-name\" class=\"name-wrapper\">").concat(player.name, "</div>\n            <div id=\"player-table-").concat(this.player_id, "-board\" class=\"player-table-board\">\n               <div id=\"player-table-").concat(this.player_id, "-dice\" class=\"player-table-dice\"></div>\n            </div>\n         </div>");
        document.getElementById('tables').insertAdjacentHTML('beforeend', html);
        this.dice = new SlotDiceStock(game.diceManager, document.getElementById("player-table-".concat(this.player_id, "-dice")), {
            slotsIds: [1, 2],
            slotClasses: [this.player_color],
            mapDieToSlot: function (die) { return die.location_arg; },
            gap: '16px',
        });
        this.dice.onDieClick = function (die) {
            var dice = _this.dice.getDice();
            dice.forEach(function (die) { return (die.value = Math.floor(Math.random() * 6) + 1); });
            _this.dice.rollDice(dice, {
                effect: 'rollIn',
                duration: [500, 900],
            });
        };
        this.dice.addDice([
            { id: getDiceId(), type: this.player_color, face: 2, location: this.player_id, location_arg: 1 },
            { id: getDiceId(), type: this.player_color, face: 5, location: this.player_id, location_arg: 2 },
        ]);
    }
    return PlayerTable;
}());
var TableCenter = (function () {
    function TableCenter(game) {
        this.game = game;
        this.setupConforts(game);
        this.setupImprovements(game);
        this.setupTravelers(game);
        this.setupValleys(game);
    }
    TableCenter.prototype.setupConforts = function (game) {
        this.conforts = new SlotStock(game.confortManager, document.getElementById("table-conforts"), {
            slotsIds: [1, 2, 3, 4],
            mapCardToSlot: function (card) { return Number(card.location_arg); },
            gap: '12px',
        });
        this.conforts.addCards(game.gamedatas.conforts);
    };
    TableCenter.prototype.setupImprovements = function (game) {
        this.improvements = new SlotStock(game.improvementManager, document.getElementById("table-improvements"), {
            slotsIds: [6, 5, 4, 3, 2, 1],
            mapCardToSlot: function (card) { return Number(card.location_arg); },
            direction: 'column',
            gap: '7px',
        });
        this.improvements.addCards(game.gamedatas.improvements);
    };
    TableCenter.prototype.setupTravelers = function (game) {
        this.travelers = new Deck(game.travelerManager, document.getElementById("table-travelers"), {});
        this.travelers.addCards(game.gamedatas.travelers);
    };
    TableCenter.prototype.setupValleys = function (game) {
        this.valley = new SlotStock(game.valleyManager, document.getElementById("table-valleys"), {
            slotsIds: ['forest', 'meadow'],
            mapCardToSlot: function (card) { return card.location; },
            gap: '30px',
        });
        debugger;
        this.valley.addCards(game.gamedatas.valleys);
    };
    return TableCenter;
}());
define(["dojo", "dojo/_base/declare", "ebg/core/gamegui", "ebg/counter", "ebg/stock"], function (dojo, declare) {
    return declare("bgagame.creatureconforts", [ebg.core.gamegui], new CreatureConforts());
});
