import { HomeIcon, FileTextIcon, BarChartIcon, SettingsIcon } from '@/components/ui/Icons';

const NavItem = ({ icon, label, active, onClick }) => ( <button onClick={onClick} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${ active ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100' }`}><div className="mr-3">{icon}</div><span>{label}</span></button> );

export const Sidebar = ({ activePage, setActivePage }) => (
    <aside className="w-64 bg-white p-4 flex-shrink-0 border-r border-gray-200 flex flex-col">
        <div className="flex items-center mb-8 px-2">
            <img src="https://www.newnet.com.br/assets/logo-BEoMyD68.svg" alt="Logo Newnet" className="h-8 w-auto"/>
        </div>
        <nav className="space-y-2">
            <NavItem icon={<HomeIcon />} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
            <NavItem icon={<FileTextIcon />} label="Formulários" active={activePage === 'forms'} onClick={() => setActivePage('forms')} />
            <NavItem icon={<BarChartIcon />} label="Análises" active={activePage === 'analytics'} onClick={() => setActivePage('analytics')} />
            <NavItem icon={<SettingsIcon />} label="Configurações" active={activePage === 'settings'} onClick={() => setActivePage('settings')} />
        </nav>
        <div className="mt-auto p-4 bg-emerald-50 rounded-lg text-center">
            <p className="text-sm text-emerald-800">Precisa de ajuda?</p>
            <p className="text-xs text-emerald-600 mt-1">Consulte nossa documentação.</p>
        </div>
    </aside>
);
