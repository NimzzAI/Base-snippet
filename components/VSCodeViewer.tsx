"use client";
import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { toast } from "./ToastProvider";

// ============================================================
//  AUTHENTIC VS CODE DARK+ THEME (Zero dynamic network chunks)
// ============================================================
const vscDarkPlusTheme: { [key: string]: React.CSSProperties } = {
  'pre[class*="language-"]': {
    color: "#d4d4d4",
    fontSize: "13px",
    textShadow: "none",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, Monaco, monospace",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    lineHeight: "1.65",
    MozTabSize: "2",
    OTabSize: "2",
    tabSize: 2,
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    padding: "14px 12px",
    margin: 0,
    overflow: "auto",
    background: "#181818",
  },
  'code[class*="language-"]': {
    color: "#d4d4d4",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, Monaco, monospace",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    lineHeight: "1.65",
    MozTabSize: "2",
    OTabSize: "2",
    tabSize: 2,
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    background: "transparent",
  },
  comment: { color: "#6a9955", fontStyle: "italic" },
  prolog: { color: "#6a9955" },
  doctype: { color: "#6a9955" },
  cdata: { color: "#6a9955" },
  punctuation: { color: "#d4d4d4" },
  property: { color: "#9cdcfe" },
  tag: { color: "#569cd6" },
  boolean: { color: "#569cd6" },
  number: { color: "#b5cea8" },
  constant: { color: "#4ec9b0" },
  symbol: { color: "#b5cea8" },
  deleted: { color: "#f44747" },
  selector: { color: "#d7ba7d" },
  "attr-name": { color: "#9cdcfe" },
  string: { color: "#ce9178" },
  char: { color: "#ce9178" },
  builtin: { color: "#4ec9b0" },
  inserted: { color: "#b5cea8" },
  operator: { color: "#d4d4d4" },
  entity: { color: "#569cd6", cursor: "help" },
  url: { color: "#9cdcfe" },
  ".language-css .token.string": { color: "#ce9178" },
  ".style .token.string": { color: "#ce9178" },
  variable: { color: "#9cdcfe" },
  atrule: { color: "#c586c0" },
  "attr-value": { color: "#ce9178" },
  function: { color: "#dcdcaa" },
  "class-name": { color: "#4ec9b0" },
  keyword: { color: "#c586c0" },
  regex: { color: "#d16969" },
  important: { color: "#569cd6", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};

interface VSCodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
  maxHeight?: string;
  showTabs?: boolean;
  showStatusBar?: boolean;
  showActions?: boolean;
  onRawClick?: () => void;
  onDownloadClick?: () => void;
}

function getLangIcon(lang: string = ""): { icon: string; color: string; label: string; ext: string } {
  const l = (lang || "").toLowerCase().trim();
  if (l.includes("javascript") || l === "js") return { icon: "fa-brands fa-js", color: "#F7DF1E", label: "JavaScript", ext: "js" };
  if (l.includes("typescript") || l === "ts") return { icon: "fa-solid fa-code", color: "#3178C6", label: "TypeScript", ext: "ts" };
  if (l.includes("python") || l === "py") return { icon: "fa-brands fa-python", color: "#3776AB", label: "Python", ext: "py" };
  if (l.includes("html")) return { icon: "fa-brands fa-html5", color: "#E34F26", label: "HTML", ext: "html" };
  if (l.includes("css") || l.includes("sass") || l.includes("scss")) return { icon: "fa-brands fa-css3-alt", color: "#1572B6", label: "CSS", ext: "css" };
  if (l.includes("php")) return { icon: "fa-brands fa-php", color: "#777BB4", label: "PHP", ext: "php" };
  if (l.includes("go")) return { icon: "fa-solid fa-cube", color: "#00ADD8", label: "Go", ext: "go" };
  if (l.includes("rust")) return { icon: "fa-solid fa-gear", color: "#DEA584", label: "Rust", ext: "rs" };
  if (l.includes("json")) return { icon: "fa-solid fa-brackets-curly", color: "#CBCB41", label: "JSON", ext: "json" };
  if (l.includes("bash") || l.includes("sh") || l.includes("shell")) return { icon: "fa-solid fa-terminal", color: "#4EAA25", label: "Bash", ext: "sh" };
  if (l.includes("sql")) return { icon: "fa-solid fa-database", color: "#00758F", label: "SQL", ext: "sql" };
  if (l.includes("react") || l === "jsx" || l === "tsx") return { icon: "fa-brands fa-react", color: "#61DAFB", label: "React", ext: "tsx" };
  return { icon: "fa-solid fa-file-code", color: "#f59e0b", label: lang || "Code", ext: "txt" };
}

