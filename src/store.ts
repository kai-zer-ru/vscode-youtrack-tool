import * as fs from "fs";

const defaultRegistryJSON = {
  tasks: [
    // {parentBranch, taskId, branchName, works:[{from:timestamp, to:timestamp}, {from, to}]}
  ],
  currentBranch: "",
  issues: []
};

let registryJSON = undefined;

const getStore = (() => {
  return function() {
    if (registryJSON) {
      return registryJSON;
    }

    try {
      const f = fs.readFileSync(__dirname + "/registry.json", "utf-8");
      registryJSON = JSON.parse(f);
    } catch (e) {
      registryJSON = defaultRegistryJSON;
    }

    return registryJSON;
  };
})();

const saveStore = () => {
  fs.writeFileSync(__dirname + "/registry.json", JSON.stringify(getStore()));
};

export const get = key => {
  return getStore()[key] || undefined;
};

export const set = (key, value = undefined) => {
  getStore()[key] = value;
  saveStore();
  return get(key);
};

export const del = key => {
  delete registryJSON[key];
  saveStore();
  return true;
};
