import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { validateRequest } from '@/lib/authMiddleware';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET user's library (books they own)
export async function GET(req: NextRequest) {
  const auth = validateRequest(req);
  if (!auth.valid) {
    return auth.response;
  }

  const books: Array<{ id: string; title: string; subtitle?: string; author: string; coverImage: string; grantedAt: string }> = [];

  try {
    const supabase = getSupabaseAdmin();
    const userEmail = auth.user.email;
    const userId = auth.user.id;
    
    console.log(`[Library] Checking access for user: email=${userEmail}, id=${userId}`);
    
    let foundLicense = false;
    
    // PRIORITY 1: Check by license ID first (most reliable for license-based auth)
    // The user.id IS the licenseId from the JWT, so this should always match
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUUID) {
      console.log(`[Library] Checking license by ID: ${userId}`);
      const { data: licenseById, error: idError } = await supabase
        .from('reader_licenses')
        .select('id, purchased_at, email, is_active, is_revoked')
        .eq('id', userId)
        .maybeSingle();

      if (idError) {
        console.error(`[Library] Error querying by ID:`, idError);
      }

      if (licenseById) {
        console.log(`[Library] Found license by ID: ${licenseById.id}, active=${licenseById.is_active}, revoked=${licenseById.is_revoked}`);
        if (licenseById.is_active && !licenseById.is_revoked) {
          foundLicense = true;
          books.push({
            id: 'crowded-bed-empty-throne',
            title: 'The Crowded Bed & The Empty Throne',
            author: 'EOLLES',
            coverImage: '/images/book-cover.jpg',
            grantedAt: licenseById.purchased_at || new Date().toISOString(),
          });
        } else {
          console.log(`[Library] License found but not active or revoked`);
        }
      } else {
        console.log(`[Library] No license found with ID: ${userId}`);
      }
    }
    
    // PRIORITY 2: Check by email (case-insensitive) if ID lookup didn't work
    if (!foundLicense && userEmail) {
      console.log(`[Library] Checking license by email: ${userEmail}`);
      // Use ilike for case-insensitive matching
      const { data: license, error } = await supabase
        .from('reader_licenses')
        .select('id, purchased_at, email, is_active, is_revoked')
        .ilike('email', userEmail)
        .eq('is_active', true)
        .eq('is_revoked', false)
        .order('purchased_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[Library] Supabase email query error:', error);
      }

      if (license) {
        console.log(`[Library] Found license by email: ${license.id}`);
        foundLicense = true;
        books.push({
          id: 'crowded-bed-empty-throne',
          title: 'The Crowded Bed & The Empty Throne',
          author: 'EOLLES',
          coverImage: '/images/book-cover.jpg',
          grantedAt: license.purchased_at || new Date().toISOString(),
        });
      }
    }
    
    // Fallback: Check device_activations table for this user's license
    if (!foundLicense) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (isUUID) {
        // Check if this license ID has any active device activations
        const { data: activation } = await supabase
          .from('device_activations')
          .select('license_id')
          .eq('license_id', userId)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (activation?.license_id) {
          // Found an active device activation, now get the license
          const { data: licenseFromActivation } = await supabase
            .from('reader_licenses')
            .select('id, purchased_at, is_active, is_revoked')
            .eq('id', activation.license_id)
            .maybeSingle();

          if (licenseFromActivation?.is_active && !licenseFromActivation?.is_revoked) {
            console.log(`[Library] Found license via device activation: ${licenseFromActivation.id}`);
            foundLicense = true;
            books.push({
              id: 'crowded-bed-empty-throne',
              title: 'The Crowded Bed & The Empty Throne',
              author: 'EOLLES',
              coverImage: '/images/book-cover.jpg',
              grantedAt: licenseFromActivation.purchased_at || new Date().toISOString(),
            });
          }
        }
      }
    }
    
    if (!foundLicense) {
      console.log(`[Library] No license found for user: email=${userEmail}, id=${userId}`);
    }
  } catch (err) {
    console.error('[Library] Error checking Supabase licenses:', err);
  }

  const db = readDb();

  const userAccess = db.libraryAccess.filter(la => la.userId === auth.user.id);

  const legacyBooks = userAccess.map(access => {
    const book = db.books.find(b => b.id === access.bookId);
    if (!book) return null;

    const { fileUrl, ...safeBook } = book;
    return {
      ...safeBook,
      grantedAt: access.grantedAt,
    };
  }).filter(Boolean) as Array<{ id: string; title: string; subtitle?: string; author: string; coverImage: string; grantedAt: string }>;

  for (const b of legacyBooks) {
    if (!books.some(x => x.id === b.id)) {
      books.push(b);
    }
  }

  return NextResponse.json(books);
}
