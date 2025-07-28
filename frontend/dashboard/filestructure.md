dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.js       # Layout principal (Root Layout)
│   │   └── page.js         # Página principal (agora mais limpa)
│   │
│   ├── components/         # <-- NOVA: Pasta para todos os componentes
│   │   ├── analytics/
│   │   │   ├── AnalyticsAnalysis.js
│   │   │   └── AnalyticsPage.js
│   │   ├── dashboard/
│   │   │   ├── DashboardAnalysis.js
│   │   │   └── DashboardPage.js
│   │   ├── forms/
│   │   │   ├── FormDetailModal.js
│   │   │   └── FormsListPage.js
│   │   ├── layout/
│   │   │   └── Sidebar.js
│   │   ├── settings/
│   │   │   ├── DraggableQuestion.js
│   │   │   ├── FormEditorPage.js
│   │   │   ├── SettingsPage.js
│   │   │   └── SmsSettingsPage.js
│   │   └── ui/               # <-- NOVA: Componentes de UI genéricos
│   │       ├── Icons.js
│   │       ├── StatCard.js
│   │       ├── StatusBadge.js
│   │       └── SimpleCharts.js
│   │
│   ├── hooks/                # <-- NOVA: Para hooks personalizados
│   │   ├── useAnimatedData.js
│   │   └── useDebounce.js
│   │
│   └── lib/                  # <-- NOVA: Para lógica de negócio e API
│       └── api.js
│
└── ... (outros ficheiros de configuração)
