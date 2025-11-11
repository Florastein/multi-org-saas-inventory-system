"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Building2, Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { user, currentOrganization, refreshOrganizations } = useAuth();
  const [name, setName] = useState(currentOrganization?.name || '');
  const [slug, setSlug] = useState(currentOrganization?.slug || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleUpdateOrganization = async () => {
    setError('');
    setSuccess('');
    setIsUpdating(true);

    try {
      const response = await fetch(
        `/api/organizations/${currentOrganization?.id}?userId=${user?.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slug }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update organization');
      }

      await refreshOrganizations();
      setSuccess('Organization updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (deleteConfirmation !== currentOrganization?.name) {
      setError('Organization name does not match');
      return;
    }

    try {
      const response = await fetch(
        `/api/organizations/${currentOrganization?.id}?userId=${user?.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete organization');
      }

      await refreshOrganizations();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization');
    }
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Organization Selected</h2>
        <p className="text-muted-foreground">
          Please select an organization to manage settings.
        </p>
      </div>
    );
  }

  const canEdit = currentOrganization.role === 'owner' || currentOrganization.role === 'admin';
  const isOwner = currentOrganization.role === 'owner';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage settings for {currentOrganization.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Update your organization's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit || isUpdating}
              placeholder="Acme Corp"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!canEdit || isUpdating}
              placeholder="acme-corp"
            />
            <p className="text-xs text-muted-foreground">
              This will be used in URLs. Only lowercase letters, numbers, and hyphens.
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleUpdateOrganization} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Organization'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>View your organization details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Organization ID</span>
            <span className="font-mono text-sm">{currentOrganization.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Role</span>
            <span className="font-medium text-sm capitalize">{currentOrganization.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="text-sm">
              {new Date(currentOrganization.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium mb-1">Delete Organization</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this organization and all associated data. This action cannot
                  be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Organization</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All inventory items and member
              associations will be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will permanently delete all data associated with this organization.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Type <span className="font-mono font-bold">{currentOrganization.name}</span> to
                confirm
              </Label>
              <Input
                id="confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Organization name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteConfirmation('');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrganization}
              disabled={deleteConfirmation !== currentOrganization.name}
            >
              Delete Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
