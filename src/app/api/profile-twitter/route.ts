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

    // Get Twitter details from request body
    const body = await request.json()
    const { twitterMetadata } = body

    if (!twitterMetadata || !twitterMetadata.twitter_id || !twitterMetadata.twitter_username) {
      return NextResponse.json(
        { error: 'Twitter ID and username are required' },
        { status: 400 }
      )
    }

    try {
      // Extract Twitter details
      const twitterId = twitterMetadata.twitter_id;
      const twitterUsername = twitterMetadata.twitter_username;
      const twitterName = twitterMetadata.twitter_name;
      const twitterFollowersCount = twitterMetadata.twitter_followers_count;
      const twitterFollowingCount = twitterMetadata.twitter_following_count;
      
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

      // Prepare the Twitter data for profiles table update
      const profileUpdateData: Record<string, any> = {
        twitter_id: twitterId,
        twitter_username: twitterUsername
      };
      
      if (twitterName) profileUpdateData.twitter_name = twitterName;
      if (twitterFollowersCount) profileUpdateData.twitter_followers_count = twitterFollowersCount;
      if (twitterFollowingCount) profileUpdateData.twitter_following_count = twitterFollowingCount;

      // Update the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating profiles table with Twitter data:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile with Twitter information' },
          { status: 500 }
        );
      }

      // Success response
      return NextResponse.json({ 
        success: true,
        message: 'Twitter information updated in profiles table',
        userId: user.id,
        twitterUsername: twitterUsername
      });
    } catch (error) {
      console.error('Error updating Twitter information:', error);
      return NextResponse.json(
        { error: 'Failed to update Twitter information' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Twitter profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update Twitter profile' },
      { status: 500 }
    );
  }
} 