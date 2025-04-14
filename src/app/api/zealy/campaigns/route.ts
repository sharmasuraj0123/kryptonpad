import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Bypass authentication completely for testing

    // Make request to Zealy API for test campaign
    const response = await fetch(
      'https://api-v2.zealy.io/public/communities/xotestcampaign/quests',
      {
        method: 'GET',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_ZEALY_API_KEY as string,
          'Accept': 'application/json',
        },
      }
    );

    // Check response and handle errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zealy API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
    }

    // Parse response
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Zealy campaigns proxy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Zealy campaigns' },
      { status: 500 }
    );
  }
} 