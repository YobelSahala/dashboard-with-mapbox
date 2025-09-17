export interface BiddingProject {
  id: string;
  projectName: string;
  category: string;
  bidValue: number;
  bidder: string;
  status: 'Open' | 'Awarded' | 'Closed';
  datePosted: string;
  latitude: number;
  longitude: number;
}

export interface FilterState {
  category: string;
  status: string;
  search: string;
}