import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Filters from './components/Filters';
import MapView from './components/MapView';
import Overview from './components/Overview';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-base-200">
        <div className="container mx-auto p-4">
          <h1 className="text-4xl font-bold text-center text-base-content mb-6">
            CMP Analytics Dashboard
          </h1>

          <div className="flex gap-6">
            {/* Left Sidebar - Filters */}
            <div className="w-1/4 flex-shrink-0">
              <div className="sticky top-4">
                <Filters />
              </div>
            </div>

            {/* Right Content - Map and Table */}
            <div className="flex-1 space-y-6">
              <Overview/>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Usage Map</h2>
                  <MapView />
                </div>
              </div>

              {/* <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Usage Records</h2>
                  <DataTable />
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
