import { Injectable } from '@angular/core';
import '../assets/latex-parser/latex-parser'
import { MathNode } from '../lib/math-node/math-node'
import { ValueProvider } from '../lib/math-node/value'

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

    evaluate(root):number{
        return root.type()
    }

    getVarNodes(root, resource, globals){
        var list = {};
        MathNode.prototype.traverseNode(root, list);
        var symbols = Object.keys(list);
        resource.addSymbols(symbols, globals);
        
    }

    setValueProviderForVarNodes(root:MathNode, vp:ValueProvider){
        var list = {};
        MathNode.prototype.traverseNode(root, list);
        var symbols = Object.keys(list);
        symbols.forEach(a => {
            list[a].nodes.forEach(n => n.vp = vp)
        })
    }
}