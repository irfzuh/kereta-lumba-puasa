import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends React.Component<{children: React.ReactNode}, ErrorBoundaryState> {
  state: ErrorBoundaryState = {hasError: false, message: ''};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {hasError: true, message: error?.message || 'Ralat paparan aplikasi.'};
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#0F172A',
            color: '#F8FAFC',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              width: '100%',
              backgroundColor: '#111827',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <h1 style={{fontSize: '18px', fontWeight: 700, marginBottom: '8px'}}>
              Lumba Kereta Ramadan
            </h1>
            <p style={{fontSize: '13px', color: '#CBD5E1', marginBottom: '16px'}}>
              Maaf, berlaku ralat semasa memuatkan halaman. ({this.state.message})
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#F59E0B',
                color: '#0F172A',
                border: 0,
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Muat Semula
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
