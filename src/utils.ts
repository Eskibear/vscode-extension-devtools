
import * as http from "http";
import * as https from "https";
import * as os from "os";
import * as path from "path";
import * as url from "url";
import * as vscode from "vscode";
import * as fs from "fs";
import * as crypto from "crypto";

let EXTENSION_PUBLISHER: string;
let EXTENSION_NAME: string;
let EXTENSION_VERSION: string;
let EXTENSION_AI_KEY: string;

export async function loadPackageInfo(context: vscode.ExtensionContext): Promise<void> {
    const raw = await fs.promises.readFile(context.asAbsolutePath("./package.json"));
    const { publisher, name, version, aiKey } = JSON.parse(raw.toString());
    EXTENSION_AI_KEY = aiKey;
    EXTENSION_PUBLISHER = publisher;
    EXTENSION_NAME = name;
    EXTENSION_VERSION = version;
}

export function getExtensionId(): string {
    return `${EXTENSION_PUBLISHER}.${EXTENSION_NAME}`;
}
export function getVersion(): string {
    return EXTENSION_VERSION;
}
export function getAiKey(): string {
    return EXTENSION_AI_KEY;
}
export function getTempFolder(): string {
    return path.join(os.tmpdir(), getExtensionId());
}

/**
 *
 * @param targetUrl
 * @param readContent return content, and remove the downloaded file.
 * @param customHeaders
 * @returns
 */
export async function downloadFile(targetUrl: string, readContent?: boolean, customHeaders?: {}): Promise<string> {
    const tempFilePath: string = path.join(getTempFolder(), randomUUID());
    await fs.promises.mkdir(getTempFolder(), {recursive: true});
    try {
        await fs.promises.access(tempFilePath);
        await fs.promises.unlink(tempFilePath);
    } catch (error) {
        // not exists. fine.
    }

    return await new Promise((resolve: (res: string) => void, reject: (e: Error) => void): void => {
        const urlObj: url.Url = url.parse(targetUrl);
        const options = Object.assign({ headers: Object.assign({}, customHeaders, { "User-Agent": `vscode/${getVersion()}` }) }, urlObj);
        let client: any;
        if (urlObj.protocol === "https:") {
            client = https;
            // tslint:disable-next-line:no-http-string
        } else if (urlObj.protocol === "http:") {
            client = http;
        } else {
            return reject(new Error("Unsupported protocol."));
        }
        client.get(options, (res: http.IncomingMessage) => {
            let rawData: string;
            let ws: fs.WriteStream;
            if (readContent) {
                rawData = "";
            } else {
                ws = fs.createWriteStream(tempFilePath);
            }
            res.on("data", (chunk: string | Buffer) => {
                if (readContent) {
                    rawData += chunk;
                } else {
                    ws.write(chunk);
                }
            });
            res.on("end", () => {
                if (readContent) {
                    fs.unlink(tempFilePath, () => {
                        resolve(rawData);
                    });
                } else {
                    ws.end();
                    ws.on("close", () => {
                        resolve(tempFilePath);
                    });
                }
            });
        }).on("error", (err: Error) => {
            reject(err);
        });
    });
}

export function randomUUID() {
    return crypto.randomUUID();
}
