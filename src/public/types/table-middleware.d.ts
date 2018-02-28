import { WriteRequest, MutationResponse, DeleteRequest, DeleteRangeRequest } from "./mutation-core";
import { IndexableType } from "./indexable-type";

export interface TableMiddleware {
  write? (
    req: WriteRequest,
    next: (req: WriteRequest) => Promise<MutationResponse>
  ) : Promise<MutationResponse>;

  delete? (
    req: DeleteRequest,
    next: (req: DeleteRequest) => Promise<MutationResponse>
  ): Promise<MutationResponse>;

  deleteRange? (
    req: DeleteRangeRequest,
    next: (req: DeleteRangeRequest) => Promise<void>
  ): Promise<void>;
}
