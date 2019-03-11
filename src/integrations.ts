"use strict";
import * as vscode from "vscode";

import { Api } from "./api";
// import { Issue, YouTrackIssue } from "./issue";

const url = require("url");

class Integration {
  protected readonly _api: Api;

  protected readonly _serverUrl: string;
  protected readonly _token: string;
  protected readonly _searchQuery: string;

  protected readonly _loginUrl: string;
  protected readonly _issueListUrl: string;
  protected readonly _issueItemUrl: string;
  protected readonly _issueItemUpdateUrl: string;
  protected _logged: boolean;
  protected _headers: object;

  constructor(
    serverUrl: string,
    token: string,
    searchQuery: string
  ) {
    this._logged = false;
    this._headers = { "Authorization": "Bearer " + token };
    this._serverUrl = serverUrl;
    this._token = token;
    this._searchQuery = searchQuery;

    this._api = new Api(this._serverUrl, this._headers);
  }

  public test() {}
  protected ensureLogin(): Promise<void> {
    return Promise.resolve();
  }

  public getIssueList() {}

  public getIssueById(id: string) {}

  public updateIssueById(id: string) {}

  public updateIssueStatusById(id: string, status: string) {}
}

class YouTrack extends Integration {
  protected token = "perm:a2FpemVy.dnNjb2Rl.4kx42qVPIiCVjGj8eBIJydkJia38ZP";
  protected readonly _issueListUrl: string = "/api/issues?fields=project%28id,name%29,id,numberInProject,summary&query={query}&$skip=0&$top=10000";
  protected readonly _issueItemUrl: string = "/api/issues/{issueId}";
  protected readonly _issueItemUpdateUrl: string = "/rest/issue/{issueId}/execute?command={command}";


  protected login(): Promise<void | string> {
    return new Promise((resolve, reject) => {
      return resolve();
    });
  }

  public test() {
    return new Promise((resolve, reject) => {
      this.login()
        .then(() => resolve())
        .catch(err => reject(String(err)));
    });
  }
  public updateIssueStatusById(
    id: string,
    status: string
  ): Promise<string | object> {
    return new Promise((resolve, reject) => {
      const config = vscode.workspace.getConfiguration("youtrack");

      this.ensureLogin()
        .then(() => {
          resolve();
          return;
          const stateField = config.get('stateField', 'status')
          this._api
            .post(
              '/api/issues/${id}',
              {
                stateField: status
              }
            )
            .then(data => {
              resolve(data);
            })
            .catch(err => {
              const [error, res] = err;
              reject(error);
            });
        })
        .catch((err: string) => reject(err));
    });
  }

  public getIssueList(): Promise<object> {
    return new Promise((resolve, reject) => {
      const config = vscode.workspace.getConfiguration("youtrack");
      const query = config.get("query", "");
      const ussieListUrl = this._issueListUrl.replace("{query}", encodeURI(query));
      this._api
        .get(ussieListUrl)
        .then(result => {
          const data = result[0];
          var issues = JSON.parse(data);
          resolve({ issues: issues });
        })
        .catch(result => {
          console.log("ERROR.RESP", result);
          vscode.window.showErrorMessage(result);
          reject(String(result));
        });
    });
  }
}

export function makeInstance() {
  const config = vscode.workspace.getConfiguration("youtrack");

  return new YouTrack(
    config.get("host"),
    config.get("token"),
    config.get("filters"),
  );
}
