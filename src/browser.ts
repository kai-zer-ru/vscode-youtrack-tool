'use strict';
import * as vscode from 'vscode';

export default class Bworser {

    public static open(urlPath: string){
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`${urlPath}`))
    }
}