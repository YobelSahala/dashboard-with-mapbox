# Project Context: Bidding Dashboard POC

## 1. Project Goal

To build a Proof-of-Concept (POC) for a one-page dashboard to enhance an existing bidding and procurement system. The goal is to create a dynamic, fast, and accurate data viewing experience that overcomes the limitations of the current Metabase solution.

## 2. Data Source

- **Origin:** Data is scraped daily and stored in AWS S3.
- **Processing:** A service processes this data.
- **Endpoint:** A new endpoint will be created on this service to provide data for this dashboard. The data is expected to be large and will include latitude and longitude for mapping purposes.

## 3. Key Features

- **Dynamic Filtering:** Filters that update the data views in real-time.
- **Interactive Data Table:** A powerful data grid with features like sorting, filtering, and pagination to handle large datasets.
- **Map Visualization:** Integration with Mapbox to display data points geographically. A key visualization will be "circle scaling," where the size of a circle on the map represents a data metric.

## 4. Agreed-Upon Technology Stack

- **Build Tool:** Vite
- **UI Framework:** React
- **Styling:** Tailwind CSS
- **Data Fetching (Server State):** TanStack Query (React Query) - To handle data from the new endpoint.
- **Data Table:** TanStack Table (React Table) - A headless library for a fully customizable and powerful data grid.
- **Mapping:** React Map GL - For integrating Mapbox into React.
- **UI State (Client State):** Zustand - For managing local UI state like filter values and component visibility.

## 5. Next Steps

1. Scaffold the initial project using Vite, React, and Tailwind CSS.
2. Set up the basic project structure.
3. Begin implementing the core UI layout.
4. Develop the table and map components using placeholder/mock data until the real endpoint is available.