import React from 'react';
import './EPTable.css';

export interface EPTableColumn<T> {
  id: string;
  header: string;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  renderCell: (row: T) => React.ReactNode;
}

interface EPTableProps<T> {
  columns: EPTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
}

export function EPTable<T>(props: EPTableProps<T>) {
  const { columns, data, getRowId } = props;

  return (
    <table className="ep-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.id}
              style={{ width: col.width }}
              className={col.align ? `ep-table-align-${col.align}` : undefined}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={getRowId(row)}>
            {columns.map((col) => (
              <td
                key={col.id}
                className={col.align ? `ep-table-align-${col.align}` : undefined}
              >
                {col.renderCell(row)}
              </td>
            ))}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td className="ep-table-empty" colSpan={columns.length}>
              Nessun elemento da visualizzare
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
