"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoutingKeyParser {
    constructor() {
        this.Rules = [
            [new RegExp('\\.', 'g'), '\\.'],
            [new RegExp('\\*', 'g'), '([\\w|-]+)'],
            [new RegExp('#', 'g'), '([\\w|.|-]*)']
        ];
        this.RegexRoute = new RegExp("\\*|#", "g");
    }
    isRoutingRoute(key) {
        return new RegExp("\\*|#", "g").test(key);
    }
    test(pattern, key) {
        const regex = this._createRegex(pattern);
        return regex.test(key);
    }
    _createRegex(pattern) {
        for (let i = 0, len = this.Rules.length; i < len; i++) {
            let rule = this.Rules[i];
            pattern = pattern.replace(rule[0], rule[1]);
        }
        let regex = new RegExp(`^${pattern}$`);
        return regex;
    }
}
exports.RoutingKeyParser = RoutingKeyParser;
exports.routingKeyParser = new RoutingKeyParser();
//# sourceMappingURL=routingKeyParser.js.map