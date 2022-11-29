import * as vscode from 'vscode';
import { codiconsProvider, init as initCodicons, update as updateCodiconMapping } from './codicons';
import { init as initCommands, commandHistoryProvider, runCommand, openConfigFile, Execution, removeExecution, toCommandUri } from './commands';
import { copyToClipboard } from './utils';

export async function activate(context: vscode.ExtensionContext) {

	initCommands(context);
	context.subscriptions.push(vscode.commands.registerCommand('extension-devtools.openConfigFile', openConfigFile));
	context.subscriptions.push(vscode.commands.registerCommand('extension-devtools.executeCommand', async (item?: Execution) => {
		if (item) {
			const {command, args} = item;
			args ? runCommand(command, ...args) : runCommand(command);
		} else {
			const command = await vscode.window.showInputBox({
				ignoreFocusOut: true,
				placeHolder: "<command-id>"
			});
			if (!command) { return; }

			const argsRaw = await vscode.window.showInputBox({
				ignoreFocusOut: true,
				placeHolder: `An array of args in JSON format, e.g. ["arg1", "arg2"]`
			});
			if (argsRaw === undefined) { return; }

			const args = argsRaw ? await JSON.parse(argsRaw) : [];
			runCommand(command, ...args);
		}
	}));

	context.subscriptions.push(vscode.window.registerTreeDataProvider("extension-devtools.view.commands", commandHistoryProvider));
	context.subscriptions.push(vscode.commands.registerCommand("extension-devtools.view.command.remove", removeExecution));
	context.subscriptions.push(vscode.commands.registerCommand("extension-devtools.view.command.copyUri", (e: Execution) => copyToClipboard(toCommandUri(e))));
	// codicons
	await initCodicons(context);
	context.subscriptions.push(vscode.window.registerTreeDataProvider("extension-devtools.view.codicons", codiconsProvider));
	context.subscriptions.push(vscode.commands.registerCommand("extension-devtools.view.codicon.copy", (codicon: string) => copyToClipboard(codicon)));
	context.subscriptions.push(vscode.commands.registerCommand("extension-devtools.view.codicon.update", () => updateCodiconMapping(context)));
}


export function deactivate() {}