function normalizePrismLang(lang: string = ""): string {
  const l = (lang || "").toLowerCase().trim();
  if (l.includes("typescript") || l === "ts") return "typescript";
  if (l.includes("javascript") || l === "js") return "javascript";
  if (l.includes("python") || l === "py") return "python";
  if (l.includes("html")) return "html";
  if (l.includes("css")) return "css";
  if (l.includes("php")) return "php";
  if (l.includes("go")) return "go";
  if (l.includes("rust")) return "rust";
  if (l.includes("json")) return "json";
  if (l.includes("bash") || l.includes("sh")) return "bash";
  if (l.includes("sql")) return "sql";
  return "javascript";
}

export default function VSCodeViewer({
  code,
  language = "javascript",
  filename,
  maxHeight = "540px",
  showTabs = true,
  showStatusBar = true,
  showActions = true,
  onRawClick,
  onDownloadClick,
}: VSCodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-detect mobile screen to optimize gutter & default word-wrap
  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobile(mobile);
    };
    checkViewport();
    if (window.innerWidth <= 640) {
      setWordWrap(true);
    }
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const cleanCode = code || "// No code available";
  const lines = cleanCode.split("\n");
  const lineCount = lines.length;
  const langMeta = getLangIcon(language);
  const prismLang = normalizePrismLang(language);
  const displayFilename = filename || `main.${langMeta.ext}`;

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    toast("Kode berhasil disalin ke clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onDownloadClick) {
      onDownloadClick();
      return;
    }
    const blob = new Blob([cleanCode], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = displayFilename;
    a.click();
    toast(`Mengunduh ${displayFilename}`, "info");
  };

  const containerStyles: React.CSSProperties = isFullscreen
    ? {
        position: "fixed",
        inset: 0,
        zIndex: 10080,
        background: "#181818",
        border: "none",
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, Monaco, monospace",
      }
    : {
        background: "#181818",
        border: "2.5px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "var(--shadow)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, Monaco, monospace",
      };

  return (
    <div className="vscode-container" style={containerStyles}>
      {/* ── VS CODE TOPBAR ── */}
      <div
        style={{
          background: "#1E1E1E",
          borderBottom: "2px solid #282828",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 8px" : "0 12px",
          height: "42px",
          userSelect: "none",
          flexWrap: "nowrap",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Left: Window Controls & Active Tab */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 12, height: "100%", minWidth: 0, flex: 1 }}>
          {/* Mac-style Window Dots (Hidden on extra narrow screens to save space for filename) */}
          <div className="hidden-mobile-xs" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F56", border: "1px solid #E0443E", display: "inline-block" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFBD2E", border: "1px solid #DEA123", display: "inline-block" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#27C93F", border: "1px solid #1AAB29", display: "inline-block" }} />
          </div>

          {/* Active File Tab */}
          {showTabs && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#181818",
                borderTop: "2px solid #e26334",
                borderRight: "1px solid #282828",
                borderLeft: "1px solid #282828",
                padding: isMobile ? "0 9px" : "0 12px",
                height: "100%",
                color: "#E0E0E0",
                fontSize: isMobile ? "0.76rem" : "0.82rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
              }}
            >
              <i className={langMeta.icon} style={{ color: langMeta.color, fontSize: "0.9rem", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{displayFilename}</span>
            </div>
          )}
        </div>

        {/* Right: Quick VS Code Action Tools */}
        {showActions && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            {/* Word Wrap Toggle Button */}
            <button
              type="button"
              onClick={() => setWordWrap(!wordWrap)}
              title={wordWrap ? "Matikan Word Wrap (Scroll Horizontal)" : "Aktifkan Word Wrap"}
              style={{
                background: wordWrap ? "#e26334" : "#282828",
                color: "#FFF",
                border: "1px solid #3E3E3E",
                borderRadius: "6px",
                padding: "5px 8px",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <i className="fa-solid fa-text-width" />
              <span className="hidden-mobile-sm">{wordWrap ? "Wrap: On" : "Wrap"}</span>
            </button>

            {/* Fullscreen Toggle Button (Great for Mobile Code Reading) */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
              style={{
                background: isFullscreen ? "#f59e0b" : "#282828",
                color: isFullscreen ? "#000" : "#FFF",
                border: "1px solid #3E3E3E",
                borderRadius: "6px",
                padding: "5px 8px",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <i className={`fa-solid ${isFullscreen ? "fa-compress" : "fa-expand"}`} />
              <span className="hidden-mobile-sm">{isFullscreen ? "Tutup" : "Penuh"}</span>
            </button>

            {/* View Raw Button */}
            {onRawClick && (
              <button
                type="button"
                onClick={onRawClick}
                title="Lihat Raw Text"
                style={{
                  background: "#282828",
                  color: "#FFF",
                  border: "1px solid #3E3E3E",
                  borderRadius: "6px",
                  padding: "5px 8px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <i className="fa-solid fa-file-code" />
                <span className="hidden-mobile-sm">Raw</span>
              </button>
            )}

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              title="Download File"
              style={{
                background: "#282828",
                color: "#FFF",
                border: "1px solid #3E3E3E",
                borderRadius: "6px",
                padding: "5px 8px",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <i className="fa-solid fa-download" />
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              title="Salin Kode ke Clipboard"
              style={{
                background: copied ? "#27C93F" : "var(--yellow, #f59e0b)",
                color: "#000",
                border: "1.5px solid #000",
                borderRadius: "6px",
                padding: isMobile ? "5px 8px" : "4px 10px",
                fontSize: "0.74rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "2px 2px 0px #000",
                transition: "all 0.15s ease",
              }}
            >
              <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} />
              <span>{copied ? "Tersalin" : "Salin"}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Breadcrumb Bar ── */}
      <div
        style={{
          background: "#181818",
          borderBottom: "1px solid #222",
          padding: isMobile ? "4px 10px" : "4px 14px",
          fontSize: "0.72rem",
          color: "#858585",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, overflow: "hidden" }}>
          <span>src</span>
          <span>›</span>
          <span style={{ color: "#D4D4D4", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayFilename}
          </span>
        </div>
        <span style={{ fontSize: "0.68rem", color: "#6a9955", flexShrink: 0 }}>
          {wordWrap ? "Wrap: Aktif" : "Scroll: Horizontal"}
        </span>
      </div>

      {/* ── Editor Canvas (Synchronous Highlighting) ── */}
      <div
        style={{
          maxHeight: isFullscreen ? "none" : maxHeight,
          flex: isFullscreen ? 1 : undefined,
          overflowY: "auto",
          overflowX: "auto",
          background: "#181818",
          position: "relative",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <SyntaxHighlighter
          language={prismLang}
          style={vscDarkPlusTheme}
          wrapLongLines={wordWrap}
          showLineNumbers
          lineNumberStyle={{
            minWidth: isMobile ? "2.1em" : "3em",
            paddingRight: isMobile ? "0.65em" : "1.1em",
            color: "#5C6370",
            textAlign: "right",
            userSelect: "none",
            borderRight: "1px solid #282828",
            marginRight: isMobile ? "0.65em" : "1.1em",
            fontSize: isMobile ? "0.75rem" : "0.82rem",
          }}
          customStyle={{
            margin: 0,
            padding: isMobile ? "12px 10px" : "16px 14px",
            background: "#181818",
            fontSize: isMobile ? "0.78rem" : "0.85rem",
            lineHeight: 1.6,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, Monaco, monospace",
            color: "#D4D4D4",
          }}
        >
          {cleanCode}
        </SyntaxHighlighter>
      </div>

      {/* ── VS Code Bottom Status Bar ── */}
      {showStatusBar && (
        <div
          style={{
            background: "#2c4a3e",
            borderTop: "1.5px solid #181818",
            color: "#f7f3e8",
            fontSize: "0.7rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 10px",
            userSelect: "none",
            flexWrap: "nowrap",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* Left: Branch & Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <i className="fa-solid fa-code-branch" style={{ fontSize: "0.68rem", color: "#f59e0b" }} />
              <span>main</span>
            </span>
            <span className="hidden-mobile-sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: "0.68rem", color: "#27C93F" }} />
              <span>Ready</span>
            </span>
          </div>

          {/* Right: Line Count & Language */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span>{lineCount} baris</span>
            <span className="hidden-mobile-sm">UTF-8</span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(255, 255, 255, 0.14)",
                padding: "1px 6px",
                borderRadius: "4px",
              }}
            >
              <i className={langMeta.icon} style={{ fontSize: "0.72rem", color: "#f59e0b" }} />
              <span>{langMeta.label}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
