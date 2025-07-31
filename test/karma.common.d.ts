export namespace karmaCommon {
    let hostname: string;
    let frameworks: string[];
    let reporters: string[];
    namespace client {
        let captureConsole: boolean;
    }
    let colors: boolean;
    let browserNoActivityTimeout: number;
    let browserDisconnectTimeout: number;
    let processKillTimeout: number;
    let browserSocketTimeout: number;
    let plugins: string[];
    let files: (string | {
        pattern: string;
        watched: boolean;
        included: boolean;
        served: boolean;
    })[];
}
/**
 * @param browserMatrixOverrides {{full: string[], ci: string[]}}
 *  Map between browser suite and array of browser to test.
 * @param configOverrides {Object} configOverrides to the common template
 */
export function getKarmaConfig(browserMatrixOverrides: {
    full: string[];
    ci: string[];
}, configOverrides: any): any;
export const browserSuiteToUse: "pre_npm_publish" | "ci" | "ciLocal" | "local";
import defaultBrowserMatrix = require("./karma.browsers.matrix");
export { defaultBrowserMatrix };
