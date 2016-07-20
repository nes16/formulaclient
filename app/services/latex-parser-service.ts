import { Injectable } from '@angular/core';
import '../lib/latex-parser/latex-parser'
import {MathNode} from '../lib/math-node/math-node'
import {Variable, Global, FG} from '../types/standard'

declare var Parser: any;

@Injectable()
export class LatexParserService {
    parser: any;
    constructor() {
        this.parser = Parser;
        this.parser.yy.MathNode = MathNode;
    }

    parse(latex) {
        return this.parser.parse(latex);
    }

    getVarNodes(root, resource, globals){
        var list = {};
        var varNodes = MathNode.prototype.traverseNode(root, list);
        var symbols = Object.keys(list);
        var newGlobals = [];
        var newVars = [];
        symbols.forEach(a => {
            var vorg;
            var index;
            var item = resource.Variables.find((item, i) => {
                index=i; 
                return (a == item.symbol)
            })
            if(item){
                newVars.push(item);
                resource.Variables.splice(index, 1);
            }
            else if(item = resource.Globals.find((g, i) => {
                index = i;
                return a == g.Global.symbol;
            })){
                newGlobals.push(item);
                resource.Globals.splice(index, 1);
            }
            else{
                var g = globals.getItem("symbol", a);
                if(g){
                    var fg = new FG({})
                    fg.Global = g;
                    newGlobals.push(fg)
                }
                else{
                    var v = new Variable({symbol:a});
                    newVars.push(v)
                }
            }
            delete list[a];
        });
        newGlobals.forEach(g => g.deleted = null);
        newVars.forEach(v => v.deleted = null);
        resource.Variables.forEach(v => v.deleted = "true");
        resource.Globals.forEach(g => g.deleted = "true");
        resource.Variables = resource.Variables.concat(newVars);
        resource.Globals = resource.Globals.concat(newGlobals);
    }
}