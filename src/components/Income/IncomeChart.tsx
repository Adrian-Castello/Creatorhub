import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PeriodBucket } from '../../lib/types'
import { useThemeContext } from '../../hooks/themeContext'
import { eur } from '../../lib/format'

interface Props {
  data: PeriodBucket[]
  previous?: PeriodBucket[] | null
}

export function IncomeChart({ data, previous }: Props) {
  const { isDark } = useThemeContext()
  const grid = isDark ? '#27272A' : '#E5E7EB'
  const axis = isDark ? '#A1A1AA' : '#6B7280'

  const merged = data.map((d, i) => ({
    bucket: d.bucket,
    gmv: d.gmv,
    commission: d.commission,
    prevGmv: previous?.[i]?.gmv ?? null,
    prevCommission: previous?.[i]?.commission ?? null,
  }))

  return (
    <div className="surface rounded-2xl p-4">
      <div className="h-[320px] w-full sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis
              dataKey="bucket"
              stroke={axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke={axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#141416' : '#FFFFFF',
                border: `1px solid ${grid}`,
                borderRadius: 12,
                fontSize: 13,
              }}
              labelStyle={{ color: axis, fontWeight: 600 }}
              formatter={(value: number, name: string) => [eur(value), name]}
            />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Line
              type="monotone"
              dataKey="gmv"
              name="GMV"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              dot={false}
              animationDuration={900}
            />
            <Line
              type="monotone"
              dataKey="commission"
              name="Comisión"
              stroke="#06B6D4"
              strokeWidth={2.5}
              dot={false}
              animationDuration={900}
            />
            {previous && (
              <>
                <Line
                  type="monotone"
                  dataKey="prevGmv"
                  name="GMV ant."
                  stroke="#8B5CF6"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  opacity={0.5}
                />
                <Line
                  type="monotone"
                  dataKey="prevCommission"
                  name="Comisión ant."
                  stroke="#06B6D4"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  opacity={0.5}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
