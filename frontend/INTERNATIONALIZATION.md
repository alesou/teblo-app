# 🌍 Internacionalización (i18n) - Teblo

## 📋 Resumen

Teblo ahora soporta **múltiples idiomas** con una implementación completa de internacionalización usando `react-i18next`.

### ✅ Idiomas Soportados
- **Español (es)** - Idioma por defecto
- **English (en)** - Idioma secundario

## 🚀 Características Implementadas

### ✅ Funcionalidades Principales
- **Detección automática** del idioma del navegador
- **Persistencia** de la preferencia de idioma en localStorage
- **Selector de idioma** en la página de Configuración
- **Cambio dinámico** de idioma sin recargar la página
- **Fallback** al español para textos no traducidos
- **Tipado fuerte** con TypeScript para evitar errores

### ✅ Componentes Internacionalizados
- ✅ **Layout** - Navegación, botones, modal de donaciones
- ✅ **Dashboard** - Títulos, estadísticas, mensajes
- ✅ **Settings** - Formulario completo + selector de idioma
- ✅ **Clients** - Gestión completa de clientes
- ✅ **Invoices** - Lista y filtros de facturas

## 📁 Estructura de Archivos

```
src/
├── config/
│   └── i18n.ts                 # Configuración principal de i18n
├── hooks/
│   └── useTranslation.ts       # Hook personalizado con funcionalidades extra
├── components/
│   └── LanguageSelector.tsx    # Componente selector de idioma
├── locales/
│   ├── es/
│   │   └── translation.json    # Traducciones en español
│   └── en/
│       └── translation.json    # Traducciones en inglés
├── types/
│   └── i18n.ts                # Tipos TypeScript para traducciones
└── utils/
    └── i18nTest.ts            # Script de testing de traducciones
```

## 🔧 Configuración

### Instalación de Dependencias
```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### Configuración Principal (`src/config/i18n.ts`)
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Configuración con:
// - Detección automática de idioma
// - Persistencia en localStorage
// - Fallback al español
// - Debug en desarrollo
```

## 🎯 Uso

### Hook Personalizado
```typescript
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t, changeLanguage, getCurrentLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button onClick={() => changeLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
};
```

### Selector de Idioma
```typescript
import LanguageSelector from '../components/LanguageSelector';

// En cualquier componente
<LanguageSelector />
```

## 📝 Estructura de Traducciones

### Organización Jerárquica
```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "clients": "Clientes"
  },
  "common": {
    "loading": "Cargando...",
    "save": "Guardar"
  },
  "dashboard": {
    "title": "Dashboard",
    "stats": {
      "totalInvoices": "Total Facturas"
    }
  }
}
```

### Claves de Traducción Principales
- **navigation** - Elementos de navegación
- **common** - Textos comunes reutilizables
- **auth** - Autenticación
- **dashboard** - Página principal
- **clients** - Gestión de clientes
- **invoices** - Gestión de facturas
- **settings** - Configuración
- **donation** - Modal de donaciones

## 🧪 Testing

### Script de Testing Automático
```typescript
import { testTranslations, testLanguageChange } from '../utils/i18nTest';

// Verificar que todas las traducciones existen
testTranslations();

// Verificar cambio de idioma
testLanguageChange();
```

### Verificación Manual
1. Abrir la aplicación
2. Ir a Settings → Cambiar idioma
3. Verificar que todos los textos cambian
4. Recargar página → Verificar persistencia

## 🔄 Agregar Nuevas Traducciones

### 1. Agregar al archivo de traducción
```json
// src/locales/es/translation.json
{
  "newSection": {
    "title": "Nuevo Título",
    "description": "Nueva descripción"
  }
}

// src/locales/en/translation.json
{
  "newSection": {
    "title": "New Title",
    "description": "New description"
  }
}
```

### 2. Usar en el componente
```typescript
const { t } = useTranslation();

return (
  <div>
    <h1>{t('newSection.title')}</h1>
    <p>{t('newSection.description')}</p>
  </div>
);
```

### 3. Agregar al testing
```typescript
// src/utils/i18nTest.ts
const requiredKeys = [
  // ... existing keys
  'newSection.title',
  'newSection.description'
];
```

## 🎨 Mejores Prácticas

### ✅ Recomendado
- Usar claves jerárquicas descriptivas
- Agrupar traducciones por sección
- Mantener consistencia en terminología
- Usar el hook personalizado `useTranslation`
- Agregar nuevas claves al testing

### ❌ Evitar
- Textos hardcodeados en componentes
- Claves de traducción muy largas
- Traducciones duplicadas
- Olvidar agregar al testing

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Verificación Pre-despliegue
1. ✅ `npm run build` - Sin errores
2. ✅ `npx tsc --noEmit` - Sin errores TypeScript
3. ✅ Testing de traducciones - Todas las claves presentes
4. ✅ Testing manual - Cambio de idioma funciona

## 📊 Estado Actual

### ✅ Completado
- [x] Configuración de i18n
- [x] Hook personalizado
- [x] Selector de idioma
- [x] Layout internacionalizado
- [x] Dashboard internacionalizado
- [x] Settings internacionalizado
- [x] Clients internacionalizado
- [x] Invoices parcialmente internacionalizado
- [x] Testing automático
- [x] Documentación completa

### 🔄 Pendiente
- [ ] Completar internacionalización de Invoices
- [ ] Internacionalizar CreateInvoice
- [ ] Internacionalizar EditInvoice
- [ ] Testing manual completo
- [ ] Optimización de rendimiento

## 🎯 Próximos Pasos

1. **Completar Invoices** - Terminar traducciones faltantes
2. **Agregar más páginas** - CreateInvoice, EditInvoice, etc.
3. **Testing exhaustivo** - Verificar todos los casos de uso
4. **Optimización** - Lazy loading de traducciones si es necesario
5. **Más idiomas** - Agregar francés, alemán, etc.

---

**🎉 ¡La internacionalización está lista para usar!** 