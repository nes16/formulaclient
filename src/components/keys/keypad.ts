import { mathkeys } from './keypad_keys';
import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { MQService } from '../../providers/mq-service'

@Component({
    selector: 'keypad',
    templateUrl: 'keypad.html',
})
export class MathKeypad {
    

    //classes used for decorate keys
    static constants = {
                keys : mathkeys.keys,
                keyGroupClasses : {},
                keyClasses : {},
                keyLinkClasses : {},
                groups :  [],
                buttons : {},
                tabs : [],
                popups : {},
                initDone : false
            }

    functionsOpen:boolean = false;
    curLayout:string = 'letters';
    curTab:string = 'trig';
    const: any;
    constructor(public mq:MQService, public viewCtrl: ViewController) {

        if(!MathKeypad.constants.initDone){
            MathKeypad.constants.initDone = true;
            for (var prop in MathKeypad.constants.keys) {
                let key = MathKeypad.constants.keys[prop]
                this.genButton(key, prop);
            }
            this.setupKeypad();

            MathKeypad.constants.groups.map(g => {let m = { 'fl-main-keypad-section': true}
                                    m['fl-'+g]=true;
                                    MathKeypad.constants.keyGroupClasses[g]=m;
                                  });
            Object.keys(MathKeypad.constants.keys).forEach(kn => {let k = MathKeypad.constants.keys[kn].display; let m = { 'fl-cell': true };
                                 if(k.cellClass) 
                                     m[k.cellClass] = true; 
                                 MathKeypad.constants.keyClasses[k.id]=m ;
                                 let n = {};
                                 n['fl-'+kn+'-key']=true;
                                 if(k.aClass){
                                     n['fl-btn']=true;
                                     n[k.aClass]= true;
                                     n['mq-math-mode']=true
                                 }
                                 MathKeypad.constants.keyLinkClasses[k.id]=n;});
        }
        this.const = MathKeypad.constants;
    }

    genButton(key, buttonId) {

        let display = key.display;
        let action = key.action;

        display.id = buttonId;

        if (!('cellClass' in display)) display.cellClass = '';

        if (!('aClass' in display)) display.aClass = '';

        if (display.colspan) {

          if (display.cellClass) display.cellClass += ' ';

          switch (display.colspan) {
            case 0.5:
              display.cellClass += 'fl-halfwide';
              break;
            case 2:
              display.cellClass += 'fl-twowide';
              break;
            case 1.5:
              display.cellClass += 'fl-onepointfivewide';
              break;
          }
        }


        if (display.html) {
          display.aClass = (display.aClass ? display.aClass + ' fl-key' : 'fl-key');
          display.aClass += ' fl-tappable';
        }

        if (!(action.tab || action.key || action.popup || action.changeLayout) &&
          !display.noMQ && display.html
        ) {
          display.mathquill = true;
          // WARNING - if run multiple times, this will modify this.keys in breaking ways
          display.html = this.mq.getHtml(display.html);
          //For mathqull 0.10.0 version
        }
    };
    
    mousedown(evt){
        this.buttonTap(evt);
        evt.stopPropagation(); 
        evt.preventDefault();
    }

    
    buttonArray2(buttonsStringA) {
          return buttonsStringA.map(buttonsString => {
              return buttonsString.split(' ').map(buttonId => {
                   if (!MathKeypad.constants.keys[buttonId])
                       buttonId = "unknown";
                   return MathKeypad.constants.keys[buttonId].display;   
              });
          });
    };




