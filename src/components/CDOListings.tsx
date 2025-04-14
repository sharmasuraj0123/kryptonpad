'use client';

import { useEffect, useState } from 'react';
import { getAllCDOs } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  name: string;
  title: string;
  description: string;
  status: 'active' | 'ended' | 'upcoming';
  startDate: string;
  endDate: string;
  community: string;
  project_name: string;
  token_symbol: string;
  token_price: string;
  project_status: string;
  blockchain_platform: string;
  reg_start_date: string;
  reg_end_date: string;
  allocation_start_date: string;
  allocation_end_date: string;
  project_website_link: string | null;
  rewards?: {
    type: string;
    amount: number;
  }[];
}

export default function CDOListings() {
  const router = useRouter();
  const [cdos, setCdos] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Ongoing' | 'Ended' | 'Upcoming'>('Ongoing');
  const [selectedCDO, setSelectedCDO] = useState<Campaign | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchCDOs() {
      try {
        console.log('Starting to fetch CDOs from database...');
        const campaignData = await getAllCDOs();
        console.log('Raw CDO data from database:', campaignData);

        // Transform database campaigns into the Campaign format if needed
        const transformedCampaigns: Campaign[] = campaignData.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name || '',
          title: campaign.title || campaign.name || '',
          description: campaign.description || '',
          status: campaign.status || 'active',
          community: campaign.community || '',
          project_name: campaign.project_name || campaign.name || '',
          token_symbol: campaign.token_symbol || 'XO',
          token_price: campaign.token_price || '0',
          project_status: campaign.project_status || campaign.status || 'active',
          blockchain_platform: campaign.blockchain_platform || 'Ethereum',
          reg_start_date: campaign.reg_start_date || campaign.startDate || '',
          reg_end_date: campaign.reg_end_date || campaign.endDate || '',
          allocation_start_date: campaign.allocation_start_date || campaign.startDate || '',
          allocation_end_date: campaign.allocation_end_date || campaign.endDate || '',
          project_website_link: campaign.project_website_link || null,
          startDate: campaign.startDate || campaign.reg_start_date || '',
          endDate: campaign.endDate || campaign.reg_end_date || '',
          rewards: campaign.rewards || []
        }));

        console.log('Transformed campaigns from database:', transformedCampaigns);
        setCdos(transformedCampaigns);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching campaigns from database:', err);
        if (err.message && err.message.includes('Authentication required')) {
          router.push('/login');
        } else {
          setError(err.message || 'Failed to fetch campaigns from database');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCDOs();
  }, [router]);

  const filterCDOs = () => {
    const now = new Date();
    
    return cdos.filter(cdo => {
      const startDate = new Date(cdo.startDate);
      const endDate = new Date(cdo.endDate);
      
      if (activeTab === 'Ongoing') {
        return startDate <= now && endDate >= now;
      } else if (activeTab === 'Ended') {
        return endDate < now;
      } else {
        return startDate > now;
      }
    });
  };

  const handleOpenModal = (cdo: Campaign) => {
    setSelectedCDO(cdo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCDO(null);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-gray-900 rounded-lg shadow-md p-6">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  const filteredCDOs = filterCDOs();

  const placeholderCDOs: Campaign[] = [
    {
      id: '1',
      name: 'Dogatoshi',
      title: 'Dogatoshi',
      description: 'A revolutionary meme coin project',
      status: 'active',
      community: 'Dogatoshi',
      rewards: [],
      project_name: 'Dogatoshi',
      token_symbol: 'DOG',
      token_price: '200000',
      project_status: 'Upcoming',
      blockchain_platform: 'Ethereum',
      reg_start_date: '2024-11-15',
      reg_end_date: '2024-12-01',
      allocation_start_date: '2024-12-05',
      allocation_end_date: '2024-12-10',
      project_website_link: 'https://example.com',
      startDate: '2024-11-15',
      endDate: '2024-12-31',
    },
    {
      id: '2',
      name: 'xRaise',
      title: 'xRaise',
      description: 'Next-generation fundraising platform',
      status: 'active',
      community: 'XRaise',
      rewards: [],
      project_name: 'xRaise',
      token_symbol: 'XR',
      token_price: '200000',
      project_status: 'Upcoming',
      blockchain_platform: 'Solana',
      reg_start_date: '2024-11-15',
      reg_end_date: '2024-12-01',
      allocation_start_date: '2024-12-05',
      allocation_end_date: '2024-12-10',
      project_website_link: 'https://example.com',
      startDate: '2024-11-15',
      endDate: '2024-12-31',
    }
  ];

  const getDisplayCDOs = () => {
    if (filteredCDOs.length > 0) {
      return filteredCDOs;
    }
    
    if (cdos.length > 0) {
      return [];
    }
    
    return placeholderCDOs;
  };

  const displayCDOs = getDisplayCDOs();

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex mb-8 gap-2 max-w-md mx-auto">
        {(['Ongoing', 'Ended', 'Upcoming'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-full transition-colors ${
              activeTab === tab
                ? 'bg-black border border-transparent relative before:absolute before:inset-0 before:rounded-full before:p-0.5 before:bg-gradient-to-r before:from-purple-500 before:via-pink-500 before:to-yellow-500 before:-z-10 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CDO Grid */}
      {displayCDOs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {displayCDOs.map((cdo) => (
            <div 
              key={cdo.id} 
              onClick={() => handleOpenModal(cdo)}
              className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
            >
              {/* Project Image/Header */}
              <div className="relative h-40 w-full bg-gray-800 overflow-hidden">
                {cdo.project_name === 'Dogatoshi' ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-yellow-900 to-gray-900 opacity-80"></div>
                ) : cdo.project_name === 'xRaise' ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-600 opacity-80"></div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900"></div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                {/* Project name and logo */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">{cdo.project_name}</h2>
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                    {cdo.project_name === 'Dogatoshi' ? (
                      <div className="w-full h-full flex items-center justify-center bg-yellow-600 text-white font-bold">
                        D
                      </div>
                    ) : cdo.project_name === 'xRaise' ? (
                      <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold">
                        X
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-white">{cdo.token_symbol.charAt(0)}</span>
                    )}
                  </div>
                </div>
                
                {/* Status badge */}
                <div className="inline-block bg-gray-800 text-white text-sm font-semibold px-4 py-1 rounded-full mb-4">
                  {cdo.status === 'active' ? 'Ongoing' : 
                  cdo.status === 'upcoming' ? 'Upcoming' : 'Ended'}
                </div>
                
                {/* Information rows */}
                <div className="space-y-3 text-white">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <p className="text-sm text-gray-400">Total Raise</p>
                    <p className="font-bold text-lg">${parseInt(cdo.token_price).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <p className="text-sm text-gray-400">Token Price</p>
                    <p className="font-bold text-lg">${parseInt(cdo.token_price).toLocaleString()}</p>
                  </div>
                  
                  {/* End date */}
                  <div className="bg-gray-800 p-2 rounded text-center mt-4">
                    <p className="font-medium">
                      {new Date(cdo.endDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg">No {activeTab.toLowerCase()} campaigns available at this time.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedCDO && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedCDO.project_name}</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-400">Token Symbol</p>
                    <p className="font-bold">{selectedCDO.token_symbol}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-400">Token Price</p>
                    <p className="font-bold">${selectedCDO.token_price}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-400">Blockchain</p>
                    <p className="font-bold">{selectedCDO.blockchain_platform}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="font-bold">{selectedCDO.project_status}</p>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-3 rounded">
                  <p className="text-sm text-gray-400">Registration Period</p>
                  <p className="font-medium">
                    {new Date(selectedCDO.reg_start_date).toLocaleDateString()} - {new Date(selectedCDO.reg_end_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="bg-gray-800 p-3 rounded">
                  <p className="text-sm text-gray-400">Allocation Period</p>
                  <p className="font-medium">
                    {new Date(selectedCDO.allocation_start_date).toLocaleDateString()} - {new Date(selectedCDO.allocation_end_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="bg-gray-800 p-3 rounded">
                  <p className="text-sm text-gray-400">Campaign Period</p>
                  <p className="font-medium">
                    {new Date(selectedCDO.startDate).toLocaleDateString()} - {new Date(selectedCDO.endDate).toLocaleDateString()}
                  </p>
                </div>
                
                {selectedCDO.project_website_link && (
                  <a 
                    href={selectedCDO.project_website_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg text-center font-semibold transition-colors"
                  >
                    Visit Website
                  </a>
                )}
                
                <button 
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center font-semibold transition-colors"
                >
                  Register for IDO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 