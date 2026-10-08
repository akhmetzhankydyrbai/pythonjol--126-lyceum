import React, { useRef, useState, useEffect } from 'react';
import {
  Copy,
  RotateCcw,
  Check,
  Play,
  Terminal,
  Maximize2,
  Minimize2,
  AlertCircle,
  Sparkles,
  Code2,
} from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  onRun?: () => void;
  onReset?: () => void;
  isRunning?: boolean;
  errorLine?: number;
  errorMessage?: string;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

// Built-in Python keywords
const PYTHON_KEYWORDS = [
  'and',
  'as',
  'assert',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'False',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'None',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'True',
  'try',
  'while',
  'with',
  'yield',
];

// Built-in Python functions
const PYTHON_BUILTINS = [
  'abs',
  'all',
  'any',
  'bin',
  'bool',
  'chr',
  'dict',
  'dir',
  'divmod',
  'enumerate',
  'filter',
  'float',
  'format',
  'help',
  'hex',
  'input',
  'int',
  'isinstance',
  'issubclass',
  'iter',
  'len',
  'list',
  'map',
  'max',
  'min',
  'next',
  'oct',
  'open',
  'ord',
  'pow',
  'print',
  'range',
  'reversed',
  'round',
  'set',
  'slice',
  'sorted',
  'str',
  'sum',
  'tuple',
  'type',
  'zip',
];

// Common Python methods
const PYTHON_METHODS = [
  'append',
  'capitalize',
  'clear',
  'copy',
  'count',
  'endswith',
  'extend',
  'find',
  'get',
  'index',
  'insert',
  'isalnum',
  'isalpha',
  'isdigit',
  'islower',
  'isupper',
  'items',
  'join',
  'keys',
  'lower',
  'pop',
  'remove',
  'replace',
  'reverse',
  'sort',
  'split',
  'splitlines',
  'startswith',
  'strip',
  'title',
  'upper',
  'values',
  // math / random methods
  'sqrt',
  'ceil',
  'floor',
  'randint',
  'choice',
  'shuffle',
];

interface Suggestion {
  name: string;
  type: 'function' | 'keyword' | 'method';
  detail: string;
}

// Tokenizer for Python syntax highlighting
interface Token {
  text: string;
  className: string;
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    // 1. Comments
    if (line[i] === '#') {
      tokens.push({ text: line.slice(i), className: 'text-slate-500 italic' });
      break;
    }

    // 2. Whitespace
    if (/\s/.test(line[i])) {
      let ws = '';
      while (i < len && /\s/.test(line[i])) {
        ws += line[i];
        i++;
      }
      tokens.push({ text: ws, className: '' });
      continue;
    }

