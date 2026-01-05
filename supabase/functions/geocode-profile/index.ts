// Supabase Edge Function: Geocode Profile
// Triggered by database webhook when city/country is updated
// Uses OpenStreetMap Nominatim (free) for geocoding

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeRequest {
  type: 'INSERT' | 'UPDATE'
  table: string
  record: {
    id: string
    user_id?: string
    city?: string
    state?: string
    country?: string
    ip_address?: string
  }
  old_record?: {
    city?: string
    country?: string
  }
}

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

// Geocode using OpenStreetMap Nominatim (free, no API key needed)
async function geocodeLocation(city?: string, state?: string, country?: string): Promise<{ lat: number; lon: number } | null> {
  if (!city && !country) return null
  
  const query = [city, state, country].filter(Boolean).join(', ')
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ThroneLight-Reader/1.0 (contact@thronelightpublishing.com)'
      }
    })
    
    if (!response.ok) {
      console.error('Nominatim error:', response.status)
      return null
    }
    
    const results: NominatimResult[] = await response.json()
    
    if (results.length > 0) {
      return {
        lat: parseFloat(results[0].lat),
        lon: parseFloat(results[0].lon)
      }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Get location from IP using ip-api.com (free, no key needed)
async function geolocateIP(ip: string): Promise<{ lat: number; lon: number; city: string; country: string; countryCode: string } | null> {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return null
  }
  
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,lat,lon`)
    const data = await response.json()
    
    if (data.status === 'success') {
      return {
        lat: data.lat,
        lon: data.lon,
        city: data.city,
        country: data.country,
        countryCode: data.countryCode
      }
    }
    
    return null
  } catch (error) {
    console.error('IP geolocation error:', error)
    return null
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload: GeocodeRequest = await req.json()
    const { type, table, record, old_record } = payload

    console.log(`Geocoding request: ${type} on ${table}`, record)

    // Check if city/country changed (for updates)
    if (type === 'UPDATE' && old_record) {
      const cityChanged = record.city !== old_record.city
      const countryChanged = record.country !== old_record.country
      
      if (!cityChanged && !countryChanged) {
        return new Response(
          JSON.stringify({ message: 'No location change detected' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    let geoResult: { lat: number; lon: number; city?: string; country?: string; countryCode?: string } | null = null

    // Try geocoding by city/country first
    if (record.city || record.country) {
      const coords = await geocodeLocation(record.city, record.state, record.country)
      if (coords) {
        geoResult = { ...coords }
      }
    }
    
    // If no city/country, try IP geolocation
    if (!geoResult && record.ip_address) {
      const ipGeo = await geolocateIP(record.ip_address)
      if (ipGeo) {
        geoResult = ipGeo
      }
    }

    if (!geoResult) {
      return new Response(
        JSON.stringify({ message: 'Could not geocode location' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the record with coordinates
    const updateData: Record<string, unknown> = {
      latitude: geoResult.lat,
      longitude: geoResult.lon
    }

    // Add city/country if we got them from IP geolocation
    if (geoResult.city) updateData.city = geoResult.city
    if (geoResult.country) updateData.country = geoResult.country
    if (geoResult.countryCode) updateData.country_code = geoResult.countryCode

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', record.id)

    if (error) {
      console.error('Update error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Geocoded successfully',
        latitude: geoResult.lat,
        longitude: geoResult.lon
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
