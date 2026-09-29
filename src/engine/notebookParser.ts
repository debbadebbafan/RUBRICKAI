import { NotebookCell } from '../types/project';

export interface ParsedNotebook {
  cells: NotebookCell[];
  metadata: Record<string, any>;
  kernelName: string;
  hasExecutionGaps: boolean;
  maxExecutionCount: number;
  outOfOrderCells: { cellIndex: number; count: number; expectedAfter: number }[];
  cellsWithErrors: number[];
}

export function parseNotebookContent(rawContent: string): ParsedNotebook {
  try {
    const data = JSON.parse(rawContent);
    const cellsRaw = Array.isArray(data.cells) ? data.cells : [];
    const metadata = data.metadata || {};
    const kernelName = metadata.kernelspec?.display_name || metadata.kernelspec?.name || 'Python 3';

    let lastExecutionCount = 0;
    const outOfOrderCells: { cellIndex: number; count: number; expectedAfter: number }[] = [];
    const cellsWithErrors: number[] = [];
    let maxExecutionCount = 0;

    const cells: NotebookCell[] = cellsRaw.map((cell: any, index: number) => {
      const cellType = cell.cell_type === 'markdown' ? 'markdown' : cell.cell_type === 'code' ? 'code' : 'raw';
      
      let source = '';
      if (Array.isArray(cell.source)) {
        source = cell.source.join('');
      } else if (typeof cell.source === 'string') {
        source = cell.source;
      }

      const executionCount = typeof cell.execution_count === 'number' ? cell.execution_count : null;
      if (executionCount !== null) {
        if (executionCount > maxExecutionCount) {
          maxExecutionCount = executionCount;
        }
        if (executionCount < lastExecutionCount && executionCount > 0) {
          outOfOrderCells.push({
            cellIndex: index + 1,
            count: executionCount,
            expectedAfter: lastExecutionCount,
          });
        }
        lastExecutionCount = executionCount;
      }

      const parsedOutputs: NotebookCell['outputs'] = [];
      let cellHasError = false;

      if (Array.isArray(cell.outputs)) {
        for (const out of cell.outputs) {
          if (out.output_type === 'error') {
            cellHasError = true;
            cellsWithErrors.push(index + 1);
            parsedOutputs.push({
              outputType: 'error',
              text: `${out.ename || 'Error'}: ${out.evalue || ''}`,
            });
          } else if (out.output_type === 'stream') {
            const streamText = Array.isArray(out.text) ? out.text.join('') : String(out.text || '');
            parsedOutputs.push({
              outputType: 'stream',
              text: streamText,
            });
          } else if (out.output_type === 'execute_result' || out.output_type === 'display_data') {
            const dataObj = out.data || {};
            let textOutput = '';
            if (dataObj['text/plain']) {
              textOutput = Array.isArray(dataObj['text/plain'])
                ? dataObj['text/plain'].join('')
                : String(dataObj['text/plain']);
            }
            let imageSrc: string | undefined;
            if (dataObj['image/png']) {
              imageSrc = `data:image/png;base64,${dataObj['image/png']}`;
            }

            parsedOutputs.push({
              outputType: out.output_type,
              text: textOutput,
              imageSrc,
              data: dataObj,
            });
          }
        }
      }

      return {
        cellIndex: index + 1,
        cellType,
        source,
        executionCount,
        outputs: parsedOutputs,
        hasErrors: cellHasError,
      };
    });

    return {
      cells,
      metadata,
      kernelName,
      hasExecutionGaps: outOfOrderCells.length > 0,
      maxExecutionCount,
      outOfOrderCells,
      cellsWithErrors,
    };
  } catch (err) {
    // Graceful fallback for non-JSON or corrupted file
    return {
      cells: [
        {
          cellIndex: 1,
          cellType: 'code',
          source: rawContent,
          executionCount: null,
          outputs: [],
          hasErrors: false,
        },
      ],
      metadata: {},
      kernelName: 'Plain Script',
      hasExecutionGaps: false,
      maxExecutionCount: 0,
      outOfOrderCells: [],
      cellsWithErrors: [],
    };
  }
}