    // 3. String literals (single or double quotes)
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let str = quote;
      i++;
      let escaped = false;
      while (i < len) {
        const ch = line[i];
        str += ch;
        if (!escaped && ch === quote) {
          i++;
          break;
        }
        if (ch === '\\' && !escaped) {
          escaped = true;
        } else {
          escaped = false;
        }
        i++;
      }
      tokens.push({ text: str, className: 'text-emerald-400 font-medium' });
      continue;
    }

    // 4. Numbers
    if (/[0-9]/.test(line[i])) {
      let num = '';
      while (i < len && /[0-9.]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ text: num, className: 'text-amber-400 font-medium' });
      continue;
    }

    // 5. Identifiers, functions, keywords, variables
    if (/[a-zA-Z_\u0400-\u04FF]/.test(line[i])) {
      let word = '';
      while (i < len && /[a-zA-Z0-9_\u0400-\u04FF]/.test(line[i])) {
        word += line[i];
        i++;
      }

      // Check if followed by '(' (ignoring spaces) -> Function call
      let j = i;
      while (j < len && /\s/.test(line[j])) j++;
      const isCall = j < len && line[j] === '(';

      // Loops, control flow & definitions (Pink/Magenta)
      if (
        /^(for|while|if|elif|else|break|continue|return|def|class|yield|pass|try|except|finally|raise|with|as)$/.test(
          word
        )
      ) {
        tokens.push({ text: word, className: 'text-pink-400 font-bold' });
      }
      // Built-in functions & function calls (Blue)
      else if (
        /^(print|input|int|float|str|bool|len|range|list|tuple|set|dict|max|min|sum|abs|round|sorted|enumerate|zip|type|help|map|filter|bin|oct|hex|chr|ord|pow|reversed|all|any)$/.test(
          word
        ) ||
        isCall
      ) {
        tokens.push({ text: word, className: 'text-blue-400 font-semibold' });
      }
      // Logical keywords (Purple)
      else if (/^(and|or|not|in|is|import|from|global|lambda)$/.test(word)) {
        tokens.push({ text: word, className: 'text-purple-400 font-medium' });
      }
      // Booleans & None (Violet)
      else if (/^(True|False|None)$/.test(word)) {
        tokens.push({ text: word, className: 'text-violet-400 font-semibold' });
      }
      // Variables, array/tuple names, identifiers (White)
      else {
        tokens.push({ text: word, className: 'text-slate-100 font-normal' });
      }
      continue;
    }

    // 6. Operators
    const twoChars = line.slice(i, i + 2);
    if (/^(==|!=|<=|>=|\+=|-=|\*=|\/=|%=|\*\*|\/\/)/.test(twoChars)) {
      tokens.push({ text: twoChars, className: 'text-sky-300' });
      i += 2;
      continue;
    }
    if (/^[+\-*/%=<>!&|^~]/.test(line[i])) {
      tokens.push({ text: line[i], className: 'text-sky-300' });
      i++;
      continue;
    }

    // 7. Brackets, tuples, lists, dictionary braces (Slate-200 / White)
    if (/^[()[\]{}]/.test(line[i])) {
      tokens.push({ text: line[i], className: 'text-slate-200 font-medium' });
      i++;
      continue;
    }

    // 8. Punctuation
    if (/^[,:.]/.test(line[i])) {
      tokens.push({ text: line[i], className: 'text-slate-400' });
      i++;
      continue;
    }

    // Default character
    tokens.push({ text: line[i], className: 'text-slate-200' });
    i++;
  }

  return tokens;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  onRun,
  onReset,
  isRunning = false,
  errorLine,
  errorMessage,
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [replacePrefix, setReplacePrefix] = useState<{ start: number; end: number; prefix: string }>({
    start: 0,
    end: 0,
    prefix: '',
  });

  // Accurate line count matching code
  const lines = value.split('\n');
  const lineCount = lines.length;

  // Sync gutter and backdrop scroll with textarea
  const handleScroll = () => {
    if (textareaRef.current) {
      if (gutterRef.current) {
        gutterRef.current.scrollTop = textareaRef.current.scrollTop;
      }
      if (backdropRef.current) {
        backdropRef.current.scrollTop = textareaRef.current.scrollTop;
        backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
    }
  };

  // Synchronize backdrop scroll whenever value changes
  useEffect(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [value]);

  // Update cursor position and calculate autocomplete
  const updateCursorAndSuggestions = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = textarea.selectionStart;
    const textBefore = value.substring(0, pos);
    const lineNum = textBefore.split('\n').length;
    const currentLineText = textBefore.split('\n').pop() || '';
    const colNum = currentLineText.length + 1;

    setCursorPos({ line: lineNum, col: colNum });

    // Calculate suggestions if not selecting text
    if (textarea.selectionStart !== textarea.selectionEnd) {
      setSuggestions([]);
      return;
    }

    // Check for dot method call: e.g. "text." or "nums.ap"
    const methodMatch = textBefore.match(/\.([a-zA-Z_][a-zA-Z0-9_]*)?$/);
    if (methodMatch) {
      const prefix = methodMatch[1] || '';
      const matchedMethods = PYTHON_METHODS.filter((m) =>
        m.toLowerCase().startsWith(prefix.toLowerCase())
      )
        .slice(0, 6)
        .map((m) => ({
          name: m,
          type: 'method' as const,
          detail: 'метод',
        }));

      if (matchedMethods.length > 0) {
        setSuggestions(matchedMethods);
        setSelectedIdx(0);
        const prefixStart = pos - prefix.length;
        setReplacePrefix({ start: prefixStart, end: pos, prefix });

        // Position popup near cursor line
        const top = Math.min((lineNum - 1) * 24 + 32, (textarea.clientHeight || 300) - 160);
        const left = Math.min(Math.max(colNum * 8.2 + 20, 48), (textarea.clientWidth || 400) - 200);
        setPopupPos({ top, left });
        return;
      }
    }

    // Check for standard identifier word: min length 1 (e.g. "pr", "in", "ra", "le")
    const wordMatch = textBefore.match(/([a-zA-Z_][a-zA-Z0-9_]*)$/);
    if (wordMatch) {
      const prefix = wordMatch[1];
      if (prefix.length >= 1) {
        const fnMatches = PYTHON_BUILTINS.filter(
          (b) => b.toLowerCase().startsWith(prefix.toLowerCase())
        ).map((b) => ({
          name: b,
          type: 'function' as const,
          detail: 'функция',
        }));

        const kwMatches = PYTHON_KEYWORDS.filter(
          (k) => k.toLowerCase().startsWith(prefix.toLowerCase())
        ).map((k) => ({
          name: k,
          type: 'keyword' as const,
          detail: 'кілт сөз',
        }));

        const combined = [...fnMatches, ...kwMatches].slice(0, 7);

        // Don't show if only 1 exact match that is identical to what's already typed
        if (combined.length > 0 && !(combined.length === 1 && combined[0].name === prefix)) {
          setSuggestions(combined);
          setSelectedIdx(0);
          const prefixStart = pos - prefix.length;
          setReplacePrefix({ start: prefixStart, end: pos, prefix });

          const top = Math.min((lineNum - 1) * 24 + 32, (textarea.clientHeight || 300) - 160);
          const left = Math.min(Math.max(colNum * 8.2 + 20, 48), (textarea.clientWidth || 400) - 200);
          setPopupPos({ top, left });
          return;
        }
      }
    }

    // Otherwise dismiss suggestions
    setSuggestions([]);
  };

  // Insert chosen autocomplete suggestion
  const applySuggestion = (sug: Suggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const newValue =
      value.substring(0, replacePrefix.start) +
      sug.name +
      value.substring(replacePrefix.end);

    onChange(newValue);
    setSuggestions([]);

    const newCursor = replacePrefix.start + sug.name.length;
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = newCursor;
      updateCursorAndSuggestions();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 1. Run shortcut: Ctrl+Enter / Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      setSuggestions([]);
      if (onRun && !isRunning) {
        onRun();
      }
      return;
    }

    // 2. Autocomplete navigation when suggestions popup is open
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        applySuggestion(suggestions[selectedIdx]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSuggestions([]);
        return;
      }
    }

    // 3. Tab and Shift+Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();

      if (e.shiftKey) {
        // Shift+Tab: Unindent current line or multiline selection
        const linesBefore = value.substring(0, start).split('\n');
        const startLineIndex = linesBefore.length - 1;
        const linesAfter = value.substring(0, end).split('\n');
        const endLineIndex = linesAfter.length - 1;
        const allLines = value.split('\n');
        let removedCharsFirst = 0;
        let totalRemoved = 0;

        for (let i = startLineIndex; i <= endLineIndex; i++) {
          const match = allLines[i].match(/^( {1,4})/);
          if (match) {
            const count = match[1].length;
            allLines[i] = allLines[i].substring(count);
            if (i === startLineIndex) removedCharsFirst = count;
            totalRemoved += count;
          }
        }

        const newValue = allLines.join('\n');
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = Math.max(0, start - removedCharsFirst);
          textarea.selectionEnd = Math.max(0, end - totalRemoved);
          updateCursorAndSuggestions();
        }, 0);
        return;
      }

      // Tab alone: Insert 4 spaces (or indent selected lines)
      if (start === end) {
        const newValue = value.substring(0, start) + '    ' + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
          updateCursorAndSuggestions();
        }, 0);
      } else {
        const linesBefore = value.substring(0, start).split('\n');
        const startLineIndex = linesBefore.length - 1;
        const linesAfter = value.substring(0, end).split('\n');
        const endLineIndex = linesAfter.length - 1;
        const allLines = value.split('\n');

        for (let i = startLineIndex; i <= endLineIndex; i++) {
          allLines[i] = '    ' + allLines[i];
        }

        const newValue = allLines.join('\n');
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = start + 4;
          textarea.selectionEnd = end + (endLineIndex - startLineIndex + 1) * 4;
          updateCursorAndSuggestions();
        }, 0);
      }
      return;
    }

    // 4. Enter: Smart Python Indentation
    if (e.key === 'Enter') {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLineBeforeCursor = value.substring(lineStart, start);
      const indentMatch = currentLineBeforeCursor.match(/^\s*/);
      let indent = indentMatch ? indentMatch[0] : '';

      // If line ends with colon (:), add 4 spaces
      if (currentLineBeforeCursor.trim().endsWith(':')) {
        indent += '    ';
      }

      e.preventDefault();
      const newValue = value.substring(0, start) + '\n' + indent + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
        updateCursorAndSuggestions();
      }, 0);
      return;
    }

    // 5. Auto-closing brackets & quotes
    const openPairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
    };

    const closeChars = [')', ']', '}', '"', "'"];

    // Overtyping: If next character is closing bracket or quote and user types it, step over
    if (closeChars.includes(e.key) && start === end && value[start] === e.key) {
      // Step over without inserting duplicate
      e.preventDefault();
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      updateCursorAndSuggestions();
      return;
    }

    // Auto-close open brackets / quotes
    if (openPairs[e.key]) {
      const closing = openPairs[e.key];

      // If text is selected: wrap selection
      if (start !== end) {
        e.preventDefault();
        const selected = value.substring(start, end);
        const newValue = value.substring(0, start) + e.key + selected + closing + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = end + 1;
          updateCursorAndSuggestions();
        }, 0);
        return;
      }

      // If typing quotes right after word letter (e.g. don't), allow normal character
      if ((e.key === "'" || e.key === '"') && start > 0 && /[a-zA-Z0-9]/.test(value[start - 1])) {
        // Allow default behavior
        return;
      }

      // Insert pair and place cursor in middle
      e.preventDefault();
      const newValue = value.substring(0, start) + e.key + closing + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        updateCursorAndSuggestions();
      }, 0);
      return;
    }

    // 6. Backspace: delete matching pairs or smart unindent
    if (e.key === 'Backspace' && start === end && start > 0) {
      const charBefore = value[start - 1];
      const charAfter = value[start];

      // Pair deletion: () [] {} "" ''
      if (
        (charBefore === '(' && charAfter === ')') ||
        (charBefore === '[' && charAfter === ']') ||
        (charBefore === '{' && charAfter === '}') ||
        (charBefore === '"' && charAfter === '"') ||
        (charBefore === "'" && charAfter === "'")
      ) {
        e.preventDefault();
        const newValue = value.substring(0, start - 1) + value.substring(start + 1);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1;
          updateCursorAndSuggestions();
        }, 0);
        return;
      }

      // Smart indent deletion: if line before cursor is only 4-space indent
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const textFromLineStart = value.substring(lineStart, start);
      if (textFromLineStart.length > 0 && /^ +$/.test(textFromLineStart)) {
        const toDelete = textFromLineStart.length % 4 === 0 ? 4 : textFromLineStart.length % 4;
        e.preventDefault();
        const newValue = value.substring(0, start - toDelete) + value.substring(start);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - toDelete;
          updateCursorAndSuggestions();
        }, 0);
        return;
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close suggestions if clicked outside
  useEffect(() => {
    const handleGlobalClick = () => setSuggestions([]);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div
      className={`flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-sm font-mono text-sm transition-all ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen' : ''
      }`}
    >
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 font-medium text-slate-300">solution.py</span>
          <span className="text-[11px] text-slate-500">Python 3 (Автожабу + Tab)</span>
        </div>

        <div className="flex items-center gap-2">
          {onRun && (
            <button
              onClick={onRun}
              disabled={isRunning}
              title="Кодты іске қосу (Ctrl + Enter)"
              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>{isRunning ? 'Орындалуда...' : 'Іске қосу'}</span>
              <span className="hidden sm:inline text-[9px] bg-emerald-700/80 px-1 rounded font-mono">
                Ctrl+↵
              </span>
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              title="Бастапқы кодқа қайтару"
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Кодты көшіріп алу"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              title={isFullScreen ? 'Экраннан шығу (Esc / F11)' : 'Толық экранға шығару'}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isFullScreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Editor Body with Synchronized Gutter and Scroll */}
      <div
        className={`relative flex flex-1 overflow-hidden ${
          isFullScreen ? 'h-[calc(100vh-80px)]' : 'min-h-[340px] max-h-[520px]'
        }`}
      >
        {/* Dynamic Line Numbers Gutter: Starts at 1, grows dynamically with every Enter */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="w-12 py-3 bg-slate-950 text-slate-600 select-none text-right pr-3 shrink-0 font-mono text-xs border-r border-slate-900 overflow-hidden"
        >
          {Array.from({ length: lineCount }).map((_, idx) => {
            const currentLineNum = idx + 1;
            const isCurrentLine = cursorPos.line === currentLineNum;
            const isErrorLine = errorLine === currentLineNum;

            return (
              <div
                key={currentLineNum}
                className={`h-6 leading-6 transition-colors flex items-center justify-end gap-1 ${
                  isErrorLine
                    ? 'text-rose-400 font-bold bg-rose-950/40 -mr-3 pr-3'
                    : isCurrentLine
                    ? 'text-amber-400 font-semibold'
                    : ''
                }`}
              >
                {isErrorLine && <span className="text-[10px] text-rose-500 font-bold">!</span>}
                <span>{currentLineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Textarea Code Input with Synchronized Python Syntax Backdrop */}
        <div className="relative flex-1 h-full overflow-hidden bg-slate-950">
          {/* Synchronized Syntax-Highlighted Layer */}
          <pre
            ref={backdropRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full p-3 pointer-events-none font-mono text-xs sm:text-sm leading-6 overflow-hidden whitespace-pre z-0 bg-transparent"
          >
            {lines.map((lineText, lineIdx) => {
              const currentLineNum = lineIdx + 1;
              const isErrorLine = errorLine === currentLineNum;
              const lineTokens = tokenizeLine(lineText);

              return (
                <div
                  key={lineIdx}
                  className={`min-h-[24px] leading-6 ${
                    isErrorLine
                      ? 'bg-rose-950/40 -mx-3 px-3 border-l-2 border-rose-500 rounded-xs'
                      : ''
                  }`}
                >
                  {lineTokens.length === 0 ? (
                    <span>{'\u00A0'}</span>
                  ) : (
                    lineTokens.map((tok, tokIdx) => (
                      <span key={tokIdx} className={tok.className}>
                        {tok.text}
                      </span>
                    ))
                  )}
                </div>
              );
            })}
          </pre>

          {/* Interactive Transparent Textarea Overlay */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              updateCursorAndSuggestions();
            }}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCursorAndSuggestions}
            onClick={updateCursorAndSuggestions}
            placeholder="# Python кодын осында жазыңыз...&#10;print('Hello, Python!')"
            spellCheck={false}
            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-amber-400 p-3 outline-none resize-none font-mono text-xs sm:text-sm leading-6 dark-scrollbar selection:bg-amber-500/35 selection:text-transparent overflow-auto whitespace-pre z-10"
          />

          {/* Autocomplete Popup */}
          {suggestions.length > 0 && popupPos && (
            <div
              style={{
                top: `${popupPos.top}px`,
                left: `${popupPos.left}px`,
              }}
              className="absolute z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-1 w-56 text-xs text-slate-200 font-mono animate-in fade-in-50 duration-100"
            >
              <div className="px-2 py-1 text-[10px] text-slate-400 border-b border-slate-800 flex items-center justify-between uppercase tracking-wider">
                <span>Подсказка (Tab / Enter)</span>
                <span className="text-amber-400">↑↓</span>
              </div>
              <div className="mt-1 space-y-0.5 max-h-48 overflow-y-auto">
                {suggestions.map((sug, idx) => (
                  <button
                    key={sug.name}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applySuggestion(sug);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                      idx === selectedIdx
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-400'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{sug.name}</span>
                    <span
                      className={`text-[10px] px-1 rounded ${
                        sug.type === 'function'
                          ? 'bg-blue-900/60 text-blue-300'
                          : sug.type === 'keyword'
                          ? 'bg-purple-900/60 text-purple-300'
                          : 'bg-emerald-900/60 text-emerald-300'
                      }`}
                    >
                      {sug.detail}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline Error Notice if errorLine exists */}
      {errorLine && (
        <div className="bg-rose-950/80 border-t border-rose-800/80 px-4 py-2 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              {errorLine}-жолда қате: {errorMessage ? errorMessage.split('\n')[0] : 'Синтаксисті тексеріңіз'}
            </span>
          </div>
          <span className="text-[11px] text-rose-400">Жолды түзеңіз</span>
        </div>
      )}

      {/* Editor Footer Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>Жол: {cursorPos.line}, Баған: {cursorPos.col}</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-500">Барлығы: {lineCount} жол</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-500">Ctrl + Enter: Іске қосу</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 hidden sm:inline">Smart Indent: 4 spaces</span>
          <span className="text-emerald-400 font-medium">UTF-8</span>
        </div>
      </div>
    </div>
  );
};
