import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, userId } = await request.json();
    
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

    // Create admin client for privileged operations
    const supabaseAdmin = createAdminClient();
    
    // Update the user's metadata with the wallet address using admin privileges
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: { wallet_address: walletAddress } }
    );

    if (error) {
      console.error('Error updating user metadata:', error);
      return NextResponse.json(
        { error: 'Failed to update user metadata', details: error },
        { status: 500 }
      );
    }

    // Also update the users table (if it exists)
    try {
      const { error: tableError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: userId,
          wallet_address: walletAddress,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id' 
        });

      if (tableError) {
        console.error('Error updating wallet address in users table:', tableError);
        return NextResponse.json(
          { error: 'Failed to update wallet address in users table', details: tableError },
          { status: 500 }
        );
      }
    } catch (e) {
      console.error('Error updating wallet address in users table:', e);
      return NextResponse.json(
        { error: 'Failed to update wallet address in users table', details: e },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Wallet address updated for user ${userId}` 
    });
    
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 