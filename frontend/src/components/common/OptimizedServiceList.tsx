import React, { memo, useMemo, useCallback } from 'react';
import { Service } from '../../hooks/useServices';
import { EditableProductTile } from '../dashboard/EditableProductTile';

interface OptimizedServiceListProps {
  services: Service[];
  onUpdate: (service: Service) => void;
  onDelete: (service: Service) => void;
  onView: (service: Service) => void;
  isLoading?: boolean;
}

// Memoized service tile component
const MemoizedServiceTile = memo<{
  service: Service;
  onUpdate: (service: Service) => void;
  onDelete: (service: Service) => void;
  onView: (service: Service) => void;
}>(({ service, onUpdate, onDelete, onView }) => {
  return (
    <EditableProductTile
      service={service}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onView={onView}
    />
  );
});

MemoizedServiceTile.displayName = 'MemoizedServiceTile';

export const OptimizedServiceList: React.FC<OptimizedServiceListProps> = memo(({
  services,
  onUpdate,
  onDelete,
  onView,
  isLoading = false
}) => {
  // Memoize the service list to prevent unnecessary re-renders
  const memoizedServices = useMemo(() => services, [services]);

  // Memoize callback functions to prevent child re-renders
  const handleUpdate = useCallback((service: Service) => {
    onUpdate(service);
  }, [onUpdate]);

  const handleDelete = useCallback((service: Service) => {
    onDelete(service);
  }, [onDelete]);

  const handleView = useCallback((service: Service) => {
    onView(service);
  }, [onView]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (memoizedServices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No services found</div>
        <div className="text-gray-400 text-sm mt-2">
          Try adjusting your search or filters
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {memoizedServices.map((service) => (
        <MemoizedServiceTile
          key={service.id}
          service={service}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onView={handleView}
        />
      ))}
    </div>
  );
});

OptimizedServiceList.displayName = 'OptimizedServiceList';
