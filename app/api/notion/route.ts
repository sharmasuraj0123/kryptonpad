import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Extract the user's authentication context
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retrieve user details using Clerk
    const user = await clerkClient.users.getUser(userId);

    // Find Twitter external account
    const externalAccount = user.externalAccounts?.find(
      (account) => account.provider === "oauth_x"
    );
    console.log("🚀 ~ GET ~ externalAccount:", externalAccount)

    if (!externalAccount || !externalAccount.externalId) {
      return NextResponse.json(
        { error: "No Twitter account linked with this user" },
        { status: 404 }
      );
    }

    // Fetch Twitter user details using the external ID
    const twitterResponse = await fetch(
      `https://api.twitter.com/2/users/${externalAccount.externalId}?user.fields=public_metrics`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TWITTER_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!twitterResponse.ok) {
      const errorData = await twitterResponse.json();
      return NextResponse.json(errorData, { status: twitterResponse.status });
    }

    const twitterData = await twitterResponse.json();

    // Return Twitter API data along with Clerk user details
    return NextResponse.json({
      clerkUser: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || null,
        username: user.username || null,
      },
      twitterData,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
