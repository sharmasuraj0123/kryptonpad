import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            return cookieStore.getAll()
          },
          async setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          },
        },
      }
    )

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get wallet address from request body
    const body = await request.json()
    const { walletAddress } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Update user metadata with wallet address
    const { error } = await supabase.auth.updateUser({
      data: {
        wallet_address: walletAddress,
        user_type: 'wallet'
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Also update the users table to ensure wallet address is saved
    try {
      const { error: tableError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          wallet_address: walletAddress,
          user_type: 'wallet',
          // Don't overwrite other existing fields
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
      
      if (tableError) {
        console.error('Error updating users table:', tableError)
        // Continue even if this fails to maintain backward compatibility
      }
    } catch (tableErr) {
      console.error('Exception updating users table:', tableErr)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Wallet connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect wallet' },
      { status: 500 }
    )
  }
} 