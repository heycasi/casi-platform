import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    deploymentTime: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
    message: 'Dashboard fix deployed - using window.location.origin',
  })
}
