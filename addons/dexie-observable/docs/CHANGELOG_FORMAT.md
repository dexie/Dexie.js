
Changelog tables are of a compressed format, and there is one changelog per table:

Table name: `${tableName}_changes`

primary key: number (revision)
[change-type, ...args]

Where change-type is "c" for create, "u" for update and "d" for delete.
When supporting OT, there might be two (or more) additional change-types: "si" (string-insert) and "sd" (string-delete)

