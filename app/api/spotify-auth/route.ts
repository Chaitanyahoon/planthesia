import { type NextRequest, NextResponse } from "next/server"

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ""
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ""
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/spotify-callback`

export async function GET(request: NextRequest) {
  const scopes = "streaming user-read-private user-read-email user-modify-playback-state playlist-read-private"

  const authUrl = new URL("https://accounts.spotify.com/authorize")
  authUrl.searchParams.append("client_id", SPOTIFY_CLIENT_ID)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI)
  authUrl.searchParams.append("scope", scopes)
  authUrl.searchParams.append("show_dialog", "true")

  return NextResponse.redirect(authUrl.toString())
}
