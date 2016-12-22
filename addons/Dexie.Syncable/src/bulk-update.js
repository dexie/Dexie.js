import Dexie from 'dexie';

export default function bulkUpdate(table, changes) {
  let keys = changes.map(c => c.key);
  let map = {};
  // Retrieve current object of each change to update and map each
  // found object's primary key to the existing object:
  return table.where(':id').anyOf(keys).raw().each((obj, cursor) => {
    map[cursor.primaryKey+''] = obj;
  }).then(()=>{
    // Filter away changes whose key wasn't found in the local database
    // (we can't update them if we do not know the existing values)
    let updatesThatApply = changes.filter(c => map.hasOwnProperty(c.key+''));
    // Apply modifications onto each existing object (in memory)
    // and generate array of resulting objects to put using bulkPut():
    let objsToPut = updatesThatApply.map (c => {
      let curr = map[c.key+''];
      Object.keys(c.mods).forEach(keyPath => {
        Dexie.setByKeyPath(curr, keyPath, c.mods[keyPath]);
      });
      return curr;
    });
    return table.bulkPut(objsToPut);
  });
}
