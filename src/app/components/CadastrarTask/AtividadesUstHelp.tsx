"use client";

import { useEffect, useMemo, useState } from "react";
import { Input, Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FaTable } from "react-icons/fa";
import { atividadesUst, type AtividadeUst } from "@/app/data/atividadesUst";

interface AtividadesUstHelpProps {
  visible: boolean;
}

const columns: ColumnsType<AtividadeUst> = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 90,
    sorter: (a, b) => a.id - b.id,
  },
  {
    title: "Descrição",
    dataIndex: "descricaoAtividade",
    key: "descricaoAtividade",
    sorter: (a, b) =>
      a.descricaoAtividade.localeCompare(b.descricaoAtividade, "pt-BR"),
  },
];

export default function AtividadesUstHelp({ visible }: AtividadesUstHelpProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!visible) {
      setOpen(false);
      setSearch("");
    }
  }, [visible]);

  const filteredAtividades = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return atividadesUst;

    return atividadesUst.filter(
      (atividade) =>
        String(atividade.id).includes(term) ||
        atividade.descricaoAtividade.toLowerCase().includes(term),
    );
  }, [search]);

  if (!visible) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-7 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="Consultar atividades UST para o Excel"
      >
        <FaTable />
      </button>

      <Modal
        title="Atividades UST"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={960}
        destroyOnClose
      >
        <p className="mb-3 text-sm text-gray-600">
          Use o <strong>ID</strong> na coluna <strong>activityId</strong> e a{" "}
          <strong>descrição</strong> na coluna <strong>activity</strong> do
          Excel.
        </p>

        <Input.Search
          placeholder="Buscar por ID ou descrição"
          allowClear
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mb-3"
        />

        <Table
          dataSource={filteredAtividades}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total) => `${total} atividade(s)`,
          }}
          scroll={{ y: 420 }}
        />
      </Modal>
    </>
  );
}
