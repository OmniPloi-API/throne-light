import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * SUB-AFFILIATE LINK SYSTEM
 * Team members can create their own tracking sub-links under the main partner's link
 * This allows managers to track their own outreach and show their contribution
 * 
 * URL Format: /partners/[partner-slug]/[sub-link-code]
 * Example: /partners/sky/mgr-abc123
 */

// Generate a short sub-link code
function generateSubLinkCode(prefix: string = 'ref'): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

/**
 * GET - List sub-links for a partner or team member
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');
    const teamMemberId = searchParams.get('teamMemberId');

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('partner_sub_links')
      .select(`
        id,
        partner_id,
        team_member_id,
        code,
        label,
        is_active,
        created_at,
        click_count,
        sale_count,
        revenue_generated,
        partner_team_members:team_member_id (name, email)
      `)
      .eq('partner_id', partnerId);

    // If team member, only show their own links
    if (teamMemberId) {
      query = query.eq('team_member_id', teamMemberId);
    }

    const { data: subLinks, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sub-links:', error);
      return NextResponse.json({ subLinks: [] });
    }

    // Get the partner slug for URL construction
    const { data: partner } = await supabase
      .from('partners')
      .select('slug')
      .eq('id', partnerId)
      .single();

    const formattedLinks = (subLinks || []).map(link => {
      const memberData = link.partner_team_members as unknown as { name: string; email: string } | null;
      return {
        id: link.id,
        code: link.code,
        label: link.label,
        isActive: link.is_active,
        createdAt: link.created_at,
        clickCount: link.click_count || 0,
        saleCount: link.sale_count || 0,
        revenueGenerated: link.revenue_generated || 0,
        createdBy: memberData?.name || 'Partner',
        createdByEmail: memberData?.email,
        fullUrl: partner?.slug 
          ? `https://thronelightpublishing.com/partners/${partner.slug}/${link.code}`
          : null,
      };
    });

    return NextResponse.json({ subLinks: formattedLinks });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ subLinks: [] });
  }
}

/**
 * POST - Create a new sub-link
 * Team members can create their own sub-links to track their outreach
 */
export async function POST(req: NextRequest) {
  try {
    const { partnerId, teamMemberId, label, customCode } = await req.json();

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify the team member belongs to this partner (if creating as team member)
    if (teamMemberId) {
      const { data: member, error: memberError } = await supabase
        .from('partner_team_members')
        .select('id, name, role, is_active')
        .eq('id', teamMemberId)
        .eq('partner_id', partnerId)
        .single();

      if (memberError || !member) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (!member.is_active) {
        return NextResponse.json({ error: 'Your access has been revoked' }, { status: 403 });
      }
    }

    // Get partner info for URL
    const { data: partner } = await supabase
      .from('partners')
      .select('slug, name')
      .eq('id', partnerId)
      .single();

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Generate or validate custom code
    let code = customCode?.toLowerCase().replace(/[^a-z0-9-]/g, '') || generateSubLinkCode();
    
    // Check if code already exists for this partner
    const { data: existing } = await supabase
      .from('partner_sub_links')
      .select('id')
      .eq('partner_id', partnerId)
      .eq('code', code)
      .single();

    if (existing) {
      // If custom code was requested, return error
      if (customCode) {
        return NextResponse.json({ error: 'This code is already in use' }, { status: 400 });
      }
      // Otherwise generate a new one
      code = generateSubLinkCode();
    }

    const id = uuidv4();

    const { data: subLink, error } = await supabase
      .from('partner_sub_links')
      .insert({
        id,
        partner_id: partnerId,
        team_member_id: teamMemberId || null,
        code,
        label: label || `Link by ${teamMemberId ? 'team member' : 'partner'}`,
        is_active: true,
        click_count: 0,
        sale_count: 0,
        revenue_generated: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sub-link:', error);
      return NextResponse.json({ error: 'Failed to create sub-link' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      subLink: {
        id: subLink.id,
        code: subLink.code,
        label: subLink.label,
        fullUrl: `https://thronelightpublishing.com/partners/${partner.slug}/${subLink.code}`,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create sub-link' }, { status: 500 });
  }
}

/**
 * PATCH - Update sub-link (label, active status)
 */
export async function PATCH(req: NextRequest) {
  try {
    const { id, partnerId, teamMemberId, label, isActive } = await req.json();

    if (!id || !partnerId) {
      return NextResponse.json({ error: 'Sub-link ID and Partner ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Build query - team members can only edit their own links
    let query = supabase
      .from('partner_sub_links')
      .update({
        ...(label && { label }),
        ...(typeof isActive === 'boolean' && { is_active: isActive }),
      })
      .eq('id', id)
      .eq('partner_id', partnerId);

    if (teamMemberId) {
      query = query.eq('team_member_id', teamMemberId);
    }

    const { data, error } = await query.select().single();

    if (error) {
      console.error('Error updating sub-link:', error);
      return NextResponse.json({ error: 'Failed to update sub-link' }, { status: 500 });
    }

    return NextResponse.json({ success: true, subLink: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update sub-link' }, { status: 500 });
  }
}

/**
 * DELETE - Delete sub-link
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const partnerId = searchParams.get('partnerId');
    const teamMemberId = searchParams.get('teamMemberId');

    if (!id || !partnerId) {
      return NextResponse.json({ error: 'Sub-link ID and Partner ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('partner_sub_links')
      .delete()
      .eq('id', id)
      .eq('partner_id', partnerId);

    // Team members can only delete their own links
    if (teamMemberId) {
      query = query.eq('team_member_id', teamMemberId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting sub-link:', error);
      return NextResponse.json({ error: 'Failed to delete sub-link' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to delete sub-link' }, { status: 500 });
  }
}
