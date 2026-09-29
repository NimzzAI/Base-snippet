import { useState, useEffect, useCallback } from "react";
import { config } from "./config";
import { DEFAULT_CATEGORIES } from "./types";

export { DEFAULT_CATEGORIES };

// Helper to get or subscribe to categories
export function useRealtimeCategories() {
  const [categories, setCategories] = useState<string[]>(
    config.categories || DEFAULT_CATEGORIES
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Poll gently every 8 seconds for live sync across tabs
    const interval = setInterval(refresh, 8000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { categories, loading, refresh };
}

// Function to add a new category to local JSON storage
export async function addCategoryToFirestore(newCategory: string): Promise<boolean> {
  const cleanCat = newCategory.trim();
  if (!cleanCat) return false;

  try {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cleanCat }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to add category:", error);
    return false;
  }
}

// Function to delete a category from local JSON storage
export async function removeCategoryFromFirestore(categoryToDelete: string): Promise<boolean> {
  try {
    const res = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryToDelete }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to delete category:", error);
    return false;
  }
}
