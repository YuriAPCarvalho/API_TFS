"use client";

import { useEffect, useState } from "react";
import { Popover } from "antd";
import { FaQuestionCircle } from "react-icons/fa";
import { RESERVED_WORDS_HELP } from "@/app/utils/replaceReservedWords";

const helpContent = (
  <div className="max-w-md">
    <p className="mb-2 text-sm">
      Use nas colunas <strong>title</strong> e <strong>description</strong> do
      Excel. Colunas obrigatórias: title, description, pbi, activityId,
      activity, complexity.
    </p>
    <ul className="m-0 max-h-72 list-none overflow-y-auto p-0 text-sm">
      {RESERVED_WORDS_HELP.map(({ placeholder, description }) => (
        <li key={placeholder} className="border-t border-gray-100 py-2 first:border-t-0">
          <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
            {placeholder}
          </code>
          <span className="ml-2 text-gray-600">{description}</span>
        </li>
      ))}
    </ul>
  </div>
);

interface ReservedWordsHelpProps {
  visible: boolean;
}

export default function ReservedWordsHelp({ visible }: ReservedWordsHelpProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!visible) {
      setOpen(false);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <Popover
      title="Palavras reservadas"
      content={helpContent}
      trigger="click"
      placement="right"
      open={open}
      onOpenChange={setOpen}
    >
      <button
        type="button"
        className="mt-7 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="Ajuda sobre palavras reservadas do Excel"
      >
        <FaQuestionCircle />
      </button>
    </Popover>
  );
}