    setupKeypad() {
        MathKeypad.constants.groups = ['mainNumbersLeft', 'numbersMiddle', 'numbersRight', 'letters', 'capitalLetters'];

        MathKeypad.constants.buttons = {
            mainNumbersLeft: [
                { keys: this.buttonArray2(['highlightedX highlightedY squared exponent'])[0] },
                { keys: this.buttonArray2(['leftparen rightparen lt gt'])[0] },
                { keys: this.buttonArray2(['pipes comma le ge'])[0] },
                { keys: this.buttonArray2(['toggleLetters sqrt pi'])[0] }
            ],

            numbersMiddle: [
                { keys: this.buttonArray2(['7 8 9 divide'])[0] },
                { keys: this.buttonArray2(['4 5 6 times'])[0] },
                { keys: this.buttonArray2(['1 2 3 minus'])[0] },
                { keys: this.buttonArray2(['0 decimal equals plus'])[0] }
            ],

            numbersRight: [
                { keys: this.buttonArray2(['popupFunctions'])[0] },
                { keys: this.buttonArray2(['left right'])[0] },
                //intentionally leave the last blank off so that enter isn't covered by it
                { keys: this.buttonArray2(['halfBlank backspace'])[0] },
                { keys: this.buttonArray2(['enter'])[0] }
            ],

            letters: [
                { keys: this.buttonArray2(['q w e r t y u i o p'])[0] },
                { keys: this.buttonArray2(['halfBlank a s d f g h j k l halfBlank'])[0] },
                { keys: this.buttonArray2(['toggleCapital z x c v b n m backspace'])[0] },
                { keys: this.buttonArray2(['toggleNumbers subscript brackets colon squarebrackets twiddle theta enter'])[0]}
            ],
            capitalLetters: [
                { keys: this.buttonArray2(['Q W E R T Y U I O P'])[0] },
                { keys: this.buttonArray2(['halfBlank A S D F G H J K L halfBlank'])[0] },
                { keys: this.buttonArray2(['toggleLowercase Z X C V B N M backspace'])[0] },
                { keys: this.buttonArray2(['toggleNumbers subscript brackets colon squarebrackets twiddle theta enter'])[0]}
            ]
        };



        MathKeypad.constants.tabs = ['trig', 'stats', 'misc'];


        MathKeypad.constants.popups = {
            functionsPopup: {
                trig: {
                    tab: this.buttonArray2(['trigTab'])[0][0],
                    funcs: this.buttonArray2([
                        'sin arcsin sinh', 'cos arccos cosh', 'tan arctan tanh', 'csc arccsc csch', 'sec arcsec sech', 'cot arccot coth']
                    )
                },
                stats: {
                    tab: this.buttonArray2(['statsTab'])[0][0],
                    funcs: this.buttonArray2([
                        'total length mean', 'median quantile stdev', 'stdevp let cov', 'corr nCr nPr', 'fact twiddle']
                    )
                },
                misc: {
                    tab: this.buttonArray2(['miscTab'])[0][0],
                    funcs: this.buttonArray2(['lcm gcd mod', 'ceil floor round', 'abs min max', 'cuberoot exp ln', 'log loga ddx', 'sum prod'])
                },

            }
        };
    };

  
    setLayout(group) {
        if((group == 'mainNumbersLeft' || group == 'numbersMiddle' || group == 'numbersRight') && this.curLayout === 'mainNumbers')
            return false;
        else if(group == this.curLayout)
            return false;
        else return true;
    };
    
    buttonTap(evt) {
        /* jshint maxcomplexity:293 */
        let t = evt.target.closest('[key]');
        if(!t)
            return;
        
        let keyID = t.getAttribute('key');
        
        let buttonAction = MathKeypad.constants.keys[keyID].action;

        if (buttonAction.changeLayout) {
            this.functionsOpen = false;
            this.curLayout = buttonAction.changeLayout;
            return;
        }
        if (buttonAction.tab) {
            return this.curTab = buttonAction.tab;
        }
        if (buttonAction.popup === 'functions') {
            this.functionsOpen = !this.functionsOpen;
            return;
        }

        //hide popup when any button is pressed (Except a popup or tab button)
        this.functionsOpen = false;
        let editor = this.mq.curElem;
        //let editor = MQ.MathField(this.lastMathquill);

        if (!editor) {
            return;
        }

        try {
            if (buttonAction.custom) {
                switch (buttonAction.custom) {
                    case 'brackets':
                        editor.cmd('{');
                        editor.cmd('}');
                        editor.keystroke('Left');
                        break;
                    case 'squarebrackets':
                        editor.cmd('[');
                        editor.cmd(']');
                        editor.keystroke('Left');
                        break;
                    case 'loga':
                        editor.write('log_{}\\left( \\right)');
                        editor.keystroke('Left');
                        editor.keystroke('Left');
                        editor.keystroke('Left');
                        break;
                    case 'cuberoot':
                        editor.write('\\sqrt[3]{}');
                        editor.keystroke('Left');
                        break;
                    case 'squared':
                        //route as if typed the exponent button, so that we get the
                        //nice behavior where exponentiating in an exponent is treated
                        //as a backspace first
                        editor.cmd('^');
                        editor.cmd('2');
                        editor.keystroke('Right');
                        break;
                    case 'cubed':
                        editor.write('^{3}');
                        break;
                    case 'd/dx':
                        editor.write('\\frac{d}{dx}');
                        break;
                }
            } else if (buttonAction.key) {
                editor.keystroke(buttonAction.key);

            } else if (buttonAction.cmd) {
                editor.cmd(buttonAction.cmd);
            } else if (buttonAction.func) {
                let suffix = '\\left( \\right)';
                if (buttonAction.args === 2) {
                    suffix = '\\left({},{}\\right)';
                }
                editor.write(buttonAction.func + suffix);
                editor.keystroke('Left');
                if (buttonAction.args === 2) {
                    editor.keystroke('Left');
                }
            }
            // // after everything is said and done, tell mathquill it rendered. This
            // // will update the value stored for the expressions latex. And that
            // // will cause this change to go into undo/redo.
            // editor.trigger('render');
        } catch (e) {

        }
    };
 }
