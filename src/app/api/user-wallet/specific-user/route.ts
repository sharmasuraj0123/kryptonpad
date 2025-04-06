import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function PUT(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    const userId = '92973c67-207c-4ae3-b7fe-0ce7a359f7ba';

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({ wallet_address: walletAddress })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating wallet address:', error);
      return NextResponse.json(
        { error: 'Failed to update wallet address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: `Wallet address updated for user ${userId}` 
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 