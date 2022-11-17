import * as vscode from 'vscode';
import { codiconsProvider, init as initCodicons } from './codicons';
import { init as initCommands, commandHistoryProvider, runCommand, openConfigFile, Execution, removeExecution } from './commands';

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
	// codicons
	await initCodicons(context);
	context.subscriptions.push(vscode.window.registerTreeDataProvider("extension-devtools.view.codicons", codiconsProvider));
	context.subscriptions.push(vscode.commands.registerCommand("extension-devtools.view.codicon.copy", (codicon: string) => vscode.env.clipboard.writeText(codicon)));
}


export function deactivate() {}
