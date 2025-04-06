import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    // Get auth user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Try to create/update user record in the users table
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        country: user.user_metadata?.country || '',
        wallet_address: user.user_metadata?.wallet_address || '',
        user_type: user.user_metadata?.user_type || '',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      
    if (upsertError) {
      return NextResponse.json(
        { error: 'Failed to update user record: ' + upsertError.message },
        { status: 500 }
      )
    }
    
    // Now fetch the user data to confirm it worked
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
      
    if (getUserError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data: ' + getUserError.message, upsertSuccess: true },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User record updated successfully',
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      },
      dbUser: userData
    })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set up database' },
      { status: 500 }
    )
  }
} 