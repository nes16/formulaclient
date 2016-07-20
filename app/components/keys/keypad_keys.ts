  let keypad_data_string = `{
    "trigFuncs":        ["sin","cos","tan","csc","sec","cot"],
  "oneArgFuncs":      ["ceil","floor","round","abs","ln","log","exp", "total", "length", "mean", "median", "stdev", "stdevp", "let"],
  "twoArgFuncs":      ["min","max","lcm","gcd","mod", "nCr", "nPr", "cov", "corr", "quantile"],
  "tabs":             ["trig","stats", "misc"],
  "staticKeys": {
    "unknown":          {"display":{"html":"?"},
                        "action":{"cmd":"?"}},
    "pi":               {"display":{"html":"&pi;"},
                        "action":{"cmd":"\\\\pi"}},
    "tau":               {"display":{"html":"&tau;"},
                        "action":{"cmd":"\\\\tau"}},
    "leftparen":        {"display":{"html":"("},
                        "action":{"cmd":"("}},
    "rightparen":       {"display":{"html":")"},
                        "action":{"cmd":")"}},
    "sqrt":             {"display":{"html":"&radic;"},
                        "action":{"cmd":"\\\\sqrt"}},
    "cuberoot":         {"display":{"html":"3&radic;"},
                        "action":{"custom": "cuberoot"}},
    "lt":               {"display":{"html":"&lt;"},
                        "action":{"cmd":"<"}},
    "gt":               {"display":{"html":"&gt;"},
                        "action":{"cmd":">"}},
    "le":               {"display":{"html":"&le;"},
                        "action":{"cmd":"\\\\le"}},
    "ge":               {"display":{"html":"&ge;"},
                        "action":{"cmd":"\\\\ge"}},
    "squared":          {"display":{"aClass":"fl-exponent", "html":"a^2"},
                        "action":{"custom":"squared"}},
    "exponent":         {"display":{"aClass":"fl-exponent", "html":"a^b"},
                        "action":{"cmd":"^"}},
    "subscript":        {"display":{"html":"a_b"},
                        "action":{"cmd":"_"}},
    "fact":             {"display":{"html":"n!"},
                        "action":{"cmd":"!"}},
    "theta":            {"display":{"html":"&theta;"},
                        "action":{"cmd":"\\\\theta"}},
    "brackets":        {"display":{"html":"{ }", "noMQ":true},
                        "action":{"custom":"brackets"}},
    "squarebrackets":        {"display":{"html":"[ ]", "noMQ":true},
                        "action":{"custom":"squarebrackets"}},
    "colon":            {"display":{"html":":"},
                        "action":{"cmd":":"}},
    "pipes":            {"display":{"html":"|a|"},
                        "action":{"cmd":"|"}},
    "comma":            {"display":{"html":","},
                        "action":{"cmd":","}},
    "times":            {"display":{"html":"&times;"},
                        "action":{"cmd":"*"}},
    "plus":             {"display":{"html":"+"},
                        "action":{"cmd":"+"}},
    "divide":           {"display":{"html":"&divide;"},
                        "action":{"cmd":"/"}},
    "minus":            {"display":{"html":"&ndash;"},
                        "action":{"cmd":"-"}},
    "equals":           {"display":{"html":"="},
                        "action":{"cmd":"="}},
    "twiddle":           {"display":{"html":"~"},
                        "action":{"cmd":"~"}},
    "decimal":          {"display":{"html":"."},
                        "action":{"cmd":"."}},
    "backspace":        {"display":{"aClass":"fl-btn-gray",
                                    "html":"<ion-icon class=\\"ion-ios-backspace\\"></ion-icon>",
                                  "colspan": 1.5
                                 },
                        "action":{"key":"Backspace"}},
    "enter":            {"display":{"aClass":"fl-btn-gray",
                                    "html":"<ion-icon class=\\"ion-ios-return-left\\"></ion-icon>",
                                    "colspan": 2
                                  },
                        "action":{"key":"Enter"}},
    "toggleLetters":    {"display":{"aClass":"fl-btn-gray",
                                    "html":"A B C",
                                    "colspan":2},
                        "action":{"changeLayout": "letters"}},
    "toggleNumbers":    {"display":{"aClass":"fl-btn-gray",
                                  "html":"1 2 3",
                                  "colspan":2
                                 },
                        "action":{"changeLayout":"mainNumbers"}},
    "popupFunctions":  {"display":{"aClass":"fl-btn-gray", "html":"func<span class=\'fl-hide-on-narrow\'>tion</span>s", "colspan":2},
                        "action":{"popup": "functions"}},
    "blank":            {"display":{},
                        "action":{}},
    "halfBlank":        {"display":{"colspan":0.5},
                        "action":{}},
    "left":             {"display":{"html":"<ion-icon class=\\"ion-ios-arrow-round-back\\"></ion-icon>"},
                        "action":{"key":"Left"}},
    "up":               {"display":{"html":"&uarr;"},
                        "action":{"key":"Up"}},
    "right":            {"display":{"html":"<ion-icon class=\\"ion-ios-arrow-round-forward\\"></ion-icon>"},
                        "action":{"key":"Right"}},
    "down":             {"display":{"html":"&darr;"},
                        "action":{"key":"Down"}},
    "toggleCapital":    {"display":{"aClass":"fl-btn-gray",
                                    "html":"<i class=\\"ion-ios-arrow-round-up\\"></i>",
                                    "colspan":1.5},
                                    "action":{"changeLayout": "capitalLetters"}},
    "toggleLowercase":    {"display":{"aClass":"fl-btn-gray fl-active",
                                    "html":"<i class=\\"ion-arrow-up-a\\"></i>",
                                    "colspan":1.5},
                                    "action":{"changeLayout": "letters"}},
    "loga":             {"display":{"html":"log_a"},
                        "action":{"custom":"loga"}},
    "ddx":              {"display":{"html":"d/dx"},
                        "action":{"custom":"d/dx"}},
    "sum":              {"display":{"html":"\\\\sum"},
                        "action":{"cmd":"\\\\sum"}},
    "prod":             {"display":{"html":"\\\\prod"},
                        "action":{"cmd":"\\\\prod"}},
    "highlightedX":     {"display":{"html":"x", "aClass":"fl-highlighted"},
                        "action":{"cmd":"x"}},
    "highlightedY":     {"display":{"html":"y", "aClass": "fl-highlighted"},
                        "action":{"cmd":"y"}}
    }
  }
  `;
  let keypad_data = JSON.parse(keypad_data_string);

  //Start with explicitly defined keys
  let _mathkeys = keypad_data.staticKeys;
  let i;

  function init(){
    //Expand summary-form data from JSON to create input structure for keypad
    for (let i = 0; i < keypad_data.tabs.length; i++) {
        _mathkeys[keypad_data.tabs[i] + 'Tab'] = { display: { html: keypad_data.tabs[i] }, action: { tab: keypad_data.tabs[i] } };
    }

    for (let i = 0; i < keypad_data.oneArgFuncs.length; i++) {
        _mathkeys[keypad_data.oneArgFuncs[i]] = { display: { html: keypad_data.oneArgFuncs[i] }, action: { func: keypad_data.oneArgFuncs[i] } };
    }

    for (let i = 0; i < keypad_data.twoArgFuncs.length; i++) {
        _mathkeys[keypad_data.twoArgFuncs[i]] = { display: { html: keypad_data.twoArgFuncs[i] }, action: { func: keypad_data.twoArgFuncs[i], args: 2 } };
    }

    for (let i = 0; i < keypad_data.trigFuncs.length; i++) {
        let groups = [keypad_data.trigFuncs[i], 'arc' + keypad_data.trigFuncs[i], keypad_data.trigFuncs[i] + 'h']
        for (let j = 0; j < groups.length; j++) {
            _mathkeys[groups[j]] = { display: { html: groups[j] }, action: { func: groups[j] } };
        }
    }

    let ch;
    for (i = 0; i < 26; i++) { // A-Z
        ch = String.fromCharCode(65 + i);
        _mathkeys[ch] = { display: { html: ch }, action: { cmd: ch } };
    }

    for (i = 0; i < 26; i++) { // a-f
        ch = String.fromCharCode(97 + i);
        _mathkeys[ch] = { display: { html: ch }, action: { cmd: ch } };
    }

    for (i = 0; i < 10; i++) { // 0-9
        let num = String.fromCharCode(48 + i);
        _mathkeys[num] = { display: { html: num }, action: { cmd: num } };
    }
  }
 
  init()
  
  
  export let mathkeys = {keys:_mathkeys};
