import { VirtualIndexCore } from '../L2-virtual-indexes/index';
import { OpenCursorResponse, KeyRangeQuery } from '../L1-dbcore/dbcore';
import { deepClone } from '../../../functions/utils';
import { getCountAndGetAllEmulation } from '../L1-dbcore/utils/index';


/** This will be a pure middleware on the L2-virtual-indexes API
 * It will be moved from here into maybe a separate addon.
 * But have to define it here to ensure the architecture allows this.
 * 
 * Förslag:
 * 1. Bygg IgnoreCase på lagret ovanför både subquery och multirange, men att den talar ned direkt
 *   med virtual indexes lagret!
 *   + noCaseAlgorithm måste ändå hantera multiranges själv.
 *   + subQueries funkar bara om sista nyckeln är ignoreCase, men kanske skulle ignoreCase lagrets subQuery() returnera
 *     en openCursor, getAll, ect som gör följande sekvens:
 *      1. getAll(want: keys, unique: true) på första delen med algoritmen på.
 *      2. för varje unik nyckel, gör standard subQuery, men där next är oss, och slut-query ignoreCase algoritm.
 * 
 *  2. (Kanske enklast): Stöd inte compound indexes vad gäller ignorecase. När AND-lagret frågar möjliga index så får den
 *     aldrig träff på nån IC-kombination - bara enkla IC indexes. AND-lagret väljer då istället att göra:
 *        getAll(want:primaryKeys) på de indexarna och får tillbaka sådan lista och kör den metoden istället.
 * 
 *  3. Stöd compound indexes men bara för sista argumentet. När AND-lagret vill kombinera equalsIgnoreCase(firstName) och 
 *      equalsIgnoreCase(lastName) så hittar den inte den kombinationen av "[firstName:ic+lastName:ic]" så den väljer
 *      getAllKeys() strategin istället. Hittar den däremot [customerId,lastName:ic] så kan den genomföra det.
 * 
 *  Men ändå:
 *    * Måste stödja multiRange själv.
 * 
 *  Om vi väljer alternativ 2, var ska då ignoreCase lagret ligga? Helt ok att ligga här, ovanpå L2-virtual-indexes
 *  och ta hand om "*:ic" indexes när det efterfrågas från getAll() eller count().
 * 
 *  Frågan är också om vi gjort subQuery lagret för avancerat? Behövs det att vi stödjer openCursor där? Å andra sidan är
 *  den biten det minst komplexa...
 * 
 *  Väljer vi alternativ 3, så är det bra att subQuery är gjort som det är gjort. Annars funkar inte det.
 */

export function IgnoreCaseEngine (next: VirtualIndexCore): VirtualIndexCore {
  const tableIndexLookup = deepClone(next.tableIndexLookup);
  for (let tableName in tableIndexLookup) {
    const indexLookup = tableIndexLookup[tableName];
    Object.keys(indexLookup).forEach(indexName => {
      const add = (name: string, indexes: {index?, keyLength, keyTail?}[]) => {
        indexLookup[name] = indexes.map(idx => ({...idx, ic: true}));
      };
      if (indexName[0] === '[') {
        const parts = indexName.substr(1, indexName.length - 2).split('+');
        // Vi kör på alternativ 3: Sista nyckeln får användas.
        add(`[${parts.map((part,i) => i === parts.length - 1 ? `${part}` : part).join('+')}:ic]`, indexLookup[indexName]);
      } else {
        add(indexName + ":ic", indexLookup[indexName]);
      }
    });
  }

  function openCursor(query: KeyRangeQuery) : Promise<OpenCursorResponse> {
    if (!query.index.endsWith(':ic')) {
      return next.openCursor(query);
    }
    // TODO: Continue here!
  }


  return {
    ...next,
    ...getCountAndGetAllEmulation(openCursor),
    tableIndexLookup,
    openCursor,
  }
}