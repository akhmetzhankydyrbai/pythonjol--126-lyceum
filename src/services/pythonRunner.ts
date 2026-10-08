import { ExecutionResult } from '../types';

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    pyodideInstance?: any;
    pyodideLoadingPromise?: Promise<any>;
  }
}

/**
 * Extracts line number from Python traceback or error string.
 */
export function extractErrorLine(rawError: string): number | undefined {
  if (!rawError) return undefined;
  // Patterns: File "solution.py", line 3, or line 3, in ...
  const match = rawError.match(/line\s+(\d+)/i) || rawError.match(/(\d+)-жол/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num) && num > 0) return num;
  }
  return undefined;
}

/**
 * Translates standard Python error messages into friendly, encouraging Kazakh guidance.
 */
export function translatePythonError(rawError: string): {
  title: string;
  message: string;
  original: string;
  errorLine?: number;
} {
  const err = rawError || '';
  const errorLine = extractErrorLine(err);
  const lineNotice = errorLine ? `📍 Қате кодыңыздың ${errorLine}-жолында табылды.` : '';

  if (err.includes('SyntaxError')) {
    let hint = 'Python жазылған код құрылымын түсінбеді. Мүмкін тырнақшаны ("..."), жақшаны () жабуды немесе шарт/цикл соңындағы қос нүктені (:) ұмытқан боларсыз?';
    if (err.includes('unmatched') || err.includes('was never closed') || err.includes('closing parenthesis')) {
      hint = 'Жақша немесе тырнақша жабылмай қалған сияқты. Әрбір ашылған таңбаның жұбы бар екенін тексеріңіз.';
    }
    return {
      title: errorLine ? `❌ Синтаксистік қате (${errorLine}-жол)` : '❌ Синтаксистік қате (SyntaxError)',
      message: `${hint}${lineNotice ? '\n\n' + lineNotice : ''}`,
      original: err,
      errorLine,
    };
  }

  if (err.includes('IndentationError')) {
    return {
      title: errorLine ? `❌ Шегініс қатесі (${errorLine}-жол)` : '❌ Шегініс қатесі (IndentationError)',
      message: `Python-да шарттар (if, else), циклдер (for, while) және функциялар (def) ішіндегі кодтар оңға қарай шегінуі (Tab немесе 4 бос орын) керек.${lineNotice ? '\n\n' + lineNotice : ''}`,
      original: err,
      errorLine,
    };
  }

  if (err.includes('NameError')) {
    const match = err.match(/name '(\w+)' is not defined/);
    const varName = match ? `'${match[1]}'` : 'бұл атау';
    return {
      title: errorLine ? `❌ Атау қатесі (${errorLine}-жол)` : '❌ Атау қатесі (NameError)',
      message: `Python ${varName} деген айнымалыны немесе команданы тани алмады. Мүмкін сөз қате жазылған немесе айнымалы әлі құрылмаған шығар? Мысалы: prnt емес print болуы керек.${lineNotice ? '\n\n' + lineNotice : ''}`,
      original: err,
      errorLine,
    };
  }

  if (err.includes('TypeError')) {
    let hint = 'Python екі түрлі дерек типін бірге қоса не өңдей алмай жатыр.';
    if (err.includes('can only concatenate str') || err.includes('unsupported operand type(s)')) {
      hint = 'Мүмкін сіз input() арқылы алынған мәтінді санға айналдырмаған шығарсыз? input() әрдайым мәтін қайтарады. Оны санға айналдыру үшін int(input()) деп жазыңыз.';
    }
    return {
      title: errorLine ? `❌ Дерек типі қатесі (${errorLine}-жол)` : '❌ Дерек типі қатесі (TypeError)',
      message: `${hint}${lineNotice ? '\n\n' + lineNotice : ''}`,
      original: err,
      errorLine,
    };
  }

  if (err.includes('ValueError')) {
    return {
      title: errorLine ? `❌ Мән қатесі (${errorLine}-жол)` : '❌ Мән қатесі (ValueError)',
      message: `Функцияға сәйкес келмейтін мән берілді. Мысалы, әріптерден тұратын сөзді int("сөз") арқылы санға түрлендіруге болмайды.${lineNotice ? '\n\n' + lineNotice : ''}`,
      original: err,
      errorLine,
    };
  }

  if (err.includes('ZeroDivisionError')) {
    return {
      title: errorLine ? `❌ Нөлге бөлу қатесі (${errorLine}-жол)` : '❌ Нөлге бөлу қатесі (ZeroDivisionError)',
      message: `Математикада санды нөлге бөлуге болмайды! Бөлгіштің нөл болып қалмауын тексеріңіз.${lineNotice ? '\n\n' + lineNotice : ''}`,
      original: err,
      errorLine,
    };
  }

  if (err.includes('IndexError')) {
    return {
      title: errorLine ? `❌ Индекс қатесі (${errorLine}-жол)` : '❌ Индекс қатесі (IndexError)',
      message: `Тізімнің немесе жолдың шегінен тыс элементті іздеп жатырсыз. Мысалы, 3 элементі бар тізімде индекстер тек 0, 1, 2 болады (3-индекс жоқ).${lineNotice ? '\n\n' + lineNotice : ''}`,
      original: err,
      errorLine,
    };
  }

  if (err.includes('KeyError')) {
    return {
      title: errorLine ? `❌ Сөздік кілті қатесі (${errorLine}-жол)` : '❌ Сөздік кілті қатесі (KeyError)',
      message: `Сөздікте мұндай кілт жоқ. Керекті кілттің сөздікке енгізілгеніне көз жеткізіңіз.${lineNotice ? '\n\n' + lineNotice : ''}`,
      original: err,
      errorLine,
    };
  }

  if (err.includes('TimeoutError') || err.includes('Уақыт шегі')) {
    return {
      title: '⏱️ Уақыт шегі асты (Шексіз цикл)',
      message: 'Код белгіленген уақытта орындалып бітпеді. Мүмкін while немесе for циклінде шарт ешқашан аяқталмайтын шексіз циклге түсіп қалған шығарсыз?',
      original: err,
      errorLine,
    };
  }

  return {
    title: errorLine ? `⚠️ Бағдарлама қатесі (${errorLine}-жол)` : '⚠️ Бағдарлама қатесі',
    message: `Кодты орындау кезінде қате туындады. Төмендегі хабарламаға назар аударыңыз.${lineNotice ? '\n\n' + lineNotice : ''}`,
    original: err,
    errorLine,
  };
}

