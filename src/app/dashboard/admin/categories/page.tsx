"use client";

import React, { useEffect, useState } from "react";
import { 
  FolderTree, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  X, 
  Search,
  CheckCircle,
  XCircle
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { mockDb, Category } from "@/services/mockDb";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    async function loadCats() {
      setCategories(await mockDb.getCategories());
    }
    loadCats();
  }, []);

  const reloadCats = async () => {
    setCategories(await mockDb.getCategories());
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setActive(cat.active);
    setModalOpen(true);
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      // Edit
      await mockDb.updateCategory(editingCategory.id, {
        name,
        description,
        active
      });
    } else {
      // Add
      await mockDb.addCategory({
        name,
        description,
        active
      });
    }
    setModalOpen(false);
    reloadCats();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja mesmo excluir esta categoria? Cursos associados a ela podem ficar órfãos.")) {
      await mockDb.deleteCategory(id);
      reloadCats();
    }
  };

  const filteredCategories = categories.filter((cat) => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-8 select-none w-full animate-enter">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center space-x-2">
              <FolderTree className="h-6.5 w-6.5 text-primary shrink-0" />
              <span>Gerenciamento de Categorias</span>
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Adicione novas categorias para classificar os cursos nas buscas ou ative/desative tags existentes.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs shadow-md shadow-primary/10 hover:opacity-90 transition-all w-max cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5 animate-pulse" />
            <span>Adicionar Categoria</span>
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="flex items-center bg-card border border-border p-4 rounded-2xl shadow-sm max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por categoria ou ementa..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* TABELA DE CATEGORIAS */}
        {filteredCategories.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4">
            <FolderTree className="h-16 w-16 text-muted-foreground/60 animate-pulse" />
            <h3 className="font-extrabold text-lg">Nenhuma categoria cadastrada</h3>
            <p className="text-sm text-muted-foreground font-semibold max-w-sm">
              Use o botão no topo direito para criar sua primeira categoria de curso.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-enter">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-semibold text-muted-foreground">
                <thead className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                  <tr>
                    <th className="px-6 py-4">Nome da Categoria</th>
                    <th className="px-6 py-4">Descrição Completa</th>
                    <th className="px-6 py-4">Status / Visibilidade</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-foreground">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-secondary/20 transition-all">
                      
                      {/* Nome */}
                      <td className="px-6 py-4 font-bold flex items-center space-x-2">
                        <FolderTree className="h-4.5 w-4.5 text-primary shrink-0" />
                        <span>{cat.name}</span>
                      </td>

                      {/* Descricao */}
                      <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{cat.description}</td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider w-max flex items-center space-x-1 border ${
                          cat.active
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}>
                          {cat.active ? (
                            <>
                              <CheckCircle className="h-3 w-3 shrink-0" />
                              <span>Ativa</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 shrink-0" />
                              <span>Inativa</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Botoes */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2.5">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-2 rounded-lg bg-secondary hover:bg-indigo-500/10 text-indigo-600 border border-border cursor-pointer transition-colors"
                            title="Editar Categoria"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 rounded-lg bg-secondary hover:bg-destructive/10 text-destructive border border-border cursor-pointer transition-colors"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: CRIAR/EDITAR CATEGORIA */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-enter">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full hover:bg-secondary text-muted-foreground border border-border cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg">
                  {editingCategory ? "Editar Categoria" : "Adicionar Categoria"}
                </h3>
              </div>

              <form onSubmit={saveCategory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Nome da Categoria</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Programação Mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Descrição Breve</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Sobre o que é esta categoria?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2.5 py-2">
                  <input
                    type="checkbox"
                    id="cat_active"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-4.5 w-4.5 text-primary border-border bg-background rounded focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="cat_active" className="text-xs font-bold text-muted-foreground uppercase tracking-wide cursor-pointer select-none">
                    Categoria Visível no Catálogo
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold bg-secondary rounded-xl hover:bg-secondary/80 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow shadow-primary/20 hover:opacity-90 cursor-pointer"
                  >
                    Confirmar Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
