-- ============================================================
-- Digital Sanctuary · 0017 expand the crisis directory
--
-- Adds verified, sourced regional/state-reach helplines to the
-- existing local_resources table (region = 'IN', same flat list
-- Safety Gateway already queries). No new mechanism: no per-state
-- routing, no region auto-detection — exactly per the founder's
-- instruction to expand the list, not the architecture. Users
-- self-select the relevant row by reading its name.
--
-- Every number below was looked up live and confirmed against the
-- organisation's own official site on 2026-09-06 (source_url +
-- verified_at per row, matching the discipline already established
-- for the national lines in 0007). A wrong crisis number is the worst
-- possible bug this product can ship, so nothing here is from memory.
-- ============================================================

insert into public.local_resources
  (region, service_type, name, contact, hours, languages, is_emergency, source_url, verified_at, sort_order)
values
  ('IN', 'helpline', 'Vandrevala Foundation (pan-India)',
   '+91 9999 666 555 (call or WhatsApp)',
   '24/7, every day of the year', null, false,
   'https://www.vandrevalafoundation.com/free-counseling/contact-us', '2026-09-06', 4),

  ('IN', 'helpline', 'iCALL Psychosocial Helpline — TISS (Mumbai, reachable pan-India by phone)',
   '022-2552-1111 or 9152987821',
   'Monday to Saturday, roughly 10am-8pm', null, false,
   'https://icallhelpline.org/what-is-icall/', '2026-09-06', 5),

  ('IN', 'helpline', 'Sneha Suicide Prevention Centre (Chennai, Tamil Nadu)',
   '044-2464-0050 (24hr) or 044-2464-0060',
   '044-2464-0050 is 24/7; 044-2464-0060 is 10am-8pm', null, false,
   'https://snehaindia.org/', '2026-09-06', 6),

  ('IN', 'helpline', 'Roshni Trust (Hyderabad, Telangana & Andhra Pradesh)',
   '8142020033 or 8142020044',
   'Monday to Saturday, 10am-7pm', null, false,
   'https://roshinitrust.com/about/', '2026-09-06', 7),

  ('IN', 'helpline', 'Maithri (Kochi, Kerala)',
   '0484-2540530',
   'Daily, 10am-7pm', null, false,
   'https://maithrikochi.in/', '2026-09-06', 8),

  ('IN', 'helpline', 'Parivarthan Counselling Helpline (Bengaluru, Karnataka)',
   '7676602602',
   'Monday to Friday, 1pm-10pm',
   'English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, Punjabi, Haryanvi',
   false,
   'https://parivarthan.org/', '2026-09-06', 9)
on conflict do nothing;
