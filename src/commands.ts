"use strict";
import * as vscode from "vscode";
import { makeInstance } from "./integrations";
import * as store from "./store";
import { Git } from "./git";
import { Issue } from "./issue";

export interface Command<T = void> {
  id: string;

  run(...args: any[]): T | Promise<T>;
}

class StatusWidget {
  private widget;

  constructor(widget) {
    this.widget = widget;
  }

  public reset(): void {
    this.widget.text = "YouTrack List";
  }

  public setTitle(title: string) {
    this.widget.text = title;
  }
}

class PreviewPanel {
  private panel;

  constructor(panel) {
    this.panel = panel;
  }

  public update() {
    this.panel.update(vscode.Uri.parse("css-preview://test"));
  }
}

export class TestConnectionCommand implements Command {
  public id = "youtrack.test-connection";
  private widget;
  private panel;

  constructor(status, panel) {
    this.run = this.run.bind(this);
    this.widget = new StatusWidget(status);
    this.panel = new PreviewPanel(panel);
  }

  public async run(): Promise<void> {
    this.widget.setTitle("Loading...");

    makeInstance()
      .test()
      .then(() => {
        this.widget.reset();
        vscode.window.showInformationMessage("Connection succeful");
      })
      .catch((err: string) => {
        this.widget.reset();
        vscode.window.showErrorMessage(err);
      });
  }
}

export class TaskListCommand implements Command {
  public id = "youtrack.list";
  private widget;
  private panel;

  constructor(status, panel) {
    this.run = this.run.bind(this);
    this.widget = new StatusWidget(status);
    this.panel = new PreviewPanel(panel);
  }

  public async run(preselected): Promise<void> {
    this.widget.setTitle("Loading...");
    makeInstance()
      .getIssueList()
      .then(data => {

        // save issues list
        const git = new Git();
        git.getCurrentBranch().then(branchName => {
          store.set("currentBranch", branchName);
          store.set("issues", data);
          this.widget.reset();
          const items: vscode.QuickPickItem[] = [];
          console.log(data['issues']);
          data['issues'].forEach(issue => {
            items.push({ label: issue['project']['name'] + "-" + issue['numberInProject'] + " - " + issue['summary'], detail: issue['project']['name'] + "-" + issue['numberInProject'], description: issue['project']['name'] + "-" + issue['numberInProject'] + " - " + issue['summary']});
          });
          vscode.window.showQuickPick(
            items,
          )
          .then(selection => {
            if (!selection || !selection.label) {
              return;
            }
            const taskId = selection.detail;
            vscode.window
              .showInputBox({
                placeHolder: selection.detail,
                valueSelection: [0, selection.detail.length],
                value: `${selection.detail}`,
                prompt: "Введите имя новой ветки"
              })
              .then((branchName: string) => {
                if (!branchName) {
                  vscode.window.showErrorMessage(
                    `Вы дожны ввести имя ветки`
                  );
                  return;
                }

                const git = new Git();

                makeInstance()
                  .updateIssueStatusById(
                    taskId,
                    "В работе"
                  )
                  .then(() => {
                    // update status success
                    git.branch(branchName).then(() => { });
                  })
                  .catch(err => vscode.window.showErrorMessage(err));
              });
          });


          // vscode.commands
          //   .executeCommand(
          //     "vscode.previewHtml",
          //     vscode.Uri.parse("css-preview://test"),
          //     vscode.ViewColumn.Two,
          //     "YouTrack List"
          //   )
          //   .then(
          //     success => {},
          //     reason => {
          //       vscode.window.showErrorMessage(reason);
          //     }
          //   );
        });
      })
      .catch((err: string) => {
        this.widget.reset();
        vscode.window.showErrorMessage(`Error open issues list ${err}`);
      });
  }
}

export class TaskStartIssueCommand implements Command {
  public id = "youtrack.start";
  private widget;
  private panel;

  constructor(status, panel) {
    this.run = this.run.bind(this);
    this.widget = new StatusWidget(status);
    this.panel = new PreviewPanel(panel);
  }

  public async run(taskId): Promise<void> {
    const config = vscode.workspace.getConfiguration("youtrack");

    vscode.window
      .showInformationMessage(
        "What is your task?",
        {},
        { title: "Feature", value: "feature", isCloseAffordance: false },
        { title: "Bug fix", value: "bugfix", isCloseAffordance: false },
        { title: "Hot fix", value: "hotfix", isCloseAffordance: false }
      )
      .then(selection => {
        if (!selection || !selection.title) {
          return;
        }

        vscode.window
          .showInputBox({
            placeHolder: selection.value,
            valueSelection: [0, selection.value.length],
            value: `${selection.value}/${taskId}`,
            prompt: "Enter the name to new git branch"
          })
          .then((branchName: string) => {
            if (!branchName) {
              vscode.window.showErrorMessage(
                `You should input new branch name`
              );
              return;
            }

            const git = new Git();

            makeInstance()
              .updateIssueStatusById(
                taskId,
                config.get("taskProgressStatus", "In Progress")
              )
              .then(() => {
                // update status success
                git.branch(branchName).then(() => {});
              })
              .catch(err => vscode.window.showErrorMessage(err));
          });
      });
  }
}

export class TaskOpenIssueInBrowserCommand implements Command {
  public id = "youtrack.open-in-browser";
  private widget;
  private panel;

  constructor(status, panel) {
    this.run = this.run.bind(this);
    this.widget = new StatusWidget(status);
    this.panel = new PreviewPanel(panel);
  }

  public async run(url: string): Promise<void> {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`${url}`));
  }
}

export class TaskStopIssueCommand implements Command {
  public id = "youtrack.stop";
  private widget;
  private panel;

  constructor(status, panel) {
    this.run = this.run.bind(this);
    this.widget = new StatusWidget(status);
    this.panel = new PreviewPanel(panel);
  }

  public async run(preselected): Promise<void> {
    vscode.window.showInformationMessage("STOP");

    // this.configuration = getConfiguration()
  }
}

export class TaskUpdatePanelCommand implements Command {
  public id = "youtrack.update-panel";
  private widget;
  private panel;

  constructor(status, panel) {
    this.run = this.run.bind(this);
    this.widget = new StatusWidget(status);
    this.panel = new PreviewPanel(panel);
  }

  public async run(preselected): Promise<void> {
    this.panel.update();
  }
}
