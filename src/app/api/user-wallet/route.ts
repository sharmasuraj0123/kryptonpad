import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function PUT(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 