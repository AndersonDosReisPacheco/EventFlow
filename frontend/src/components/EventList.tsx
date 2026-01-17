==================================================
ARQUIVO: D:\Meu_Projetos_Pessoais\EventFlow\frontend\src\components\EventList.tsx
==================================================
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, AlertCircle, CheckCircle, Shield, User, Settings, Lock } from 'lucide-react';
import { Event } from '../types/event';

interface EventListProps {
  events: Event[];
  loading: boolean;
  onViewDetails: (event: Event) => void;
}

const getEventIcon = (type: string) => {
  if (type.includes('AUTH') || type.includes('LOGIN')) {
    return <Lock className="h-4 w-4" />;
  } else if (type.includes('ERROR')) {
    return <AlertCircle className="h-4 w-4" />;
  } else if (type.includes('SUCCESS') || type.includes('REGISTER')) {
    return <CheckCircle className="h-4 w-4" />;
  } else if (type.includes('ACCESS') || type.includes('DASHBOARD')) {
    return <Shield className="h-4 w-4" />;
  } else if (type.includes('PROFILE') || type.includes('UPDATE')) {
    return <User className="h-4 w-4" />;
  } else {
    return <Settings className="h-4 w-4" />;
  }
};

const getEventColor = (type: string) => {
  if (type.includes('SUCCESS')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  if (type.includes('ERROR') || type.includes('FAIL')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  if (type.includes('AUTH')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  if (type.includes('ACCESS')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

export const EventList: React.FC<EventListProps> = ({ events, loading, onViewDetails }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhum evento encontrado
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {events.length === 0 ? 'Nenhum evento registrado ainda.' : 'Tente ajustar seus filtros.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventColor(event.type)}`}>
                    {event.type.replace(/_/g, ' ')}
                  </span>
                  {event.ip && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      IP: {event.ip}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-900 dark:text-white truncate">
                  {event.message}
                </p>

                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Object.keys(event.metadata).length} propriedade(s)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-4">
              <div className="text-right">
                <div className="text-sm text-gray-900 dark:text-white">
                  {format(new Date(event.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(event.createdAt), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </div>
              </div>

              <button
                onClick={() => onViewDetails(event)}
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                title="Ver detalhes"
              >
                <Eye className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
