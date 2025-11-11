"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { InventoryTable, InventoryItem } from '@/components/InventoryTable';
import { InventoryDialog } from '@/components/InventoryDialog';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function InventoryPage() {
  const { user, currentOrganization } = useApp();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    fetchInventory();
  }, [user, currentOrganization]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, categoryFilter]);

  async function fetchInventory() {
    if (!user || !currentOrganization) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/inventory?userId=${user.id}&organizationId=${currentOrganization.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      setItems(data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((item: InventoryItem) => item.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function filterItems() {
    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'low-stock') {
        filtered = filtered.filter((item) => item.quantity <= item.lowStockThreshold);
      } else {
        filtered = filtered.filter((item) => item.category === categoryFilter);
      }
    }

    setFilteredItems(filtered);
  }

  async function handleSave(data: Partial<InventoryItem>) {
    if (!user || !currentOrganization) return;

    const url = editingItem
      ? `/api/inventory/${editingItem.id}?userId=${user.id}`
      : `/api/inventory?userId=${user.id}&organizationId=${currentOrganization.id}`;

    const method = editingItem ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save item');
    }

    await fetchInventory();
    setEditingItem(null);
  }

  async function handleDelete() {
    if (!deletingItem || !user) return;

    try {
      const response = await fetch(
        `/api/inventory/${deletingItem.id}?userId=${user.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      await fetchInventory();
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  }

  const content = loading ? (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your inventory items</p>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-48" />
      </div>
      <Skeleton className="h-96" />
    </div>
  ) : error ? (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Manage your inventory items</p>
      </div>
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Error: {error}</p>
      </div>
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your inventory items ({filteredItems.length} items)
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <InventoryTable
        items={filteredItems}
        onEdit={(item) => {
          setEditingItem(item);
          setDialogOpen(true);
        }}
        onDelete={(item) => {
          setDeletingItem(item);
          setDeleteDialogOpen(true);
        }}
      />

      <InventoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the inventory item "{deletingItem?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return <PageLayout breadcrumb="Inventory">{content}</PageLayout>;
}