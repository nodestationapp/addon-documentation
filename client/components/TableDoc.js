import { useState } from "react";

import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import TableDocsModal from "./TableDocsModal.js";
import { useQuery } from "@tanstack/react-query";

import { api } from "@nstation/design-system/utils";

const TableDoc = ({ table }) => {
  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ["client_tables_docs", table?.id],
    queryFn: () => api.get(`/api/tables/${table?.id}/docs`),
    enabled: !!table?.id,
  });

  const [tableDocs, setTableDocs] = useState(false);

  return (
    <>
      {!!docs?.length && (
        <IconButton size="micro" onClick={() => setTableDocs(true)}>
          <HelpOutlineIcon />
        </IconButton>
      )}
      {!!tableDocs && (
        <TableDocsModal
          data={docs}
          open={tableDocs}
          isLoading={docsLoading}
          onClose={() => setTableDocs(false)}
        />
      )}
    </>
  );
};

export default TableDoc;
