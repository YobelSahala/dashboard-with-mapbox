import { useFilterStore } from '../store/useFilterStore';

const Filters = () => {
  const { category, status, search, setCategory, setStatus, setSearch, clearFilters } = useFilterStore();

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <input
              type="text"
              placeholder="Search MSISDN or location..."
              className="input input-bordered"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Region</span>
            </label>
            <select
              className="select select-bordered"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Regions</option>
              <option value="CENTRAL JABOTABEK">Central Jabotabek</option>
              <option value="EASTERN JABOTABEK">Eastern Jabotabek</option>
              <option value="WESTERN JABOTABEK">Western Jabotabek</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Billing Status</span>
            </label>
            <select
              className="select select-bordered"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="IN-BILLING">In Billing</option>
              <option value="OUT-OF-BILLING">Out of Billing</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          
          <div className="form-control pt-5">
            <button
              className="btn btn-primary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;