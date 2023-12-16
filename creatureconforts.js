var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
function throttle(callback, delay) {
    var last;
    var timer;
    return function () {
        var context = this;
        var now = +new Date();
        var args = arguments;
        if (last && now < last + delay) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                callback.apply(context, args);
            }, delay);
        }
        else {
            last = now;
            callback.apply(context, args);
        }
    };
}
var ZoomManager = (function () {
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
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
        this.throttleTime = (_e = settings.throttleTime) !== null && _e !== void 0 ? _e : 100;
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
        if ((_f = this.settings.autoZoom) === null || _f === void 0 ? void 0 : _f.expectedWidth) {
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
        this.zoomOrDimensionChangedUnsafe();
    };
    ZoomManager.prototype.manualHeightUpdate = function () {
        if (!window.ResizeObserver) {
            this.zoomOrDimensionChanged();
        }
    };
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _this = this;
        throttle(function () { return _this.zoomOrDimensionChangedUnsafe(); }, this.throttleTime);
    };
    ZoomManager.prototype.zoomOrDimensionChangedUnsafe = function () {
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
function pauseAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a;
        var settings = animation.settings;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        setTimeout(function () { return success(); }, duration);
    });
    return promise;
}
var BgaPauseAnimation = (function (_super) {
    __extends(BgaPauseAnimation, _super);
    function BgaPauseAnimation(settings) {
        return _super.call(this, pauseAnimation, settings) || this;
    }
    return BgaPauseAnimation;
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
        var promise;
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            promise = this.manager.removeCard(card, settings);
        }
        else {
            promise = Promise.resolve(false);
        }
        this.cardRemoved(card, settings);
        return promise;
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
        return __awaiter(this, void 0, void 0, function () {
            var promises, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = cards.map(function (card) { return _this.removeCard(card, settings); });
                        return [4, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        return [2, results.some(function (result) { return result; })];
                }
            });
        });
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
            element === null || element === void 0 ? void 0 : element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(unselectableCardsClass, !selectable);
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
        if (!element || !element.classList.contains(selectableCardsClass)) {
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
        element === null || element === void 0 ? void 0 : element.classList.remove(selectedCardsClass);
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
        cardElement === null || cardElement === void 0 ? void 0 : cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
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
        var promise = topCard ? this.addCard(topCard) : Promise.resolve(true);
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
        return promise;
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
    SlotStock.prototype.addSlotsIds = function (newSlotsIds) {
        var _a;
        var _this = this;
        if (newSlotsIds.length == 0) {
            return;
        }
        (_a = this.slotsIds).push.apply(_a, newSlotsIds);
        newSlotsIds.forEach(function (slotId) {
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
        this.updateMainTimeoutId = [];
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
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
            return Promise.resolve(false);
        }
        div.id = "deleted".concat(id);
        div.remove();
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return Promise.resolve(true);
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateMain) !== null && _a !== void 0 ? _a : false) {
            if (this.updateMainTimeoutId[stringId]) {
                clearTimeout(this.updateMainTimeoutId[stringId]);
                delete this.updateMainTimeoutId[stringId];
            }
            var updateMainDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateMainDelay) !== null && _b !== void 0 ? _b : 0;
            if (isVisible && updateMainDelay > 0 && this.animationsActive()) {
                this.updateMainTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element); }, updateMainDelay);
            }
            else {
                (_d = (_c = this.settings).setupDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _e !== void 0 ? _e : true) {
            if (this.updateFrontTimeoutId[stringId]) {
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _f !== void 0 ? _f : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_h = (_g = this.settings).setupFrontDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _j !== void 0 ? _j : false) {
            if (this.updateBackTimeoutId[stringId]) {
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_k = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _k !== void 0 ? _k : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_m = (_l = this.settings).setupBackDiv) === null || _m === void 0 ? void 0 : _m.call(_l, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_o = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _o !== void 0 ? _o : true) {
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
var GOODS = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain'];
var ICONS = __spreadArray(__spreadArray([], GOODS, true), ['lesson', 'story', 'coin', 'card'], false);
var ResourceCounterLineStock = (function () {
    function ResourceCounterLineStock(parent, settings) {
        var _this = this;
        this.parent = parent;
        this.settings = settings;
        this.counters = [];
        this.element = this.createElement();
        parent.appendChild(this.element);
        settings.resources.forEach(function (_a) {
            var resource = _a.resource, initialValue = _a.initialValue, disabled = _a.disabled;
            var counter = new ResourceCounter(_this.element, resource, {
                initialValue: initialValue,
                disabled: disabled !== null && disabled !== void 0 ? disabled : (initialValue !== null && initialValue !== void 0 ? initialValue : 0) === 0,
            });
            counter.onClick = function () { return _this.onClick(resource); };
            _this.counters.push(counter);
        });
    }
    ResourceCounterLineStock.prototype.createElement = function () {
        var _a;
        var element = document.createElement('div');
        element.classList.add('resource-counter-line-stock');
        if (this.settings.classList) {
            (_a = element.classList).add.apply(_a, this.settings.classList);
        }
        return element;
    };
    ResourceCounterLineStock.prototype.disable = function () {
        this.counters.forEach(function (counter) { return counter.disabled(true); });
    };
    ResourceCounterLineStock.prototype.disableResource = function (type) {
        var _a;
        (_a = this.counters.find(function (counter) { return counter.icon === type; })) === null || _a === void 0 ? void 0 : _a.disabled(true);
    };
    ResourceCounterLineStock.prototype.reset = function () {
        this.counters.forEach(function (counter) { return counter.reset(); });
    };
    return ResourceCounterLineStock;
}());
var ResourceCounter = (function () {
    function ResourceCounter(parent, icon, settings) {
        this.icon = icon;
        this.settings = settings;
        var resource_counter = this.createCounter();
        this.element = this.createWrapper(icon, [resource_counter, this.createIcon(icon)]);
        parent.appendChild(this.element);
        var initialValue = settings.initialValue, disabled = settings.disabled;
        this.counter = createCounter(resource_counter, initialValue !== null && initialValue !== void 0 ? initialValue : 0);
        this.disabled(disabled !== null && disabled !== void 0 ? disabled : false);
    }
    ResourceCounter.prototype.createWrapper = function (icon, children) {
        var _this = this;
        var element = document.createElement('div');
        element.classList.add('resource-counter-wrapper');
        element.dataset.type = '' + icon;
        element.onclick = function () { return _this.handleClick(); };
        children.forEach(function (child) { return element.appendChild(child); });
        return element;
    };
    ResourceCounter.prototype.createCounter = function () {
        var element = document.createElement('span');
        element.classList.add('counter');
        return element;
    };
    ResourceCounter.prototype.createIcon = function (icon) {
        var element = document.createElement('div');
        element.classList.add('resource-icon');
        element.dataset.type = '' + icon;
        return element;
    };
    ResourceCounter.prototype.handleClick = function () {
        var _a;
        var notifyClick = this.onClick !== undefined &&
            this.counter.getValue() > 0 &&
            this.element.classList.contains('disabled') === false;
        if (notifyClick) {
            var handled = (_a = this.onClick) === null || _a === void 0 ? void 0 : _a.call(this);
            if (handled !== false) {
                this.counter.incValue(-1);
                if (this.counter.getValue() === 0) {
                    this.disabled(true);
                }
            }
        }
    };
    ResourceCounter.prototype.disabled = function (value) {
        this.element.classList.toggle('disabled', value === true);
    };
    ResourceCounter.prototype.getValue = function () {
        return this.counter.getValue();
    };
    ResourceCounter.prototype.incValue = function (value) {
        this.counter.incValue(value);
        if (this.counter.getValue() === 0)
            this.disabled(true);
    };
    ResourceCounter.prototype.setValue = function (value) {
        this.counter.setValue(value);
        if (this.counter.getValue() === 0)
            this.disabled(true);
    };
    ResourceCounter.prototype.reset = function () {
        var _a = this.settings, initialValue = _a.initialValue, disabled = _a.disabled;
        this.counter.setValue(initialValue !== null && initialValue !== void 0 ? initialValue : 0);
        this.disabled(disabled);
    };
    return ResourceCounter;
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
    ResourceHelper.convertCostToArray = function (cost) {
        var value = [];
        Object.keys(cost).forEach(function (type) {
            for (var index = 0; index < cost[type]; index++) {
                value.push(type);
            }
        });
        return value;
    };
    return ResourceHelper;
}());
var ResourceManagerPayFor = (function () {
    function ResourceManagerPayFor(root, settings) {
        var _this = this;
        this.settings = settings;
        this.resource_trader = [];
        root.classList.add('resource-container');
        root.classList.add('resource-manager-pay-for');
        this.resource_player = new ResourceCounterLineStock(root, {
            resources: settings.from.available,
        });
        if (settings.to.available) {
            root.appendChild(this.createArrow());
            this.resource_board = new ResourceCounterLineStock(root, {
                resources: settings.to.available.map(function (p) {
                    return {
                        resource: p,
                        initialValue: 1,
                    };
                }),
                classList: ['resource-board'],
            });
            this.resource_board.onClick = function (type) { return _this.handleResourceBoardClick(type); };
        }
        root.appendChild(this.createSpacer());
        this.traders = this.createTraders();
        root.appendChild(this.traders);
        this.addResourceTrader();
        this.resource_player.onClick = function (type) { return _this.handleResourcePlayerClick(type); };
    }
    ResourceManagerPayFor.prototype.getResourcesFrom = function () {
        return this.resource_trader.filter(function (t) { return t.isComplete(); }).flatMap(function (t) { return t.getFrom(); });
    };
    ResourceManagerPayFor.prototype.getResourcesTo = function () {
        return this.resource_trader.filter(function (t) { return t.isComplete(); }).flatMap(function (t) { return t.getTo(); });
    };
    ResourceManagerPayFor.prototype.reset = function () {
        var _a;
        (_a = this.resource_board) === null || _a === void 0 ? void 0 : _a.reset();
        this.resource_player.reset();
        this.resource_trader.forEach(function (t) { return t.destroy(); });
        this.resource_trader.splice(0);
        this.addResourceTrader();
    };
    ResourceManagerPayFor.prototype.hasTradePending = function () {
        return !this.resource_trader.every(function (t) { return !t.isTradePending(); });
    };
    ResourceManagerPayFor.prototype.addResourceTrader = function () {
        var _a = this.settings, from = _a.from, to = _a.to;
        var trader = new ResourceTrader(this.traders, {
            from: {
                count: from.count,
                resources: from.requirement,
                restriction: from.restriction,
            },
            to: {
                count: to.count,
                resources: to.resources,
                restriction: to.restriction,
            },
        });
        this.resource_trader.push(trader);
        if (from.restriction) {
            if (from.restriction === 'all_different') {
                console.log(from.restriction);
                trader.element.insertAdjacentElement('afterbegin', this.createDifferentIcon());
            }
            if (from.restriction === 'all_same') {
                trader.element.insertAdjacentElement('afterbegin', this.createSameIcon());
            }
        }
        if (to.restriction) {
            if (to.restriction === 'all_different') {
                trader.element.appendChild(this.createDifferentIcon());
            }
            if (to.restriction === 'all_same') {
                trader.element.appendChild(this.createSameIcon());
            }
        }
        return trader;
    };
    ResourceManagerPayFor.prototype.createArrow = function () {
        var divSpacer = document.createElement('div');
        divSpacer.classList.add('arrow');
        return divSpacer;
    };
    ResourceManagerPayFor.prototype.createSpacer = function () {
        var divSpacer = document.createElement('div');
        divSpacer.classList.add('spacer');
        return divSpacer;
    };
    ResourceManagerPayFor.prototype.createTraders = function () {
        var divTrader = document.createElement('div');
        divTrader.classList.add('resource-traders');
        return divTrader;
    };
    ResourceManagerPayFor.prototype.handleResourceBoardClick = function (type) {
        var _this = this;
        var _a;
        var trader = this.resource_trader.find(function (p) { return !p.isFullTo() && p.canAddTo(type); });
        if (trader) {
            trader.addTo(type);
        }
        if (this.settings.to.restriction === 'all_same') {
            (_a = this.settings.to.available) === null || _a === void 0 ? void 0 : _a.filter(function (p) { return p !== type; }).forEach(function (p) {
                _this.resource_board.disableResource(p);
            });
            this.resource_player.disableResource(type);
        }
        return false;
    };
    ResourceManagerPayFor.prototype.handleResourcePlayerClick = function (type) {
        var trader = this.resource_trader.find(function (p) { return !p.isFullFrom() && p.canAddFrom(type); });
        if (trader === undefined) {
            if (this.resource_trader.length < this.settings.times) {
                trader = this.addResourceTrader();
            }
            else {
                return false;
            }
        }
        trader.addFrom(type);
        var last_trader = this.resource_trader.find(function (p) { return !p.isFullFrom() && p.canAddFrom(type); });
        if (last_trader === undefined && this.resource_trader.length < this.settings.times) {
            last_trader = this.addResourceTrader();
        }
        if (!(last_trader === null || last_trader === void 0 ? void 0 : last_trader.canAddFrom(type)) || this.settings.from.restriction === 'all_different') {
            this.resource_player.disableResource(type);
        }
        if (this.resource_trader.every(function (p) { return p.isFullFrom(); })) {
            this.resource_player.disable();
        }
    };
    ResourceManagerPayFor.prototype.createDifferentIcon = function () {
        var icon = document.createElement('div');
        icon.classList.add('restriction-icon', 'different');
        return icon;
    };
    ResourceManagerPayFor.prototype.createSameIcon = function () {
        var icon = document.createElement('div');
        icon.classList.add('restriction-icon', 'same');
        return icon;
    };
    return ResourceManagerPayFor;
}());
var ResourceManagerPay = (function () {
    function ResourceManagerPay(root, settings) {
        var _this = this;
        var player_resources = settings.player_resources, resource_count = settings.resource_count;
        root.classList.add('resource-container');
        root.classList.add('resource-manager-pay');
        this.resource_player = new ResourceCounterLineStock(root, {
            resources: player_resources,
        });
        root.appendChild(this.createSpacer());
        this.resource_paid = new ResourcePlaceholderLineStock(root, resource_count, {
            resources: settings.requirement,
        });
        this.resource_player.onClick = function (type) {
            _this.resource_paid.add(type);
            if (!_this.resource_paid.canAdd(type)) {
                _this.resource_player.disableResource(type);
            }
            if (_this.resource_paid.isFull()) {
                _this.resource_player.disable();
            }
            return undefined;
        };
    }
    ResourceManagerPay.prototype.getResourcesFrom = function () {
        var res = this.resource_paid.get();
        return res;
    };
    ResourceManagerPay.prototype.getResourcesTo = function () {
        return [];
    };
    ResourceManagerPay.prototype.reset = function () {
        this.resource_player.reset();
        this.resource_paid.reset();
    };
    ResourceManagerPay.prototype.hasTradePending = function () {
        return !this.resource_paid.isFull();
    };
    ResourceManagerPay.prototype.createSpacer = function () {
        var divSpacer = document.createElement('div');
        divSpacer.classList.add('spacer');
        return divSpacer;
    };
    return ResourceManagerPay;
}());
var ResourcePlaceholderLineStock = (function () {
    function ResourcePlaceholderLineStock(parent, count, settings) {
        this.parent = parent;
        this.settings = settings;
        this.placeholders = [];
        this.element = this.createElement();
        parent.appendChild(this.element);
        for (var index = 0; index < count; index++) {
            var allowed = undefined;
            if ((settings === null || settings === void 0 ? void 0 : settings.resources) && settings.resources[index]) {
                if (Array.isArray(settings.resources[index])) {
                    allowed = settings.resources[index];
                }
                else {
                    allowed = [settings.resources[index]];
                }
            }
            this.placeholders.push(new ResourcePlaceholder(this.element, { allowed: allowed }));
            if ((settings === null || settings === void 0 ? void 0 : settings.restriction) && index < count - 1) {
                this.addRestrictionIcon();
            }
        }
    }
    ResourcePlaceholderLineStock.prototype.createElement = function () {
        var element = document.createElement('div');
        element.classList.add('resource-placeholder-line-stock');
        return element;
    };
    ResourcePlaceholderLineStock.prototype.get = function () {
        return this.placeholders.filter(function (p) { return !p.isEmpty(); }).map(function (p) { return p.getResource(); });
    };
    ResourcePlaceholderLineStock.prototype.add = function (resource) {
        var firstEmpty = this.placeholders.find(function (p) { return p.isEmpty() && p.isResourceAllowed(resource); });
        if (firstEmpty) {
            firstEmpty.add(resource);
        }
        return firstEmpty !== undefined;
    };
    ResourcePlaceholderLineStock.prototype.canAdd = function (resource) {
        var _a;
        var firstEmpty = this.placeholders.find(function (p) { return p.isEmpty() && p.isResourceAllowed(resource); });
        if (firstEmpty === undefined)
            return false;
        if ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.restriction) {
            var current_resources = this.placeholders.filter(function (p) { return !p.isEmpty(); }).map(function (p) { return p.getResource(); });
            if (current_resources.length === 0)
                return true;
            if (this.settings.restriction === 'different') {
                return current_resources.indexOf(resource) < 0;
            }
            if (this.settings.restriction === 'same') {
                return current_resources.indexOf(resource) >= 0;
            }
        }
        return true;
    };
    ResourcePlaceholderLineStock.prototype.isFull = function () {
        return this.placeholders.find(function (p) { return p.isEmpty(); }) === undefined;
    };
    ResourcePlaceholderLineStock.prototype.reset = function () {
        return this.placeholders.forEach(function (p) { return p.reset(); });
    };
    ResourcePlaceholderLineStock.prototype.createDifferentIcon = function () {
        var icon = document.createElement('div');
        icon.classList.add('restriction-icon', 'different');
        return icon;
    };
    ResourcePlaceholderLineStock.prototype.createSameIcon = function () {
        var icon = document.createElement('div');
        icon.classList.add('restriction-icon', 'same');
        return icon;
    };
    ResourcePlaceholderLineStock.prototype.addRestrictionIcon = function () {
        var _a, _b;
        if (((_a = this.settings) === null || _a === void 0 ? void 0 : _a.restriction) === 'different') {
            this.element.appendChild(this.createDifferentIcon());
        }
        else if (((_b = this.settings) === null || _b === void 0 ? void 0 : _b.restriction) === 'same') {
            this.element.appendChild(this.createSameIcon());
        }
    };
    return ResourcePlaceholderLineStock;
}());
var ResourcePlaceholder = (function () {
    function ResourcePlaceholder(parent, settings) {
        this.settings = settings;
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
        this.resource = undefined;
        while (this.element.children.length > 0) {
            this.element.removeChild(this.element.childNodes[0]);
        }
    };
    ResourcePlaceholder.prototype.add = function (type) {
        this.resource = type;
        this.element.insertAdjacentHTML('beforeend', ResourceHelper.getElement(type));
    };
    ResourcePlaceholder.prototype.isEmpty = function () {
        return this.resource === undefined;
    };
    ResourcePlaceholder.prototype.isResourceAllowed = function (type) {
        var _a;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.allowed) === undefined || this.settings.allowed.indexOf(type) >= 0;
    };
    return ResourcePlaceholder;
}());
var ResourceTrader = (function () {
    function ResourceTrader(parent, settings) {
        var _this = this;
        var _a;
        this.settings = settings;
        var from = settings.from, to = settings.to;
        this.element = this.createElement();
        parent.appendChild(this.element);
        this.from = new ResourcePlaceholderLineStock(this.element, from.count, {
            resources: from.resources,
            restriction: from.restriction,
        });
        if (to.count || to.resources || to.resources) {
            this.element.append(this.createArrow());
            this.to = new ResourcePlaceholderLineStock(this.element, (_a = to.count) !== null && _a !== void 0 ? _a : to.resources.length, {
                restriction: to.restriction,
            });
            if (to.resources) {
                to.resources.forEach(function (r) { return _this.to.add(r); });
            }
        }
    }
    ResourceTrader.prototype.addFrom = function (resource) {
        this.from.add(resource);
    };
    ResourceTrader.prototype.addTo = function (resource) {
        this.to.add(resource);
    };
    ResourceTrader.prototype.canAddFrom = function (resource) {
        return this.from.canAdd(resource);
    };
    ResourceTrader.prototype.canAddTo = function (resource) {
        return this.to.canAdd(resource);
    };
    ResourceTrader.prototype.destroy = function () {
        this.element.remove();
    };
    ResourceTrader.prototype.disable = function (value) {
        this.element.classList.toggle('disabled', value);
    };
    ResourceTrader.prototype.getFrom = function () {
        return this.from.get();
    };
    ResourceTrader.prototype.getTo = function () {
        return this.to !== undefined ? this.to.get() : [];
    };
    ResourceTrader.prototype.isFullFrom = function () {
        return this.from.isFull();
    };
    ResourceTrader.prototype.isFullTo = function () {
        return this.to === undefined || this.to.isFull();
    };
    ResourceTrader.prototype.isComplete = function () {
        return this.isFullFrom() && this.isFullTo();
    };
    ResourceTrader.prototype.isTradePending = function () {
        return ((!this.isFullFrom() && this.getFrom().length > 0) || (!this.isFullTo() && this.getTo().length > 0));
    };
    ResourceTrader.prototype.createElement = function () {
        var element = document.createElement('div');
        element.classList.add('resource-trader');
        return element;
    };
    ResourceTrader.prototype.createArrow = function () {
        var divSpacer = document.createElement('div');
        divSpacer.classList.add('arrow');
        return divSpacer;
    };
    return ResourceTrader;
}());
var DiceModifier = (function () {
    function DiceModifier(game, diceManager, settings) {
        this.game = game;
        this.diceManager = diceManager;
        this.settings = settings;
        this.diceLessonLearned = {};
        this.diceUmbrella = {};
    }
    DiceModifier.prototype.show = function () {
        var _this = this;
        var die = this.settings.die;
        var htmlDie = this.diceManager.getDieElement(die).childNodes[0];
        var dieValue = Number(die.face);
        var handleConfirmLesson = function () {
            _this.game.tableCenter.dice_locations.unselectAll();
            _this.game.updatePageTitle();
        };
        var handleRemoveLesson = function () {
            _this.diceLessonLearned[die.id] = 0;
            _this.displayLessonLearnedToken(htmlDie, die);
            updateButton();
        };
        var updateButton = function () {
            var count = _this.diceLessonLearned[die.id];
            _this.game.toggleButtonEnable('btn_minus', dieValue + count > 1 && (getLessonRemaining() > 0 || count > 0));
            _this.game.toggleButtonEnable('btn_plus', dieValue + count < 6 && (getLessonRemaining() > 0 || count < 0));
        };
        this.addLessonButtons();
        if (this.game.getCurrentPlayerTable().hasUmbrella()) {
            var label_plus_1 = applyIcon(_('Use ${token} to increase by ${nbr}'), 'umbrella', 1);
            var label_plus_2 = applyIcon(_('Use ${token} to increase by ${nbr}'), 'umbrella', 2);
            this.game.addActionButton('btn_umbrella_1', label_plus_1, function () { return handleModification(6, 1); });
            this.game.addActionButton('btn_umbrella_2', label_plus_2, function () { return handleModification(6, 2); });
        }
        this.game.addActionButtonGray('btn_confirm_lesson', _('Confirm'), handleConfirmLesson);
        this.game.addActionButtonRed('btn_remove', _('Remove all tokens'), handleRemoveLesson);
        updateButton();
    };
    DiceModifier.prototype.addLessonButtons = function () {
        var label_minus = this.applyIcon(_('Use ${token} to decrease by ${nbr}'), 'lesson-minus', 1);
        var label_plus = this.applyIcon(_('Use ${token} to increase by ${nbr}'), 'lesson-plus', 1);
        this.game.addActionButton('btn_minus', label_minus, function () { return handleModification(1, -1); });
        this.game.addActionButton('btn_plus', label_plus, function () { return handleModification(6, +1); });
    };
    DiceModifier.prototype.applyIcon = function (text, icon, nbr) {
        var token = ResourceHelper.getElement(icon);
        return text.replace('${token}', token).replace('${nbr}', nbr.toString());
    };
    DiceModifier.prototype.displayLessonLearnedToken = function (htmlDie) {
        var die = this.settings.die;
        var lesson_wrapper = htmlDie.parentElement.querySelector('.tokens-wrapper');
        if (lesson_wrapper) {
            lesson_wrapper.remove();
        }
        var icon = this.diceLessonLearned[die.id] > 0 ? 'lesson-plus' : 'lesson-minus';
        var icons = arrayRange(1, Math.abs(this.diceLessonLearned[die.id]))
            .map(function () { return ResourceHelper.getElement(icon); })
            .join('');
        htmlDie.parentElement.insertAdjacentHTML('beforeend', "<div class=\"tokens-wrapper\">".concat(icons, "</div>"));
    };
    DiceModifier.prototype.getDieValue = function () {
        return Number(this.settings.die.face);
    };
    DiceModifier.prototype.getLessonRemaining = function () {
        var _this = this;
        var nbr_token = this.game.getPlayerPanel(this.game.getPlayerId()).counters['lesson'].getValue();
        var total = 0;
        Object.keys(this.diceLessonLearned).forEach(function (dieId) {
            total += Math.abs(_this.diceLessonLearned[dieId]);
        });
        return nbr_token - total;
    };
    DiceModifier.prototype.handleModification = function (limit, value) {
        var htmlDie = this.game.diceManager.getDieElement(die).childNodes[0];
        var die_id = this.settings.die.id;
        if (this.getDieValue() + this.diceLessonLearned[die_id] == limit)
            return;
        if (this.getLessonRemaining() <= 0) {
            var canMakeOppositeMove = (this.diceLessonLearned[die_id] > 0 && value < 0) ||
                (this.diceLessonLearned[die_id] < 0 && value > 0);
            if (!canMakeOppositeMove) {
                this.game.showMessage(_('Not enough lesson learned token remaining'), 'error');
                return;
            }
        }
        this.diceLessonLearned[die_id] += value;
        this.displayLessonLearnedToken(htmlDie);
        this.updateButton();
    };
    DiceModifier.prototype.updateButton = function () {
        var count = this.diceLessonLearned[this.settings.die.id];
        this.game.toggleButtonEnable('btn_minus', getDieValue() + count > 1 && (getLessonRemaining() > 0 || count > 0));
        this.game.toggleButtonEnable('btn_plus', getDieValue() + count < 6 && (getLessonRemaining() > 0 || count < 0));
    };
    return DiceModifier;
}());
var PlayerDiceStock = (function (_super) {
    __extends(PlayerDiceStock, _super);
    function PlayerDiceStock(manager, element) {
        var _this = _super.call(this, manager, element, {
            gap: '8px',
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
    VillageDiceStock.prototype.addDie = function (die, animation, settings) {
        var originStock = this.manager.getDieStock(die);
        if (originStock) {
            var originalDie = originStock.getDice().find(function (d) { return d.id == die.id; });
            if (originalDie.face !== die.face) {
                debugger;
                this.rollDie(die, { effect: 'turn', duration: 0 });
            }
        }
        return _super.prototype.addDie.call(this, die, animation, settings);
    };
    VillageDiceStock.prototype.rollDie = function (die, settings) {
        _super.prototype.rollDie.call(this, die, settings);
        var div = this.getDieElement(die);
        var faces = div.querySelector('.bga-dice_die-faces');
        faces.dataset.visibleFace = "".concat(die.face);
    };
    return VillageDiceStock;
}(LineDiceStock));
var DiceLocationStock = (function (_super) {
    __extends(DiceLocationStock, _super);
    function DiceLocationStock(manager, element) {
        var _this = _super.call(this, manager, element, {
            slotsIds: __spreadArray([], arrayRange(1, 12), true).flat(),
            mapDieToSlot: function (die) { return die.location; },
            gap: '0',
        }) || this;
        _this.manager = manager;
        _this.element = element;
        return _this;
    }
    DiceLocationStock.prototype.addSlotElement = function (slotId) {
        this.slotsIds.push(slotId);
        this.createSlot(slotId);
        var slot = this.slots[slotId];
        return slot;
    };
    DiceLocationStock.prototype.bindSlotClick = function (slot, slotId) {
        var _this = this;
        slot.parentElement.addEventListener('click', function (event) {
            var _a;
            if (slot.children.length == 0) {
                (_a = _this.onSlotClick) === null || _a === void 0 ? void 0 : _a.call(_this, slotId, slot);
                return;
            }
            var die = _this.dice.find(function (c) { return _this.manager.getId(c) == slot.children[0].id; });
            if (!die) {
                return;
            }
            _this.dieClick(die);
        });
    };
    return DiceLocationStock;
}(SlotDiceStock));
var DiscardStock = (function (_super) {
    __extends(DiscardStock, _super);
    function DiscardStock(manager, element, linestock) {
        var _this = _super.call(this, manager, element, {
            cardNumber: 0,
            counter: {
                hideWhenEmpty: false,
            },
            autoRemovePreviousCards: false,
        }) || this;
        _this.linestock = linestock;
        if (linestock) {
            _this.eyeIcon = document.createElement('div');
            _this.eyeIcon.classList.add('eye-icon', 'closed');
            _this.eyeIcon.onclick = function () { return _this.onEyeClick(); };
            element.appendChild(_this.eyeIcon);
        }
        element.classList.add('discard');
        return _this;
    }
    DiscardStock.prototype.addCard = function (card, animation, settings) {
        var _a;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        (_a = this.linestock) === null || _a === void 0 ? void 0 : _a.addCard(__assign({}, card));
        return promise;
    };
    DiscardStock.prototype.removeCard = function (card, settings) {
        var _a, _b;
        var promise = _super.prototype.removeCard.call(this, card, settings);
        (_a = this.linestock) === null || _a === void 0 ? void 0 : _a.removeCard(__assign({}, card));
        if (((_b = this.linestock) === null || _b === void 0 ? void 0 : _b.getCards().length) == 0) {
            this.eyeIcon.classList.toggle('closed', true);
            this.setClassToTable();
        }
        return promise;
    };
    DiscardStock.prototype.onEyeClick = function () {
        this.eyeIcon.classList.toggle('closed');
        this.setClassToTable();
    };
    DiscardStock.prototype.setClassToTable = function () {
        var opened = !this.eyeIcon.classList.contains('closed');
        var classCss = "".concat(this.element.id, "-opened");
        document.getElementById('table').classList.toggle(classCss, opened);
    };
    return DiscardStock;
}(Deck));
var Hand = (function (_super) {
    __extends(Hand, _super);
    function Hand(manager, element, current_player, hand_counter) {
        var _this = _super.call(this, manager, element, {
            cardOverlap: '10px',
            cardShift: '5px',
            inclination: 6,
            sort: sortFunction('id'),
        }) || this;
        _this.current_player = current_player;
        _this.hand_counter = hand_counter;
        return _this;
    }
    Hand.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var id = card.id;
        var copy = this.current_player ? __assign({}, card) : { id: id };
        return new Promise(function (resolve) {
            _super.prototype.addCard.call(_this, copy, animation, settings)
                .then(function () { return _this.hand_counter.toValue(_this.getCards().length); })
                .then(function () { return resolve(true); });
        });
    };
    Hand.prototype.removeCard = function (card, settings) {
        var _this = this;
        return new Promise(function (resolve) {
            _super.prototype.removeCard.call(_this, card, settings)
                .then(function () { return _this.hand_counter.toValue(_this.getCards().length); })
                .then(function () { return resolve(true); });
        });
    };
    return Hand;
}(HandStock));
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
        if (locations.length > 0) {
            locations.forEach(function (sel) { return _this.slots[sel].classList.toggle('selectable', true); });
        }
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
var ComfortManager = (function (_super) {
    __extends(ComfortManager, _super);
    function ComfortManager(game, prefix) {
        if (prefix === void 0) { prefix = 'comforts'; }
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(prefix, "-").concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('comfort');
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: function (card, div) {
                var card_info = _this.getCardType(card);
                if (!card_info)
                    return;
                div.dataset.type = card.type;
                if (Array.isArray(card_info.img)) {
                    div.dataset.img = card_info.img[Number(card.type_arg) - 1].toString();
                }
                else {
                    div.dataset.img = card_info.img.toString();
                }
                if (div.getElementsByClassName('title').length !== 0)
                    return;
                div.insertAdjacentHTML('beforeend', "<div class=\"title\">".concat(_(card_info.name), "</div>"));
                if (card_info.gametext) {
                    div.insertAdjacentHTML('beforeend', "<div class=\"gametext-wrapper\"><div class=\"gametext\">".concat(_this.game.formatTextIcons(_(card_info.gametext), true), "</div></div>"));
                }
                game.setTooltip(div.id, _this.getTooltip(card));
                _this.game.addModalToCard(div, "".concat(_this.getId(card), "-help-marker"), function () {
                    return _this.game.modal.displayConfort(card);
                });
            },
            isCardVisible: function (card) { return 'type' in card; },
            cardWidth: 110,
            cardHeight: 154,
        }) || this;
        _this.game = game;
        return _this;
    }
    ComfortManager.prototype.markAsSelected = function (card_id) {
        if (card_id > 0) {
            this.getCardElement({ id: card_id.toString() }).classList.add('bga-cards_selected-card');
        }
    };
    ComfortManager.prototype.getCardType = function (card) {
        return this.game.gamedatas.confort_types[card.type];
    };
    ComfortManager.prototype.getTooltip = function (card) {
        var card_type = this.getCardType(card);
        var name = card_type.name, cost = card_type.cost, gametext = card_type.gametext, score = card_type.score;
        var display_cost = ResourceHelper.convertCostToArray(cost).map(function (type) {
            return ResourceHelper.getElement(type);
        });
        var display_gametext = gametext ? this.game.formatTextIcons(gametext) : '';
        var html = "<div class=\"tooltip-card-comfort\">\n         <div class=\"tooltip-left\">\n            <div class=\"tooltip-header\">\n               <div class=\"score\"><div class=\"i-heart\"><span>".concat(score, "</span></div></div>\n               <div class=\"name\">").concat(_(name), "</div>\n            </div>\n            <div class=\"tooltip-cost\">").concat(display_cost.join(''), "</div>\n            <div class=\"tooltip-gametext\">").concat(display_gametext, "</div>\n      </div>");
        return html;
    };
    return ComfortManager;
}(CardManager));
var ImprovementManager = (function (_super) {
    __extends(ImprovementManager, _super);
    function ImprovementManager(game, prefix, modal) {
        if (prefix === void 0) { prefix = 'improvement'; }
        if (modal === void 0) { modal = false; }
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(prefix, "-").concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('improvement');
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: function (card, div) {
                var card_info = _this.getCardType(card);
                if (!card_info)
                    return;
                div.dataset.type = card.type;
                div.dataset.img = card_info.img.toString();
                if (div.getElementsByClassName('title').length !== 0)
                    return;
                div.insertAdjacentHTML('beforeend', "<div class=\"title\">".concat(_(card_info.name), "</div>"));
                if (card_info.gametext) {
                    var gametext = _this.formatText(_(card_info.gametext));
                    div.insertAdjacentHTML('beforeend', "<div class=\"gametext-wrapper\"><div class=\"gametext\">".concat(gametext, "</div></div>"));
                }
                if (card.type_arg) {
                }
                if ('type' in card) {
                    _this.game.addModalToCard(div, "".concat(_this.getId(card), "-help-marker"), function () {
                        return _this.game.modal.displayImprovement(card);
                    });
                }
                if (!document.getElementById("".concat(_this.getId(card), "-slot-cottage")) && !modal) {
                    div.insertAdjacentHTML('beforeend', "<div id=\"".concat("".concat(_this.getId(card), "-slot-cottage"), "\" class=\"slot-cottage\"></div>"));
                    _this.cottages[card.id] = new LineStock(_this.game.cottageManager, document.getElementById("".concat(_this.getId(card), "-slot-cottage")));
                    var cottage = _this.game.gamedatas.cottages.improvements.find(function (c) { return c.location_arg == card.id; });
                    if (cottage) {
                        _this.cottages[card.id].addCard(cottage);
                    }
                }
                if (card.location == 'glade' && !modal) {
                    setTimeout(function () {
                        var slot = _this.game.tableCenter.dice_locations.addSlotElement(card.location_arg);
                        slot.classList.add('slot-dice');
                        div.appendChild(slot);
                        _this.game.tableCenter.dice_locations.bindSlotClick(slot, card.location_arg);
                    }, 10);
                }
            },
            isCardVisible: function (card) { return 'type' in card; },
            cardWidth: 125,
            cardHeight: 125,
        }) || this;
        _this.game = game;
        _this.cottages = {};
        return _this;
    }
    ImprovementManager.prototype.addCottage = function (card, cottage) {
        return this.cottages[card.id].addCard(cottage);
    };
    ImprovementManager.prototype.getCardType = function (card) {
        return this.game.gamedatas.improvement_types[card.type];
    };
    ImprovementManager.prototype.formatText = function (rawText) {
        if (!rawText) {
            return '';
        }
        var keywords = /::keyword-{([a-zA-Z ]*)}::/gi;
        var type_food = /::type-food::/gi;
        var type_clothing = /::type-clothing::/gi;
        var type_lighting = /::type-lighting::/gi;
        var type_outdoor = /::type-outdoor::/gi;
        var getTypeTemplate = function (text) {
            return "<span class=\"type food\"><span class=\"label\">".concat(text, "</span><span class=\"image\"></span></span>");
        };
        var value = rawText
            .replaceAll(keywords, "<span class=\"keyword\">$1</span>")
            .replaceAll(type_food, getTypeTemplate(_('Food')))
            .replaceAll(type_clothing, getTypeTemplate(_('Clothing')))
            .replaceAll(type_lighting, getTypeTemplate(_('Lighting')))
            .replaceAll(type_outdoor, getTypeTemplate(_('Outdoor')));
        return this.game.formatTextIcons(value);
    };
    return ImprovementManager;
}(CardManager));
var TravelerManager = (function (_super) {
    __extends(TravelerManager, _super);
    function TravelerManager(game, prefix) {
        if (prefix === void 0) { prefix = 'traveler'; }
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(prefix, "-").concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('traveler');
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: function (card, div) {
                var card_info = _this.getCardType(card);
                if (!card_info)
                    return;
                div.dataset.type = card.type;
                div.dataset.img = '' + card_info.img;
                if (div.getElementsByClassName('title').length !== 0)
                    return;
                div.insertAdjacentHTML('beforeend', "<div class=\"title\">".concat(_(card_info.name), "</div>"));
                if (card_info.gametext) {
                    var gametext = _this.game.formatTextIcons(_(card_info.gametext), ['1', '2', '8'].includes(card.type));
                    var fullgametext = "".concat(_(card_info.timing), " \u2022 ").concat(gametext);
                    div.insertAdjacentHTML('beforeend', "<div class=\"gametext-wrapper\"><div class=\"gametext\">".concat(fullgametext, "</div></div>"));
                }
                if (card.type_arg) {
                }
                if ('type' in card) {
                    _this.game.addModalToCard(div, "".concat(_this.getId(card), "-help-marker"), function () {
                        return _this.game.modal.displayTraveler(card);
                    });
                }
            },
            isCardVisible: function (card) { return _this.getCardType(card) !== undefined; },
            cardWidth: 212,
            cardHeight: 142,
        }) || this;
        _this.game = game;
        return _this;
    }
    TravelerManager.prototype.getCardType = function (card) {
        return this.game.gamedatas.travelers.types[card.type];
    };
    return TravelerManager;
}(CardManager));
var ValleyManager = (function (_super) {
    __extends(ValleyManager, _super);
    function ValleyManager(game, prefix) {
        if (prefix === void 0) { prefix = 'valley'; }
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(prefix, "-").concat(card.id); },
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
                if ('type' in card) {
                    _this.game.addModalToCard(div, "".concat(_this.getId(card), "-help-marker"), function () {
                        return _this.game.modal.displayValley(card);
                    });
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
            getId: function (card) { return "cottage-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('cottage');
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: function (card, div) {
                div.dataset.type = getColorName(card.type);
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
var DiceHelper = (function () {
    function DiceHelper(game) {
        this.game = game;
    }
    DiceHelper.prototype.getTotalDiceSlot = function (location_id) {
        if (location_id > 4) {
            return 1;
        }
        return ValleyHelper.getValleyLocationInfo(location_id).count;
    };
    DiceHelper.prototype.isRequirementMet = function (location_id, dice) {
        if (dice.length == 0)
            return true;
        var requirement = null;
        if (location_id >= 1 && location_id <= 4) {
            var info = ValleyHelper.getValleyLocationInfo(location_id);
            if (info.count > 0 && info.count !== dice.length)
                return false;
            requirement = this.getValleyRequirement(info);
        }
        else if (location_id >= 5 && location_id <= 7) {
            requirement = new DialRequirement(this.game.tableCenter.getRiverDial(), location_id);
        }
        else {
            return true;
        }
        return requirement.isRequirementMet(dice.map(function (d) { return Number(d.face); }).sort(function (a, b) { return a - b; }));
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
        var nextValues = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 1, 7: 2, 8: 3, 9: 4, 10: 5, 11: 6, 12: 1 };
        switch (this.location_id) {
            case 5:
                return dieValue == this.dial;
            case 6:
                return dieValue == nextValues[this.dial] || dieValue == nextValues[this.dial + 1];
            case 7:
                return (dieValue == nextValues[this.dial + 2] ||
                    dieValue == nextValues[this.dial + 3] ||
                    dieValue == nextValues[this.dial + 4]);
            default:
                return false;
        }
    };
    return DialRequirement;
}());
var ImprovementHelper = (function () {
    function ImprovementHelper() {
    }
    return ImprovementHelper;
}());
var ResourceRequirement = (function () {
    function ResourceRequirement() {
    }
    ResourceRequirement.isRequirementMet = function (game, cost) {
        var _a, _b;
        var counters = game.getPlayerPanel(game.getPlayerId()).counters;
        for (var _i = 0, _c = Object.keys(cost); _i < _c.length; _i++) {
            var type = _c[_i];
            if (type !== '*' && counters[type].getValue() < cost[type]) {
                if (['stone', 'coin'].includes(type) && TravelerHelper.isActiveHairyTailedHole()) {
                    var sumResource = counters['stone'].getValue() + counters['coin'].getValue();
                    var sumCost = ((_a = cost === null || cost === void 0 ? void 0 : cost.stone) !== null && _a !== void 0 ? _a : 0) + ((_b = cost === null || cost === void 0 ? void 0 : cost.coin) !== null && _b !== void 0 ? _b : 0);
                    if (sumResource < sumCost) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if ('*' in cost) {
            var total_goods = GOODS.map(function (type) { return counters[type].getValue(); }).reduce(function (prev, curr) { return prev + curr; }, 0);
            var total_cost = Object.keys(cost)
                .filter(function (type) { return ICONS.indexOf(type) >= 0; })
                .map(function (type) { return cost[type]; })
                .reduce(function (prev, curr) { return prev + curr; }, 0);
            return total_goods >= total_cost;
        }
        return true;
    };
    return ResourceRequirement;
}());
var TravelerHelper = (function () {
    function TravelerHelper() {
    }
    TravelerHelper.setTravelerToTable = function () {
        var game = window.gameui;
        var traveler = game.tableCenter.traveler_deck.getTopCard().type;
        document.getElementById('table').dataset.traveler = traveler;
    };
    TravelerHelper.isActiveLeopardFrog = function () {
        return this.isTravelerActive(2);
    };
    TravelerHelper.isActivePileatedWoodpecker = function () {
        return this.isTravelerActive(3);
    };
    TravelerHelper.isActiveHairyTailedHole = function () {
        return this.isTravelerActive(5);
    };
    TravelerHelper.isActiveAmericanBeaver = function () {
        return this.isTravelerActive(8);
    };
    TravelerHelper.isActivePineMarten = function () {
        return this.isTravelerActive(11);
    };
    TravelerHelper.isTravelerActive = function (type) {
        var game = window.gameui;
        if (Number(game.gamedatas.gamestate.id) > 90)
            return false;
        return Number(game.tableCenter.traveler_deck.getTopCard().type) === type;
    };
    return TravelerHelper;
}());
var ValleyHelper = (function () {
    function ValleyHelper() {
    }
    ValleyHelper.getValleyLocationInfo = function (location_id) {
        var location = location_id <= 2 ? 'forest' : 'meadow';
        var card = ValleyHelper.game()
            .tableCenter.valley.getCards()
            .filter(function (card) { return card.location == location; })[0];
        return ValleyHelper.game().gamedatas.valley_types[Number(card.type_arg)].position[location_id];
    };
    ValleyHelper.game = function () {
        return window.gameui;
    };
    return ValleyHelper;
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
            resolvePlayerTurnDiceManipulation: new PlayerTurnDiceManipulationState(game),
            resolveTraveler: new ResolveTravelerState(game),
            resolveTravelerDiscard: new ResolveTravelerDiscardState(game),
            resolveMarket: new ResolveMarketState(game),
            resolveOwnNest: new ResolveOwlNestState(game),
            resolveWheelbarrow: new ResolveWheelbarrowState(game),
            resolveWorkshop: new ResolveWorkshopState(game),
            playerTurnDiscard: new PlayerTurnDiscardState(game),
            upkeep: new UpkeepState(game),
            preEndOfGame: new PreEndGame(game),
            bicycle: new ImprovementBicycleState(game),
            resolveBicycleDestination: new ImprovementBicycleDestinationState(game),
            grayWolf: new TravelerGrayWolfState(game),
            canadaLynx: new TravelerCanadaLynxState(game),
            commonRaven: new TravelerCommonRavenState(game),
            stripedSkunk: new TravelerStripedSkunkStates(game),
            commonLoon: new PlacementState(game),
            moose: new TravelerMooseState(game),
            wildTurkey: new TravelerWildTurkeyStates(game),
            wildTurkeyEnd: new TravelerWildTurkeyEndStates(game),
        };
    }
    StateManager.prototype.onEnteringState = function (stateName, args) {
        debug('Entering state: ' + stateName);
        if (args.phase) {
            this.game.gameOptions.setPhase(args.phase);
        }
        else {
            this.game.gameOptions.setPhase('99');
        }
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
            else if ('isMultipleActivePlayer' in this.states[stateName]) {
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
        debug(args);
        this.allowed_workers = args._private.workers;
        this.locations_unavailable = args._private.locations_unavailable;
        this.wheelbarrow = args._private.wheelbarrow;
        this.original_workers = [];
        var locations = (_c = (_b = (_a = args._private) === null || _a === void 0 ? void 0 : _a.locations) === null || _b === void 0 ? void 0 : _b.map(function (loc) { return Number(loc); })) !== null && _c !== void 0 ? _c : [];
        if (locations.length > 0) {
            locations.forEach(function (slotId) { return _this.moveWorker(slotId, args._private.workers); });
        }
        this.showSelection();
        if (args._private.wheelbarrow > 0) {
            this.game.tableCenter.addWheelbarrow(args._private.wheelbarrow);
        }
        if (!this.game.isCurrentPlayerActive)
            return;
        this.game.tableCenter.worker_locations.OnLocationClick = function (slotId) {
            var isValleyOrRiver = Number(slotId) >= 1 && Number(slotId) <= 7;
            var askWheelbarrow = isValleyOrRiver && _this.wheelbarrow === 0 && args._private.wheelbarrow_count > 0;
            if (askWheelbarrow) {
                var handleYes = function () {
                    _this.wheelbarrow = Number(slotId);
                    _this.game.tableCenter.addWheelbarrow(Number(slotId));
                    _this.moveWorker(slotId, args._private.workers);
                };
                var handleNo = function () {
                    _this.moveWorker(slotId, args._private.workers);
                };
                _this.game.confirmationDialog(_('Do you want to add a wheelbarrow'), handleYes, handleNo);
            }
            else {
                _this.moveWorker(slotId, args._private.workers);
            }
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
            if (_this.locations.length !== _this.allowed_workers.length) {
                _this.game.showMessage('You must place all your workers', 'error');
                return;
            }
            _this.game.takeAction('confirmPlacement', {
                locations: _this.locations.join(';'),
                wheelbarrow: _this.wheelbarrow,
            });
        };
        var handleRestartPlacement = function () {
            _this.game.takeAction('cancelPlacement', {}, null, function () {
                _this.resetState();
            });
        };
        if (!this.game.isSpectator) {
            if (this.game.isCurrentPlayerActive()) {
                this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirmPlacement);
                this.game.addActionButtonGray('btn_cancel', _('Reset'), handleCancelLocal);
            }
            else {
                this.game.addActionButtonGray('btn_restart', _('Cancel'), handleRestartPlacement);
            }
        }
    };
    PlacementState.prototype.moveWorker = function (slotId, workers) {
        var _this = this;
        if (this.locations.includes(Number(slotId))) {
            this.game.showMessage(_('You already have a worker on that location'), 'error');
            return;
        }
        var worker = workers.filter(function (w) { return !_this.original_workers.find(function (x) { return x.id === w.id; }); })[0];
        var copy = __assign(__assign({}, worker), { location: 'board', location_arg: slotId.toString() });
        this.original_workers.push(__assign({}, worker));
        this.game.tableCenter.worker_locations.addCard(copy);
        this.locations.push(Number(slotId));
        this.showSelection();
        this.game.toggleButtonEnable('btn_confirm', this.locations.length == this.allowed_workers.length);
    };
    PlacementState.prototype.resetState = function () {
        if (this.original_workers.length > 0) {
            var player_id = Number(this.original_workers[0].type_arg);
            this.game.getPlayerTable(player_id).workers.addCards(this.original_workers);
        }
        this.locations = [];
        this.original_workers = [];
        this.wheelbarrow = 0;
        this.game.tableCenter.clearWheelbarrow();
        this.showSelection();
        this.game.disableButton('btn_confirm');
    };
    PlacementState.prototype.showSelection = function () {
        var _this = this;
        var locations = this.game.tableCenter.worker_locations;
        if (this.locations.length < this.allowed_workers.length) {
            if (TravelerHelper.isActivePineMarten()) {
                locations.setSelectableLocation(arrayRange(3, 12));
            }
            else {
                var selectable = arrayRange(1, 12).filter(function (num) { return _this.locations.indexOf(num) < 0 && _this.locations_unavailable.indexOf(num) < 0; });
                locations.setSelectableLocation(selectable);
            }
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
        this.original_dice = [];
        this.diceHelper = new DiceHelper(game);
    }
    PlayerTurnDiceState.prototype.onEnteringState = function (args) {
        var _this = this;
        if (!this.game.isCurrentPlayerActive())
            return;
        var _a = this.game.tableCenter, hill = _a.hill, worker_locations = _a.worker_locations, dice_locations = _a.dice_locations;
        this.original_dice = hill.getDice().map(function (die) { return Object.assign({}, die); });
        var handleGladeSlotClick = function (slot_id) {
            var canAddDice = _this.game.tableCenter.getDiceFromLocation(Number(slot_id)).length == 0 &&
                hill.getSelection()[0].owner_id;
            if (canAddDice) {
                _this.addSelectedDieToSlot(slot_id);
            }
        };
        var handleDiceLocationClick = function (die) {
            dice_locations.unselectDie(die, true);
            hill.addDie(die);
        };
        var handleHillClick = function (selection) {
            worker_locations.setSelectableLocation([]);
            document.querySelectorAll('#dice-locations .slot-dice, #glade .slot-dice').forEach(function (slot) {
                slot.classList.remove('selectable');
            });
            if (selection.length == 0) {
                return;
            }
            dice_locations.unselectAll();
            var locations = _this.game.tableCenter.getWorkerLocations().filter(function (location_id) {
                var count = _this.game.tableCenter.getDiceFromLocation(location_id).length;
                var max = _this.diceHelper.getTotalDiceSlot(location_id);
                return count < max || max == -1;
            });
            worker_locations.setSelectableLocation(locations);
            if (selection[0].owner_id) {
                _this.game.tableCenter.glade
                    .getCards()
                    .map(function (card) { return Number(card.location_arg); })
                    .filter(function (location) { return _this.game.tableCenter.getDiceFromLocation(location).length == 0; })
                    .forEach(function (location) {
                    var el = document.querySelector("#glade [data-slot-id=\"".concat(location, "\"]"));
                    el.classList.toggle('selectable', true);
                    el.addEventListener('click', function (ev) {
                        ev.stopPropagation();
                        handleGladeSlotClick(Number(location));
                    });
                });
            }
        };
        var handleWorkerLocationClick = function (slotId) {
            _this.addSelectedDieToSlot(slotId);
        };
        var handleDiceSlotClick = function (slotId, div) {
            if (Number(slotId) >= 20 && div.classList.contains('selectable')) {
                _this.addSelectedDieToSlot(slotId);
            }
        };
        hill.setSelectionMode('single');
        hill.onSelectionChange = handleHillClick;
        worker_locations.OnLocationClick = handleWorkerLocationClick;
        dice_locations.onDieClick = handleDiceLocationClick;
        dice_locations.onSlotClick = handleDiceSlotClick;
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
        var _a = this.game.tableCenter, hill = _a.hill, dice_locations = _a.dice_locations;
        var handleCancel = function () {
            var copy = _this.original_dice.map(function (die) { return Object.assign({}, die); });
            dice_locations.unselectAll();
            hill.unselectAll();
            hill.addDice(copy);
        };
        var handleConfirm = function () {
            var dice = dice_locations.getDice();
            var args = {
                dice: __spreadArray([], dice.sort(function (a, b) { return a.id - b.id; }), true),
                original: _this.original_dice,
                lessons: Number(_this.game.getCurrentPlayerPanel().counters['lesson'].getValue()) +
                    _this.game.getCurrentPlayerPanel().countAlmanac(),
                umbrella: _this.game.getCurrentPlayerTable().hasUmbrella(),
            };
            _this.game.setClientState('resolvePlayerTurnDiceManipulation', {
                descriptionmyturn: _('${you} can modify dices'),
                args: args,
            });
        };
        this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonGray('btn_cancel', _('Reset'), handleCancel);
    };
    PlayerTurnDiceState.prototype.addSelectedDieToSlot = function (slotId) {
        var _a = this.game.tableCenter, hill = _a.hill, dice_locations = _a.dice_locations;
        var die = hill.getSelection()[0];
        if (!die)
            return;
        var copy = __assign(__assign({}, die), { location: Number(slotId) });
        dice_locations.addDie(copy);
    };
    return PlayerTurnDiceState;
}());
var PlayerTurnDiceManipulationState = (function () {
    function PlayerTurnDiceManipulationState(game) {
        this.game = game;
        this.LOCATIONS_UPDATABLE_DICE = [1, 2, 3, 4, 5, 6, 7, 9, 10, 12];
        this.toolbar = new ToolbarContainer('dice-manipulation');
    }
    PlayerTurnDiceManipulationState.prototype.onEnteringState = function (args) {
        var _this = this;
        this.original = args.original;
        this.initDiceManipulation(args.dice);
        this.validateLocations();
        var dice_locations = this.game.tableCenter.dice_locations;
        dice_locations.setSelectionMode('single');
        dice_locations.onSelectionChange = function (selection) {
            _this.updateCommandButton();
        };
    };
    PlayerTurnDiceManipulationState.prototype.onLeavingState = function () {
        this.toolbar.removeContainer();
        this.resetDiceManipulation(false);
        var dice_locations = this.game.tableCenter.dice_locations;
        dice_locations.setSelectionMode('none');
        dice_locations.onSelectionChange = undefined;
        document.querySelectorAll("#dice-locations .is-invalid").forEach(function (slot) {
            slot.classList.remove('is-invalid');
        });
    };
    PlayerTurnDiceManipulationState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        this.totalLesson = args.lessons;
        this.totalUmbrella = args.umbrella ? 1 : 0;
        if (TravelerHelper.isActiveLeopardFrog()) {
            this.totalLesson += 2;
        }
        var handleReset = function () {
            _this.game.tableCenter.dice_locations.unselectAll();
            _this.resetDiceManipulation(true);
            _this.updateCommandButton();
        };
        var handleConfirm = function () {
            _this.validateLocations();
            var nbrErrors = document.querySelectorAll("#dice-locations .slot.is-invalid").length;
            if (nbrErrors > 0) {
                _this.game.showMessage(_('You have at least 1 location that requirement was not met'), 'error');
                return;
            }
            var infos = _this.diceManipulation;
            var args = {
                dice_ids: infos.map(function (info) { return info.die.id; }).join(';'),
                location_ids: infos.map(function (info) { return Number(info.die.location); }).join(';'),
                lesson: infos.map(function (info) { return Number(info.lesson); }).join(';'),
                umbrella: infos.map(function (info) { return Number(info.umbrella); }).join(';'),
            };
            _this.game.takeAction('confirmPlayerDice', args);
        };
        this.toolbar.addContainer();
        this.addButtonLessonMinus();
        this.addButtonLessonPlus();
        if (this.game.getCurrentPlayerTable().hasUmbrella()) {
            this.addButtonUmbrella(1);
            this.addButtonUmbrella(2);
        }
        this.game.addActionButton('btnConfirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonGray('btnReset', _('Reset tokens'), handleReset);
        this.game.addActionButtonClientCancel();
        this.updateCommandButton();
    };
    PlayerTurnDiceManipulationState.prototype.restoreGameState = function () {
        this.game.tableCenter.hill.addDice(__spreadArray([], this.original, true));
    };
    PlayerTurnDiceManipulationState.prototype.applyIcon = function (text, icon, nbr) {
        return text.replace('${token}', ResourceHelper.getElement(icon)).replace('${nbr}', nbr.toString());
    };
    PlayerTurnDiceManipulationState.prototype.addButtonLessonMinus = function () {
        var _this = this;
        var handleLessonMinus = function () {
            var info = _this.getSelectedDieInfo();
            if (!info) {
                _this.game.showMessage(_('You must select a die first'), 'error');
                return;
            }
            var currentDieValue = _this.getSelectedDieValue();
            if (currentDieValue - 1 < 1) {
                _this.game.showMessage(_('You cannot use this option yet'), 'error');
                return;
            }
            if (_this.getLessonLearnedRemaining() == 0 && info.lesson <= 0) {
                _this.game.showMessage(_("You don't have any lesson learned remaining"), 'error');
                return;
            }
            info.lesson -= 1;
            _this.displayTokens(info);
            _this.updateCommandButton();
        };
        var lesson_minus = this.applyIcon(_('Use ${token} to decrease by ${nbr}'), 'lesson-minus', 1);
        this.game.addActionButton('lm1', lesson_minus, handleLessonMinus, this.toolbar.name);
    };
    PlayerTurnDiceManipulationState.prototype.addButtonLessonPlus = function () {
        var _this = this;
        var handleLessonPlus = function () {
            var info = _this.getSelectedDieInfo();
            if (!info) {
                _this.game.showMessage(_('You must select a die first'), 'error');
                return;
            }
            var currentDieValue = _this.getSelectedDieValue();
            if (currentDieValue + 1 > 6) {
                _this.game.showMessage(_('You cannot use this option yet'), 'error');
                return;
            }
            if (_this.getLessonLearnedRemaining() == 0 && info.lesson >= 0) {
                _this.game.showMessage(_("You don't have any lesson learned remaining"), 'error');
                return;
            }
            info.lesson += 1;
            _this.displayTokens(info);
            _this.updateCommandButton();
        };
        var lesson_plus = this.applyIcon(_('Use ${token} to increase by ${nbr}'), 'lesson-plus', 1);
        this.game.addActionButton('lp1', lesson_plus, handleLessonPlus, this.toolbar.name);
    };
    PlayerTurnDiceManipulationState.prototype.addButtonUmbrella = function (nbr) {
        var _this = this;
        var handleUmbrella = function () {
            var info = _this.getSelectedDieInfo();
            if (!info) {
                _this.game.showMessage(_('You must select a die first'), 'error');
                return;
            }
            var currentDieValue = _this.getSelectedDieValue();
            if (currentDieValue + nbr > 6) {
                _this.game.showMessage(_('You cannot use this option yet'), 'error');
                return;
            }
            if (_this.getUmbrellaRemaining() == 0) {
                _this.game.showMessage(_('You already used your umbrella this turn'), 'error');
                return;
            }
            info.umbrella = nbr;
            _this.displayTokens(info);
            _this.updateCommandButton();
        };
        var umbrella_plus = this.applyIcon(_('Use ${token} to increase by ${nbr}'), 'umbrella', nbr);
        this.game.addActionButton("up".concat(nbr), umbrella_plus, handleUmbrella, this.toolbar.name);
    };
    PlayerTurnDiceManipulationState.prototype.displayTokens = function (info, validate) {
        if (validate === void 0) { validate = true; }
        var htmlDie = this.game.diceManager.getDieElement(info.die).childNodes[0];
        var lesson_wrapper = htmlDie.parentElement.querySelector('.tokens-wrapper');
        if (lesson_wrapper)
            lesson_wrapper.remove();
        var icon = info.lesson > 0 ? 'lesson-plus' : 'lesson-minus';
        var icons = arrayRange(1, Math.abs(info.lesson)).map(function () { return ResourceHelper.getElement(icon); });
        for (var index = 0; index < info.umbrella; index++) {
            icons.push(ResourceHelper.getElement('umbrella'));
        }
        htmlDie.parentElement.insertAdjacentHTML('beforeend', "<div class=\"tokens-wrapper\">".concat(icons.join(''), "</div>"));
        if (validate) {
            this.validateLocation(info.location);
        }
    };
    PlayerTurnDiceManipulationState.prototype.getLessonLearnedRemaining = function () {
        var nbrLesson = this.diceManipulation.reduce(function (total, curr) { return (total += Math.abs(curr.lesson)); }, 0);
        return this.totalLesson - nbrLesson;
    };
    PlayerTurnDiceManipulationState.prototype.getSelectedDieInfo = function () {
        var _a;
        var _b = this.game.tableCenter.dice_locations.getSelection(), selectedDie = _b[0], others = _b.slice(1);
        var dieId = (_a = selectedDie === null || selectedDie === void 0 ? void 0 : selectedDie.id) !== null && _a !== void 0 ? _a : 0;
        return this.diceManipulation.find(function (info) { return info.die.id === dieId; });
    };
    PlayerTurnDiceManipulationState.prototype.getSelectedDieValue = function () {
        var info = this.getSelectedDieInfo();
        return info.value + info.lesson + info.umbrella;
    };
    PlayerTurnDiceManipulationState.prototype.getUmbrellaRemaining = function () {
        var nbrUmbrella = this.diceManipulation.reduce(function (t, c) { return (t += c.umbrella > 0 ? 1 : 0); }, 0);
        return this.totalUmbrella - nbrUmbrella;
    };
    PlayerTurnDiceManipulationState.prototype.initDiceManipulation = function (dice) {
        var _this = this;
        this.diceManipulation = dice.map(function (die) {
            var canModify = _this.LOCATIONS_UPDATABLE_DICE.includes(die.location);
            return {
                die: die,
                value: Number(die.face),
                location: Number(die.location),
                lesson: 0,
                umbrella: 0,
                canModify: canModify,
            };
        });
        debug(this.diceManipulation);
    };
    PlayerTurnDiceManipulationState.prototype.resetDiceManipulation = function (validate) {
        var _this = this;
        this.diceManipulation.forEach(function (info) {
            info.lesson = 0;
            info.umbrella = 0;
            _this.displayTokens(info, validate);
        });
    };
    PlayerTurnDiceManipulationState.prototype.updateCommandButton = function () {
        var _this = this;
        var _a = this.game.tableCenter.dice_locations.getSelection(), selectedDice = _a[0], others = _a.slice(1);
        if (selectedDice) {
            var info = this.diceManipulation.find(function (item) { return item.die.id === selectedDice.id; });
            var lessonRemaining = this.getLessonLearnedRemaining();
            var umbrellaRemaining = this.getUmbrellaRemaining();
            var toggle = function (id, enable) { return _this.game.toggleButtonEnable(id, enable); };
            var currDieValue = this.getSelectedDieValue();
            toggle('lm1', currDieValue > 1 && (lessonRemaining > 0 || info.lesson > 0));
            toggle('lp1', currDieValue < 6 && (lessonRemaining > 0 || info.lesson < 0));
            toggle('up1', currDieValue + 1 <= 6 && umbrellaRemaining > 0);
            toggle('up2', currDieValue + 2 <= 6 && umbrellaRemaining > 0);
        }
        else {
            this.game.disableButton('lm1');
            this.game.disableButton('lp1');
            this.game.disableButton('up1');
            this.game.disableButton('up2');
        }
    };
    PlayerTurnDiceManipulationState.prototype.validateLocation = function (location) {
        var dice = this.diceManipulation
            .filter(function (info) { return info.location === location; })
            .map(function (info) {
            var newValue = Number(info.die.face) + info.lesson + info.umbrella;
            return __assign(__assign({}, info.die), { face: newValue });
        });
        var diceHelper = new DiceHelper(this.game);
        var isRequirementMet = diceHelper.isRequirementMet(location, dice);
        var wrapper = document.querySelector("#dice-locations [data-slot-id=\"".concat(location, "\"]"));
        wrapper.classList.toggle('is-invalid', !isRequirementMet);
    };
    PlayerTurnDiceManipulationState.prototype.validateLocations = function () {
        var _this = this;
        var locations = this.diceManipulation
            .filter(function (info) { return info.canModify; })
            .map(function (info) { return info.location; })
            .filter(function (value, index, array) { return array.indexOf(value) === index; });
        locations.forEach(function (loc) {
            _this.validateLocation(loc);
        });
    };
    return PlayerTurnDiceManipulationState;
}());
var PlayerTurnResolveState = (function () {
    function PlayerTurnResolveState(game) {
        this.game = game;
        this.glade_selection = undefined;
    }
    PlayerTurnResolveState.prototype.onEnteringState = function (args) {
        var _this = this;
        var locations = args.locations, resolve_market = args.resolve_market;
        if (!this.game.isCurrentPlayerActive())
            return;
        if (resolve_market) {
            this.goToMarket(args);
        }
        var _a = this.game.tableCenter, worker_locations = _a.worker_locations, dice_locations = _a.dice_locations;
        var handleWorkerLocationClick = function (slotId) {
            var isSelected = worker_locations.isSelectedLocation(slotId);
            _this.clearSelectedDiceLocations();
            worker_locations.setSelectedLocation(isSelected ? [] : [slotId]);
            _this.game.toggleButtonEnable('btn_resolve', !isSelected);
        };
        var handleGladeSlotClick = function (slotId, isSelected) {
            if (hasSingleDice(slotId)) {
                _this.glade_selection = isSelected ? slotId : undefined;
                _this.game.toggleButtonEnable('btn_resolve', isSelected);
                worker_locations.setSelectedLocation([]);
            }
        };
        var hasSingleDice = function (slotId) {
            var diceCount = _this.game.tableCenter.getDiceFromLocation(slotId).length;
            return diceCount === 1;
        };
        var handleDieClick = function (die) {
            if (die.location && die.location >= 20) {
                alert('click');
            }
        };
        worker_locations.setSelectableLocation(locations.filter(function (f) { return f < 20; }));
        worker_locations.OnLocationClick = handleWorkerLocationClick;
        locations
            .filter(function (loc) { return loc >= 20; })
            .forEach(function (loc) {
            setTimeout(function () {
                var slot = document.querySelector("#glade [data-slot-id=\"".concat(loc, "\"]"));
                slot.classList.toggle('selectable', true);
                slot.addEventListener('click', function (ev) {
                    ev.stopPropagation();
                    slot.classList.toggle('selected');
                    handleGladeSlotClick(loc, slot.classList.contains('selected'));
                });
            }, 15);
        });
        dice_locations.onDieClick = handleDieClick;
        var slotDices = document.querySelectorAll('#dice-locations .slot-dice:not(:empty)');
        slotDices.forEach(function (slot) {
            slot.classList.toggle('selectable', true);
            slot.addEventListener('click', function (ev) {
                ev.stopPropagation();
                slot.classList.toggle('selected');
                var slot_id = Number(slot.dataset.slotId);
                handleGladeSlotClick(slot_id, slot.classList.contains('selected'));
            });
        });
    };
    PlayerTurnResolveState.prototype.onLeavingState = function () {
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectableLocation([]);
        worker_locations.setSelectedLocation([]);
        worker_locations.OnLocationClick = null;
        this.clearSelectedDiceLocations();
        document.querySelectorAll("#glade .slot-dice").forEach(function (div) { return div.classList.remove('selectable'); });
        this.glade_selection = undefined;
    };
    PlayerTurnResolveState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var locations = args.locations, wheelbarrow = args.wheelbarrow;
        var handleResolve = function () {
            if (_this.glade_selection) {
                _this.game.takeAction('resolveWorker', { location_id: _this.glade_selection });
                return;
            }
            var selectedLocations = _this.game.tableCenter.worker_locations.getSelectedLocation();
            if (selectedLocations.length === 0) {
                _this.game.showMessage(_('You must select a location with one of your workers'), 'error');
                return;
            }
            var locationId = Number(selectedLocations[0]);
            if (locationId == 8) {
                _this.goToMarket(args);
            }
            else if (locationId == 9) {
                _this.game.setClientState('resolveTraveler', {
                    descriptionmyturn: _('You must resolve the effect of the traveler'),
                });
            }
            else if (locationId == 10) {
                _this.game.setClientState('resolveWorkshop', {
                    descriptionmyturn: _("You must select one card in the Workshop"),
                });
            }
            else if (locationId == 11) {
                _this.game.setClientState('resolveOwnNest', {
                    descriptionmyturn: _("You must select one card in the Owl's Nest"),
                });
            }
            else if (wheelbarrow === locationId) {
                _this.game.setClientState('resolveWheelbarrow', {
                    descriptionmyturn: _("You must select one card in the Owl's Nest"),
                    args: {
                        location_id: locationId,
                    },
                });
            }
            else {
                _this.game.takeAction('resolveWorker', { location_id: locationId });
            }
        };
        var handleEnd = function () {
            _this.game.takeAction('confirmResolveWorker');
        };
        if (locations.length > 0) {
            this.game.addActionButtonDisabled('btn_resolve', _('Resolve'), handleResolve);
            this.game.addActionButtonRed('btn_end', _('End'), handleEnd);
        }
        else {
            this.game.addActionButton('btn_end', _('End'), handleEnd);
        }
        this.game.addActionButtonUndo();
    };
    PlayerTurnResolveState.prototype.clearSelectedDiceLocations = function () {
        var selectedDiceLocations = document.querySelectorAll('#dice-locations .slot-dice.selectable.selected, #glade .slot-dice.selectable.selected');
        selectedDiceLocations.forEach(function (slot) { return slot.classList.remove('selected'); });
    };
    PlayerTurnResolveState.prototype.goToMarket = function (args) {
        this.game.setClientState('resolveMarket', {
            descriptionmyturn: _('You must resolve the effect of the market'),
            args: args,
        });
    };
    return PlayerTurnResolveState;
}());
var PlayerTurnCraftState = (function () {
    function PlayerTurnCraftState(game) {
        this.game = game;
        this.toolbar = new ToolbarContainer('craft');
    }
    PlayerTurnCraftState.prototype.onEnteringState = function (args) {
        var _this = this;
        if (!this.game.isCurrentPlayerActive())
            return;
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectionMode('none');
        worker_locations.setSelectableLocation([]);
        worker_locations.setSelectedLocation([]);
        var hand = this.game.getCurrentPlayerTable().hand;
        var handleSelectionChange = function (selection) {
            if (_this.resourceManager) {
                _this.toolbar.removeContainer();
                _this.resourceManager.reset();
                _this.resourceManager = null;
            }
            _this.game.toggleButtonEnable('btn_craft', selection.length == 1);
            _this.game.disableButton('btn_reset');
            if (selection.length == 0)
                return;
            var card_type = _this.game.confortManager.getCardType(selection[0]);
            if ('*' in card_type.cost) {
                _this.game.enableButton('btn_reset', 'gray');
                _this.resourceManager = new ResourceManagerPay(_this.toolbar.addContainer(), {
                    player_resources: _this.game.getPlayerResources(__spreadArray([], GOODS, true)),
                    resource_count: 2,
                });
            }
            else if (TravelerHelper.isActiveHairyTailedHole()) {
                _this.game.enableButton('btn_reset', 'gray');
                var requirement = [];
                var resource_type = [];
                var hasStoneOrCoin = false;
                for (var icon in card_type.cost) {
                    var count = card_type.cost[icon];
                    for (var index = 0; index < count; index++) {
                        if (['stone', 'coin'].includes(icon)) {
                            requirement.push(['coin', 'stone']);
                            resource_type.push('coin', 'stone');
                            hasStoneOrCoin = true;
                        }
                        else {
                            requirement.push([icon]);
                            resource_type.push(icon);
                        }
                    }
                }
                if (hasStoneOrCoin) {
                    _this.resourceManager = new ResourceManagerPay(_this.toolbar.addContainer(), {
                        player_resources: _this.game.getPlayerResources(resource_type),
                        resource_count: requirement.length,
                        requirement: requirement,
                    });
                }
            }
        };
        var selection = hand.getCards().filter(function (card) {
            var card_type = _this.game.confortManager.getCardType(card);
            if (!card_type.cost) {
                console.warn('No cost for', card_type);
                return false;
            }
            var cost = __assign({}, card_type.cost);
            if (TravelerHelper.isActivePileatedWoodpecker() && 'wood' in cost) {
                cost['wood'] -= 1;
                if (cost['wood'] <= 0) {
                    delete cost['wood'];
                }
            }
            return ResourceRequirement.isRequirementMet(_this.game, cost);
        });
        this.game.enableButton('btn_pass', selection.length > 0 ? 'red' : 'blue');
        hand.setSelectionMode('single');
        hand.setSelectableCards(selection);
        hand.onSelectionChange = handleSelectionChange;
    };
    PlayerTurnCraftState.prototype.onLeavingState = function () {
        var hand = this.game.getCurrentPlayerTable().hand;
        hand.setSelectionMode('none');
        hand.setSelectableCards([]);
        hand.onSelectionChange = null;
    };
    PlayerTurnCraftState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var hand = this.game.getCurrentPlayerTable().hand;
        var handleCraft = function () {
            var card = hand.getSelection()[0];
            if (!card)
                return;
            var card_type = _this.game.confortManager.getCardType(card);
            var cost = __assign({}, card_type.cost);
            if (TravelerHelper.isActivePileatedWoodpecker() && 'wood' in cost) {
                cost['wood'] -= 1;
                if (cost['wood'] <= 0) {
                    delete cost['wood'];
                }
            }
            if (!ResourceRequirement.isRequirementMet(_this.game, cost)) {
                _this.game.showMessage('Requirement not met', 'error');
            }
            var resources = [];
            if (_this.resourceManager) {
                resources = ResourceHelper.convertToInt(_this.resourceManager.getResourcesFrom());
            }
            _this.game.takeAction('craftConfort', { card_id: card.id, resources: resources.join(';') });
        };
        var handlePass = function () {
            _this.game.takeAction('passCraftConfort');
        };
        var handleReset = function () {
            var _a;
            (_a = _this.resourceManager) === null || _a === void 0 ? void 0 : _a.reset();
        };
        this.game.addActionButtonDisabled('btn_craft', _('Craft comfort'), handleCraft);
        this.game.addActionButtonDisabled('btn_pass', _('Pass'), handlePass);
        this.game.addActionButtonDisabled('btn_reset', _('Reset'), handleReset);
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
        this.toolbar = new ToolbarContainer('market');
    }
    ResolveMarketState.prototype.onEnteringState = function (args) {
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectableLocation([8]);
        worker_locations.setSelectedLocation([8]);
        this.toolbar.addContainer();
    };
    ResolveMarketState.prototype.onLeavingState = function () {
        var _a;
        this.toolbar.removeContainer();
        (_a = this.resource_manager) === null || _a === void 0 ? void 0 : _a.reset();
        this.resource_manager = null;
        this.option = 0;
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectedLocation([]);
        this.isModeResource = false;
    };
    ResolveMarketState.prototype.onUpdateActionButtons = function (_a) {
        var _this = this;
        var resolve_market = _a.resolve_market, has_scale = _a.has_scale, use_scale = _a.use_scale;
        var handleConfirm = function () {
            var rm = _this.resource_manager;
            if (rm.hasTradePending() || rm.getResourcesFrom().length === 0) {
                _this.game.showMessage(_('You have trade that was incomplete'), 'error');
                return;
            }
            var resources = ResourceHelper.convertToInt(rm.getResourcesFrom()).join(';');
            var resources2 = ResourceHelper.convertToInt(rm.getResourcesTo()).join(';');
            _this.game.takeAction('resolveWorker', { location_id: 8, resources: resources, resources2: resources2, option: _this.option }, function () {
                _this.game.restoreGameState();
            });
        };
        var handleChoice1 = function () {
            _this.resource_manager = new ResourceManagerPayFor(_this.toolbar.getContainer(), {
                from: {
                    available: _this.game.getPlayerResources(['coin']),
                    count: 1,
                },
                to: {
                    count: 1,
                    available: __spreadArray([], GOODS, true),
                },
                times: 99,
            });
            handleChoice();
        };
        var handleChoice2 = function () {
            _this.resource_manager = new ResourceManagerPayFor(_this.toolbar.getContainer(), {
                from: {
                    available: _this.game.getPlayerResources(__spreadArray([], GOODS, true)),
                    count: 2,
                    restriction: 'same',
                },
                to: {
                    count: 1,
                    available: __spreadArray([], GOODS, true),
                },
                times: 99,
            });
            handleChoice();
        };
        var handleChoice3 = function () {
            _this.resource_manager = new ResourceManagerPayFor(_this.toolbar.getContainer(), {
                from: {
                    available: _this.game.getPlayerResources(__spreadArray([], GOODS, true)),
                    count: 3,
                },
                to: {
                    resources: ['coin'],
                },
                times: 99,
            });
            handleChoice();
        };
        var handleScale = function () {
            if (use_scale) {
                _this.game.showMessage(_('You already use your Scale this turn'), 'error');
                return;
            }
            _this.resource_manager = new ResourceManagerPayFor(_this.toolbar.getContainer(), {
                from: {
                    available: _this.game.getPlayerResources(__spreadArray([], GOODS, true)),
                    count: 1,
                },
                to: {
                    count: 1,
                    available: __spreadArray([], GOODS, true),
                },
                times: 1,
            });
            _this.option = 1;
            handleChoice();
        };
        var handleChoice = function () {
            _this.isModeResource = true;
            _this.game.updatePageTitle();
        };
        var handleReset = function () {
            _this.resource_manager.reset();
        };
        var handleEndMarket = function () {
            _this.game.takeAction('resolveWorker', { location_id: 8, resources: '', resources2: '', option: 2 }, function () {
                _this.game.restoreGameState();
            });
        };
        if (this.isModeResource) {
            this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
            this.game.addActionButtonClientCancel();
            this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
        }
        else {
            this.game.addActionButton('btn_confirm1', _('Convert Coin to any good'), handleChoice1);
            this.game.addActionButton('btn_confirm2', _('Convert 2 identical goods to any good'), handleChoice2);
            this.game.addActionButton('btn_confirm3', _('Convert 3 goods to a Coin'), handleChoice3);
            if (has_scale) {
                this.game.addActionButton('btn_scale', _('Scale : Convert a good for a good'), handleScale);
                this.game.toggleButtonEnable('btn_scale', !use_scale);
            }
            if (resolve_market) {
                this.game.addActionButtonRed('btn_endMarket', _('End market'), handleEndMarket);
            }
            else {
                this.game.addActionButtonClientCancel();
            }
        }
    };
    return ResolveMarketState;
}());
var ResolveTravelerState = (function () {
    function ResolveTravelerState(game) {
        this.game = game;
        this.toolbar = new ToolbarContainer('traveler');
    }
    ResolveTravelerState.prototype.onEnteringState = function (args) {
        var _this = this;
        var _a = this.game.tableCenter, worker_locations = _a.worker_locations, dice_locations = _a.dice_locations;
        worker_locations.setSelectableLocation([9]);
        worker_locations.setSelectedLocation([9]);
        var die = dice_locations.getDice().find(function (die) { return die.location == 9; });
        var traveler_type = Number(this.game.tableCenter.traveler_deck.getTopCard().type);
        var trade = this.game.gamedatas.travelers.types[traveler_type].trade[die.face];
        var getRequirementFrom = function () {
            if (TravelerHelper.isActiveHairyTailedHole()) {
                return trade.from.requirement.map(function (icon) { return [icon, 'coin']; });
            }
            else {
                return trade.from.requirement;
            }
        };
        if (trade.from.count === 0) {
            this.resource_manager = undefined;
            this.game.takeAction('resolveWorker', { location_id: 9, resources: [], resource2: [] }, null, function () {
                _this.game.restoreGameState();
            });
        }
        else {
            var requirement = getRequirementFrom();
            var filter_available = TravelerHelper.isActiveAmericanBeaver() || requirement === undefined
                ? __spreadArray([], GOODS, true) : requirement;
            var available = this.game.getPlayerResources(filter_available);
            this.resource_manager = new ResourceManagerPayFor(this.toolbar.addContainer(), __assign(__assign({}, trade), { from: __assign(__assign({}, trade.from), { available: available, requirement: requirement }), to: __assign(__assign({}, trade.to), { available: trade.to.resources !== undefined ? undefined : __spreadArray([], GOODS, true) }) }));
        }
    };
    ResolveTravelerState.prototype.onLeavingState = function () {
        var _a;
        this.toolbar.removeContainer();
        (_a = this.resource_manager) === null || _a === void 0 ? void 0 : _a.reset();
        this.resource_manager = null;
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectedLocation([]);
    };
    ResolveTravelerState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var toArray = function (resources) {
            return ResourceHelper.convertToInt(resources).join(';');
        };
        var handleConfirm = function () {
            var rm = _this.resource_manager;
            if (rm.hasTradePending() || rm.getResourcesFrom().length === 0) {
                _this.game.showMessage(_('You have trade that was incomplete'), 'error');
                return;
            }
            var data = {
                location_id: 9,
                resources: toArray(rm.getResourcesFrom()),
                resources2: toArray(rm.getResourcesTo()),
            };
            var cardDiscardCount = rm.getResourcesFrom().filter(function (icon) { return icon === 'card'; }).length;
            if (cardDiscardCount > 0) {
                _this.game.setClientState('resolveTravelerDiscard', {
                    descriptionmyturn: _('${you} must discard ${nbr} card(s) from your hand').replace('${nbr}', cardDiscardCount.toString()),
                    args: {
                        data: data,
                        action: 'resolveWorker',
                        count: cardDiscardCount,
                    },
                });
            }
            else {
                _this.game.takeAction('resolveWorker', data);
            }
        };
        var handleReset = function () {
            _this.resource_manager.reset();
        };
        this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonClientCancel();
        this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
    };
    return ResolveTravelerState;
}());
var ResolveTravelerDiscardState = (function () {
    function ResolveTravelerDiscardState(game) {
        this.game = game;
    }
    ResolveTravelerDiscardState.prototype.onEnteringState = function (args) {
        var _this = this;
        var hand = this.game.getCurrentPlayerTable().hand;
        var handleSelectionChange = function (selection) {
            _this.game.toggleButtonEnable('btn_confirm', selection.length == args.count, 'blue');
        };
        hand.setSelectionMode('multiple');
        hand.onSelectionChange = handleSelectionChange;
    };
    ResolveTravelerDiscardState.prototype.onLeavingState = function () {
        var hand = this.game.getCurrentPlayerTable().hand;
        hand.setSelectionMode('none');
        hand.onSelectionChange = undefined;
    };
    ResolveTravelerDiscardState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var hand = this.game.getCurrentPlayerTable().hand;
        var handleConfirm = function () {
            if (hand.getSelection().length !== args.count)
                return;
            var card_ids = hand
                .getSelection()
                .map(function (card) { return card.id; })
                .join(';');
            _this.game.takeAction(args.action, __assign(__assign({}, args.data), { card_ids: card_ids }));
        };
        this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonClientCancel();
    };
    return ResolveTravelerDiscardState;
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
var ResolveWheelbarrowState = (function () {
    function ResolveWheelbarrowState(game) {
        this.game = game;
        this.toolbar = new ToolbarContainer('wheelbarrow');
    }
    ResolveWheelbarrowState.prototype.onEnteringState = function (_a) {
        var location_id = _a.location_id;
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectableLocation([location_id]);
        worker_locations.setSelectedLocation([location_id]);
        var getRequirementFrom = function () {
            if ([5, 6, 7].includes(location_id)) {
                return ['stone'];
            }
            var valley_info = ValleyHelper.getValleyLocationInfo(location_id);
            return Object.keys(valley_info.resources).filter(function (res) { return GOODS.includes(res); });
        };
        var requirement = getRequirementFrom();
        var available = this.game.getPlayerResources(requirement);
        this.resource_manager = new ResourceManagerPayFor(this.toolbar.addContainer(), {
            from: { requirement: requirement, available: available, count: 1 },
            to: {},
            times: 1,
        });
    };
    ResolveWheelbarrowState.prototype.onLeavingState = function () {
        var _a;
        this.toolbar.removeContainer();
        (_a = this.resource_manager) === null || _a === void 0 ? void 0 : _a.reset();
        this.resource_manager = null;
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectedLocation([]);
    };
    ResolveWheelbarrowState.prototype.onUpdateActionButtons = function (_a) {
        var _this = this;
        var location_id = _a.location_id;
        var toArray = function (resources) {
            return ResourceHelper.convertToInt(resources).join(';');
        };
        var handleConfirm = function () {
            var rm = _this.resource_manager;
            if (rm.hasTradePending() || rm.getResourcesFrom().length === 0) {
                _this.game.showMessage(_('You have trade that was incomplete'), 'error');
                return;
            }
            var data = {
                location_id: location_id,
                resources: toArray(rm.getResourcesFrom()),
            };
            _this.game.takeAction('resolveWorker', data);
        };
        var handleReset = function () {
            _this.resource_manager.reset();
        };
        this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonClientCancel();
        this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
    };
    return ResolveWheelbarrowState;
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
        var die = dice_locations.getDice().find(function (die) { return die.location == 10; });
        var hasToolShed = this.game
            .getCurrentPlayerTable()
            .improvements.getCards()
            .find(function (f) { return f.type === '6'; }) !== undefined;
        market.setSelectionMode('single');
        market.setSelectableCards(market.getCards().filter(function (card) {
            if (Number(card.location_arg) > die.face && !hasToolShed)
                return false;
            var has_already_improvement = _this.game
                .getCurrentPlayerTable()
                .improvements.getCards()
                .filter(function (c) { return c.type == card.type; }).length > 0;
            if (has_already_improvement) {
                return false;
            }
            var cost = __assign({}, _this.game.improvementManager.getCardType(card).cost);
            if (TravelerHelper.isActivePileatedWoodpecker() && 'wood' in cost) {
                cost['wood'] -= 1;
                if (cost['wood'] <= 0) {
                    delete cost['wood'];
                }
            }
            return ResourceRequirement.isRequirementMet(_this.game, cost);
        }));
        market.onSelectionChange = function (selection) {
            _this.game.toggleButtonEnable('btn_confirm', selection.length == 1);
        };
    };
    ResolveWorkshopState.prototype.onLeavingState = function () {
        var _a = this.game.tableCenter, worker_locations = _a.worker_locations, market = _a.improvement_market;
        worker_locations.setSelectedLocation([]);
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
var UpkeepState = (function () {
    function UpkeepState(game) {
        this.game = game;
    }
    UpkeepState.prototype.onEnteringState = function (args) {
        this.game.tableCenter.clearReservedZones();
    };
    UpkeepState.prototype.onLeavingState = function () { };
    UpkeepState.prototype.onUpdateActionButtons = function (args) { };
    return UpkeepState;
}());
var PreEndGame = (function () {
    function PreEndGame(game) {
        this.game = game;
        this.toolbar = new ToolbarContainer('stored');
        this.toolbarButton = new ToolbarContainer('stored-buttons');
        this.stored_resources = {};
        this.index_ress = 0;
    }
    PreEndGame.prototype.onEnteringState = function (args) {
        var _this = this;
        var handleSelectionChange = function (selection) {
            _this.game.toggleButtonEnable('btn_ress', selection.length === 0);
            _this.game.toggleButtonEnable('btn_reset_ress', selection.length === 0, 'gray');
            if (selection.length === 0) {
                _this.resetResourceManager();
                return;
            }
            _this.toolbarButton.addContainer();
            _this.addResourcesActionButtonAdd();
            _this.addResourcesActionButtonCancel();
            _this.addResourcesActionButtonReset();
            _this.addResourcesManager(selection[0]);
        };
        var comforts = this.game.getCurrentPlayerTable().comforts;
        var selectableCards = this.getSelectableComfortCards();
        comforts.setSelectionMode('single');
        comforts.setSelectableCards(selectableCards);
        comforts.onSelectionChange = handleSelectionChange;
    };
    PreEndGame.prototype.onLeavingState = function () {
        var comforts = this.game.getCurrentPlayerTable().comforts;
        comforts.setSelectionMode('none');
        comforts.onSelectionChange = undefined;
        this.toolbar.removeContainer();
        this.toolbarButton.removeContainer();
    };
    PreEndGame.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            if (_this.toolbar.getContainer())
                return;
            var cards = [];
            Object.keys(_this.stored_resources).forEach(function (card_id) {
                var resources = _this.stored_resources[card_id];
                var string = __spreadArray([card_id], ResourceHelper.convertToInt(resources), true).join(';');
                cards.push(string);
            });
            _this.game.takeAction('confirmStoreResource', { info: cards.join('|') });
        };
        var handleReset = function () {
            if (_this.toolbar.getContainer())
                return;
            var counters = _this.game.getCurrentPlayerPanel().counters;
            Object.keys(_this.stored_resources).forEach(function (card_id) {
                var ress = _this.stored_resources[card_id];
                ress.forEach(function (ress) {
                    counters[ress].incValue(1);
                });
            });
            _this.stored_resources = {};
            document.querySelectorAll('.storage.resource-icon').forEach(function (div) { return div.remove(); });
            _this.game.getCurrentPlayerTable().comforts.unselectAll();
        };
        this.game.addActionButton('btn_ress', _('Confirm stored resources'), handleConfirm);
        this.game.addActionButtonGray('btn_reset_ress', _('Reset stored resources'), handleReset);
    };
    PreEndGame.prototype.moveResources = function (card_id, resources) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, ress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        for (ress in resources) {
                            promises.push(this.animateResource(card_id, resources[ress]));
                        }
                        return [4, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    PreEndGame.prototype.animateResource = function (card_id, type) {
        this.index_ress += 1;
        var html = "<div id=\"ress-".concat(this.index_ress, "\" class=\"resource-icon storage\" data-type=\"").concat(type, "\" style=\"z-index: 10; position: absolute\"></div>");
        var id = "player-panel-".concat(this.game.getPlayerId(), "-icons-").concat(type, "-counter");
        document.getElementById(id).insertAdjacentHTML('beforeend', html);
        var element = document.getElementById("ress-".concat(this.index_ress));
        var toElement = document.getElementById("comforts-".concat(card_id));
        var finalTransform = "translate(".concat(60 * Math.random() + 10, "px, ").concat(65 * Math.random() + 25, "px)");
        return this.game.confortManager.animationManager.attachWithAnimation(new BgaSlideAnimation({ element: element, finalTransform: finalTransform }), toElement);
    };
    PreEndGame.prototype.addResourcesManager = function (selection) {
        var _a = this.game.confortManager.getCardType(selection), storable = _a.storable, card_class = _a.class;
        var filter_available = __spreadArray([], storable, true);
        var counters = this.game.getCurrentPlayerPanel().counters;
        var available = ICONS.filter(function (icon) { return filter_available.includes(icon); }).map(function (icon) {
            return {
                resource: icon,
                initialValue: counters[icon].getValue(),
            };
        });
        if (storable) {
            this.resource_manager = new ResourceManagerPayFor(this.toolbar.addContainer(), {
                from: {
                    available: available,
                    requirement: storable,
                    count: storable.length,
                },
                to: {},
                times: card_class == 'Lamp' ? 1 : 99,
            });
        }
        else {
            this.resource_manager = new ResourceManagerPay(this.toolbar.addContainer(), {
                player_resources: available,
                resource_count: 1,
                requirement: ['story'],
            });
        }
    };
    PreEndGame.prototype.addResourcesActionButtonAdd = function () {
        var _this = this;
        var comforts = this.game.getCurrentPlayerTable().comforts;
        var handleButtonConfirm = function () {
            if (_this.resource_manager.hasTradePending()) {
                _this.game.showMessage('You have uncompleted requirement met', 'error');
                return;
            }
            var counters = _this.game.getCurrentPlayerPanel().counters;
            var resources = _this.resource_manager.getResourcesFrom();
            resources.forEach(function (good) { return counters[good].incValue(-1); });
            var card_id = comforts.getSelection()[0].id;
            if (_this.stored_resources[card_id] === undefined) {
                _this.stored_resources[card_id] = __spreadArray([], resources, true);
            }
            else {
                _this.stored_resources[card_id] = __spreadArray(__spreadArray([], _this.stored_resources[card_id], true), resources, true);
            }
            _this.moveResources(Number(card_id), resources);
            comforts.unselectAll();
        };
        this.game.addActionButton('btn_confirm', _('Add resources'), handleButtonConfirm, this.toolbarButton.getContainer().id);
    };
    PreEndGame.prototype.addResourcesActionButtonCancel = function () {
        var comforts = this.game.getCurrentPlayerTable().comforts;
        var handleCancel = function () {
            comforts.unselectAll();
        };
        this.game.addActionButton('btn_cancel', _('Cancel'), handleCancel, this.toolbarButton.getContainer().id, null, 'gray');
    };
    PreEndGame.prototype.addResourcesActionButtonReset = function () {
        var _this = this;
        var handleReset = function () {
            _this.resource_manager.reset();
        };
        this.game.addActionButton('btn_reset', _('Reset'), handleReset, this.toolbarButton.getContainer().id, null, 'gray');
    };
    PreEndGame.prototype.getSelectableComfortCards = function () {
        var _this = this;
        var _a = this.game.getCurrentPlayerTable(), comforts = _a.comforts, improvements = _a.improvements;
        var canAddStoryFood = improvements.getCards().filter(function (card) {
            return Number(card.type) === 12;
        }).length > 0;
        var canAddStoryClothing = improvements.getCards().filter(function (card) {
            return Number(card.type) === 5;
        }).length > 0;
        var selectableCards = comforts.getCards().filter(function (card) {
            var type = _this.game.confortManager.getCardType(card);
            return (type.storable !== undefined ||
                (type.type === 'food' && canAddStoryFood) ||
                (type.type === 'clothing' && canAddStoryClothing));
        });
        return selectableCards;
    };
    PreEndGame.prototype.resetResourceManager = function () {
        var _a;
        this.toolbarButton.removeContainer();
        this.toolbar.removeContainer();
        (_a = this.resource_manager) === null || _a === void 0 ? void 0 : _a.reset();
        this.resource_manager = null;
    };
    return PreEndGame;
}());
var ImprovementBicycleState = (function () {
    function ImprovementBicycleState(game) {
        this.game = game;
    }
    ImprovementBicycleState.prototype.onEnteringState = function (args) {
        var _this = this;
        if (!this.game.isCurrentPlayerActive())
            return;
        var worker_locations = this.game.tableCenter.worker_locations;
        this.available = worker_locations.getCards().map(function (worker) { return worker.location_arg; });
        worker_locations.setSelectableLocation(this.available);
        worker_locations.OnLocationClick = function (slotId) {
            if (worker_locations.isSelectedLocation(slotId)) {
                _this.reset();
            }
            else {
                worker_locations.setSelectedLocation([slotId]);
                worker_locations.setSelectableLocation([slotId]);
                _this.game.enableButton('btn_confirm', 'blue');
                _this.game.enableButton('btn_reset', 'gray');
            }
        };
    };
    ImprovementBicycleState.prototype.onLeavingState = function () {
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectedLocation();
        worker_locations.setSelectableLocation();
        worker_locations.OnLocationClick = undefined;
    };
    ImprovementBicycleState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            var selectedSlotId = _this.game.tableCenter.worker_locations.getSelectedLocation();
            if (selectedSlotId.length !== 1)
                return;
            _this.game.setClientState('resolveBicycleDestination', {
                descriptionmyturn: _('${you} must select a destination for your worker'),
                args: {
                    location_from: Number(selectedSlotId[0]),
                },
            });
        };
        this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonPass(true);
        this.game.addActionButtonDisabled('btn_reset', _('Reset'), function () { return _this.reset(); });
    };
    ImprovementBicycleState.prototype.reset = function () {
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectedLocation();
        worker_locations.setSelectableLocation(this.available);
        this.game.disableButton('btn_confirm');
        this.game.disableButton('btn_reset');
    };
    return ImprovementBicycleState;
}());
var ImprovementBicycleDestinationState = (function () {
    function ImprovementBicycleDestinationState(game) {
        this.game = game;
    }
    ImprovementBicycleDestinationState.prototype.onEnteringState = function (args) {
        var _this = this;
        if (!this.game.isCurrentPlayerActive())
            return;
        document
            .querySelector("#worker-locations [data-slot-id=\"".concat(args.location_from, "\"]"))
            .classList.add('remainder');
        var worker_locations = this.game.tableCenter.worker_locations;
        var unavailable = worker_locations.getCards().map(function (worker) { return worker.location_arg; });
        var min = TravelerHelper.isActivePineMarten() ? 3 : 1;
        this.available = arrayRange(min, 12).filter(function (loc) { return !unavailable.includes(loc.toString()); });
        worker_locations.setSelectableLocation(this.available);
        worker_locations.OnLocationClick = function (slotId) {
            if (worker_locations.isSelectedLocation(slotId)) {
                _this.reset();
            }
            else {
                worker_locations.setSelectedLocation([slotId]);
                worker_locations.setSelectableLocation([slotId]);
                _this.game.enableButton('btn_confirm', 'blue');
                _this.game.enableButton('btn_reset', 'gray');
            }
        };
    };
    ImprovementBicycleDestinationState.prototype.onLeavingState = function () {
        document.querySelector('.remainder').classList.remove('remainder');
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectedLocation();
        worker_locations.setSelectableLocation();
        worker_locations.OnLocationClick = undefined;
    };
    ImprovementBicycleDestinationState.prototype.onUpdateActionButtons = function (_a) {
        var _this = this;
        var location_from = _a.location_from;
        var handleConfirm = function () {
            var locations = _this.game.tableCenter.worker_locations.getSelectedLocation();
            if (locations.length !== 1)
                return;
            _this.game.takeAction('confirmBicycle', { location_from: location_from, location_to: Number(locations[0]) });
        };
        this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonDisabled('btn_reset', _('Reset'), function () { return _this.reset(); });
        this.game.addActionButtonClientCancel();
    };
    ImprovementBicycleDestinationState.prototype.reset = function () {
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectedLocation();
        worker_locations.setSelectableLocation(this.available);
        this.game.disableButton('btn_confirm');
        this.game.disableButton('btn_reset');
    };
    return ImprovementBicycleDestinationState;
}());
var TravelerGrayWolfState = (function () {
    function TravelerGrayWolfState(game) {
        this.game = game;
    }
    TravelerGrayWolfState.prototype.onEnteringState = function (args) {
        var _this = this;
        var market = this.game.tableCenter.confort_market;
        market.setSelectionMode('single');
        market.setSelectableCards(market.getCards());
        market.onSelectionChange = function (selection) {
            _this.game.toggleButtonEnable('btn_confirm', selection.length == 1);
        };
    };
    TravelerGrayWolfState.prototype.onLeavingState = function () {
        var market = this.game.tableCenter.confort_market;
        market.setSelectionMode('none');
        market.onSelectionChange = null;
    };
    TravelerGrayWolfState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            var market = _this.game.tableCenter.confort_market;
            if (market.getSelection().length == 0)
                return;
            _this.game.takeAction('confirmGrayWolf', {
                slot_id: market.getSelection()[0].location_arg,
            });
        };
        this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
    };
    return TravelerGrayWolfState;
}());
var TravelerCanadaLynxState = (function () {
    function TravelerCanadaLynxState(game) {
        this.game = game;
        this.toolbar = new ToolbarContainer('canada-lynx');
    }
    TravelerCanadaLynxState.prototype.onEnteringState = function (args) {
        if (!this.game.isCurrentPlayerActive())
            return;
        this.resource_manager = new ResourceManagerPayFor(this.toolbar.addContainer(), {
            from: {
                available: GOODS.map(function (p) {
                    return { resource: p, initialValue: 1 };
                }),
                count: 2,
                restriction: 'different',
            },
            to: {},
            times: 1,
        });
    };
    TravelerCanadaLynxState.prototype.onLeavingState = function () {
        this.toolbar.removeContainer();
    };
    TravelerCanadaLynxState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var toArray = function (resources) {
            return ResourceHelper.convertToInt(resources).join(';');
        };
        var handleConfirm = function () {
            var rm = _this.resource_manager;
            if (rm.hasTradePending() || rm.getResourcesFrom().length === 0) {
                _this.game.showMessage(_('You must select 2 differents goods'), 'error');
                return;
            }
            _this.game.takeAction('confirmCanadaLynx', { resources: toArray(rm.getResourcesFrom()) });
        };
        var handleReset = function () {
            _this.resource_manager.reset();
        };
        this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
    };
    return TravelerCanadaLynxState;
}());
var TravelerCommonRavenState = (function () {
    function TravelerCommonRavenState(game) {
        this.game = game;
    }
    TravelerCommonRavenState.prototype.onEnteringState = function (_a) {
        var _this = this;
        var location_ids = _a.locations_unavailable;
        if (!this.game.isCurrentPlayerActive())
            return;
        debugger;
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.OnLocationClick = function (slotId) {
            var selection = worker_locations.getSelectedLocation();
            if (selection.includes(slotId)) {
                worker_locations.setSelectedLocation([]);
                worker_locations.setSelectableLocation(arrayRange(1, 12));
                _this.game.disableButton('btn_confirm');
            }
            else {
                worker_locations.setSelectableLocation([slotId]);
                worker_locations.setSelectedLocation([slotId]);
                _this.game.enableButton('btn_confirm');
            }
        };
        worker_locations.setSelectableLocation(arrayRange(1, 12).filter(function (l) { return !location_ids.includes(l); }));
    };
    TravelerCommonRavenState.prototype.onLeavingState = function () {
        var worker_locations = this.game.tableCenter.worker_locations;
        worker_locations.setSelectableLocation();
        worker_locations.setSelectedLocation();
        worker_locations.OnLocationClick = undefined;
    };
    TravelerCommonRavenState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            var worker_locations = _this.game.tableCenter.worker_locations;
            if (worker_locations.getSelectedLocation().length == 0)
                return;
            _this.game.takeAction('confirmCommonRaven', {
                location_id: worker_locations.getSelectedLocation()[0],
            });
        };
        this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
    };
    return TravelerCommonRavenState;
}());
var TravelerMooseState = (function () {
    function TravelerMooseState(game) {
        this.game = game;
        this.toolbar = new ToolbarContainer('moose');
    }
    TravelerMooseState.prototype.onEnteringState = function (args) {
        if (!this.game.isCurrentPlayerActive())
            return;
        this.ressource_manager = new ResourceManagerPayFor(this.toolbar.addContainer(), {
            from: { available: this.game.getPlayerResources(__spreadArray([], GOODS, true)), count: 1 },
            to: { resources: ['story'] },
            times: 1,
        });
    };
    TravelerMooseState.prototype.onLeavingState = function () {
        var _a;
        (_a = this.ressource_manager) === null || _a === void 0 ? void 0 : _a.reset();
        this.ressource_manager = undefined;
        this.toolbar.removeContainer();
    };
    TravelerMooseState.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            var rm = _this.ressource_manager;
            if (rm.hasTradePending() || rm.getResourcesFrom().length === 0) {
                _this.game.showMessage(_('You have trade that was incomplete'), 'error');
                return;
            }
            var resource = ResourceHelper.convertToInt(_this.ressource_manager.getResourcesFrom())[0];
            _this.game.takeAction('confirmMoose', { resource: resource });
        };
        var handleReset = function () {
            _this.ressource_manager.reset();
        };
        var handlePass = function () {
            _this.game.takeAction('confirmMoose', { resource: -1 });
        };
        this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
        this.game.addActionButtonGray('btn_pass', _('Pass'), handlePass);
    };
    return TravelerMooseState;
}());
var TravelerStripedSkunkStates = (function () {
    function TravelerStripedSkunkStates(game) {
        this.game = game;
    }
    TravelerStripedSkunkStates.prototype.onEnteringState = function (args) {
        var _this = this;
        var discard = this.game.tableCenter.confort_discard_line;
        var handleSelectionChanged = function (selection) {
            _this.game.toggleButtonEnable('btn_confirm', selection.length === 1);
        };
        discard.setSelectionMode('single');
        discard.onSelectionChange = handleSelectionChanged;
    };
    TravelerStripedSkunkStates.prototype.onLeavingState = function () {
        var discard = this.game.tableCenter.confort_discard_line;
        discard.setSelectionMode('none');
        discard.onSelectionChange = undefined;
    };
    TravelerStripedSkunkStates.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            var discard = _this.game.tableCenter.confort_discard_line;
            if (discard.getSelection().length == 0)
                return;
            _this.game.takeAction('confirmStripedSkunk', {
                card_id: discard.getSelection()[0].id,
            });
        };
        this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
        this.game.addActionButtonPass();
    };
    return TravelerStripedSkunkStates;
}());
var TravelerWildTurkeyStates = (function () {
    function TravelerWildTurkeyStates(game) {
        this.game = game;
        this.isMultipleActivePlayer = true;
        this.toolbar = new ToolbarContainer('wild-turkey');
    }
    TravelerWildTurkeyStates.prototype.onEnteringState = function (args) {
        var _this = this;
        var _a = this.game.getCurrentPlayerTable(), dice = _a.dice, player_color = _a.player_color;
        this.addDiceSelector(player_color);
        var handleDiceSelection = function (selection) {
            _this.toolbar
                .getContainer()
                .querySelectorAll('.colored-die')
                .forEach(function (div) { return div.classList.remove('disabled', 'selected'); });
            if (selection.length == 1) {
                document.getElementById("die-wt-".concat(selection[0].face)).classList.add('disabled');
            }
            else {
                _this.toolbar
                    .getContainer()
                    .querySelectorAll('.colored-die')
                    .forEach(function (div) { return div.classList.add('disabled'); });
            }
            _this.game.disableButton('btn_confirm');
        };
        if (this.game.isCurrentPlayerActive()) {
            dice.setSelectionMode('single');
            dice.onSelectionChange = handleDiceSelection;
        }
        else {
            this.displayDiceSelection(args._private);
        }
    };
    TravelerWildTurkeyStates.prototype.displayDiceSelection = function (_a) {
        var die_id = _a.die_id, die_value = _a.die_value;
        var dice = this.game.getCurrentPlayerTable().dice;
        dice.setSelectionMode('none');
        dice.onSelectionChange = undefined;
        if (die_id === 0)
            return;
        if (!this.toolbar.getContainer())
            return;
        var die = this.game
            .getCurrentPlayerTable()
            .dice.getDice()
            .filter(function (die) { return die.id == die_id; })[0];
        var divDie = this.game.diceManager.getDieElement(die);
        divDie.classList.add('bga-dice_selected-die');
        this.toolbar
            .getContainer()
            .querySelectorAll('.disabled')
            .forEach(function (div) {
            div.classList.toggle('disabled', div.dataset.face === die.face.toString());
            div.classList.toggle('selected', div.dataset.face === die_value.toString());
        });
    };
    TravelerWildTurkeyStates.prototype.addDiceSelector = function (player_color) {
        var _this = this;
        var handleChoiceClick = function (div) {
            if (!_this.game.isCurrentPlayerActive())
                return;
            if (div.classList.contains('disabled'))
                return;
            if (!div.classList.contains('selected')) {
                _this.toolbar
                    .getContainer()
                    .querySelectorAll('.selected')
                    .forEach(function (div) { return div.classList.remove('selected'); });
            }
            div.classList.toggle('selected');
            _this.game.toggleButtonEnable('btn_confirm', div.classList.contains('selected'), 'blue');
        };
        var root = this.toolbar.addContainer();
        arrayRange(1, 6).forEach(function (value) {
            root.insertAdjacentHTML('beforeend', "<div id=\"die-wt-".concat(value, "\" data-face=\"").concat(value, "\" class=\"disabled bga-dice_die bga-dice_die6 colored-die\" data-color=\"").concat(player_color, "\">\n               <div class=\"bga-dice_die-face\" data-face=\"").concat(value, "\"></div>\n            </div>"));
            var div = document.getElementById("die-wt-".concat(value));
            div.onclick = function () { return handleChoiceClick(div); };
        });
    };
    TravelerWildTurkeyStates.prototype.onLeavingState = function () { };
    TravelerWildTurkeyStates.prototype.onUpdateActionButtons = function (args) {
        var _this = this;
        var handleConfirm = function () {
            var die_value = Number(_this.toolbar.getContainer().querySelector('.selected').dataset.face);
            var die_id = _this.game.getCurrentPlayerTable().dice.getSelection()[0].id;
            _this.game.takeAction('confirmWildTurkey', { die_id: die_id, die_value: die_value }, function () {
                _this.displayDiceSelection({ die_id: die_id, die_value: die_value });
            });
        };
        var handlePass = function () {
            _this.game.takeAction('confirmWildTurkey', { die_id: 0, die_value: 0 }, function () {
                _this.displayDiceSelection({ die_id: 0, die_value: 0 });
            });
        };
        var handleCancel = function () {
            _this.game.takeAction('cancelWildTurkey', {}, function () {
                _this.game.restoreGameState();
            });
        };
        if (this.game.isCurrentPlayerActive()) {
            this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
            this.game.addActionButtonRed('btn_pass', _('Pass'), handlePass);
        }
        else {
            this.game.addActionButtonGray('btn_cancel', _('Cancel'), handleCancel);
        }
    };
    return TravelerWildTurkeyStates;
}());
var TravelerWildTurkeyEndStates = (function () {
    function TravelerWildTurkeyEndStates(game) {
        this.game = game;
        this.isMultipleActivePlayer = true;
        this.toolbar = new ToolbarContainer('wild-turkey');
    }
    TravelerWildTurkeyEndStates.prototype.onEnteringState = function (args) {
        var dice = this.game.getCurrentPlayerTable().dice;
        dice.setSelectionMode('none');
        dice.onSelectionChange = undefined;
        this.toolbar.removeContainer();
        document
            .querySelectorAll('.bga-dice_selected-die')
            .forEach(function (div) { return div.classList.remove('bga-dice_selected-die'); });
    };
    TravelerWildTurkeyEndStates.prototype.onLeavingState = function () { };
    TravelerWildTurkeyEndStates.prototype.onUpdateActionButtons = function (args) { };
    return TravelerWildTurkeyEndStates;
}());
var ToolbarContainer = (function () {
    function ToolbarContainer(name) {
        this.name = name;
        this.name = "resource_manager_".concat(name);
    }
    ToolbarContainer.prototype.addContainer = function () {
        this.removeContainer();
        document
            .getElementById("maintitlebar_content")
            .insertAdjacentHTML('beforeend', "<div id=\"".concat(this.name, "\" class=\"cc-toolbar\"></div>"));
        return this.getContainer();
    };
    ToolbarContainer.prototype.removeContainer = function () {
        var element = document.getElementById(this.name);
        if (element)
            element.remove();
    };
    ToolbarContainer.prototype.getContainer = function () {
        return document.getElementById(this.name);
    };
    return ToolbarContainer;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var debug = isDebug ? console.log.bind(window.console) : function () { };
var arrayRange = function (start, end) { return Array.from(Array(end - start + 1).keys()).map(function (x) { return x + start; }); };
var LOCAL_STORAGE_ZOOM_KEY = 'creature-comforts-zoom';
var CreatureComforts = (function () {
    function CreatureComforts() {
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
    }
    CreatureComforts.prototype.setup = function (gamedatas) {
        var _this = this;
        debug(gamedatas);
        this.animationManager = new AnimationManager(this, { duration: 0 });
        this.confortManager = new ComfortManager(this);
        this.confortManagerDiscard = new ComfortManager(this, 'comforts-discard');
        this.improvementManager = new ImprovementManager(this);
        this.travelerManager = new TravelerManager(this);
        this.valleyManager = new ValleyManager(this);
        this.diceManager = new MyDiceManager(this);
        this.cottageManager = new CottageManager(this);
        this.workerManager = new WorkerManager(this);
        this.notifManager = new NotificationManager(this);
        this.stateManager = new StateManager(this);
        this.gameOptions = new GameOptions(this);
        this.tableCenter = new TableCenter(this);
        this.tableScore = new TableScore(this);
        this.modal = new Modal(this);
        ['red', 'yellow', 'green', 'gray', 'purple'].forEach(function (color) {
            _this.dontPreloadImage("board_".concat(color, ".jpg"));
            _this.dontPreloadImage("dice_".concat(color, ".jpg"));
        });
        this.dontPreloadImage('improvements.jpg');
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        TravelerHelper.setTravelerToTable();
        Object.keys(gamedatas.comfort_resources).forEach(function (card_id) {
            gamedatas.comfort_resources[card_id].forEach(function (type) {
                var transform = "transform: translate(".concat(60 * Math.random() + 10, "px, ").concat(65 * Math.random() + 25, "px)");
                var html = "<div class=\"resource-icon storage\" data-type=\"".concat(type, "\" style=\"z-index: 10; position: absolute; ").concat(transform, "\"></div>");
                var toElement = document.getElementById("comforts-".concat(card_id));
                toElement.insertAdjacentHTML('beforeend', html);
            });
        });
        this.setupNotifications();
    };
    CreatureComforts.prototype.onEnteringState = function (stateName, args) {
        this.stateManager.onEnteringState(stateName, args);
    };
    CreatureComforts.prototype.onLeavingState = function (stateName) {
        this.stateManager.onLeavingState(stateName);
    };
    CreatureComforts.prototype.onUpdateActionButtons = function (stateName, args) {
        this.stateManager.onUpdateActionButtons(stateName, args);
    };
    CreatureComforts.prototype.addActionButtonDisabled = function (id, label, action) {
        this.addActionButton(id, label, action);
        this.disableButton(id);
    };
    CreatureComforts.prototype.addActionButtonClientCancel = function () {
        var _this = this;
        var handleCancel = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            _this.restoreGameState();
        };
        this.addActionButtonGray('btnCancelAction', _('Cancel'), handleCancel);
    };
    CreatureComforts.prototype.addActionButtonPass = function (notification) {
        var _this = this;
        if (notification === void 0) { notification = false; }
        var handlePass = function () {
            _this.takeAction('pass', { notification: notification });
        };
        this.addActionButtonRed('btn_pass', _('Pass'), handlePass);
    };
    CreatureComforts.prototype.addActionButtonUndo = function () {
        var _this = this;
        var handleUndo = function () {
            _this.takeAction('undo');
        };
        this.addActionButtonGray('btn_undo', _('Undo'), handleUndo);
    };
    CreatureComforts.prototype.addActionButtonGray = function (id, label, action) {
        this.addActionButton(id, label, action, null, null, 'gray');
    };
    CreatureComforts.prototype.addActionButtonRed = function (id, label, action) {
        this.addActionButton(id, label, action, null, null, 'red');
    };
    CreatureComforts.prototype.addActionButtonReset = function (parent, handle) {
        this.addActionButton('btn_reset', _('Reset'), handle, parent, false, 'gray');
    };
    CreatureComforts.prototype.addModalToCard = function (div, helpMarkerId, callback) {
        if (!document.getElementById(helpMarkerId)) {
            div.insertAdjacentHTML('afterbegin', "<div id=\"".concat(helpMarkerId, "\" class=\"help-marker\">\n                     <i class=\"fa fa-search\" style=\"color: white\"></i>\n                  </div>"));
            document.getElementById(helpMarkerId).addEventListener('click', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                callback();
            });
        }
    };
    CreatureComforts.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        this.playersPanels = [];
        gamedatas.playerorder.forEach(function (player_id) {
            var player = gamedatas.players[Number(player_id)];
            var panel = new PlayerPanel(_this, player);
            _this.playersPanels.push(panel);
        });
    };
    CreatureComforts.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        this.playersTables = [];
        gamedatas.playerorder.forEach(function (player_id) {
            var player = gamedatas.players[Number(player_id)];
            var table = new PlayerTable(_this, player);
            _this.playersTables.push(table);
        });
    };
    CreatureComforts.prototype.toggleButtonEnable = function (id, enabled, color) {
        if (color === void 0) { color = 'blue'; }
        if (enabled) {
            this.enableButton(id, color);
        }
        else {
            this.disableButton(id);
        }
    };
    CreatureComforts.prototype.disableButton = function (id) {
        var el = document.getElementById(id);
        if (el) {
            el.classList.remove('bgabutton_blue');
            el.classList.remove('bgabutton_red');
            el.classList.add('bgabutton_disabled');
        }
    };
    CreatureComforts.prototype.enableButton = function (id, color) {
        if (color === void 0) { color = 'blue'; }
        var el = document.getElementById(id);
        if (el) {
            el.classList.add("bgabutton_".concat(color));
            el.classList.remove('bgabutton_disabled');
        }
    };
    CreatureComforts.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    CreatureComforts.prototype.getPlayerPanel = function (playerId) {
        return this.playersPanels.find(function (playerPanel) { return playerPanel.player_id === playerId; });
    };
    CreatureComforts.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.player_id === playerId; });
    };
    CreatureComforts.prototype.getCurrentPlayerPanel = function () {
        return this.getPlayerPanel(this.getPlayerId());
    };
    CreatureComforts.prototype.getCurrentPlayerTable = function () {
        return this.getPlayerTable(this.getPlayerId());
    };
    CreatureComforts.prototype.getPlayerResources = function (filter) {
        if (filter === void 0) { filter = []; }
        var counters = this.getPlayerPanel(this.getPlayerId()).counters;
        var hand = this.getCurrentPlayerTable().hand;
        var resources = ICONS.map(function (icon) {
            return {
                resource: icon,
                initialValue: icon == 'card' ? hand.getCards().length : counters[icon].getValue(),
            };
        });
        if (filter.length > 0 && TravelerHelper.isActiveHairyTailedHole()) {
            filter = __spreadArray(__spreadArray([], filter, true), ['coin', 'stone'], false);
        }
        return filter.length == 0 ? resources : resources.filter(function (r) { return filter.indexOf(r.resource) >= 0; });
    };
    CreatureComforts.prototype.restoreGameState = function () {
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
    CreatureComforts.prototype.clearSelection = function () {
        debug('clearSelection');
    };
    CreatureComforts.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    };
    CreatureComforts.prototype.takeAction = function (action, data, onSuccess, onComplete) {
        data = data || {};
        data.lock = true;
        onSuccess = onSuccess !== null && onSuccess !== void 0 ? onSuccess : function (result) { };
        onComplete = onComplete !== null && onComplete !== void 0 ? onComplete : function (is_error) { };
        this.ajaxcall("/creatureconforts/creatureconforts/".concat(action, ".html"), data, this, onSuccess, onComplete);
    };
    CreatureComforts.prototype.setupNotifications = function () {
        debug('notifications subscriptions setup');
        this.notifManager.setup();
    };
    CreatureComforts.prototype.format_string_recursive = function (log, args) {
        try {
            if (log.indexOf('::coin::') >= 0) {
                log = log.replaceAll('::coin::', "<div class=\"resource-icon\" data-type=\"coin\"></div>");
            }
            if (log.indexOf('::story::') >= 0) {
                log = log.replaceAll('::story::', "<div class=\"resource-icon\" data-type=\"story\"></div>");
            }
            if (log.indexOf('::any::') >= 0) {
                log = log.replaceAll('::any::', "<div class=\"resource-icon\" data-type=\"*\"></div>");
            }
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
                if (args.die_from !== undefined) {
                    var value = args.die_from;
                    var color = args.die_color == 'white' ? 'white' : getColorName(args.die_color);
                    args.die_from = this.getDiceLog(value, color);
                }
                if (args.die_to !== undefined) {
                    var value = args.die_to;
                    var color = args.die_color == 'white' ? 'white' : getColorName(args.die_color);
                    args.die_to = this.getDiceLog(value, color);
                }
                if (args.token !== undefined) {
                    args.token = "<div class=\"".concat(args.token, "\"></div>");
                }
            }
        }
        catch (e) {
            console.error(log, args, 'Exception thrown', e.stack);
        }
        return this.inherited(arguments);
    };
    CreatureComforts.prototype.getDiceLog = function (value, color) {
        return "<div class=\"dice-icon-log bga-dice_die colored-die\" data-color=\"".concat(color, "\"><div class=\"bga-dice_die-face\" data-face=\"").concat(value, "\"><span>").concat(value, "</span></div></div>");
    };
    CreatureComforts.prototype.formatTextDice = function (player_id, rawText) {
        var _this = this;
        if (!rawText)
            return '';
        var dice = rawText.split(',');
        var values = [];
        var color = dice.length == 2 ? this.getPlayerTable(player_id).player_color : 'white';
        dice.forEach(function (value) {
            values.push(_this.getDiceLog(value, color));
        });
        return values.join('');
    };
    CreatureComforts.prototype.formatResourceIcons = function (group) {
        var values = [];
        Object.keys(group).forEach(function (icon) {
            for (var index = 0; index < group[icon]; index++) {
                values.push("<div class=\"resource-icon\" data-type=\"".concat(icon, "\"></div>"));
            }
        });
        return values.join('');
    };
    CreatureComforts.prototype.formatTextIcons = function (rawText, groupResources) {
        if (groupResources === void 0) { groupResources = false; }
        if (!rawText) {
            return '';
        }
        var generic_icons = /::(\w+)::/gi;
        var generic_digit_icons = /::(\w+)-(\S+)::/gi;
        var value = rawText
            .replaceAll(generic_icons, '<div class="resource-icon" data-type="$1"></div>')
            .replaceAll(generic_digit_icons, '<div class="i-$1"><span>$2</span></div>');
        if (groupResources) {
            var firstDiv = value.indexOf('<div class="resource-icon"');
            var lastDiv = value.lastIndexOf('<div class="resource-icon"');
            if (firstDiv !== lastDiv) {
                value = value.substring(0, firstDiv) + "<div class=\"resource-group\">" + value.substring(firstDiv);
                var lastEndDiv = value.lastIndexOf('</div>');
                value = value.substring(0, lastEndDiv) + "</div>" + value.substring(lastEndDiv);
            }
        }
        return value;
    };
    return CreatureComforts;
}());
var GameOptions = (function () {
    function GameOptions(game) {
        this.game = game;
        this.setupGameInfo(game.gamedatas);
        this.setupGamePhase();
        this.game.updatePlayerOrdering();
    }
    GameOptions.prototype.setPhase = function (phase) {
        document.getElementById('wg-phases').dataset.phase = phase.toString();
        document.getElementById('table').dataset.phase = phase.toString();
    };
    GameOptions.prototype.setTurnNumber = function (value) {
        this.turn_number.toValue(value);
    };
    GameOptions.prototype.setupGameInfo = function (_a) {
        var turn_number = _a.turn_number, nbr_turns = _a.nbr_turns;
        var display = document.getElementById('game-infos');
        if (display) {
            display.parentElement.removeChild(display);
        }
        var html = "\n         <div class=\"player-board\" id=\"game-infos\">\n            <div class=\"title\">".concat(_('Game informations'), "</div>\n            <div class=\"player-board-inner\">\n               <div id=\"game-infos-turn-number\">").concat(_('Turn : '), " <span id=\"game-infos-turn-number-counter\"></span> / ").concat(nbr_turns, "</div>\n            </div>\n         </div>");
        document.getElementById('player_boards').insertAdjacentHTML('beforeend', html);
        this.turn_number = new ebg.counter();
        this.turn_number.create('game-infos-turn-number-counter');
        this.turn_number.setValue(turn_number);
    };
    GameOptions.prototype.setupGamePhase = function () {
        var display = document.getElementById('game-phases');
        if (display) {
            display.parentElement.removeChild(display);
        }
        var _a = {
            phase1: _('New traveler'),
            phase2: _('Family dice'),
            phase3: _('Placement'),
            phase4: _('Village dice'),
            phase5: _('Player Turn'),
            phase6: _('Upkeep'),
        }, phase1 = _a.phase1, phase2 = _a.phase2, phase3 = _a.phase3, phase4 = _a.phase4, phase5 = _a.phase5, phase6 = _a.phase6;
        var _b = {
            phase5b: _('Assign dice'),
            phase5c: _('Resolve locations'),
            phase5e: _('Craft Comforts'),
        }, phase5b = _b.phase5b, phase5c = _b.phase5c, phase5e = _b.phase5e;
        var html = "\n         <div class=\"player-board\" id=\"game-phases\">\n            <div class=\"title\">".concat(_('Turn order'), "</div>\n            <div class=\"player-board-inner\">\n               <ul id=\"wg-phases\" data-phase=\"1\">\n                  <li><div class=\"wg-icon\"></div><div class=\"wg-phase-name\">1. ").concat(phase1, "</div></li>\n                  <li><div class=\"wg-icon\"></div><div class=\"wg-phase-name\">2. ").concat(phase2, "</div></li>\n                  <li><div class=\"wg-icon\"></div><div class=\"wg-phase-name\">3. ").concat(phase3, "</div></li>\n                  <li><div class=\"wg-icon\"></div><div class=\"wg-phase-name\">4. ").concat(phase4, "</div></li>\n                  <li><div class=\"wg-icon\"></div><div class=\"wg-phase-name\">5. ").concat(phase5, "</div></li>\n                  <li class=\"sub\"><div class=\"wg-icon\"></div><div class=\"wg-phase-name\">").concat(phase5b, "</div></li>\n                  <li class=\"sub\"><div class=\"wg-icon\"></div><div class=\"wg-phase-name\">").concat(phase5c, "</div></li>\n                  <li class=\"sub\"><div class=\"wg-icon\"></div><div class=\"wg-phase-name\">").concat(phase5e, "</div></li>\n                  <li><div class=\"wg-icon\"></div><div class=\"wg-phase-name\">6. ").concat(phase6, "</div></li>\n               </ul>\n            </div>\n         </div>");
        document.getElementById('player_boards').insertAdjacentHTML('beforeend', html);
    };
    return GameOptions;
}());
var Modal = (function () {
    function Modal(game) {
        var _this = this;
        this.game = game;
        var display = document.getElementById('modal-display');
        if (display) {
            display.parentElement.removeChild(display);
        }
        var html = "<div id=\"modal-display\">\n         <div id=\"modal-display-card\"></div>\n        </div>";
        var elBody = document.getElementById('ebd-body');
        elBody.insertAdjacentHTML('beforeend', html);
        var handleKeyboard = function (ev) {
            if (elBody.classList.contains('modal_open')) {
                if (ev.key == 'Escape') {
                    _this.close();
                }
            }
        };
        document.getElementById('modal-display').addEventListener('click', function () { return _this.close(); });
        elBody.addEventListener('keydown', handleKeyboard);
    }
    Modal.prototype.displayImprovement = function (card) {
        var el = document.getElementById('modal-display-card');
        var stock = new LineStock(new ImprovementManager(this.game, 'modal', true), el);
        stock.addCard(card);
        this.onClose = function () {
            stock.removeCard(card);
        };
        this.adjustPosition();
    };
    Modal.prototype.displayTraveler = function (card) {
        var el = document.getElementById('modal-display-card');
        var stock = new LineStock(new TravelerManager(this.game, 'modal'), el);
        stock.addCard(card);
        this.onClose = function () {
            stock.removeCard(card);
        };
        this.adjustPosition();
    };
    Modal.prototype.displayValley = function (card) {
        var el = document.getElementById('modal-display-card');
        var stock = new LineStock(new ValleyManager(this.game, 'modal'), el);
        stock.addCard(card);
        this.onClose = function () {
            stock.removeCard(card);
        };
        this.adjustPosition();
    };
    Modal.prototype.displayConfort = function (card) {
        var el = document.getElementById('modal-display-card');
        var stock = new LineStock(new ComfortManager(this.game, 'modal'), el);
        stock.addCard(card);
        this.onClose = function () {
            stock.removeCard(card);
        };
        this.adjustPosition();
    };
    Modal.prototype.adjustPosition = function () {
        var scrollY = window.scrollY;
        var body = document.getElementById('ebd-body');
        body.classList.toggle('modal_open', true);
        body.style.top = "-".concat(scrollY, "px");
        var display = document.getElementById('modal-display');
        display.style.top = "".concat(scrollY, "px");
    };
    Modal.prototype.close = function () {
        var body = document.getElementById('ebd-body');
        body.classList.toggle('modal_open', false);
        body.style.top = "";
        var display = document.getElementById('modal-display');
        var scrollY = Number(display.style.top.replace('px', ''));
        display.style.top = "".concat(scrollY, "px");
        window.scroll(0, scrollY);
        this.onClose();
    };
    return Modal;
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
            ['onReturnFamilyDie', undefined],
            ['onNewSeason', 1000],
            ['onRiverDialRotate', 500],
            ['onRefillOwlNest', undefined],
            ['onRefillLadder', undefined],
            ['onDiscardTraveler', 100],
            ['onNewFirstPlayer', 100],
            ['onTravelerExchangeResources', 100],
            ['onMarketExchangeResources', 100],
            ['onDrawConfort', undefined],
            ['onAddConfortToHand', undefined],
            ['onBuildImprovement', undefined],
            ['onModifyDieWithLessonLearned', 100],
            ['onModifyDieWithWildTurkey', 375],
            ['onNewRavenLocationTaken', 100],
            ['onAddAlmanac', 100],
            ['onAddWheelbarrow', 100],
            ['onNewTurn', 100],
            ['onFinalScoring', 3000],
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
        deck.setCardNumber(count + 1, { id: card.id });
        setTimeout(function () {
            deck.flipCard(card);
            TravelerHelper.setTravelerToTable();
        }, 500);
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
        this.game.tableCenter.hill.removeDice(dice);
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
        var fromElement = location_id < 20
            ? document.querySelector("#worker-locations *[data-slot-id=\"".concat(location_id, "\"]"))
            : document.querySelector("#glade *[data-slot-id=\"".concat(location_id, "\"]"));
        this.animationMoveResource(player_id, resources, fromElement);
    };
    NotificationManager.prototype.notif_onCraftConfort = function (_a) {
        var player_id = _a.player_id, card = _a.card, cost = _a.cost;
        var counters = this.game.getPlayerPanel(player_id).counters;
        var comforts = this.game.getPlayerTable(player_id).comforts;
        comforts.addCard(card);
        Object.keys(cost).forEach(function (type) {
            var value = -cost[type];
            counters[type].incValue(value);
        });
    };
    NotificationManager.prototype.notif_onReturnDice = function (_a) {
        var player_id = _a.player_id, dice = _a.dice;
        var white_dice = dice.filter(function (die) { return die.type == 'white'; });
        var player_dice = dice.filter(function (die) { return Number(die.owner_id) == player_id; });
        this.game.tableCenter.hill.removeDice(white_dice);
        this.game.tableCenter.hill.addDice(white_dice);
        this.game.getPlayerTable(player_id).dice.removeDice(player_dice);
        this.game.getPlayerTable(player_id).dice.addDice(player_dice);
    };
    NotificationManager.prototype.notif_onReturnFamilyDie = function (_a) {
        var player_id = _a.player_id, die = _a.die;
        return this.game.getPlayerTable(player_id).dice.addDie(die);
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
    NotificationManager.prototype.notif_onRefillLadder = function (_a) {
        var ladder = _a.ladder, discard = _a.discard, shuffled = _a.shuffled, cards = _a.cards;
        return __awaiter(this, void 0, void 0, function () {
            var _b, deck, market, _i, _c, card, copy;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!discard) return [3, 2];
                        return [4, this.game.tableCenter.improvement_discard.addCard(discard)];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _b = this.game.tableCenter, deck = _b.improvement_deck, market = _b.improvement_market;
                        market.setSelectionMode('none');
                        _i = 0, _c = ladder.slice(0, 5);
                        _d.label = 3;
                    case 3:
                        if (!(_i < _c.length)) return [3, 6];
                        card = _c[_i];
                        return [4, market.swapCards([__assign({}, card)])];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5:
                        _i++;
                        return [3, 3];
                    case 6:
                        if (!shuffled) return [3, 9];
                        copy = __spreadArray(__spreadArray([], cards, true), [{ id: ladder[5].id }], false);
                        return [4, deck.addCards(copy)];
                    case 7:
                        _d.sent();
                        return [4, deck.shuffle(Math.min(copy.length, 8))];
                    case 8:
                        _d.sent();
                        deck.setCardNumber(deck.getCardNumber(), this.game.tableCenter.hidden_improvement);
                        _d.label = 9;
                    case 9: return [4, market.addCard(ladder[5], { fromStock: deck })];
                    case 10:
                        _d.sent();
                        return [2];
                }
            });
        });
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
    NotificationManager.prototype.notif_onBuildImprovement = function (_a) {
        var player_id = _a.player_id, card = _a.card, cost = _a.cost, cottage = _a.cottage;
        return __awaiter(this, void 0, void 0, function () {
            var counters;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(card.location == 'board')) return [3, 2];
                        return [4, this.game.getPlayerTable(player_id).improvements.addCard(card)];
                    case 1:
                        _b.sent();
                        return [3, 4];
                    case 2: return [4, this.game.tableCenter.glade.addCard(card)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [4, this.game.improvementManager.addCottage(card, cottage)];
                    case 5:
                        _b.sent();
                        counters = this.game.getPlayerPanel(player_id).counters;
                        Object.keys(cost).forEach(function (type) {
                            var value = -cost[type];
                            counters[type].incValue(value);
                        });
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_onModifyDieWithLessonLearned = function (_a) {
        var player_id = _a.player_id, nbr_lesson = _a.nbr_lesson, die_id = _a.die_id, die_newvalue = _a.die_newvalue;
        this.game.getPlayerPanel(player_id).counters['lesson'].incValue(-nbr_lesson);
        var die = this.game.tableCenter.dice_locations.getDice().find(function (d) { return d.id == die_id; });
        die.face = die_newvalue;
        this.game.getPlayerTable(player_id).dice.rollDie(die, { effect: 'turn', duration: 375 });
    };
    NotificationManager.prototype.notif_onModifyDieWithWildTurkey = function (_a) {
        var player_id = _a.player_id, die_val_id = _a.die_val_id, die_val_to = _a.die_val_to;
        var die = this.game
            .getPlayerTable(player_id)
            .dice.getDice()
            .find(function (d) { return d.id == die_val_id; });
        die.face = die_val_to;
        this.game.getPlayerTable(player_id).dice.rollDie(die, { effect: 'turn', duration: 375 });
    };
    NotificationManager.prototype.notif_onNewRavenLocationTaken = function (_a) {
        var location_id = _a.location_id;
        this.game.tableCenter.addRavenToken(location_id);
    };
    NotificationManager.prototype.notif_onAddAlmanac = function (_a) {
        var player_id = _a.player_id;
        this.game.getPlayerPanel(player_id).addAlmanac();
    };
    NotificationManager.prototype.notif_onAddWheelbarrow = function (_a) {
        var player_id = _a.player_id;
        this.game.getPlayerPanel(player_id).addWheelbarrow();
    };
    NotificationManager.prototype.notif_onNewTurn = function (_a) {
        var turn_number = _a.turn_number;
        this.game.gameOptions.setTurnNumber(turn_number);
    };
    NotificationManager.prototype.notif_onFinalScoring = function (_a) {
        var _this = this;
        var scores = _a.scores;
        this.game.tableScore.displayScores(scores);
        Object.keys(scores).forEach(function (player_id) {
            _this.game.scoreCtrl[player_id].toValue(scores[player_id]['total']);
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
            Object.getOwnPropertyNames(CreatureComforts.prototype)
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
var PlayerPanel = (function () {
    function PlayerPanel(game, player) {
        var _this = this;
        this.game = game;
        this.counters = {};
        this.almanac = 0;
        this.wheelbarrow = 0;
        this.player_id = Number(player.id);
        var templateIcon = "<div class=\"wrapper\">\n         <span id=\"player-panel-".concat(player.id, "-icons-{icon-value}-counter\" class=\"counter\">1</span>\n         <div class=\"resource-icon\" data-type=\"{icon-value}\"></div>\n      </div>");
        var html = "<div id=\"player-panel-".concat(player.id, "-icons\" class=\"icons counters\">\n        ").concat(ICONS.map(function (icon) { return templateIcon.replaceAll('{icon-value}', icon); }).join(' '), "\n        <div class=\"row\"></div>\n      </div>");
        document.getElementById("player_board_".concat(player.id)).insertAdjacentHTML('beforeend', html);
        ICONS.forEach(function (icon) {
            var value = player[icon];
            if (isNaN(value)) {
                value = 0;
            }
            var counter = new ebg.counter();
            counter.create("player-panel-".concat(player.id, "-icons-").concat(icon, "-counter"));
            counter.setValue(value);
            _this.counters[icon] = counter;
        });
        if (this.player_id == game.gamedatas.first_player_id) {
            this.addFirstTokenPlayer();
        }
        for (var index = 0; index < Number(player.almanac); index++) {
            this.addAlmanac();
        }
        for (var index = 0; index < Number(player.wheelbarrow); index++) {
            this.addWheelbarrow();
        }
    }
    PlayerPanel.prototype.addFirstTokenPlayer = function () {
        document.querySelectorAll(".first-player-marker").forEach(function (div) { return div.remove(); });
        var container = document.querySelectorAll("#player-panel-".concat(this.player_id, "-icons .row"))[0];
        container.insertAdjacentHTML('afterbegin', '<div class="first-player-marker"></div>');
    };
    PlayerPanel.prototype.addAlmanac = function () {
        var container = document.querySelectorAll("#player-panel-".concat(this.player_id, "-icons .row"))[0];
        container.insertAdjacentHTML('beforeend', '<div class="almanac"></div>');
        this.almanac += 1;
    };
    PlayerPanel.prototype.addWheelbarrow = function () {
        var container = document.querySelectorAll("#player-panel-".concat(this.player_id, "-icons .row"))[0];
        container.insertAdjacentHTML('beforeend', '<div class="wheelbarrow"></div>');
        this.wheelbarrow += 1;
    };
    PlayerPanel.prototype.countAlmanac = function () {
        return this.almanac;
    };
    PlayerPanel.prototype.hasWheelbarrow = function () {
        return this.wheelbarrow > 0;
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
        this.setupImprovement(game);
    }
    PlayerTable.prototype.hasUmbrella = function () {
        return this.improvements.getCards().filter(function (card) { return card.type === '9'; }).length > 0;
    };
    PlayerTable.prototype.setupBoard = function (game, player) {
        var dataset = ["data-color=\"".concat(player.color, "\"")].join(' ');
        var resourceManager = this.game.getPlayerId() === Number(player.id)
            ? "<div id=\"player-table-".concat(this.player_id, "-resources\" class=\"icons counters\"></div>")
            : '';
        var html = "\n         <div id=\"player-table-".concat(this.player_id, "\" class=\"player-table player-color-").concat(this.player_color, "\" style=\"--player-color: #").concat(player.color, "\" ").concat(dataset, ">\n            <div id=\"player-table-").concat(this.player_id, "-name\" class=\"name-wrapper\">").concat(player.name, "</div>\n            <div class=\"cols\">\n               <div class=\"col\">\n                  <div id=\"player-table-").concat(this.player_id, "-board\" class=\"player-table-board\">\n                     <div id=\"player-table-").concat(this.player_id, "-dice\" class=\"player-table-dice\"></div>\n                     <div id=\"player-table-").concat(this.player_id, "-cottage\" class=\"player-table-cottage\"></div>\n                     <div id=\"player-table-").concat(this.player_id, "-worker\" class=\"player-table-worker\"></div>\n                  </div>\n                  ").concat(resourceManager, "\n                  <div id=\"player-table-").concat(this.player_id, "-hand\"></div>\n               </div>\n               <div class=\"col\">\n                  <div id=\"player-table-").concat(this.player_id, "-improvement\" class=\"player-table-improvement\"></div>\n                  <div id=\"player-table-").concat(this.player_id, "-comfort\" class=\"player-table-comfort\"></div>\n               </div>\n            </div>\n         </div>");
        var destination = this.game.getPlayerId() == this.player_id ? 'current-player-table' : 'tables';
        document.getElementById(destination).insertAdjacentHTML('beforeend', html);
    };
    PlayerTable.prototype.setupConfort = function (game, player) {
        this.comforts = new LineStock(game.confortManager, document.getElementById("player-table-".concat(this.player_id, "-comfort")), {
            gap: '7px',
        });
        this.comforts.addCards(game.gamedatas.comforts.players[this.player_id].board);
    };
    PlayerTable.prototype.setupCottage = function (game, player) {
        this.cottages = new LineStock(game.cottageManager, document.getElementById("player-table-".concat(this.player_id, "-cottage")), {
            direction: 'column',
            gap: '2px',
        });
        this.cottages.addCards(game.gamedatas.cottages.players[player.id]);
    };
    PlayerTable.prototype.setupDice = function (game) {
        var _this = this;
        this.dice = new PlayerDiceStock(game.diceManager, document.getElementById("player-table-".concat(this.player_id, "-dice")));
        var dice = game.gamedatas.dice.filter(function (die) { return die.owner_id == _this.player_id.toString() && die.location == null; });
        this.dice.addDice(dice);
    };
    PlayerTable.prototype.setupHand = function (game) {
        this.hand = new Hand(game.confortManager, document.getElementById("player-table-".concat(this.player_id, "-hand")), this.player_id === game.getPlayerId(), game.getPlayerPanel(this.player_id).counters['card']);
        this.hand.addCards(game.gamedatas.comforts.players[this.player_id].hand);
    };
    PlayerTable.prototype.setupImprovement = function (game) {
        this.improvements = new LineStock(game.improvementManager, document.getElementById("player-table-".concat(this.player_id, "-improvement")), {
            gap: '7px',
        });
        this.improvements.addCards(game.gamedatas.improvements.players[this.player_id]);
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
        var _this = this;
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
        this.setupGlade(game);
        this.setRiverDial(game.gamedatas.river_dial);
        this.setupReservedZones(game);
        this.setupAmericanBeaverZones();
        this.setupBlackBearZones();
        this.setupLeopardFrogZones();
        game.gamedatas.wheelbarrows.forEach(function (location_id) { return _this.addWheelbarrow(location_id); });
    }
    TableCenter.prototype.addWheelbarrow = function (location_id) {
        var html = "<div class=\"wheelbarrow\"></div>";
        var zone = document.querySelector("#reserved-zones [data-zone-id=\"".concat(location_id, "\"]"));
        zone.insertAdjacentHTML('beforeend', html);
    };
    TableCenter.prototype.clearWheelbarrow = function () {
        document
            .querySelectorAll("#reserved-zones .wheelbarrow")
            .forEach(function (div) { return div.parentElement.removeChild(div); });
    };
    TableCenter.prototype.addRavenToken = function (location_id) {
        var zone = document.querySelector("#reserved-zones [data-zone-id=\"".concat(location_id, "\"]"));
        zone.innerHTML = ResourceHelper.getElement('coin');
    };
    TableCenter.prototype.clearReservedZones = function () {
        document.querySelectorAll('#reserved-zones .cc-zone').forEach(function (zone) {
            zone.childNodes.forEach(function (item) { return item.remove(); });
        });
    };
    TableCenter.prototype.getDiceFromLocation = function (location_id) {
        return this.dice_locations.getDice().filter(function (die) { return die.location == location_id; });
    };
    TableCenter.prototype.getWorkerLocations = function () {
        var player_id = this.game.getPlayerId().toString();
        var locations = this.game.tableCenter.worker_locations
            .getCards()
            .filter(function (meeple) { return meeple.type_arg == player_id; })
            .map(function (meeple) { return Number(meeple.location_arg); });
        if (TravelerHelper.isActivePineMarten()) {
            if (!locations.includes(1))
                locations.push(1);
            if (!locations.includes(2))
                locations.push(2);
        }
        return locations;
    };
    TableCenter.prototype.setRiverDial = function (value) {
        document.getElementById('river-dial').dataset.position = value.toString();
    };
    TableCenter.prototype.getRiverDial = function () {
        return Number(document.getElementById('river-dial').dataset.position);
    };
    TableCenter.prototype.setupConfortCards = function (game) {
        var _a = game.gamedatas.comforts, market = _a.market, discard = _a.discard, deckCount = _a.deckCount;
        this.confort_market = new SlotStock(game.confortManager, document.getElementById("table-comforts"), {
            slotsIds: [1, 2, 3, 4],
            mapCardToSlot: function (card) { return Number(card.location_arg); },
            gap: '12px',
        });
        this.confort_deck = new Deck(game.confortManager, document.getElementById("deck-comforts"), {
            cardNumber: Number(deckCount),
            topCard: this.hidden_confort,
            counter: {},
        });
        this.confort_discard_line = new LineStock(game.confortManagerDiscard, document.getElementById("discard-comforts-line"), {
            gap: '2px',
            center: false,
        });
        this.confort_discard = new DiscardStock(game.confortManager, document.getElementById("discard-comforts"), this.confort_discard_line);
        this.confort_discard.addCards(discard);
        this.confort_market.addCards(market);
    };
    TableCenter.prototype.setupDiceLocations = function (game) {
        var _this = this;
        this.dice_locations = new DiceLocationStock(game.diceManager, document.getElementById("dice-locations"));
        var dice = game.gamedatas.dice.filter(function (die) { return die.location > 0; });
        setTimeout(function () {
            _this.dice_locations.addDice(dice);
        }, 15);
    };
    TableCenter.prototype.setupGlade = function (game) {
        this.glade = new LineStock(this.game.improvementManager, document.getElementById('glade'), {
            sort: sortFunction('location_arg'),
            center: false,
        });
        this.glade.addCards(game.gamedatas.improvements.glade);
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
            cardNumber: Number(deckCount),
            topCard: this.hidden_improvement,
            counter: {},
        });
        this.improvement_discard = new DiscardStock(game.improvementManager, document.getElementById("discard-improvements"));
        this.improvement_discard.addCards(discard);
        this.improvement_market.addCards(market);
    };
    TableCenter.prototype.setupAmericanBeaverZones = function () {
        var icons = ResourceHelper.getElement('wood') + ResourceHelper.getElement('wood');
        var html = arrayRange(1, 2)
            .map(function (value) { return "<div class=\"cc-zone\" data-zone-id=\"".concat(value, "\">").concat(icons, "</div>"); })
            .join('');
        document.getElementById('american-beaver-zones').innerHTML = html;
    };
    TableCenter.prototype.setupBlackBearZones = function () {
        var icon = ResourceHelper.getElement('fruit');
        var html = arrayRange(1, 4)
            .map(function (value) { return "<div class=\"cc-zone\" data-zone-id=\"".concat(value, "\">").concat(icon, "</div>"); })
            .join('');
        document.getElementById('black-bear-zones').innerHTML = html;
    };
    TableCenter.prototype.setupLeopardFrogZones = function () {
        var icon = ResourceHelper.getElement('lesson');
        document.getElementById('leopard-frog-zones').innerHTML = "<div class=\"cc-zone\" data-zone-id=\"9\">".concat(icon).concat(icon, "</div>");
    };
    TableCenter.prototype.setupReservedZones = function (game) {
        var _this = this;
        document.getElementById('reserved-zones').innerHTML = arrayRange(1, 12)
            .map(function (value) { return "<div class=\"cc-zone\" data-zone-id=\"".concat(value, "\"></div>"); })
            .join('');
        game.gamedatas.raven_location.forEach(function (location_id) { return _this.addRavenToken(location_id); });
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
var TableScore = (function () {
    function TableScore(game) {
        this.game = game;
        if (game.gamedatas.gamestate.name !== 'gameEnd')
            return;
        this.displayScores(game.gamedatas.scores);
    }
    TableScore.prototype.displayScores = function (scores) {
        document.querySelectorAll('.players-scores').forEach(function (table) { return table.remove(); });
        var player_ids = this.game.gamedatas.playerorder.map(function (id) { return Number(id); });
        var html = "<table class=\"players-scores\">\n            <thead>\n               ".concat(this.getHeaderNames(player_ids, this.game.gamedatas), "\n            </thead>\n            <tbody>\n               ").concat(this.getRow('comforts', _('Comforts'), player_ids, scores), "\n               ").concat(this.getRow('comforts_bonus', _('Bonus'), player_ids, scores), "\n               ").concat(this.getRow('improvements', _('Improvements'), player_ids, scores), "\n               ").concat(this.getRow('improvements_bonus', _('Bonus'), player_ids, scores), "\n               ").concat(this.getRow('cottages', _('Cottages'), player_ids, scores), "\n               ").concat(this.getRow('', _('Resources'), player_ids, scores), "\n               ").concat(this.getRow('stories', _('Stories'), player_ids, scores), "\n               ").concat(this.getRow('coins', _('Coins'), player_ids, scores), "\n               ").concat(this.getRow('goods', _('Resources'), player_ids, scores), "\n               ").concat(this.getTotals(player_ids, scores), "\n            </tbody>\n         </table>");
        debugger;
        document.getElementById('table-score').insertAdjacentHTML('afterbegin', html);
    };
    TableScore.prototype.getHeaderNames = function (player_ids, _a) {
        var players = _a.players;
        var colums = player_ids.map(function (id) {
            var _a = players[id], color = _a.color, name = _a.name;
            return "<th style=\"color: #".concat(color, "\">").concat(name, "</th>");
        });
        return "<tr id=\"score-headers\">\n         <th></th>\n         ".concat(colums.join(''), "\n      </tr>");
    };
    TableScore.prototype.getTotals = function (player_ids, scores) {
        var colums = player_ids.map(function (pId) {
            var player_scores = scores[pId];
            var total = Object.keys(player_scores)
                .filter(function (key) { return key !== 'total'; })
                .reduce(function (prev, curr) {
                return prev + Number(player_scores[curr]);
            }, 0);
            return "<td>\n            <div id=\"score-".concat(pId, "-total\">").concat(total, "</div>\n            <i class=\"fa fa-star\"></id>\n         </td>");
        });
        return "<tr id=\"scores-row-total\">\n         <td class=\"row-header\">".concat(_('Total'), "</td>\n         ").concat(colums.join(''), "\n      </tr>");
    };
    TableScore.prototype.getRow = function (row, title, player_ids, scores) {
        var columns = player_ids.map(function (pId) {
            if (row === '')
                return "<td></td>";
            var score = scores[pId][row];
            return "<td>\n            <div id=\"score-".concat(pId, "-").concat(row, "\">").concat(score, "</div>\n            <i class=\"fa fa-star\"></id>\n         </td>");
        });
        return this.getScoreRow(row, title, columns);
    };
    TableScore.prototype.getScoreRow = function (id, title, columns) {
        return "<tr id=\"scores-row-".concat(id, "\">\n         <td class=\"row-header\">").concat(title, "</td>\n         ").concat(columns.join(''), "\n      </tr>");
    };
    return TableScore;
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
function countExtractions(mainArray, targetArray) {
    var mainArrayCounts = {};
    var targetArrayCounts = {};
    for (var i = 0; i < mainArray.length; i++) {
        var element = mainArray[i];
        mainArrayCounts[element] = (mainArrayCounts[element] || 0) + 1;
    }
    for (var j = 0; j < targetArray.length; j++) {
        var element = targetArray[j];
        targetArrayCounts[element] = (targetArrayCounts[element] || 0) + 1;
    }
    var minExtractions = 10000;
    for (var key in mainArrayCounts) {
        if (mainArrayCounts.hasOwnProperty(key)) {
            var mainCount = mainArrayCounts[key];
            var targetCount = targetArrayCounts[key] || 0;
            var extractions = Math.floor(targetCount / mainCount);
            minExtractions = Math.min(minExtractions, extractions);
        }
    }
    return minExtractions;
}
define(['dojo', 'dojo/_base/declare', 'ebg/core/gamegui', 'ebg/counter', 'ebg/stock'], function (dojo, declare) {
    return declare('bgagame.creatureconforts', [ebg.core.gamegui], new CreatureComforts());
});
