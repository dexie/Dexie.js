

1. Once a query has an offset or limit, where(), desc() and orderBy() is disabled on child querys.
2. If neither a where or orderBy is given, the default order is the primary key.
3. If no orderBy is given and the where-criteria can be resolved with an index, the default order is the order of any index that can resolve the criteria. If no such index is found, the default order is the primary key.
4. orderby will ignore unset entries on the index being ordered
