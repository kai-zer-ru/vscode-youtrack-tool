"use strict";
import * as https from "https";
import * as xml2js from "xml2js";

export class Api {
  private host: string;
  private defaultHeaders: object;
  private https = https;

  constructor(
    host: string,
    defaultHeaders: object = {}
  ) {
    this.host = host;
    this.defaultHeaders = defaultHeaders;
  }

  private _call(
    method: string,
    url: string = "",
    body: object = {},
    headers: object = {}
  ) {
    return new Promise((resolve, reject) => {
      const options = {
        host: this.host,
        body: body,
        method,
        port: 443,
        path: url,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Accept": "application/json",
          ...this.defaultHeaders,
          ...headers
        }
      };
      const postReq = this.https.request(options, function(res) {
        res.setEncoding("utf8");
        let data = "";
        res.on("data", function(chunk) {
          data += chunk;
        });
        res.on("end", function() {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject([data, res]);
            return;
          }
          resolve([data, res]);
        });

        res.on("error", function(e) {
          return reject([data, res]);
        });

        res.on("timeout", function(e) {
          return reject([data, res]);
        });
      });
      postReq.end();
    });
  }
  public get(url: string) {
    return this._call("get", url);
  }
  public post(
    url: string,
    body: {}
  ) {
    return this._call("get", url, body);
  }
}
