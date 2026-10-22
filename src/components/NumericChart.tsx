import { useId } from 'react';
import { asDate, dateLabel, type Data, type Habit } from '../model';
import { compareNumeric, numericSeries } from '../insights';

const number = (n: number) => n.toLocaleString('nl-NL', { maximumFractionDigits: 2 });
export default function NumericChart({
  data,
  habit,
  start,
  end,
  today,
  period,
}: {
  data: Data;
  habit: Habit;
  start: string;
  end: string;
  today: string;
  period: 'week' | 'month';
}) {
  const id = useId();
  const series = numericSeries(data, habit, start, end, today);
  const units = [...new Set(series.flatMap((p) => (p.goal ? [p.goal.unit] : [])))];
  const comparison = compareNumeric(data, habit, start, end, today, period);
  const rangeLabel = (a: string, b: string) =>
    `${dateLabel(a, { day: 'numeric', month: 'short' })}–${dateLabel(b, { day: 'numeric', month: 'short' })}`;
  return (
    <div className="numeric-insight">
      {units.map((unit, unitIndex) => {
        const points = series.map((p) =>
          p.goal?.unit === unit ? p : { ...p, value: null, goal: undefined },
        );
        const values = points.filter((p) => p.value !== null);
        const highest = Math.max(1, ...points.flatMap((p) => [p.value ?? 0, p.goal?.target ?? 0]));
        const ceiling = Math.ceil(highest * 1.15);
        const x = (i: number) => 34 + (i * 276) / Math.max(points.length - 1, 1);
        const y = (v: number) => 116 - (v / ceiling) * 94;
        const labelId = `${id}-${unitIndex}`;
        return (
          <figure className="numeric-chart" key={unit}>
            <figcaption id={labelId}>
              <strong>Verloop in {unit}</strong>
              <span>
                {values.length} geregistreerde {values.length === 1 ? 'dag' : 'dagen'}
              </span>
            </figcaption>
            <svg
              viewBox="0 0 330 148"
              role="img"
              aria-labelledby={labelId}
              aria-describedby={`${labelId}-note`}
            >
              {[0, ceiling].map((tick) => (
                <g key={tick}>
                  <line className="chart-gridline" x1="34" x2="310" y1={y(tick)} y2={y(tick)} />
                  <text x="28" y={y(tick) + 4} textAnchor="end">
                    {tick.toLocaleString('nl-NL', {
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    })}
                  </text>
                </g>
              ))}
              {points.map((point, i) => {
                const prev = points[i - 1];
                return (
                  <g key={point.day}>
                    {point.goal && (
                      <path
                        className="chart-target"
                        d={`M${i ? (x(i - 1) + x(i)) / 2 : x(i)},${y(point.goal.target)}H${i === points.length - 1 ? x(i) : (x(i) + x(i + 1)) / 2}`}
                      />
                    )}
                    {point.value !== null && (
                      <>
                        {prev?.value !== null && prev?.value !== undefined && (
                          <line
                            className="chart-line"
                            x1={x(i - 1)}
                            y1={y(prev.value)}
                            x2={x(i)}
                            y2={y(point.value)}
                          />
                        )}
                        <circle
                          className={`chart-point ${point.day === today ? 'provisional' : ''}`}
                          cx={x(i)}
                          cy={y(point.value)}
                          r="3.5"
                        >
                          <title>
                            {dateLabel(point.day)}: {number(point.value)} {unit}; doel{' '}
                            {point.goal?.target}
                          </title>
                        </circle>
                      </>
                    )}
                    {(i === 0 || i === points.length - 1 || points.length <= 7 || i % 7 === 0) && (
                      <text x={x(i)} y="139" textAnchor="middle">
                        {asDate(point.day).getDate()}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            <p className="chart-note" id={`${labelId}-note`}>
              <span className="chart-key" /> Doelgrens ·{' '}
              {values.length
                ? 'Gaten zijn dagen zonder waarde.'
                : 'Nog geen waarden geregistreerd.'}{' '}
              {values.some((p) => p.day === today) && 'Vandaag kan nog veranderen.'}
            </p>
            {values.length > 0 && (
              <details className="chart-values">
                <summary>Waarden en doelen bekijken</summary>
                <table>
                  <caption className="sr-only">
                    Registraties in {unit} voor {habit.name}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Dag</th>
                      <th scope="col">Waarde</th>
                      <th scope="col">Doelgrens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {values.map((p) => (
                      <tr key={p.day}>
                        <th scope="row">{dateLabel(p.day)}</th>
                        <td>{number(p.value!)}</td>
                        <td>
                          {p.goal?.kind === 'minimum' ? '≥' : '≤'} {number(p.goal!.target)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            )}
          </figure>
        );
      })}
      <p className="period-comparison">
        {comparison.delta !== null ? (
          <>
            <strong>
              {comparison.delta === 0
                ? 'Gemiddeld gelijk'
                : `Gemiddeld ${number(Math.abs(comparison.delta))} ${comparison.unit} ${comparison.delta < 0 ? 'minder' : 'meer'}`}
            </strong>
            <br />
            {rangeLabel(comparison.start, comparison.end)} tegenover{' '}
            {rangeLabel(comparison.previousStart, comparison.previousEnd)} ·{' '}
            {comparison.currentCount} en {comparison.previousCount} geregistreerde dagen. Alleen
            verstreken dagen; ontbrekende invoer telt niet als nul.
          </>
        ) : comparison.reason === 'changed' ? (
          'Doel, eenheid of planning gewijzigd; deze perioden zijn niet goed vergelijkbaar.'
        ) : (
          'Nog onvoldoende informatie voor een betrouwbare vergelijking. Hiervoor zijn in beide perioden minstens 3 geregistreerde, verstreken dagen nodig en invoer op minstens de helft van de geplande dagen.'
        )}
      </p>
    </div>
  );
}
