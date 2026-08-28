"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  RemoveFormatting,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const getEl = () =>
    document.querySelector<HTMLDivElement>("[data-rte-editor]");

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    const el = getEl();
    if (el) onChange(el.innerHTML);
  };

  const formatBlock = (tag: string) => exec("formatBlock", tag);

  const addLink = () => {
    const url = window.prompt("Masukkan URL tautan:");
    if (url) exec("createLink", url);
  };

  const btn = (
    label: ReactNode,
    onClick: () => void,
    title: string
  ) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-parchment-2 transition hover:bg-gold/15 hover:text-gold-2"
    >
      {label}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gold/15 bg-ink-2 transition focus-within:border-gold/50">
      <div className="flex flex-wrap items-center gap-1 border-b border-gold/10 bg-ink-3/40 px-2 py-1.5">
        {btn(<Bold className="h-4 w-4" />, () => exec("bold"), "Tebal")}
        {btn(<Italic className="h-4 w-4" />, () => exec("italic"), "Miring")}
        {btn(
          <Underline className="h-4 w-4" />,
          () => exec("underline"),
          "Garis bawah"
        )}
        {btn(
          <Heading2 className="h-4 w-4" />,
          () => formatBlock("h2"),
          "Judul 2"
        )}
        {btn(
          <Heading3 className="h-4 w-4" />,
          () => formatBlock("h3"),
          "Judul 3"
        )}
        {btn(
          <List className="h-4 w-4" />,
          () => exec("insertUnorderedList"),
          "List"
        )}
        {btn(
          <ListOrdered className="h-4 w-4" />,
          () => exec("insertOrderedList"),
          "List nomor"
        )}
        {btn(
          <Quote className="h-4 w-4" />,
          () => formatBlock("blockquote"),
          "Kutipan"
        )}
        {btn(<Link2 className="h-4 w-4" />, addLink, "Tautan")}
        {btn(
          <RemoveFormatting className="h-4 w-4" />,
          () => exec("removeFormat"),
          "Hapus format"
        )}
      </div>
      <div
        ref={ref}
        data-rte-editor
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        data-placeholder="Tulis isi artikel di sini..."
        className="article-editor min-h-[220px] px-3 py-2.5 text-sm leading-relaxed text-parchment outline-none"
      />
    </div>
  );
}
