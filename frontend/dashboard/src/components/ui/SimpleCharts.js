import { useAnimatedData } from '@/hooks/useAnimatedData';
import { useMemo } from 'react';

export const SimpleBarChart = ({ data, colors, onBarClick }) => {
    const animatedData = useAnimatedData(data, 'name');
    const maxValue = useMemo(() => Math.max(...animatedData.map(d => d.value), 1), [animatedData]);
    return (
        <div className="w-full h-64 flex items-end justify-between px-2 pt-8 relative">
             {animatedData.map((item, index) => (
                <div key={item.name} className="h-full w-full flex flex-col items-center justify-end group relative px-1" onClick={() => onBarClick && onBarClick(item.name)}>
                    <div className="absolute -top-6 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.name}: {item.value.toFixed(1)}
                    </div>
                    <div 
                        className={`w-full max-w-8 rounded-t-md transition-all duration-300 ${onBarClick ? 'cursor-pointer' : ''}`}
                        style={{ 
                            height: `${(item.value / maxValue) * 100}%`,
                            backgroundColor: colors[index % colors.length]
                        }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">{item.name}</span>
                </div>
            ))}
        </div>
    );
};

export const SimplePieChart = ({ data, colors }) => {
    const animatedData = useAnimatedData(data, 'name');
    const total = useMemo(() => animatedData.reduce((sum, item) => sum + item.value, 0), [animatedData]);
    if (total === 0) {
        return <div className="w-full h-64 flex items-center justify-center text-gray-500">Sem dados para exibir</div>;
    }
    let cumulativePercent = 0;

    const segments = animatedData.map((item) => {
        const percent = (item.value / total) * 100;
        const startAngle = cumulativePercent;
        cumulativePercent += percent;
        const endAngle = cumulativePercent;
        return { percent, startAngle, endAngle, name: item.name, value: item.value };
    });

    return (
        <div className="w-full flex flex-col md:flex-row items-center justify-center p-4">
            <div className="w-48 h-48 rounded-full" style={{ background: `conic-gradient(${
                segments.map((s, i) => `${colors[i % colors.length]} ${s.startAngle}% ${s.endAngle}%`).join(', ')
            })`}}></div>
            <div className="ml-0 md:ml-6 mt-4 md:mt-0">
                <ul className="space-y-2">
                    {animatedData.map((item, index) => (
                        <li key={item.name} className="flex items-center text-sm">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                            <span className="text-gray-700">{item.name}:</span>
                            <span className="font-semibold ml-1">{item.value.toFixed(1)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export const SimpleLineChart = ({ data, color }) => {
    const animatedData = useAnimatedData(data, 'label');
    const padding = 40;
    const width = 500;
    const height = 250;

    const maxValue = useMemo(() => Math.max(...animatedData.map(d => d.value), 0), [animatedData]);
    const minValue = useMemo(() => Math.min(...animatedData.map(d => d.value), 0), [animatedData]);

    const getX = (index) => {
        if (animatedData.length <= 1) return padding;
        return padding + (index / (animatedData.length - 1)) * (width - padding * 2);
    };

    const getY = (value) => {
        if (maxValue === minValue) return height / 2;
        return height - padding - ((value - minValue) / (maxValue - minValue)) * (height - padding * 2);
    };

    const linePath = animatedData.map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.value)}`).join(' ');

    return (
        <div className="w-full h-64 relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Y-axis labels */}
                <text x={padding - 10} y={getY(maxValue)} textAnchor="end" alignmentBaseline="middle" className="text-xs fill-gray-500">{maxValue.toFixed(0)}</text>
                <text x={padding - 10} y={getY(minValue)} textAnchor="end" alignmentBaseline="middle" className="text-xs fill-gray-500">{minValue.toFixed(0)}</text>
                
                {/* X-axis labels */}
                {animatedData.map((point, index) => (
                    <text key={index} x={getX(index)} y={height - padding + 15} textAnchor="middle" className="text-xs fill-gray-500">{point.label}</text>
                ))}

                <path d={linePath} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                
                {animatedData.map((point, index) => (
                    <circle key={index} cx={getX(index)} cy={getY(point.value)} r="4" fill={color} />
                ))}
            </svg>
        </div>
    );
};