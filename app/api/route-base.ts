import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  // input:
  // vals=functiona, functionb, functionc
  // prompt=hello

  // step 1: send functions and prompt to openai
  // step 2: get response from openai on which function to call with which parameters
  // step 3: call function with parameters
  // step 4: return response from function
  const path = request.nextUrl.searchParams.get('path') || '/isr/[id]';
  const collection =
    request.nextUrl.searchParams.get('collection') || 'collection';
  revalidatePath(path);
  revalidateTag(collection);
  console.log('revalidated', path, collection);
  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    cache: 'no-store',
  });
}
