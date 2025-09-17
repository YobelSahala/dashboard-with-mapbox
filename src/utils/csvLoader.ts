import Papa from 'papaparse';
import type { DataUsageRecord } from '../types/data';

export const loadCSVData = async (csvFile: string): Promise<DataUsageRecord[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => {
        // Remove unnamed index column (first column)
        return header === '' ? null : header;
      },
      transform: (value, field) => {
        // Skip the unnamed index column
        if (field === '' || field === null) {
          return undefined;
        }
        
        // Convert string numbers to actual numbers for specific fields
        if (field === 'data_usage_raw_total' || field === 'latitude' || field === 'longitude') {
          return parseFloat(value) || 0;
        }
        
        return value;
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        
        // Filter out any records with invalid data
        const validData = results.data.filter((record: any) => 
          record.msisdn && 
          record.latitude && 
          record.longitude &&
          !isNaN(record.latitude) &&
          !isNaN(record.longitude)
        ) as DataUsageRecord[];
        
        console.log(`✅ Loaded ${validData.length} valid records from CSV`);
        resolve(validData);
      },
      error: (error: any) => {
        console.error('❌ CSV parsing error:', error);
        reject(error);
      }
    });
  });
};

export const loadCSVFromUrl = async (url: string): Promise<DataUsageRecord[]> => {
  try {
    console.log(`📦 Fetching CSV from: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log(`📦 CSV downloaded: ${(csvText.length / 1024 / 1024).toFixed(2)}MB`);
    
    return await loadCSVData(csvText);
  } catch (error) {
    console.error('❌ Failed to load CSV:', error);
    throw error;
  }
};