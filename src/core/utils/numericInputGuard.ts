/**
 * Guard global para todos los `<input type="number">` de la aplicación.
 *
 * Resuelve el comportamiento nativo de React en inputs numéricos controlados:
 * 1. Al borrar todos los dígitos con Backspace/Delete, permite que la caja quede
 *    visualmente vacía (con placeholder "0") mientras tiene el foco, evitando que
 *    React fuerce un "0" inmediato que al escribir "125" produzca "0125" o "1250".
 * 2. Si el campo tiene "0" y el usuario escribe un dígito del 1 al 9, reemplaza el "0"
 *    automáticamente por el nuevo dígito sin dejar ceros a la izquierda ("0125" -> "125").
 * 3. Respeta números decimales como "0.25" o "0.5".
 * 4. Al salir del campo (blur), si quedó vacío, restaura visualmente "0".
 */

let installed = false;

function getNativeValueSetter(): ((val: string) => void) | null {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  return descriptor?.set ?? null;
}

function isNumericInput(el: EventTarget | null): el is HTMLInputElement {
  return el instanceof HTMLInputElement && el.type === 'number' && !el.readOnly && !el.disabled;
}

export function installNumericInputGuard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const nativeSetValue = getNativeValueSetter();
  if (!nativeSetValue) return;

  // 1. Al enfocar un input con valor "0", seleccionar su contenido para facilitar reemplazo directo
  document.addEventListener(
    'focus',
    (e: FocusEvent) => {
      if (!isNumericInput(e.target)) return;
      const input = e.target;
      if (!input.placeholder) {
        input.placeholder = '0';
      }
      if (input.value === '0') {
        requestAnimationFrame(() => {
          if (document.activeElement === input && input.value === '0') {
            try {
              input.select();
            } catch {
              // Ignorar si el navegador no soporta select() en type="number"
            }
          }
        });
      }
    },
    true
  );

  // 2. Interceptar teclas antes de que el navegador inserte el carácter
  document.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (!isNumericInput(e.target)) return;
      const input = e.target;

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Backspace' || e.key === 'Delete') {
        input.dataset.typedExplicitZero = 'false';
        return;
      }

      if (e.key === '0') {
        input.dataset.typedExplicitZero = 'true';
        input.dataset.clearedByUser = 'false';
        if (input.value === '0') {
          // Evitar que se acumule "00"
          e.preventDefault();
        }
        return;
      }

      // Si el usuario presiona un dígito 1-9 cuando el input muestra "0",
      // vaciamos el DOM justo antes de insertar para que quede "1" y nunca "01" ni "10".
      if (e.key >= '1' && e.key <= '9') {
        input.dataset.typedExplicitZero = 'false';
        input.dataset.clearedByUser = 'false';
        if (input.value === '0') {
          nativeSetValue.call(input, '');
        }
      }
    },
    true
  );

  // 3. Interceptar el evento `input` (tanto en teclados físicos como móviles/pegado)
  document.addEventListener(
    'input',
    (e: Event) => {
      if (!isNumericInput(e.target)) return;
      const input = e.target;

      // Caso A: El usuario borró todo el contenido del input
      if (input.value === '' && input.dataset.typedExplicitZero !== 'true') {
        input.dataset.clearedByUser = 'true';
        if (!input.placeholder) {
          input.placeholder = '0';
        }
        // Después de que React ejecute onChange y restaure "0", volvemos a dejar limpia la caja
        const clearIfStillEmpty = () => {
          if (document.activeElement === input && input.dataset.clearedByUser === 'true') {
            nativeSetValue.call(input, '');
          }
        };
        queueMicrotask(clearIfStillEmpty);
        requestAnimationFrame(clearIfStillEmpty);
        return;
      }

      input.dataset.clearedByUser = 'false';

      // Caso B: Si por cualquier motivo quedó un cero a la izquierda (ej. "0125" o "-0125"), limpiarlo
      if (/^-?0+\d/.test(input.value)) {
        const cleaned = input.value.replace(/^(-?)0+(\d)/, '$1$2');
        nativeSetValue.call(input, cleaned);
        queueMicrotask(() => {
          if (/^-?0+\d/.test(input.value)) {
            nativeSetValue.call(input, input.value.replace(/^(-?)0+(\d)/, '$1$2'));
          }
        });
      }
    },
    true
  );

  // 4. Al perder el foco (blur), si el campo quedó vacío, mostrar "0"
  document.addEventListener(
    'blur',
    (e: FocusEvent) => {
      if (!isNumericInput(e.target)) return;
      const input = e.target;
      input.dataset.clearedByUser = 'false';
      input.dataset.typedExplicitZero = 'false';
      if (input.value === '') {
        nativeSetValue.call(input, '0');
      } else if (/^-?0+\d/.test(input.value)) {
        nativeSetValue.call(input, input.value.replace(/^(-?)0+(\d)/, '$1$2'));
      }
    },
    true
  );
}