/**
 * Loads Pyodide dynamically from CDN.
 */
let pyodideLoadPromise: Promise<any> | null = null;

export async function getPyodide(): Promise<any> {
  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }
  if (pyodideLoadPromise) {
    return pyodideLoadPromise;
  }

  pyodideLoadPromise = new Promise(async (resolve, reject) => {
    try {
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.crossOrigin = 'anonymous';
        const loadScript = new Promise((res, rej) => {
          script.onload = res;
          script.onerror = () => rej(new Error('Pyodide скрипті жүктелмеді'));
        });
        document.head.appendChild(script);
        await loadScript;
      }

      if (window.loadPyodide) {
        const py = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
        });
        window.pyodideInstance = py;
        resolve(py);
      } else {
        reject(new Error('loadPyodide функциясы табылмады'));
      }
    } catch (err) {
      console.warn('Pyodide CDN initialization fallback:', err);
      reject(err);
    }
  });

  return pyodideLoadPromise;
}

/**
 * Lightweight instant fallback interpreter for beginner programs if Pyodide CDN is slow or offline.
 */
function runFallbackInterpreter(code: string, stdin: string): ExecutionResult {
  const startTime = performance.now();
  const outputs: string[] = [];
  const lines = stdin.split('\n');
  let lineIdx = 0;

  const mockInput = () => {
    if (lineIdx < lines.length) {
      return lines[lineIdx++];
    }
    return '';
  };

  try {
    // Check for dangerous operations
    if (code.includes('import os') || code.includes('__import__') || code.includes('open(')) {
      throw new Error('Қауіпсіздік шектеуі: жүйелік файлдарға рұқсат жоқ.');
    }

    // Clean execution of standard simple print and expressions
    const trimmed = code.trim();
    const printMatch = trimmed.match(/^print\((.*)\)$/s);

    if (printMatch) {
      const inner = printMatch[1].trim();
      // Simple string literal check
      if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
        const unquoted = inner.slice(1, -1).replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
        outputs.push(unquoted);
        return {
          stdout: outputs.join('\n'),
          stderr: '',
          success: true,
          executionTimeMs: Math.round(performance.now() - startTime),
        };
      }
    }

    // Default error indicating waiting for full pyodide engine
    throw new Error('Python орындау ортасы іске қосылуда...');
  } catch (err: any) {
    const raw = err?.message || String(err);
    const friendly = translatePythonError(raw);
    return {
      stdout: outputs.join('\n'),
      stderr: raw,
      error: raw,
      friendlyError: `${friendly.title}\n${friendly.message}`,
      success: false,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }
}

