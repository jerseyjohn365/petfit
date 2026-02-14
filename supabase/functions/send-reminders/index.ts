import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const currentDay = now.getUTCDay();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    // Find reminders due now (within 30 min window)
    const { data: reminders, error } = await supabase
      .from('reminder_settings')
      .select(`
        id,
        dog_id,
        frequency,
        day_of_week,
        preferred_time,
        expo_push_token,
        dogs!inner(name, user_id)
      `)
      .eq('enabled', true)
      .not('expo_push_token', 'is', null);

    if (error) throw error;

    const dueReminders = (reminders || []).filter((r: any) => {
      const [prefHour, prefMin] = r.preferred_time.split(':').map(Number);
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (prefHour * 60 + prefMin));
      if (timeDiff > 15) return false;

      switch (r.frequency) {
        case 'daily': return true;
        case 'weekly': return currentDay === r.day_of_week;
        case 'biweekly': return currentDay === r.day_of_week;
        case 'monthly': return now.getUTCDate() === 1;
        default: return false;
      }
    });

    if (dueReminders.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send via Expo Push API
    const messages = dueReminders.map((r: any) => ({
      to: r.expo_push_token,
      sound: 'default',
      title: `Time to weigh ${r.dogs.name}! 🐕`,
      body: `Keep up the great work tracking ${r.dogs.name}'s progress!`,
      data: { dogId: r.dog_id, screen: 'weigh-in' },
    }));

    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    let totalSent = 0;
    for (const chunk of chunks) {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      if (response.ok) {
        totalSent += chunk.length;
      }
    }

    return new Response(JSON.stringify({ sent: totalSent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
