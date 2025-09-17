import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Filters from './components/Filters';
import DataTable from './components/DataTable';
import MapView from './components/MapView';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-base-200">
        <div className="container mx-auto p-4">
          <h1 className="text-4xl font-bold text-center text-base-content mb-6">
            Data Usage Analytics Dashboard
          </h1>
          
          <Filters />
          
          <div className="space-y-6 mt-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Usage Map</h2>
                <MapView />
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Usage Records</h2>
                <DataTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
