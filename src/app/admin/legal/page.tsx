"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Edit3,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  keywords: string[];
  synonyms: string[];
  isActive: boolean;
};

type Provision = {
  _id: string;
  category:
    | string
    | {
        _id: string;
        name: string;
        slug: string;
      };
  lawName: string;
  section: string;
  title: string;
  plainExplanation: string;
  keywords: string[];
  isActive: boolean;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  keywords: string;
  synonyms: string;
  isActive: boolean;
};

type ProvisionForm = {
  category: string;
  lawName: string;
  section: string;
  title: string;
  plainExplanation: string;
  keywords: string;
  isActive: boolean;
};

const emptyCategory: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  keywords: "",
  synonyms: "",
  isActive: true,
};

const emptyProvision: ProvisionForm = {
  category: "",
  lawName: "",
  section: "",
  title: "",
  plainExplanation: "",
  keywords: "",
  isActive: true,
};

function toArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function categoryId(value: Provision["category"]) {
  return typeof value === "string" ? value : value?._id || "";
}

export default function AdminLegalPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategory);
  const [provisionForm, setProvisionForm] =
    useState<ProvisionForm>(emptyProvision);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingProvisionId, setEditingProvisionId] = useState<string | null>(
    null,
  );

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProvisionForm, setShowProvisionForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [categoryResult, provisionResult] = await Promise.all([
        apiFetch<{ success: boolean; data: Category[] }>(
          "/admin/legal/categories",
        ),
        apiFetch<{ success: boolean; data: Provision[] }>(
          "/admin/legal/provisions",
        ),
      ]);

      setCategories(categoryResult.data || []);
      setProvisions(provisionResult.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load legal content",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    void loadData();
  }, [router]);

  function openNewCategory() {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategory);
    setShowCategoryForm(true);
  }

  function editCategory(category: Category) {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon || "",
      keywords: category.keywords?.join(", ") || "",
      synonyms: category.synonyms?.join(", ") || "",
      isActive: category.isActive,
    });
    setShowCategoryForm(true);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const body = {
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description,
        icon: categoryForm.icon || undefined,
        keywords: toArray(categoryForm.keywords),
        synonyms: toArray(categoryForm.synonyms),
        isActive: categoryForm.isActive,
      };

      if (editingCategoryId) {
        await apiFetch(`/admin/legal/categories/${editingCategoryId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/admin/legal/categories", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      setShowCategoryForm(false);
      setEditingCategoryId(null);
      setCategoryForm(emptyCategory);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save category",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(categoryIdValue: string) {
    if (
      !window.confirm(
        "Delete this category? Categories with provisions cannot be deleted.",
      )
    ) {
      return;
    }

    try {
      setError("");

      await apiFetch(`/admin/legal/categories/${categoryIdValue}`, {
        method: "DELETE",
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    }
  }

  function openNewProvision() {
    setEditingProvisionId(null);
    setProvisionForm({
      ...emptyProvision,
      category: categories[0]?._id || "",
    });
    setShowProvisionForm(true);
  }

  function editProvision(provision: Provision) {
    setEditingProvisionId(provision._id);
    setProvisionForm({
      category: categoryId(provision.category),
      lawName: provision.lawName,
      section: provision.section,
      title: provision.title,
      plainExplanation: provision.plainExplanation,
      keywords: provision.keywords?.join(", ") || "",
      isActive: provision.isActive,
    });
    setShowProvisionForm(true);
  }

  async function saveProvision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const body = {
        category: provisionForm.category,
        lawName: provisionForm.lawName,
        section: provisionForm.section,
        title: provisionForm.title,
        plainExplanation: provisionForm.plainExplanation,
        keywords: toArray(provisionForm.keywords),
        isActive: provisionForm.isActive,
      };

      if (editingProvisionId) {
        await apiFetch(`/admin/legal/provisions/${editingProvisionId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/admin/legal/provisions", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      setShowProvisionForm(false);
      setEditingProvisionId(null);
      setProvisionForm(emptyProvision);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save provision",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProvision(provisionIdValue: string) {
    if (!window.confirm("Delete this legal provision?")) {
      return;
    }

    try {
      setError("");

      await apiFetch(`/admin/legal/provisions/${provisionIdValue}`, {
        method: "DELETE",
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete provision",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => router.push("/admin")}
              className="mb-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Admin
            </button>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Legal Content
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage legal categories and plain-language provisions.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => void loadData()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading legal content...
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Legal Categories
                  </h2>
                  <p className="text-sm text-slate-500">
                    {categories.length} categories
                  </p>
                </div>

                <button
                  onClick={openNewCategory}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          /{category.slug}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          category.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {category.description}
                    </p>

                    {category.keywords?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {category.keywords.slice(0, 5).map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => editCategory(category)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => void deleteCategory(category._id)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                    No legal categories yet.
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Legal Provisions
                  </h2>
                  <p className="text-sm text-slate-500">
                    {provisions.length} provisions
                  </p>
                </div>

                <button
                  onClick={openNewProvision}
                  disabled={categories.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Provision
                </button>
              </div>

              <div className="space-y-4">
                {provisions.map((provision) => {
                  const provisionCategory =
                    typeof provision.category === "string"
                      ? categories.find(
                          (item) => item._id === provision.category,
                        )?.name
                      : provision.category?.name;

                  return (
                    <div
                      key={provision._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                              {provision.lawName}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                              Section {provision.section}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                provision.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {provision.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <h3 className="mt-3 text-lg font-bold text-slate-900">
                            {provision.title}
                          </h3>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            Category: {provisionCategory || "Unknown"}
                          </p>

                          <p className="mt-3 max-w-4xl whitespace-pre-line text-sm leading-6 text-slate-600">
                            {provision.plainExplanation}
                          </p>

                          {provision.keywords?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {provision.keywords.map((keyword) => (
                                <span
                                  key={keyword}
                                  className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 gap-2 lg:w-28 lg:flex-col">
                          <button
                            onClick={() => editProvision(provision)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>

                          <button
                            onClick={() => void deleteProvision(provision._id)}
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="lg:hidden">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {provisions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                    No legal provisions yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {showCategoryForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  {editingCategoryId ? "Edit Category" : "Add Category"}
                </h2>
                <p className="text-xs text-slate-500">
                  Define a legal issue category.
                </p>
              </div>

              <button
                onClick={() => setShowCategoryForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveCategory} className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Name
                  <input
                    required
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        name: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                    placeholder="Family Law"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Slug
                  <input
                    required
                    pattern="[a-z0-9-]+"
                    value={categoryForm.slug}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        slug: e.target.value.toLowerCase(),
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                    placeholder="family-law"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  required
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="General family-related legal matters."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Icon
                  <input
                    value={categoryForm.icon}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        icon: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                    placeholder="Scale"
                  />
                </label>

                <label className="flex items-end gap-3 pb-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded"
                  />
                  Active category
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Keywords
                <input
                  value={categoryForm.keywords}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      keywords: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="divorce, marriage, custody"
                />
                <span className="mt-1 block text-xs text-slate-400">
                  Separate keywords with commas.
                </span>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Synonyms
                <input
                  value={categoryForm.synonyms}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      synonyms: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="family dispute, family case"
                />
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingCategoryId
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProvisionForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  {editingProvisionId
                    ? "Edit Legal Provision"
                    : "Add Legal Provision"}
                </h2>
                <p className="text-xs text-slate-500">
                  Add a plain-language legal provision.
                </p>
              </div>

              <button
                onClick={() => setShowProvisionForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveProvision} className="space-y-4 p-5">
              <label className="block text-sm font-medium text-slate-700">
                Category
                <select
                  required
                  value={provisionForm.category}
                  onChange={(e) =>
                    setProvisionForm({
                      ...provisionForm,
                      category: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Law Name
                  <input
                    required
                    value={provisionForm.lawName}
                    onChange={(e) =>
                      setProvisionForm({
                        ...provisionForm,
                        lawName: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                    placeholder="Pakistan Penal Code"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Section
                  <input
                    required
                    value={provisionForm.section}
                    onChange={(e) =>
                      setProvisionForm({
                        ...provisionForm,
                        section: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                    placeholder="302"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Title
                <input
                  required
                  value={provisionForm.title}
                  onChange={(e) =>
                    setProvisionForm({
                      ...provisionForm,
                      title: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="Punishment for murder"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Plain Explanation
                <textarea
                  required
                  rows={5}
                  value={provisionForm.plainExplanation}
                  onChange={(e) =>
                    setProvisionForm({
                      ...provisionForm,
                      plainExplanation: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="Explain the provision in simple language..."
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Keywords
                <input
                  value={provisionForm.keywords}
                  onChange={(e) =>
                    setProvisionForm({
                      ...provisionForm,
                      keywords: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="murder, qatl, homicide"
                />
                <span className="mt-1 block text-xs text-slate-400">
                  Separate keywords with commas.
                </span>
              </label>

              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={provisionForm.isActive}
                  onChange={(e) =>
                    setProvisionForm({
                      ...provisionForm,
                      isActive: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded"
                />
                Active provision
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProvisionForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProvisionId
                      ? "Update Provision"
                      : "Create Provision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
