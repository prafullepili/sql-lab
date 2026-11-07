import { useCallback, useEffect, useState } from 'react';
import { initializeDatabase, inspectSchema, runSql as executeSql } from './dbService.js';

export function useSqlDatabase() {
  const [state, setState] = useState({ ready: false, error: '', tables: {} });

  useEffect(() => {
    let active = true;
    Promise.all([initializeDatabase(), inspectSchema()])
      .then(([, tables]) => {
        if (active) setState({ ready: true, error: '', tables });
      })
      .catch((error) => {
        if (active) setState({ ready: false, error: error.message || 'Unable to start the local SQL database.', tables: {} });
      });
    return () => { active = false; };
  }, []);

  const runSql = useCallback(async (sql) => {
    const result = await executeSql(sql);
    const tables = await inspectSchema();
    setState((current) => ({ ...current, tables }));
    return result;
  }, []);

  return { ...state, runSql };
}