/**
 * Executes Python code safely with stdin feeding and infinite loop timeout cutoff.
 */
export async function executePythonCode(
  code: string,
  stdin: string = '',
  timeoutMs: number = 4000
): Promise<ExecutionResult> {
  const startTime = performance.now();

  try {
    // Race against timeout
    const pyodidePromise = getPyodide();

    const pyodide = await Promise.race([
      pyodidePromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Python модулін жүктеу уақыты аяқталды')), 12000)
      ),
    ]);

    // Setup input lines as JSON in Python
    const inputLines = stdin.split('\n');
    const inputLinesJson = JSON.stringify(inputLines);
    const codeJson = JSON.stringify(code);

    // Python wrapper script with custom stdin and stdout capture
    const pythonWrapper = `
import sys
import io
import json

_captured_stdout = io.StringIO()
_captured_stderr = io.StringIO()
sys.stdout = _captured_stdout
sys.stderr = _captured_stderr

_raw_inputs = json.loads('''${inputLinesJson.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}''')
_input_idx = 0

def _custom_input(prompt=''):
    global _input_idx
    if _input_idx < len(_raw_inputs):
        val = _raw_inputs[_input_idx]
        _input_idx += 1
        return str(val)
    return ''

__builtins__.input = _custom_input

# Clean global namespace for user execution
_user_globals = {
    '__builtins__': __builtins__,
    '__name__': '__main__',
}

_user_code_str = json.loads('''${codeJson.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}''')

try:
    _compiled = compile(_user_code_str, 'solution.py', 'exec')
    exec(_compiled, _user_globals)
except BaseException as _e:
    import traceback
    traceback.print_exc(file=_captured_stderr)

_out_result = _captured_stdout.getvalue()
_err_result = _captured_stderr.getvalue()
(_out_result, _err_result)
`;

    // Execute wrapped code with execution timeout
    const executionPromise = pyodide.runPythonAsync(pythonWrapper);

    const result = await Promise.race([
      executionPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TimeoutError: Кодтың орындалу уақыты 4 секундтан асып кетті')), timeoutMs)
      ),
    ]);

    const stdout = (result.get ? result.get(0) : result[0]) || '';
    const stderr = (result.get ? result.get(1) : result[1]) || '';

    const executionTimeMs = Math.round(performance.now() - startTime);

    if (stderr && stderr.trim().length > 0) {
      const friendly = translatePythonError(stderr);
      return {
        stdout: stdout.trimEnd(),
        stderr: stderr.trimEnd(),
        error: stderr.trimEnd(),
        friendlyError: `${friendly.title}\n\n${friendly.message}`,
        errorLine: friendly.errorLine,
        executionTimeMs,
        success: false,
      };
    }

    return {
      stdout: stdout.trimEnd(),
      stderr: '',
      executionTimeMs,
      success: true,
    };
  } catch (error: any) {
    const rawError = error?.message || String(error);

    // If Pyodide CDN failed or timeout occurred, try fallback interpreter for simple tasks
    if (!rawError.includes('TimeoutError') && rawError.includes('Pyodide')) {
      return runFallbackInterpreter(code, stdin);
    }

    const friendly = translatePythonError(rawError);
    return {
      stdout: '',
      stderr: rawError,
      error: rawError,
      friendlyError: `${friendly.title}\n\n${friendly.message}`,
      errorLine: friendly.errorLine,
      executionTimeMs: Math.round(performance.now() - startTime),
      success: false,
    };
  }
}
