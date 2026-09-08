/**
 * Testhelfer für `$bindable`-Props: Ein reaktiver „Elternteil" für Komponententests.
 *
 * `@testing-library/svelte` reicht Props über einen Proxy ohne Setter weiter, daher
 * kämen Schreibzugriffe der Komponente auf ein `$bindable`-Prop dort nie an. Dieser
 * Helfer liefert ein Props-Objekt mit Getter/Setter auf einem `$state`: Svelte findet
 * den Setter (Rückweg wie bei `bind:`), und Änderungen des Tests am `value` erreichen
 * die Komponente wie eine Prop-Änderung von außen (Hinweg).
 */
export function createBindableHost<T>(key: string, initial: T) {
  const store = $state({ value: initial });
  const props = {
    get [key]() {
      return store.value;
    },
    set [key](next: T) {
      store.value = next;
    }
  } as Record<string, T>;
  return {
    props,
    get value(): T {
      return store.value;
    },
    set value(next: T) {
      store.value = next;
    }
  };
}
