import {Algorithm} from '../algorithm';
import {CursorFilterResult} from '../cursor-filter';
import {keyRangeUnion} from '../keyrange';

/**
 * Creates a Union algorithm that is capable of executing logical OR between expressions
 * on the same key. For example, the expression:
 * 
 *      db.friends.where('name').startsWithIgnoreCase('d')
 *                .or('name').equalsIgnoreCase('fahlander')
 * 
 * This expression will, when executed, detect that the two expressions apply to the same key ('age') so it
 * can use the ignoreCase algorithm to the left and the one to the right and combine them using this
 * union algorithm and find either of the two set of keys.
 */
export function createUnionAlgorithm (algorithms: Algorithm[]) : Algorithm {
    return (reverse, tools) => {
        // Create filters by invoking each Algorithm (which is a function returning a CursorFilter)
        const filters = algorithms.map(algorithm => algorithm (reverse, tools));
        // Fill an array with default 'previous results'. Could have used Array.prototype.fill() if
        // it wasn't for the lack of support in IE. Map is a totally ok substitute as well.
        const previousResults = algorithms.map(() => ({match: false} as CursorFilterResult));
        // Here are just some tools we will use in the code:
        const {cmp, minOrUndefined, MAX_KEY} = tools;

        // Return the CursorFilter instance:
        return {
            // Let keyRange be the union of all keyRanges involveed:
            keyRange: filters.map(filter => filter.keyRange).reduce(
                (result, range) => keyRangeUnion(result, range)),

            // Let done be false initially. Updated in filter() method when all filters are done.
            done: false,

            // CursorFilter.filter() method that unifies all involved filters:
            filter (currentKeys: {key, primaryKey}) {
                let allDone = true,
                    minWantedKey = MAX_KEY,
                    minWantedPrimaryKey = MAX_KEY;
                    
                for (let i=0, l=filters.length; i<l; ++i) {
                    const filter = filters[i],
                          lastResult = previousResults[i];

                    if (filter.done) continue;

                    allDone = false; // At least one filter isn't done yet, so we shouldn't be done either.
                    const {match, wantedKey, wantedPrimaryKey} = lastResult;

                    if (match) {
                        // No need to continue calling filters. Want only one match.
                        return {match: true};
                    }

                    // Update minWanted-keys (so we know what we should return)
                    minWantedKey = minOrUndefined(wantedKey, minWantedKey);
                    minWantedPrimaryKey = minOrUndefined(wantedPrimaryKey, minWantedPrimaryKey);

                    if (wantedKey !== undefined) {
                        const keyCompare = cmp(currentKeys.key, wantedKey);
                        if (keyCompare < 0) {
                            // Cursor is not yet at wantedKey. Skip this filter.
                            continue;
                        }

                        if (wantedPrimaryKey !== undefined &&
                            keyCompare === 0 &&
                            cmp(currentKeys.primaryKey, wantedPrimaryKey) < 0)
                        {
                            // Cursor is not yet at wantedPrimaryKey. Skip this filter.
                            continue;
                        }
                    }
                }

                this.done = allDone;
                
                return {
                    match: false,
                    wantedKey: minWantedKey,
                    wantedPrimaryKey: minWantedPrimaryKey
                };
            }
        }
    };
}

