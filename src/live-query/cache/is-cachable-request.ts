import { DBCoreCountRequest, DBCoreGetManyRequest, DBCoreGetRequest, DBCoreOpenCursorRequest, DBCoreQueryRequest } from '../../public/types/dbcore';


export function isCachableRequest(type: string, req: Partial<DBCoreQueryRequest & DBCoreCountRequest & DBCoreGetManyRequest & DBCoreGetRequest & DBCoreOpenCursorRequest>) {
  switch (type) {
    case 'query':
      return req.values && !req.unique;
    case 'get':
      return false;
    case 'getMany':
      return false;
    case 'count':
      return false;
    case 'openCursor':
      return false;
  }
}
