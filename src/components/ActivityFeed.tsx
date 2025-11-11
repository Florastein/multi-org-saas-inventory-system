"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: number;
  action: string;
  description: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  inventoryItem: {
    name: string;
    sku: string;
  } | null;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const actionColors: Record<string, string> = {
  created: 'default',
  updated: 'secondary',
  deleted: 'destructive',
  stock_adjusted: 'outline',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest inventory updates and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={actionColors[activity.action] as any || 'default'}>
                      {activity.action.replace('_', ' ')}
                    </Badge>
                    {activity.inventoryItem && (
                      <span className="text-sm font-medium">{activity.inventoryItem.name}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.user.name}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
