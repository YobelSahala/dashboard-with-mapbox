import { useFilterStore } from '../store/useFilterStore';

const Filters = () => {
  const { category, status, search, setCategory, setStatus, setSearch, clearFilters } = useFilterStore();

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Filters</h2>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <input
              type="text"
              placeholder="Search MSISDN or location..."
              className="input input-bordered w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Region</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Regions</option>
              <option value="BALI NUSRA">Bali Nusra</option>
              <option value="CENTRAL JABOTABEK">Central Jabotabek</option>
              <option value="EASTERN JABOTABEK">Eastern Jabotabek</option>
              <option value="JABAR">Jabar</option>
              <option value="JATENG-DIY">Jateng-DIY</option>
              <option value="JATIM">Jatim</option>
              <option value="KALIMANTAN">Kalimantan</option>
              <option value="MALUKU DAN PAPUA">Maluku dan Papua</option>
              <option value="SULAWESI">Sulawesi</option>
              <option value="SUMBAGSEL">Sumbagsel</option>
              <option value="SUMBAGTENG">Sumbagteng</option>
              <option value="SUMBAGUT">Sumbagut</option>
              <option value="WESTERN JABOTABEK">Western Jabotabek</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Billing Status</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="IN-BILLING">In Billing</option>
              <option value="IN-TESTING">In Testing</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>

          <div className="form-control">
            <button
              className="btn btn-primary w-full"
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