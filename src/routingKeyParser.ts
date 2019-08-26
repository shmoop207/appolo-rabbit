export class RoutingKeyParser {
    private readonly Rules: [RegExp, string][] = [
        [new RegExp('\\.', 'g'), '\\.'],
        [new RegExp('\\*', 'g'), '([\\w|-]+)'],
        [new RegExp('#', 'g'), '([\\w|.|-]*)']
    ];

    private readonly RegexRoute = new RegExp("\\*|#", "g");

    public isRoutingRoute(key: string): boolean {
        return new RegExp("\\*|#","g").test(key);
    }

    public test(pattern: string, key: string): boolean {
        const regex = this._createRegex(pattern);
        return regex.test(key)
    }


    private _createRegex(pattern: string): RegExp {
        for (let i = 0, len = this.Rules.length; i < len; i++) {
            let rule = this.Rules[i];

            pattern = pattern.replace(rule[0], rule[1])
        }

        let regex = new RegExp(`^${pattern}$`);

        return regex
    }
}

export const routingKeyParser = new RoutingKeyParser();
