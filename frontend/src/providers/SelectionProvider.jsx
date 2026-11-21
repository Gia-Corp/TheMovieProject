import { useCallback, useEffect, useMemo, useState } from "react";
import { SelectionContext } from "@/hooks/useSelection";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "selection-mode";

function emptySelection() {
  return { isSelectionMode: false, selectedIds: new Set() };
}

function readStoredSelection() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return emptySelection();

    const parsed = JSON.parse(stored);
    return {
      isSelectionMode: Boolean(parsed.isSelectionMode),
      selectedIds: new Set(parsed.selectedIds ?? []),
    };
  } catch {
    return emptySelection();
  }
}

export function SelectionProvider({ children }) {
  const { accessToken } = useAuth();
  const [selection, setSelection] = useState(readStoredSelection);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isSelectionMode: selection.isSelectionMode,
          selectedIds: Array.from(selection.selectedIds),
        }),
      );
    } catch {
      // Si sessionStorage no está disponible, la selección sigue en memoria.
    }
  }, [selection]);

  useEffect(() => {
    if (accessToken) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelection(emptySelection());
  }, [accessToken]);

  const toggleSelectionMode = useCallback(() => {
    setSelection((prev) => {
      if (prev.isSelectionMode) return emptySelection();
      return { ...prev, isSelectionMode: true };
    });
  }, []);

  const toggleSelection = useCallback((movieId) => {
    setSelection((prev) => {
      const selectedIds = new Set(prev.selectedIds);
      if (selectedIds.has(movieId)) {
        selectedIds.delete(movieId);
      } else {
        selectedIds.add(movieId);
      }
      return { ...prev, selectedIds };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(emptySelection());
  }, []);

  const value = useMemo(
    () => ({
      isSelectionMode: selection.isSelectionMode,
      selectedIds: selection.selectedIds,
      toggleSelectionMode,
      toggleSelection,
      clearSelection,
    }),
    [selection, toggleSelectionMode, toggleSelection, clearSelection],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}
