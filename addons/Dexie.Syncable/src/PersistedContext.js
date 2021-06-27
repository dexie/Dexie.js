import Dexie from 'dexie';

export default function initPersistedContext(node) {
  //
  // PersistedContext : IPersistedContext
  //
  return class PersistedContext {
    constructor(nodeID, otherProps) {
      this.nodeID = nodeID;
      if (otherProps) Dexie.extend(this, otherProps);
    }

    save() {
      // Store this instance in the syncContext property of the node it belongs to.
      return Dexie.vip(() => {
        return node.save();
      });
    }
  }
}
