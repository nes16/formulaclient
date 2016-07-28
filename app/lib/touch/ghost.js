"use strict";
// fixes an issue with ghost clicks. borrowed the idea of using capture phase rather than bubble phase from:
//    https://developers.google.com/mobile/articles/fast_buttons?csw=1#ghost
//
// but the solution there is far from complete. It doesn't deal with focus being placed in textboxes still, and
// it doesn't prevent the ghost events from propagating down and back up through the dom. Mathquill listens for
// the mousedown and mouseup events, so when they were triggered erroneously, we should prevent them from propagating.
//
// the event handlers defined here need to be added before jquery has chance to add it's own listeners. This is
// especially important for the focus and blur events. The fact that touchtracking.js is split into two separate
// events here is unfortunate, but I think it's fine for now. There are talks of refactoring the touchtracking.js
// code anyways.
var GhostEvents = (function () {
    function GhostEvents() {
        this.inGhostEventMode = false;
        this.startingActiveElement = null;
        var _self = this;
        // don't send ghost mouseup events; someone might be listening for them
        document.addEventListener('mouseup', this.stopGhostEvent.bind(this), true);
        // prevent links from being followed on ghost clicks.
        document.addEventListener('click', function (evt) {
            _self.stopAndPreventGhostEvent(evt);
            // put focus where it was before the start of these events. the focusin and focusout
            // events fired from this will be stopped.
            if (_self.inGhostEventMode && document.activeElement !== _self.startingActiveElement) {
                if (document.activeElement)
                    document.activeElement.blur();
                if (_self.startingActiveElement)
                    _self.startingActiveElement.focus();
            }
            // anything after this is not a ghost event
            inGhostEventMode = false;
        }, true);
        // we prevent focus events from firing during ghost events
        document.addEventListener('focus', this.stopAndPreventGhostEvent.bind(this), true);
        document.addEventListener('blur', this.stopAndPreventGhostEvent.bind(this), true);
        this.touchTrackingCallbacks = {
            isGhostEvent: function (evt) {
                return false;
            }
        };
        // don't send ghost mousedwon events; someone might be listening for them
        document.addEventListener('mousedown', function (evt) {
            _self.startingActiveElement = document.activeElement;
            _self.inGhostEventMode = _self.touchTrackingCallbacks.isGhostEvent(evt);
            // stop the mousedown event
            _self.stopGhostEvent(evt);
        }, true);
    }
    GhostEvents.prototype.stopGhostEvent = function (evt) {
        if (this.inGhostEventMode) {
            evt.stopPropagation();
            evt.stopImmediatePropagation();
        }
    };
    GhostEvents.prototype.stopAndPreventGhostEvent = function (evt) {
        if (this.inGhostEventMode) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
        }
    };
    return GhostEvents;
}());
;
exports.ghostEvents = new GhostEvents();
