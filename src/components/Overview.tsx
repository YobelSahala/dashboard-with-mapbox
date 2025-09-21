import { useState, useEffect } from 'react'
import { FcBullish, FcBearish } from "react-icons/fc";
import { loadCSVData } from '../utils/csvLoader';
import csvData from '../../data.csv?raw';

const Overview = () => {
  const [data, setData] = useState({
    usage: {
      total_usage: '0 GB',
      difference_percentage: '0',
      last_day_usage: '0 GB'
    },
    status: {
      inbilling: '0',
      intesting: '0',
      suspended: '0',
      retired: '0'
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processData = async () => {
      try {
        setLoading(true);
        const records = await loadCSVData(csvData);

        // Filter by dates
        const todayRecords = records.filter(record => record.event_date === '2025-08-04');
        const yesterdayRecords = records.filter(record => record.event_date === '2025-08-03');

        // Calculate total usage
        const todayTotal = todayRecords.reduce((sum, record) => sum + (record.data_usage_raw_total || 0), 0);
        const yesterdayTotal = yesterdayRecords.reduce((sum, record) => sum + (record.data_usage_raw_total || 0), 0);

        // Calculate percentage difference
        const percentageDiff = yesterdayTotal > 0 ?
          ((todayTotal - yesterdayTotal) / yesterdayTotal * 100).toFixed(2) : '0';

        // Count statuses (using today's data)
        const statusCounts = todayRecords.reduce((counts, record) => {
          switch (record.current_billing_status) {
            case 'IN-BILLING':
              counts.inbilling++;
              break;
            case 'IN-TESTING':
              counts.intesting++;
              break;
            case 'SUSPENDED':
              counts.suspended++;
              break;
            case 'RETIRED':
              counts.retired++;
              break;
          }
          return counts;
        }, { inbilling: 0, intesting: 0, suspended: 0, retired: 0 });

        setData({
          usage: {
            total_usage: formatDataUsage(todayTotal),
            difference_percentage: percentageDiff,
            last_day_usage: formatDataUsage(yesterdayTotal)
          },
          status: {
            inbilling: statusCounts.inbilling.toString(),
            intesting: statusCounts.intesting.toString(),
            suspended: statusCounts.suspended.toString(),
            retired: statusCounts.retired.toString()
          }
        });
      } catch (error) {
        console.error('Error processing overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    processData();
  }, []);

  // Dynamic unit conversion
  const formatDataUsage = (bytes: number): string => {
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (bytes < 1000 * 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
    }
  };

  const getDynamicIcons = (total_usage: string, last_day_usage: string) => {
    const today = parseFloat(total_usage);
    const yesterday = parseFloat(last_day_usage);

    if (today > yesterday) {
      return <FcBullish size={28}/>
    } else {
      return <FcBearish size={28}/>
    }
  }

  if (loading) {
    return (
      <div className='w-full grid grid-cols-2 gap-2'>
        <div className='card bg-primary text-white shadow-xl p-5'>
          <div className="loading loading-spinner loading-lg"></div>
        </div>
        <div className='card bg-primary text-white shadow-xl p-5'>
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full grid grid-cols-2 gap-6'>
      <div className='card bg-primary text-white shadow-xl p-5 space-y-3'>
        <p className='font-semibold text-2xl'>Usage</p>
        <div className='grid grid-cols-2 items-center'>
          <p className='font-semibold items-center text-4xl'>{data.usage.total_usage}</p>
          <div className='flex justify-end items-center text-end text-lg gap-1'>
            {getDynamicIcons(data.usage.total_usage, data.usage.last_day_usage)}
            <p>{data.usage.difference_percentage}%</p>
          </div>
        </div>
        <p>vs. {data.usage.last_day_usage} from last day</p>
      </div>
      <div className='card bg-primary text-white shadow-xl p-5 space-y-3'>
        <p className='font-semibold text-2xl'>Status</p>
        <div className='grid grid-cols-2'>
          <div className='grid grid-cols-2'>
            <p className='font-bold'>In Billing:</p>
            <p>{data.status.inbilling}</p>
          </div>
          <div className='grid grid-cols-2'>
            <p className='font-bold'>In Testing:</p>
            <p>{data.status.intesting}</p>
          </div>
          <div className='grid grid-cols-2'>
            <p className='font-bold'>Suspended:</p>
            <p>{data.status.suspended}</p>
          </div>
          <div className='grid grid-cols-2'>
            <p className='font-bold'>Retired:</p>
            <p>{data.status.retired}</p>
          </div>
        </div>
        <p>from last day</p>
      </div>
    </div>
  )
}

export default Overview
