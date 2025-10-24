# 🧮 Calculadora de Rendimientos - Actualizada

🌐 **Versión pública disponible aquí:**  
👉 [https://tinosgn.github.io/calculadora-rendimientos-TNA/](https://tinosgn.github.io/calculadora-rendimientos-TNA/)

---

## 🆕 Nuevas Características

He integrado completamente la funcionalidad del script Python de simulación de ahorros a tu aplicación web.  
Ahora tienes **dos modos de uso**:

### 1. **Modo Calculadora Simple** (versión original)

- Cálculo básico de rendimientos con TNA manual
- Gráficos mensuales y diarios
- Tablas de proyección
- Exportación a CSV

### 2. **Modo Simulación de Ahorros** (nuevo)

Simula tu ahorro real mes a mes considerando:

#### ✨ Parámetros configurables:

- **Dinero inicial**: Tu ahorro actual
- **Sueldo mensual**: Ingreso mensual
- **Gastos promedio**: Tus gastos habituales mensuales
- **TNA Mercado Pago**: Tasa de rendimiento anual
- **Gasto de vacaciones en Enero**: Gasto extra personalizable (por defecto $800.000)
- **Incluir aguinaldos**: Checkbox para habilitar/deshabilitar aguinaldos automáticos
- **Cantidad de meses**: Período a simular (1-60 meses)
- **Fecha de inicio**: Opcional (por defecto comienza el mes siguiente)

#### 🎁 Eventos especiales configurables:

- **Aguinaldos**: Se agregan automáticamente en Junio y Diciembre (50% del sueldo)
- **Vacaciones**: Gasto extra personalizable definido por el usuario

#### 💰 ¿Cómo funcionan los gastos de vacaciones?

- Tú defines el monto en el campo **"Gasto de vacaciones en Enero"**
- Por defecto viene en **$800.000**, pero puedes cambiarlo
- Si pones **$0**, no se agrega ningún gasto extra en Enero

#### 📊 Cálculos incluidos:

- Interés compuesto **diario**
- Días reales de cada mes (28, 29, 30 o 31)
- Suma ingresos y resta gastos al inicio de cada mes
- Aplica el interés sobre el saldo actualizado

#### 📈 Visualización completa:

- **Resumen**: Saldo inicial/final, intereses totales, ahorro neto, aguinaldos, vacaciones
- **Gráfico**: Evolución del saldo mes a mes
- **Tabla mensual detallada** con ingresos, gastos, intereses y eventos

#### 💾 Funcionalidades adicionales:

- Exportar a **CSV**
- Botón **Reset**
- **Persistencia automática** en localStorage

---

## ⌨️ Formateo de números mejorado

- **Separador de miles:** punto (.)
- **Separador decimal:** coma (,)

Ejemplo en tiempo real:

- Si escribes `8000000` → se muestra `8.000.000`
- Para porcentajes: usa coma → `36,5` ✅

Campos con formateo automático:

- Monto a invertir
- Dinero inicial
- Sueldo mensual
- Gastos promedio
- TNA

---

## 🔄 Cómo usar

1. Abre `index.html` en tu navegador
2. Verás dos botones:
   - **Calculadora Simple**
   - **Simulación de Ahorros**
3. Ingresa tus datos y haz clic en **Simular Ahorros**
4. Explora los resultados en:
   - Resumen
   - Gráfico
   - Tabla mensual detallada

---

## 📝 Ejemplo de uso

Dinero inicial: $0
Sueldo: $500.000
Gastos promedio: $300.000
TNA: 36,5%
Gasto de vacaciones: $800.000
☑️ Incluir aguinaldos
Meses: 12
Fecha inicio: (vacío)

**Resultado esperado:**

- Ahorro promedio mensual $200.000
- 2 aguinaldos automáticos ($250.000 c/u)
- Gasto de vacaciones $800.000 en enero
- Interés compuesto diario

---

## 🔧 Archivos actualizados

- `index.html` → Interfaz con selector de modo
- `script.js` → Lógica completa de simulación + formateo
- `style.css` → Estilos mejorados

---

## 💡 Notas técnicas

- Fórmula de interés diario:  
  `saldo * (TNA / 100 / 365)`
- Se ajusta según los días reales del mes (incluye bisiestos)
- Guarda automáticamente tu configuración
- Formato regional argentino (miles con punto, decimales con coma)

---

**¡Disfruta tu nueva calculadora mejorada! 🚀**
