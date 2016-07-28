    var _Keys = function(){
        let table = {
            8: this.BACKSPACE = 'Backspace',
            9: this.TAB = 'Tab',
            13: this.ENTER = 'Enter',
            16: this.SHIFT = 'Shift',
            17: this.CONTROL = 'Control',
            18: this.ALT = 'Alt',
            20: this.CAPSLOCK = 'CapsLock',
            27: this.ESCAPE = 'Esc',
            32: this.SPACEBAR = 'Space',
            33: this.PAGEUP = 'PageUp',
            34: this.PAGEDOWN = 'PageDown',
            35: this.END = 'End',
            36: this.HOME = 'Home',
            37: this.LEFT = 'Left',
            38: this.UP = 'Up',
            39: this.RIGHT = 'Right',
            40: this.DOWN = 'Down',
            46: this.DELETE = 'Del'
        };

        this.lookup = function(evt) {
            return table[evt.which];
        };
    };
    //let Keys = new Keys();
    export let Keys = new _Keys();

