
export const StatCard = ({ title, value, icon, subtext }) => ( <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"><div className="flex items-center justify-between"><h3 className="text-sm font-medium text-gray-500">{title}</h3><div className="text-emerald-500">{icon}</div></div><div className="mt-4"><p className="text-3xl font-bold text-gray-800">{value}</p>{subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}</div></div> );

