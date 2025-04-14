export interface ZealyCampaign {
  id: string;
  name: string;
  title: string;
  description: string;
  status: 'active' | 'ended' | 'upcoming';
  startDate: string;
  endDate: string;
  community: string;
  rewards: {
    type: string;
    amount: number;
  }[];
  token_price?: string;
}

export async function getZealyCampaigns(): Promise<ZealyCampaign[]> {
  const response = await fetch('/api/zealy/campaigns');
  
  if (response.status === 401) {
    throw new Error('Please log in to view campaigns');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }

  const quests = await response.json();
  
  if (!Array.isArray(quests)) {
    throw new Error('Unexpected response format');
  }

  // Transform the Zealy API response to match our interface
  return quests.map((quest: any) => {
    // Determine status based on published state and dates
    let status: 'active' | 'ended' | 'upcoming' = 'ended';
    
    if (quest.published) {
      // If it's published and not archived, it's active
      if (!quest.archived) {
        status = 'active';
      } else {
        status = 'ended';
      }
    } else {
      // If it's not published, it's upcoming
      status = 'upcoming';
    }

    // Set a token price based on quest attributes for display purposes
    const tokenPrice = quest.rewards && quest.rewards.length > 0 
      ? String(quest.rewards[0].value * 1000 || 100000)
      : String(Math.floor(Math.random() * 200000) + 50000);

    return {
      id: quest.id,
      name: quest.name,
      title: quest.name,
      description: typeof quest.description === 'object' && quest.description?.content 
        ? quest.description.content[0]?.content[0]?.text || '' 
        : quest.description || '',
      status: status,
      startDate: quest.createdAt || '',
      endDate: quest.updatedAt || '',
      community: quest.communityName || quest.subdomain || 'XO-Test-Campaign',
      rewards: (quest.rewards || []).map((reward: any) => ({
        type: reward.type || 'unknown',
        amount: reward.value || 0
      })),
      token_price: tokenPrice
    };
  });
} 