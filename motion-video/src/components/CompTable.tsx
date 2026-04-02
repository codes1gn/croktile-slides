import {Layout, Rect, Txt} from '@motion-canvas/2d';
import {sequence, Reference} from '@motion-canvas/core';
import {Colors, Fonts} from '../theme';

export interface TableRow {
  cells: string[];
}

export function* animateTable(
  container: Reference<Layout>,
  headers: string[],
  rows: TableRow[],
  colWidths: number[],
  duration: number = 0.4,
) {
  const headerRow = (
    <Layout direction="row" gap={0}>
      {headers.map((h, i) => (
        <Rect
          width={colWidths[i]}
          height={36}
          fill={Colors.mint500 + '15'}
          justifyContent="center"
          alignItems="center"
          stroke={Colors.mint500 + '40'}
          lineWidth={1}
        >
          <Txt
            text={h}
            fill={Colors.mint700}
            fontFamily={Fonts.main}
            fontSize={14}
            fontWeight={700}
          />
        </Rect>
      ))}
    </Layout>
  );

  container().add(headerRow);

  const rowNodes: Layout[] = [];

  for (const row of rows) {
    const rowNode = (
      <Layout direction="row" gap={0} opacity={0}>
        {row.cells.map((cell, i) => (
          <Rect
            width={colWidths[i]}
            height={32}
            fill={Colors.surface}
            justifyContent="center"
            alignItems="center"
            stroke={Colors.border}
            lineWidth={0.5}
          >
            <Txt
              text={cell}
              fill={
                cell === '✓'
                  ? Colors.mint500
                  : cell === '—'
                    ? Colors.fgDim
                    : Colors.fg
              }
              fontFamily={i === 0 ? Fonts.main : Fonts.mono}
              fontSize={13}
              fontWeight={cell === '✓' || i === 0 ? 700 : 400}
            />
          </Rect>
        ))}
      </Layout>
    ) as Layout;

    container().add(rowNode);
    rowNodes.push(rowNode);
  }

  yield* sequence(
    0.12,
    ...rowNodes.map(r => r.opacity(1, duration)),
  );
}
