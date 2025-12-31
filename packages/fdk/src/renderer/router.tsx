/**
 * FDK Router Configuration
 * Defines all routes for the multi-page application
 */
import { createHashRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { FlowsPage } from './pages/FlowsPage';
import { FlowDetailPage } from './pages/FlowDetailPage';
import { LeadsPage } from './pages/LeadsPage';
import { RunPage } from './pages/RunPage';
import { ExecutionPage } from './pages/ExecutionPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'flows',
        element: <FlowsPage />,
      },
      {
        path: 'flows/:flowKey',
        element: <FlowDetailPage />,
      },
      {
        path: 'leads',
        element: <LeadsPage />,
      },
      {
        path: 'run',
        element: <RunPage />,
      },
      {
        path: 'run/:executionId',
        element: <ExecutionPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
