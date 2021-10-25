
export interface DexieMango {
  // Mongo compatible:
  $eq?: any;
  $lt?: any;
  $lte?: any;
  $gt?: any;
  $gte?: any;
  $in?: any[]; // can also perform inAnyRange: $in: [{$gte: 0, $lt: 18}, {$gte: 65}]
  $ne?: any;
  $nin?: any;
  // Dexie specific:
  $equalsIgnoreCase: string;
  $startsWithIgnoreCase: string;
  $anyOfIgnoreCase: string[];
  $startsWithAnyOfIgnoreCase: string[];
  //$startsWithAnyOf: string[];
}