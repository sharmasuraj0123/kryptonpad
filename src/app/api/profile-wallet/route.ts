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
    const { walletAddress, twitterMetadata } = body

    // At least one of walletAddress or twitterMetadata must be provided
    if (!walletAddress && !twitterMetadata) {
      return NextResponse.json(
        { error: 'Either wallet address or Twitter details are required' },
        { status: 400 }
      )
    }

    // First check if the profiles table exists by trying to select from it
    try {
      // Try to update auth user first since that's most important
      if (walletAddress) {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            wallet_address: walletAddress,
            user_type: 'wallet'
          }
        })

        if (authError) {
          console.error('Error updating auth user:', authError);
        }
      }

      // Extract Twitter details if provided
      const twitterId = twitterMetadata?.twitter_id;
      const twitterUsername = twitterMetadata?.twitter_username;
      const twitterName = twitterMetadata?.twitter_name;
      const twitterFollowersCount = twitterMetadata?.twitter_followers_count;
      const twitterFollowingCount = twitterMetadata?.twitter_following_count;

      // Then try users table for backward compatibility
      const updateData: Record<string, any> = { id: user.id };
      
      if (walletAddress) {
        updateData.wallet_address = walletAddress;
        updateData.user_type = 'wallet';
      }
      
      const { error: usersError } = await supabase
        .from('users')
        .upsert(updateData, { 
          onConflict: 'id' 
        });
      
      if (usersError) {
        console.error('Error updating users table:', usersError);
      }

      // Finally try profiles table - this might fail if the schema is still updating
      try {
        // First check if we can select any row from profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
          
        if (profilesError) {
          if (profilesError.code === 'PGRST116') {
            // Table exists but no row found for this user, try to insert
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({ id: user.id });
              
            if (insertError) {
              console.error('Error inserting into profiles table:', insertError);
            }
          } else {
            console.error('Error checking profiles table:', profilesError);
          }
        }

        // Now prepare the profile update data
        const profileUpdateData: Record<string, any> = {};
        
        if (walletAddress) {
          profileUpdateData.wallet_address = walletAddress;
        }
        
        if (twitterMetadata) {
          // Add Twitter details to the update
          if (twitterId) profileUpdateData.twitter_id = twitterId;
          if (twitterUsername) profileUpdateData.twitter_username = twitterUsername;
          if (twitterName) profileUpdateData.twitter_name = twitterName;
          if (twitterFollowersCount) profileUpdateData.twitter_followers_count = twitterFollowersCount;
          if (twitterFollowingCount) profileUpdateData.twitter_following_count = twitterFollowingCount;
        }

        // Only update if we have data to update
        if (Object.keys(profileUpdateData).length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(profileUpdateData)
            .eq('id', user.id);
          
          if (!updateError) {
            console.log('Successfully updated profile with new data');
          } else {
            console.error('Error updating profiles table:', updateError);
          }
        }
      } catch (profileErr) {
        console.error('Exception updating profiles table:', profileErr);
      }

      // Success response
      const responseData: Record<string, any> = { 
        success: true,
        message: 'Profile updated successfully',
        userId: user.id
      };
      
      if (walletAddress) {
        responseData.walletAddress = walletAddress;
      }
      
      if (twitterMetadata) {
        responseData.twitterUpdated = true;
      }
      
      return NextResponse.json(responseData);
    } catch (error) {
      console.error('Error updating profile information:', error);
      return NextResponse.json(
        { error: 'Failed to update profile information' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 