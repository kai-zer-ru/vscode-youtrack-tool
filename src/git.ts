"use strict";
import * as vscode from "vscode";
import * as childProcess from "child_process";

export class Git {
  public branch(branchName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let bStat = childProcess.exec(
        'git checkout -b "' + branchName + '"',
        {
          cwd: vscode.workspace.rootPath
        },
        (err, stdout, stderr) => {
          if (err) {
            vscode.window.showErrorMessage("Git create branch error:" + err);
            reject(err);
            return;
          }
          vscode.window.showInformationMessage(stderr);
          resolve(stderr);
        }
      );
    });
  }

  public checkout(branchName: string) {}

  public merge(branchName: string) {}

  public commit(commitMessage: string) {}

  public pull() {}

  public push(force: boolean = false) {}

  public getCurrentBranch(): Promise<string> {
    return new Promise((resolve, reject) => {
      let bStat = childProcess.exec(
        "git symbolic-ref --short HEAD",
        {
          cwd: vscode.workspace.rootPath
        },
        (err, stdout, stderr) => {
          if (err) {
            reject(err);
          } else resolve(stdout.trim().toLowerCase());
        }
      );
    });
  }

  public deleteBranch(branchName: string) {}
}
